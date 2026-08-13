import 'server-only';
import {
  Categories,
  DealTypes,
  MAX_LEDGER_FILE_BYTES,
  MAX_LEDGER_TEXT_CHARS,
  MAX_OPERATOR_NOTES_CHARS,
  PaymentModes,
  TaxClasses,
  Types,
  isAllowedMime,
  type ConfidenceLevel,
  type LedgerEntry,
} from '@/lib/ledger-schema';
import { applyBusinessRules, clipText, smartMapValue } from '@/lib/ledger-engine';
import { completeLedgerModel, parseJsonFromModel, type LedgerAiProvider } from '@/lib/ledger-ai';
import {
  applyHarvestLocks,
  formatSignalsForPrompt,
  harvestDocumentSignals,
  type HarvestedSignals,
} from '@/lib/ledger-parse';

export type ExtractRequest = {
  file?: { data?: string; mimeType?: string } | null;
  fileText?: string;
  extraDetails?: string;
  provider?: LedgerAiProvider | string;
};

export type ExtractResult = {
  data: LedgerEntry;
  validation_errors: string[];
  confidence_flags: Record<string, ConfidenceLevel>;
  status: 'DONE' | 'REVIEW_REQUIRED';
  fusion: string;
};

function decodeFilePayload(file?: { data?: string; mimeType?: string } | null): {
  mimeType?: string;
  data?: string;
} {
  if (!file?.data) return {};
  const raw = file.data.trim();
  const comma = raw.indexOf(',');
  const data = raw.startsWith('data:') && comma > 0 ? raw.slice(comma + 1) : raw;
  const mimeType = file.mimeType || (raw.startsWith('data:') ? raw.slice(5, raw.indexOf(';')) : undefined);
  const approxBytes = Math.floor((data.length * 3) / 4);
  if (approxBytes > MAX_LEDGER_FILE_BYTES) {
    throw new Error(`File is too large. Max ${Math.round(MAX_LEDGER_FILE_BYTES / (1024 * 1024))} MB.`);
  }
  if (mimeType && !isAllowedMime(mimeType) && !mimeType.includes('pdf')) {
    throw new Error('Unsupported file type. Use PDF, PNG, JPG, or WebP.');
  }
  return { mimeType, data };
}

function wrapUntrusted(tag: string, value: string): string {
  const cleaned = value.replace(new RegExp(`</?${tag}>`, 'gi'), '');
  return `<${tag}>\n${cleaned}\n</${tag}>`;
}

function extractPrompt(
  fileText: string,
  extraDetails: string,
  signals: HarvestedSignals,
  hasImage: boolean
): string {
  return `Extract one ledger row as JSON. Use EVERY token in the sources below. Do not summarize away names, dates, invoice numbers, or amounts.

SOURCE PRIORITY:
1. TRUSTED_OPERATOR_NOTES — the bookkeeper. They win on conflicts (INR bank debit, card, purpose, entity).
2. LOCKED_* fields in DETERMINISTIC_SIGNALS — copy them into JSON. Do not invent a different date, vendor, or INR total when a lock is present.
3. UNTRUSTED_INVOICE_TEXT — use every remaining word for purpose, line items, tax, subscription, payment rail.
4. ${hasImage ? 'An image of the document is attached — use it only to fill gaps the text did not lock.' : 'No image. The text is the document.'}

${extraDetails ? wrapUntrusted('TRUSTED_OPERATOR_NOTES', extraDetails) : '(No operator notes.)'}

${fileText ? wrapUntrusted('UNTRUSTED_INVOICE_TEXT', fileText) : '(No extracted document text.)'}

<DETERMINISTIC_SIGNALS>
${formatSignalsForPrompt(signals) || '(none)'}
</DETERMINISTIC_SIGNALS>

JSON fields:
- chainOfThought: short. Cite which source filled date, vendor, amount.
- transactionName, type, category, paymentMode, taxClass, dealType
- amount, netAmount, gstAmount (numbers, INR)
- date MUST be YYYY-MM-DD (convert "July 20, 2026" → 2026-07-20)
- vendor, customer, invoiceNumber, businessPurpose, notes
- idfcWowCard, gstApplicable, requiresInrConversion, isSubscription
- subscriptionFrequency: Monthly | Yearly | One-time
- financialYear, month
- confidence_flags for every field: HIGH | MEDIUM | LOW | ABSENT

Enums:
- type: ${Types.join(', ')}
- category: ${Categories.join(', ')}
- paymentMode: ${PaymentModes.join(', ')}
- taxClass: ${TaxClasses.join(', ')}
- dealType: ${DealTypes.join(', ')}

Rules:
- If INR (₹) is printed, do NOT set requiresInrConversion.
- If only USD/EUR/GBP and notes have no INR debit, requiresInrConversion=true and leave amounts null; put foreign figures in notes.
- IDFC / WOW → International Card + idfcWowCard true.
- GST applicable only if GST is explicit.
- SaaS / SuperGrok / ChatGPT / GitHub / Notion → isSubscription true when it is a recurring plan.
- Output JSON only.`;
}

const EXTRACT_SYSTEM =
  'You are a careful Indian-startup bookkeeper. Map the full invoice text and the operator notes into one ledger JSON object. Convert every human date to YYYY-MM-DD. Never drop a vendor name that appears in the letterhead. Operator notes override the invoice when they conflict.';

function confidenceFromMethod(method: string): ConfidenceLevel {
  if (method.includes('Direct Exact Match') || method.includes('Fuzzy Strip Match') || method.includes('Substring Match')) {
    return 'HIGH';
  }
  if (method.includes('Heuristics') || method.includes('Keyword') || method.includes('Card Detection')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

function salvageFromSignals(entry: LedgerEntry, signals: HarvestedSignals): LedgerEntry {
  return applyHarvestLocks(entry, signals);
}

function normalizeStructured(
  raw: Record<string, unknown>,
  fileText: string,
  extraDetails: string,
  signals: HarvestedSignals
): LedgerEntry {
  const context = [extraDetails, fileText, clipText(raw.vendor, 200), clipText(raw.transactionName, 200)].join('\n');

  const typeRes = smartMapValue(String(raw.type || ''), Types, context, 'type');
  const catRes = smartMapValue(String(raw.category || ''), Categories, context, 'category');
  const payRes = smartMapValue(String(raw.paymentMode || ''), PaymentModes, context, 'paymentMode');
  const taxRes = smartMapValue(String(raw.taxClass || ''), TaxClasses, context, 'taxClass');
  const dealRes = smartMapValue(String(raw.dealType || ''), DealTypes, context, 'dealType');

  const flags: Record<string, ConfidenceLevel> = {
    ...(typeof raw.confidence_flags === 'object' && raw.confidence_flags
      ? (raw.confidence_flags as Record<string, ConfidenceLevel>)
      : {}),
    type: confidenceFromMethod(typeRes.method),
    category: confidenceFromMethod(catRes.method),
    paymentMode: confidenceFromMethod(payRes.method),
    taxClass: confidenceFromMethod(taxRes.method),
    dealType: confidenceFromMethod(dealRes.method),
  };

  const amountRaw = typeof raw.amount === 'number' ? raw.amount : Number(raw.amount);
  const entry: LedgerEntry = {
    transactionName: clipText(raw.transactionName, 180) || clipText(raw.vendor, 180) || 'Untitled transaction',
    type: typeRes.resolved,
    category: catRes.resolved,
    amount: Number.isFinite(amountRaw) ? amountRaw : 0,
    netAmount:
      typeof raw.netAmount === 'number'
        ? raw.netAmount
        : Number.isFinite(amountRaw)
          ? amountRaw
          : 0,
    gstAmount: typeof raw.gstAmount === 'number' ? raw.gstAmount : 0,
    date: clipText(raw.date, 40),
    paymentMode: payRes.resolved,
    taxClass: taxRes.resolved,
    dealType: dealRes.resolved,
    vendor: clipText(raw.vendor, 180),
    customer: raw.customer ? clipText(raw.customer, 180) : null,
    invoiceNumber: clipText(raw.invoiceNumber, 80),
    businessPurpose: clipText(raw.businessPurpose, 400),
    idfcWowCard: raw.idfcWowCard === true,
    gstApplicable: raw.gstApplicable === true,
    financialYear: clipText(raw.financialYear, 24),
    month: clipText(raw.month, 20),
    notes: clipText(raw.notes, 1800),
    requiresInrConversion: raw.requiresInrConversion === true,
    isSubscription: raw.isSubscription === true,
    subscriptionFrequency:
      raw.subscriptionFrequency === 'Monthly' ||
      raw.subscriptionFrequency === 'Yearly' ||
      raw.subscriptionFrequency === 'One-time'
        ? raw.subscriptionFrequency
        : 'One-time',
    chainOfThought: clipText(raw.chainOfThought, 2500),
    confidence_flags: flags,
  };

  if (
    entry.paymentMode === 'International Card' &&
    (context.toLowerCase().includes('idfc') || context.toLowerCase().includes('wow'))
  ) {
    entry.idfcWowCard = true;
  }

  const salvaged = salvageFromSignals(entry, signals);
  if (signals.picks.date) flags.date = 'HIGH';
  if (signals.picks.vendor) flags.vendor = 'HIGH';
  if (signals.picks.amount != null) flags.amount = 'HIGH';
  if (signals.picks.invoiceNumber) flags.invoiceNumber = 'HIGH';
  const fused = applyBusinessRules(salvaged, extraDetails);
  const trail = [
    fused.chainOfThought ? `--- MODEL ---\n${fused.chainOfThought}` : '',
    '--- ENGINE ---',
    `Type: ${fused.type} [${typeRes.method}]`,
    `Category: ${fused.category} [${catRes.method}]`,
    `Payment: ${fused.paymentMode} [${payRes.method}]`,
    `Tax: ${fused.taxClass} [${taxRes.method}]`,
    `Deal: ${fused.dealType} [${dealRes.method}]`,
    fused.sourceFusion ? `Fusion: ${fused.sourceFusion}` : '',
    signals.dates[0] ? `Harvested date: ${signals.dates[0]}` : '',
    signals.vendor ? `Harvested vendor: ${signals.vendor}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  fused.chainOfThought = trail;
  fused.confidence_flags = flags;
  return fused;
}

export async function runLedgerExtraction(input: ExtractRequest): Promise<ExtractResult> {
  const extraDetails = clipText(input.extraDetails, MAX_OPERATOR_NOTES_CHARS);
  const fileText = clipText(input.fileText, MAX_LEDGER_TEXT_CHARS);
  const file = decodeFilePayload(input.file);

  if (!file.data && !extraDetails && !fileText) {
    throw new Error('Add an invoice, extracted text, or operator notes.');
  }

  const signals = harvestDocumentSignals(fileText, extraDetails);
  const hasImage = !!(file.data && file.mimeType && file.mimeType.startsWith('image/'));

  let parsed: unknown = {};
  try {
    const mapped = await completeLedgerModel({
      provider: input.provider,
      systemPrompt: EXTRACT_SYSTEM,
      userText: extractPrompt(fileText, extraDetails, signals, hasImage),
      image: hasImage ? { mimeType: file.mimeType || 'image/jpeg', data: file.data || '' } : undefined,
      jsonFormat: true,
    });
    parsed = parseJsonFromModel(mapped.text);
  } catch (error) {
    console.warn('[ledger-extract] model failed, using harvested signals', error);
    parsed = {};
  }

  if (!parsed || typeof parsed !== 'object') parsed = {};

  const data = normalizeStructured(parsed as Record<string, unknown>, fileText, extraDetails, signals);
  const errors: string[] = [];
  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.push('Date is missing or not YYYY-MM-DD.');
  }
  if (data.requiresInrConversion) {
    errors.push('Foreign currency detected — enter the exact INR bank debit.');
  }
  if (!data.vendor) errors.push('Vendor is empty.');

  const flags = data.confidence_flags || {};
  const hasLow = Object.values(flags).includes('LOW') || errors.length > 0;

  return {
    data,
    validation_errors: errors,
    confidence_flags: flags,
    status: hasLow ? 'REVIEW_REQUIRED' : 'DONE',
    fusion: data.sourceFusion || 'Document and notes were merged.',
  };
}

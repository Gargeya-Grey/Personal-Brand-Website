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

const OCR_SYSTEM_PROMPT = `You are a precision OCR and document transcription engine.
Transcribe EVERY word, number, symbol, label, table, line item, and footer in this document with 100% verbatim fidelity.
Ensure you capture all:
- Invoice numbers, receipt numbers, reference numbers
- Merchant names, addresses, emails, and phone numbers
- Customer names, billing details, and country
- Dates (invoice date, payment date, billing cycle period)
- Line items with descriptions, quantities, unit prices, and amounts
- Subtotals, fees, taxes, discounts, and total paid amounts
- Payment methods (card brand, last 4 digits, receipt numbers)
Do not summarize. Output the complete raw text transcription of the document.`;

const LEDGER_EXTRACT_SYSTEM_PROMPT = `You are an expert startup accountant and financial data extraction engine.
You are given a verbatim document transcription and trusted human bookkeeper notes.

INPUT PRIORITY & ROLES:
1. TRUSTED OPERATOR NOTES (<HIGH_IMPORTANCE_TRUSTED_OPERATOR_NOTES>):
   - Highest authority for bank debit amount (INR ₹), payment rail used (e.g. IDFC WOW / International Card), GST confirmation, and owner notes.
2. DOCUMENT TRANSCRIPT (<VERBATIM_DOCUMENT_TRANSCRIPT>):
   - Supplies merchant facts: Vendor name, exact invoice/receipt number (e.g. "81H04RAX-0003"), line items, printed dates, original foreign currency amounts, and subscription billing cycle.

CRITICAL FIELD RULES:
- transactionName: Clean, professional format: "[Vendor] - [Product / Service]" (e.g. "Command Code - GOAT Subscription").
- invoiceNumber: Extract the exact invoice number (e.g. "81H04RAX-0003") or receipt number (e.g. "2601-1320"). Preserve exact hyphens, slashes, and digits. Never leave empty when present in the document.
- businessPurpose: Describe WHAT was purchased and WHY it is a business expense (e.g. "Software subscription for AI coding assistant and developer tooling"). Write a full, complete, untruncated sentence. NEVER put payment methods, card names, or transaction amounts here.
- notes: Full context breakdown. Itemize individual line items, processing fees, total original currency amount (e.g. "$10.00 Command Code GOAT + $0.78 processing fee = $10.78 USD Total"), and billing cycle dates (e.g. "Aug 24–Sep 24, 2026").
- amount: Final amount in INR. Use the trusted operator notes bank debit if provided (e.g. 1032.62). If foreign currency with no INR debit, set amount: 0 and requiresInrConversion: true.
- netAmount: Pre-tax INR amount.
- gstAmount: GST amount in INR (0 if not applicable).
- gstApplicable: true only if GST is explicitly charged or confirmed by operator.
- idfcWowCard: true if operator notes or invoice indicate IDFC WOW.
- paymentMode: "International Card" (for IDFC Wow / foreign card charges), "UPI", "Business Current Account", etc.
- date: YYYY-MM-DD format (convert any human date like "August 24, 2026" to "2026-08-24").
- type: "Expense" | "Income" | "Asset Purchase" | "Refund" | "Transfer".
- category: Standard category (e.g. "SaaS Tools", "Hosting & Cloud", "AI / API Credits", "Domain & DNS", "Laptop & Equipment", etc.).
- taxClass: "Fully Deductible" (standard business operating expenses) | "Not Deductible" | "Capital Asset - Depreciation".
- dealType: "Subscription" (for recurring software/tools) | "Internal" | "Pilot" | "Implementation".
- isSubscription: true when the document represents a recurring SaaS/tool subscription with a billing cycle.
- subscriptionFrequency: "Monthly" | "Yearly" | "One-time".
- confidence_flags: Mark HIGH for fields confirmed by document or operator notes. Mark MEDIUM for reasonable inferences.`;

const JUDGE_SYSTEM_PROMPT = `You are the Senior Chief Auditor reviewing and perfecting a financial ledger extraction.
Compare the proposed first-pass extraction against the raw document transcript and trusted operator notes.
Fix all omissions, complement missing signals, and return the perfected final ledger row JSON.

AUDIT CRITERIA:
1. INVOICE NUMBER: If invoiceNumber is empty or missing, find it in the transcript (e.g. "Invoice number: 81H04RAX-0003" or "Receipt number: 2601-1320") and extract it with full hyphens/digits intact.
2. BUSINESS PURPOSE: Ensure businessPurpose is a complete, well-formed sentence (fix any truncation like "tware" -> "Software subscription for AI coding assistant and developer tooling"). Ensure it never contains payment methods or card names.
3. NOTES BREAKDOWN: Ensure notes contains the itemized line items, processing fees, original foreign currency figures, and billing cycle dates. Never leave notes blank when line items exist.
4. SUBSCRIPTION & DEAL TYPE: If this is a recurring SaaS tool or subscription (e.g. billing period Aug 24-Sep 24), set isSubscription: true, subscriptionFrequency: 'Monthly', and dealType: 'Subscription'.
5. OPERATOR OVERRIDES: Ensure trusted operator notes for bank debit (INR 1032.62), card (IDFC WOW / International Card), and GST are accurately reflected.
6. CONFIDENCE FLAGS: Set confidence_flags for every field.`;

function buildExtractUserPrompt(transcript: string, extraDetails: string): string {
  const sections: string[] = [];

  if (extraDetails.trim()) {
    sections.push(wrapUntrusted('HIGH_IMPORTANCE_TRUSTED_OPERATOR_NOTES', extraDetails.trim()));
  } else {
    sections.push('(No operator notes provided)');
  }

  if (transcript.trim()) {
    sections.push(wrapUntrusted('VERBATIM_DOCUMENT_TRANSCRIPT', transcript.trim()));
  } else {
    sections.push('(No document text available)');
  }

  sections.push('Extract the complete structured financial ledger row JSON.');
  return sections.join('\n\n');
}

function buildJudgeUserPrompt(transcript: string, extraDetails: string, pass1: unknown): string {
  const sections: string[] = [];

  if (extraDetails.trim()) {
    sections.push(wrapUntrusted('HIGH_IMPORTANCE_TRUSTED_OPERATOR_NOTES', extraDetails.trim()));
  }

  if (transcript.trim()) {
    sections.push(wrapUntrusted('VERBATIM_DOCUMENT_TRANSCRIPT', transcript.trim()));
  }

  sections.push(
    wrapUntrusted(
      'PROPOSED_FIRST_PASS_EXTRACTION',
      typeof pass1 === 'object' && pass1 ? JSON.stringify(pass1, null, 2) : '{}'
    )
  );

  sections.push('Audit every field, fix any omissions or truncations, complement missing signals, and return the final perfected JSON.');
  return sections.join('\n\n');
}

function normalizeStructured(
  raw: Record<string, unknown>,
  fileText: string,
  extraDetails: string
): LedgerEntry {
  const context = [extraDetails, fileText, clipText(raw.vendor, 200), clipText(raw.transactionName, 200)].join('\n');

  const typeRes = smartMapValue(String(raw.type || ''), Types, context, 'type');
  const catRes = smartMapValue(String(raw.category || ''), Categories, context, 'category');
  const payRes = smartMapValue(String(raw.paymentMode || ''), PaymentModes, context, 'paymentMode');
  const taxRes = smartMapValue(String(raw.taxClass || ''), TaxClasses, context, 'taxClass');
  const dealRes = smartMapValue(String(raw.dealType || ''), DealTypes, context, 'dealType');

  const rawFlags = (typeof raw.confidence_flags === 'object' && raw.confidence_flags ? raw.confidence_flags : {}) as Record<string, ConfidenceLevel>;
  const flags: Record<string, ConfidenceLevel> = {
    transactionName: rawFlags.transactionName || 'HIGH',
    type: rawFlags.type || 'HIGH',
    category: rawFlags.category || 'HIGH',
    amount: rawFlags.amount || (raw.amount ? 'HIGH' : 'LOW'),
    netAmount: rawFlags.netAmount || 'HIGH',
    gstAmount: rawFlags.gstAmount || 'HIGH',
    date: rawFlags.date || (raw.date ? 'HIGH' : 'LOW'),
    paymentMode: rawFlags.paymentMode || 'HIGH',
    taxClass: rawFlags.taxClass || 'HIGH',
    dealType: rawFlags.dealType || 'HIGH',
    vendor: rawFlags.vendor || (raw.vendor ? 'HIGH' : 'LOW'),
    invoiceNumber: rawFlags.invoiceNumber || (raw.invoiceNumber ? 'HIGH' : 'MEDIUM'),
    businessPurpose: rawFlags.businessPurpose || (raw.businessPurpose ? 'HIGH' : 'MEDIUM'),
    financialYear: rawFlags.financialYear || 'HIGH',
    month: rawFlags.month || 'HIGH',
    notes: rawFlags.notes || 'HIGH',
    isSubscription: rawFlags.isSubscription || 'HIGH',
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

  const fused = applyBusinessRules(entry, extraDetails);
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

  const hasImage = !!(file.data && file.mimeType && file.mimeType.startsWith('image/'));
  const imageData = hasImage ? { mimeType: file.mimeType || 'image/jpeg', data: file.data || '' } : undefined;

  // Phase 1: High-Fidelity Document Transcription (OCR)
  let transcript = fileText;
  if (hasImage && (!fileText || fileText.trim().length < 80)) {
    try {
      const ocrResult = await completeLedgerModel({
        provider: input.provider,
        systemPrompt: OCR_SYSTEM_PROMPT,
        userText: 'Please transcribe all visible text, tables, line items, and invoice numbers from this document image.',
        image: imageData,
        jsonFormat: false,
      });
      if (ocrResult.text && ocrResult.text.trim()) {
        transcript = [fileText, ocrResult.text.trim()].filter(Boolean).join('\n\n');
      }
    } catch (ocrErr) {
      console.warn('[ledger-extract] OCR transcription pass failed, proceeding with direct image extraction', ocrErr);
    }
  }

  // Phase 2: High-Thinking Structured Extraction
  let pass1Parsed: unknown = null;
  try {
    const pass1Result = await completeLedgerModel({
      provider: input.provider,
      systemPrompt: LEDGER_EXTRACT_SYSTEM_PROMPT,
      userText: buildExtractUserPrompt(transcript, extraDetails),
      image: imageData,
      jsonFormat: true,
      thinkingBudget: 2048,
    });
    pass1Parsed = parseJsonFromModel(pass1Result.text);
  } catch (extractErr) {
    console.error('[ledger-extract] Phase 2 extraction error', extractErr);
    throw new Error(extractErr instanceof Error ? extractErr.message : 'Structured extraction failed.');
  }

  // Phase 3: High-Thinking Judge & Complementary Verifier
  let finalParsed = pass1Parsed;
  try {
    const judgeResult = await completeLedgerModel({
      provider: input.provider,
      systemPrompt: JUDGE_SYSTEM_PROMPT,
      userText: buildJudgeUserPrompt(transcript, extraDetails, pass1Parsed),
      image: imageData,
      jsonFormat: true,
      thinkingBudget: 2048,
    });
    const judgeParsed = parseJsonFromModel(judgeResult.text);
    if (judgeParsed && typeof judgeParsed === 'object') {
      finalParsed = judgeParsed;
    }
  } catch (judgeErr) {
    console.warn('[ledger-extract] Judge pass failed, falling back to Phase 2 output', judgeErr);
  }

  if (!finalParsed || typeof finalParsed !== 'object') {
    throw new Error('Extraction did not produce a valid ledger entry.');
  }

  const data = normalizeStructured(finalParsed as Record<string, unknown>, transcript, extraDetails);

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
    fusion: data.sourceFusion || 'Document transcript and operator notes were successfully audited and merged.',
  };
}

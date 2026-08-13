/** Deterministic harvest from invoice text + operator notes. No LLM. */

const MONTH_NAME_TO_INDEX: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

const KNOWN_MERCHANTS: Array<{ match: RegExp; vendor: string }> = [
  { match: /\b(grok\s*xai|xai|x\.ai|supergrok|grok)\b/i, vendor: 'Grok xAI' },
  { match: /\bopenai\b/i, vendor: 'OpenAI' },
  { match: /\banthropic\b|\bclaude\b/i, vendor: 'Anthropic' },
  { match: /\bgoogle\s*workspace\b|\bgemini\s*api\b/i, vendor: 'Google' },
  { match: /\bvercel\b/i, vendor: 'Vercel' },
  { match: /\bsupabase\b/i, vendor: 'Supabase' },
  { match: /\bgithub\b/i, vendor: 'GitHub' },
  { match: /\bnotion\b/i, vendor: 'Notion' },
  { match: /\bfigma\b/i, vendor: 'Figma' },
  { match: /\baws\b|amazon web services/i, vendor: 'Amazon Web Services' },
  { match: /\bcloudflare\b/i, vendor: 'Cloudflare' },
  { match: /\bnamecheap\b/i, vendor: 'Namecheap' },
  { match: /\bgodaddy\b/i, vendor: 'GoDaddy' },
];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toIso(year: number, month: number, day: number): string | null {
  if (year < 1990 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const max = new Date(year, month, 0).getDate();
  if (day > max) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Turn almost any invoice date into YYYY-MM-DD. */
export function parseFlexibleDate(raw: string | null | undefined): string | null {
  const text = (raw || '').trim();
  if (!text) return null;

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text);
  if (iso) return toIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const monthFirst =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[.]?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4})\b/i.exec(
      text
    );
  if (monthFirst) {
    const month = MONTH_NAME_TO_INDEX[monthFirst[1]!.toLowerCase()];
    return toIso(Number(monthFirst[3]), month, Number(monthFirst[2]));
  }

  const dayFirst =
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[.]?(?:,)?\s+(\d{4})\b/i.exec(
      text
    );
  if (dayFirst) {
    const month = MONTH_NAME_TO_INDEX[dayFirst[2]!.toLowerCase()];
    return toIso(Number(dayFirst[3]), month, Number(dayFirst[1]));
  }

  const slash = /\b(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})\b/.exec(text);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    const year = Number(slash[3]);
    if (a > 12 && b <= 12) return toIso(year, b, a);
    if (b > 12 && a <= 12) return toIso(year, a, b);
    return toIso(year, a, b);
  }

  return null;
}

export function collectDates(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const push = (value: string | null) => {
    if (value) found.add(value);
  };

  push(parseFlexibleDate(text));

  const named =
    text.match(
      /\b(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[.]?\s+\d{1,2}(?:st|nd|rd|th)?(?:,)?\s+\d{4}\b/gi
    ) || [];
  for (const chunk of named) push(parseFlexibleDate(chunk));

  const dayNamed =
    text.match(
      /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[.]?(?:,)?\s+\d{4}\b/gi
    ) || [];
  for (const chunk of dayNamed) push(parseFlexibleDate(chunk));

  const isoAll = text.match(/\b20\d{2}-\d{2}-\d{2}\b/g) || [];
  for (const chunk of isoAll) push(parseFlexibleDate(chunk));

  return [...found];
}

export function collectAmounts(text: string): number[] {
  if (!text) return [];
  const amounts = new Set<number>();
  const patterns = [
    /(?:₹|inr|rs\.?)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.\d{1,2})?|[0-9]+(?:\.\d{1,2})?)/gi,
    /(?:usd|\$|eur|€|gbp|£)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d{1,2})?)/gi,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    const clone = new RegExp(pattern.source, pattern.flags);
    while ((match = clone.exec(text))) {
      const value = Number(match[1]!.replace(/,/g, ''));
      if (!Number.isNaN(value) && value > 0) amounts.add(value);
    }
  }
  return [...amounts].sort((a, b) => b - a);
}

const INVOICE_STOP = /^(receipt|date|paid|invoice|number|no|nos|total|amount|bill|to|from|page|qty|description)$/i;

/** Keep invoice/receipt ids; drop following labels like "Receipt number". */
export function cleanInvoiceNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const tokens = raw.replace(/\s+/g, ' ').trim().split(' ');
  const kept: string[] = [];
  for (const token of tokens) {
    if (INVOICE_STOP.test(token)) break;
    if (!/^[A-Z0-9][A-Z0-9\-\/]*$/i.test(token)) break;
    kept.push(token);
  }
  const value = kept.join(' ').trim();
  return value.length >= 4 ? value : null;
}

export function collectInvoiceNumbers(text: string): string[] {
  if (!text) return [];
  const found: string[] = [];
  const patterns = [
    /invoice\s*(?:number|no\.?|#)\s*[:#-]?\s*([A-Z0-9][A-Z0-9\-\/]*(?:\s+[A-Z0-9][A-Z0-9\-\/]*){0,2})/i,
    /receipt\s*(?:number|no\.?|#)\s*[:#-]?\s*([A-Z0-9][A-Z0-9\-\/]*(?:\s+[A-Z0-9][A-Z0-9\-\/]*){0,2})/i,
    /\bINV[-\s]?[A-Z0-9]{4,}\b/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    const cleaned = cleanInvoiceNumber(match?.[1] || match?.[0] || '');
    if (cleaned) found.push(cleaned);
  }
  return [...new Set(found)];
}

export function guessVendor(text: string): string | null {
  if (!text) return null;
  for (const merchant of KNOWN_MERCHANTS) {
    if (merchant.match.test(text)) return merchant.vendor;
  }

  const labeled =
    /(?:from|vendor|billed\s+by|sold\s+by|merchant|payee)\s*[:\-]\s*([A-Za-z0-9][A-Za-z0-9 .,&'\-]{2,60})/i.exec(
      text
    );
  if (labeled?.[1]) return labeled[1].trim();

  return null;
}

export type HarvestedSignals = {
  dates: string[];
  amounts: number[];
  invoiceNumbers: string[];
  vendor: string | null;
  hasInr: boolean;
  hasForeignCurrency: boolean;
  sourcePreview: string;
  picks: {
    date: string | null;
    dateReason: string;
    amount: number | null;
    amountReason: string;
    vendor: string | null;
    vendorReason: string;
    invoiceNumber: string | null;
  };
  complete: boolean;
};

const DATE_LABEL =
  /(?:date\s*paid|payment\s*date|invoice\s*date|dated|paid\s+on)\s*[:\-]?\s*([^\n]{6,40})/i;
const AMOUNT_LABEL =
  /(?:amount\s*paid|grand\s*total|total\s*paid|total(?!\s*tax))\s*[:\-]?\s*(?:₹|inr|rs\.?)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i;

function labeledDate(text: string): string | null {
  const match = DATE_LABEL.exec(text);
  return match ? parseFlexibleDate(match[1]) : null;
}

function labeledAmount(text: string): number | null {
  const match = AMOUNT_LABEL.exec(text);
  if (!match) return null;
  const value = Number(match[1]!.replace(/,/g, ''));
  return !Number.isNaN(value) && value > 0 ? value : null;
}

export function harvestDocumentSignals(fileText: string, extraDetails: string): HarvestedSignals {
  const notes = extraDetails || '';
  const document = fileText || '';
  const combined = `${notes}\n${document}`;

  const noteDates = collectDates(notes);
  const docDates = collectDates(document);
  const dates = [...new Set([...noteDates, ...docDates])];

  const noteAmounts = collectAmounts(notes);
  const docAmounts = collectAmounts(document);
  const amounts = [...new Set([...noteAmounts, ...docAmounts])].sort((a, b) => b - a);

  const invoiceNumbers = [
    ...new Set([...collectInvoiceNumbers(notes), ...collectInvoiceNumbers(document)]),
  ];

  const noteVendor = guessVendor(notes);
  const docVendor = guessVendor(document);

  const dateFromNotes = labeledDate(notes) || noteDates[0] || null;
  const dateFromDoc = labeledDate(document) || docDates[0] || null;
  const amountFromNotes = labeledAmount(notes) || noteAmounts[0] || null;
  const amountFromDoc = labeledAmount(document) || docAmounts[0] || null;

  const labeledInvoice = (blob: string) => {
    const match =
      /invoice\s*(?:number|no\.?|#)\s*[:#-]?\s*([A-Z0-9][A-Z0-9\-\/]*(?:\s+[A-Z0-9][A-Z0-9\-\/]*){0,2})/i.exec(
        blob
      );
    return cleanInvoiceNumber(match?.[1] || '');
  };

  const picks = {
    date: dateFromNotes || dateFromDoc,
    dateReason: dateFromNotes
      ? 'operator notes'
      : labeledDate(document)
        ? 'labeled date on invoice (Date paid / Invoice date)'
        : dateFromDoc
          ? 'first date in invoice text'
          : 'none',
    amount: amountFromNotes || amountFromDoc,
    amountReason: amountFromNotes
      ? 'operator notes'
      : labeledAmount(document)
        ? 'labeled Amount paid / Total'
        : amountFromDoc
          ? 'largest printed amount'
          : 'none',
    vendor: noteVendor || docVendor,
    vendorReason: noteVendor ? 'operator notes' : docVendor ? 'known merchant or labeled vendor' : 'none',
    invoiceNumber: labeledInvoice(notes) || labeledInvoice(document) || invoiceNumbers[0] || null,
  };

  const hasInr = /₹|\binr\b|\brs\.?\b/i.test(combined);
  const hasForeignCurrency =
    /(?:\busd\b|\$\s*\d|\beur\b|€|\bgbp\b|£)/i.test(combined) && !hasInr;

  return {
    dates: picks.date ? [picks.date, ...dates.filter((item) => item !== picks.date)] : dates,
    amounts,
    invoiceNumbers,
    vendor: picks.vendor,
    hasInr,
    hasForeignCurrency,
    sourcePreview: combined.replace(/\s+/g, ' ').trim().slice(0, 280),
    picks,
    complete: !!(picks.date && picks.vendor && (picks.amount || hasForeignCurrency)),
  };
}

export function formatSignalsForPrompt(signals: HarvestedSignals): string {
  const { picks } = signals;
  const lines = [
    picks.date ? `LOCKED_DATE: ${picks.date} (${picks.dateReason})` : 'LOCKED_DATE: (none)',
    picks.vendor ? `LOCKED_VENDOR: ${picks.vendor} (${picks.vendorReason})` : 'LOCKED_VENDOR: (none)',
    picks.amount != null ? `LOCKED_AMOUNT: ${picks.amount} (${picks.amountReason})` : 'LOCKED_AMOUNT: (none)',
    picks.invoiceNumber ? `LOCKED_INVOICE: ${picks.invoiceNumber}` : '',
    signals.dates.length > 1 ? `other_dates_seen: ${signals.dates.slice(1).join(', ')}` : '',
    `currency_inr_seen: ${signals.hasInr ? 'yes' : 'no'}`,
    `foreign_currency_without_inr: ${signals.hasForeignCurrency ? 'yes' : 'no'}`,
    `harvest_complete: ${signals.complete ? 'yes' : 'no'}`,
  ].filter(Boolean);
  return lines.join('\n');
}

/** Harvested labeled facts beat the model. Operator notes already sit in picks. */
export function applyHarvestLocks<
  T extends {
    date?: string;
    vendor?: string;
    amount?: number;
    invoiceNumber?: string;
    requiresInrConversion?: boolean;
    transactionName?: string;
    netAmount?: number;
    notes?: string;
    isSubscription?: boolean;
    subscriptionFrequency?: string;
    dealType?: string;
  },
>(entry: T, signals: HarvestedSignals): T {
  const next = { ...entry };
  const corpus = `${signals.sourcePreview} ${next.transactionName || ''} ${next.notes || ''}`;

  if (signals.picks.date) {
    next.date = signals.picks.date;
  } else {
    const parsed = parseFlexibleDate(next.date);
    if (parsed) next.date = parsed;
  }

  if (signals.picks.vendor && !next.vendor) {
    next.vendor = signals.picks.vendor;
  } else if (signals.picks.vendor && next.vendor && next.vendor.toLowerCase() !== signals.picks.vendor.toLowerCase()) {
    const modelLooksWeak = next.vendor.length < 3 || /unknown|n\/a|null/i.test(next.vendor);
    if (modelLooksWeak) next.vendor = signals.picks.vendor;
  }

  if (signals.picks.amount != null && (!next.amount || next.amount <= 0)) {
    next.amount = signals.picks.amount;
    if (!next.netAmount) next.netAmount = signals.picks.amount;
  }

  const modelInvoice = cleanInvoiceNumber(next.invoiceNumber);
  const harvestedInvoice = cleanInvoiceNumber(signals.picks.invoiceNumber);
  next.invoiceNumber = modelInvoice || harvestedInvoice || '';

  if (signals.hasInr) next.requiresInrConversion = false;

  if (/supergrok|subscription|monthly plan|billed monthly/i.test(corpus)) {
    next.isSubscription = true;
    if (!next.subscriptionFrequency || next.subscriptionFrequency === 'One-time') {
      next.subscriptionFrequency = 'Monthly';
    }
    if (next.dealType === 'Internal' || !next.dealType) next.dealType = 'Subscription';
  }

  if ((!next.transactionName || next.transactionName === 'Untitled transaction') && next.vendor) {
    next.transactionName = next.invoiceNumber ? `${next.vendor} – ${next.invoiceNumber}` : next.vendor;
  }

  if (next.notes && /harvest locks:/i.test(next.notes)) {
    next.notes = next.notes
      .split('\n')
      .filter((line) => !/harvest locks:/i.test(line))
      .join('\n')
      .trim();
  }

  return next;
}

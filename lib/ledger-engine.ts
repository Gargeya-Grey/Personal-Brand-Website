import {
  CALENDAR_MONTHS,
  Categories,
  DealTypes,
  MONTH_INDEX,
  Months,
  PaymentModes,
  SubscriptionFrequencies,
  TaxClasses,
  Types,
  type LedgerEntry,
  type SubscriptionFrequency,
} from './ledger-schema';

export function stripEnum(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function indianFyFromDate(isoDate: string): { financialYear: string; month: string } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((isoDate || '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthNum = Number(match[2]);
  const day = Number(match[3]);
  if (!year || monthNum < 1 || monthNum > 12 || day < 1 || day > 31) return null;

  const monthIndex = monthNum - 1;
  const fyStart = monthIndex >= 3 ? year : year - 1;
  return {
    financialYear: `FY ${fyStart}-${String(fyStart + 1).slice(-2)}`,
    month: CALENDAR_MONTHS[monthIndex] || '',
  };
}

export function parseFyStartYear(financialYear: string | undefined, fallbackYear: number): number {
  const match = /FY\s*(\d{4})/.exec(financialYear || '');
  if (!match) return fallbackYear;
  return Number(match[1]) || fallbackYear;
}

export function clampDayInMonth(year: number, monthIndex: number, day: number): {
  day: number;
  truncated: boolean;
} {
  const maxDays = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(Math.max(1, day), maxDays);
  return { day: safeDay, truncated: safeDay !== day };
}

export function dateForFyMonth(
  targetMonth: string,
  originalDay: number,
  fyStartYear: number
): { date: string; truncated: boolean; year: number } {
  const monthIdx = MONTH_INDEX[targetMonth] ?? 3;
  const targetYear = monthIdx >= 3 ? fyStartYear : fyStartYear + 1;
  const { day, truncated } = clampDayInMonth(targetYear, monthIdx, originalDay);
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(monthIdx + 1).padStart(2, '0');
  return {
    date: `${targetYear}-${formattedMonth}-${formattedDay}`,
    truncated,
    year: targetYear,
  };
}

export function replaceMonthInName(name: string, fromMonth: string | undefined, toMonth: string): string {
  const current = name || '';
  if (fromMonth && current.includes(fromMonth)) {
    return current.replace(fromMonth, toMonth);
  }
  const found = Months.find((month) => current.includes(month));
  if (found) return current.replace(found, toMonth);
  return `${current} - ${toMonth}`.replace(/^\s-\s/, toMonth);
}

export function generateEntryForMonth(base: LedgerEntry, targetMonth: string): LedgerEntry {
  let originalDay = 15;
  if (base.date) {
    const parts = base.date.split('-');
    if (parts.length === 3) originalDay = Number(parts[2]) || 15;
  }

  const fallbackYear = new Date().getFullYear();
  const fyStartYear = parseFyStartYear(base.financialYear, fallbackYear);
  const shifted = dateForFyMonth(targetMonth, originalDay, fyStartYear);
  const fy = indianFyFromDate(shifted.date);

  return {
    ...base,
    transactionName: replaceMonthInName(base.transactionName, base.month, targetMonth),
    date: shifted.date,
    month: targetMonth,
    financialYear: fy?.financialYear || base.financialYear,
  };
}

export function monthNeedsTruncation(originalDay: number, monthName: string, year: number): boolean {
  const monthIdx = MONTH_INDEX[monthName];
  if (monthIdx === undefined) return false;
  return clampDayInMonth(year, monthIdx, originalDay).truncated;
}

function fallbackContextScan(
  allowedValues: readonly string[],
  contextText: string,
  fieldName: string,
  rawAttempt?: string
): { resolved: string; method: string } {
  const context = contextText.toLowerCase();

  if (fieldName === 'type') {
    if (context.includes('refund') || context.includes('reimbursement')) {
      return { resolved: 'Refund', method: 'Context Keyword: refund' };
    }
    if (context.includes('transfer') || context.includes('wire transfer')) {
      return { resolved: 'Transfer', method: 'Context Keyword: transfer' };
    }
    if (
      context.includes('income') ||
      context.includes('revenue') ||
      context.includes('paid by customer') ||
      context.includes('pilot pricing') ||
      context.includes('sales receipt')
    ) {
      return { resolved: 'Income', method: 'Context Keyword: income/revenue' };
    }
    if (
      context.includes('macbook') ||
      context.includes('laptop') ||
      context.includes('monitor') ||
      context.includes('hardware')
    ) {
      return { resolved: 'Asset Purchase', method: 'Context Keyword: laptop/asset' };
    }
    return { resolved: 'Expense', method: 'Default Fallback (general invoice)' };
  }

  if (fieldName === 'category') {
    if (
      context.includes('domain') ||
      context.includes('dns') ||
      context.includes('godaddy') ||
      context.includes('namecheap') ||
      context.includes('cloudflare') ||
      context.includes('name.com')
    ) {
      return { resolved: 'Domain & DNS', method: 'Context Heuristics (Domain/DNS)' };
    }
    if (
      context.includes('aws') ||
      context.includes('vercel') ||
      context.includes('supabase') ||
      context.includes('hosting') ||
      context.includes('cloud') ||
      context.includes('render') ||
      context.includes('digitalocean')
    ) {
      return { resolved: 'Hosting & Cloud', method: 'Context Heuristics (Host/Cloud)' };
    }
    if (
      context.includes('supergrok') ||
      context.includes('chatgpt plus') ||
      context.includes('github copilot') ||
      context.includes('grok xai') ||
      context.includes('x.ai')
    ) {
      return { resolved: 'SaaS Tools', method: 'Context Heuristics (AI subscription SaaS)' };
    }
    if (
      context.includes('openai') ||
      context.includes('anthropic') ||
      context.includes('gemini') ||
      context.includes('api credits') ||
      context.includes('claude') ||
      context.includes('deepseek') ||
      context.includes('gpt-')
    ) {
      return { resolved: 'AI / API Credits', method: 'Context Heuristics (AI Credits)' };
    }
    if (
      context.includes('ads') ||
      context.includes('marketing') ||
      context.includes('google ads') ||
      context.includes('facebook') ||
      context.includes('meta ads') ||
      context.includes('campaign')
    ) {
      return { resolved: 'Marketing & Ads', method: 'Context Heuristics (Ads/Marketing)' };
    }
    if (
      context.includes('laptop') ||
      context.includes('equipment') ||
      context.includes('hardware') ||
      context.includes('macbook') ||
      context.includes('monitor') ||
      context.includes('keyboard')
    ) {
      return { resolved: 'Laptop & Equipment', method: 'Context Heuristics (Hardware)' };
    }
    if (
      context.includes('freelancer') ||
      context.includes('contractor') ||
      context.includes('upwork') ||
      context.includes('fiverr')
    ) {
      return { resolved: 'Contractor / Freelancer', method: 'Context Heuristics (Freelancer)' };
    }
    if (
      context.includes('professional') ||
      context.includes('accounting') ||
      context.includes('legal') ||
      context.includes('ca fee') ||
      context.includes('corporate filing')
    ) {
      return { resolved: 'Professional Fees', method: 'Context Heuristics (Professional)' };
    }
    if (
      context.includes('flight') ||
      context.includes('hotel') ||
      context.includes('uber') ||
      context.includes('travel') ||
      context.includes('cab') ||
      context.includes('ola')
    ) {
      return { resolved: 'Travel', method: 'Context Heuristics (Travel)' };
    }
    if (
      context.includes('utility') ||
      context.includes('internet') ||
      context.includes('wifi') ||
      context.includes('electricity') ||
      context.includes('broadband')
    ) {
      return { resolved: 'Internet & Utilities', method: 'Context Heuristics (Utilities/Wifi)' };
    }
    if (
      context.includes('bank charge') ||
      context.includes('card fee') ||
      context.includes('fx fee') ||
      context.includes('markup') ||
      context.includes('transaction fee')
    ) {
      return { resolved: 'Bank Charges', method: 'Context Heuristics (Bank Charge)' };
    }
    if (
      context.includes('github') ||
      context.includes('notion') ||
      context.includes('figma') ||
      context.includes('linear') ||
      context.includes('slack') ||
      context.includes('saas') ||
      context.includes('subscription')
    ) {
      return { resolved: 'SaaS Tools', method: 'Context Heuristics (SaaS Tools)' };
    }
    if (context.includes('revenue') || context.includes('pilot') || context.includes('customer payment')) {
      if (context.includes('pilot')) return { resolved: 'Pilot Revenue', method: 'Context Revenue (Pilot)' };
      if (context.includes('implementation'))
        return { resolved: 'Implementation Fee', method: 'Context Revenue (Implementation)' };
      if (context.includes('training')) return { resolved: 'Training Revenue', method: 'Context Revenue (Training)' };
      if (context.includes('development'))
        return { resolved: 'Custom Development', method: 'Context Revenue (Custom Dev)' };
      return { resolved: 'Other Revenue', method: 'Context Revenue (Other)' };
    }
    return {
      resolved: 'Office & Misc',
      method: `Heuristic Default (unclassified raw value: "${rawAttempt || ''}")`,
    };
  }

  if (fieldName === 'paymentMode') {
    if (context.includes('idfc') || context.includes('wow card') || context.includes('wow business')) {
      return { resolved: 'International Card', method: 'Card Detection (IDFC Wow)' };
    }
    if (
      context.includes('upi') ||
      context.includes('gpay') ||
      context.includes('phonepe') ||
      context.includes('@ok') ||
      context.includes('paytm')
    ) {
      return { resolved: 'UPI', method: 'Context Heuristics (UPI)' };
    }
    if (
      context.includes('auto debit') ||
      context.includes('auto-debit') ||
      context.includes('mandate') ||
      context.includes('standing instruction')
    ) {
      return { resolved: 'Auto Debit', method: 'Context Heuristics (Auto Debit)' };
    }
    if (
      context.includes('neft') ||
      context.includes('imps') ||
      context.includes('rtgs') ||
      context.includes('bank transfer')
    ) {
      return { resolved: 'NEFT / IMPS', method: 'Context Heuristics (NEFT/IMPS)' };
    }
    if (/\bcash\b/.test(context)) {
      return { resolved: 'Cash', method: 'Context Heuristics (Cash)' };
    }
    if (
      context.includes('personal card') ||
      context.includes('reimburse') ||
      context.includes('personal expense')
    ) {
      return { resolved: 'Personal Card - Reimbursable', method: 'Context Heuristics (Personal Card)' };
    }
    if (
      context.includes('usd') ||
      context.includes('eur') ||
      context.includes('gbp') ||
      context.includes('visa') ||
      context.includes('mastercard') ||
      context.includes('stripe')
    ) {
      return { resolved: 'International Card', method: 'Currency/Merchant Match (International Card)' };
    }
    return { resolved: 'Business Current Account', method: 'Default Payment Mode' };
  }

  if (fieldName === 'taxClass') {
    if (context.includes('income') || context.includes('revenue') || context.includes('customer invoice')) {
      return { resolved: 'Revenue - Taxable', method: 'Tax Classification (Revenue)' };
    }
    if (
      context.includes('laptop') ||
      context.includes('hardware') ||
      context.includes('macbook') ||
      context.includes('equipment')
    ) {
      return { resolved: 'Capital Asset - Depreciation', method: 'Tax Classification (Depreciation)' };
    }
    if (context.includes('personal') || context.includes('entertainment') || context.includes('penalty')) {
      return { resolved: 'Not Deductible', method: 'Tax Classification (Not Deductible)' };
    }
    return { resolved: 'Fully Deductible', method: 'Standard Business Operating Expense' };
  }

  if (fieldName === 'dealType') {
    if (context.includes('income') || context.includes('revenue') || context.includes('received from')) {
      if (context.includes('pilot')) return { resolved: 'Pilot', method: 'Revenue Deal (Pilot)' };
      if (context.includes('implementation'))
        return { resolved: 'Implementation', method: 'Revenue Deal (Implementation)' };
      if (context.includes('training')) return { resolved: 'Training', method: 'Revenue Deal (Training)' };
      if (context.includes('development'))
        return { resolved: 'Custom Development', method: 'Revenue Deal (Custom Dev)' };
      return { resolved: 'Subscription', method: 'Revenue Deal (Subscription)' };
    }
    return { resolved: 'Internal', method: 'Default Expense Deal Type' };
  }

  return { resolved: allowedValues[0] || '', method: 'First-option Fallback' };
}

export function smartMapValue(
  rawVal: string | null | undefined,
  allowedValues: readonly string[],
  contextText: string,
  fieldName: string
): { resolved: string; method: string } {
  const normalizedRaw = (rawVal || '').trim();
  if (!normalizedRaw) {
    return fallbackContextScan(allowedValues, contextText, fieldName);
  }

  const lowercaseRaw = normalizedRaw.toLowerCase();
  for (const val of allowedValues) {
    if (val.toLowerCase() === lowercaseRaw) {
      return { resolved: val, method: 'Direct Exact Match' };
    }
  }

  const strippedRaw = stripEnum(normalizedRaw);
  for (const val of allowedValues) {
    if (stripEnum(val) === strippedRaw) {
      return { resolved: val, method: 'Fuzzy Strip Match' };
    }
  }

  for (const val of allowedValues) {
    if (val.toLowerCase().includes(lowercaseRaw) || lowercaseRaw.includes(val.toLowerCase())) {
      return { resolved: val, method: 'Substring Match' };
    }
  }

  return fallbackContextScan(allowedValues, contextText, fieldName, normalizedRaw);
}

const NOTE_INR_PATTERNS = [
  /(?:inr|rs\.?|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
  /(?:bank|charged|deducted|paid|actual)\s*(?:amount|as)?\s*(?:is|=|:)?\s*(?:inr|rs\.?|₹)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
];

export function parseInrFromOperatorNotes(notes: string): number | null {
  const text = notes.trim();
  if (!text) return null;
  for (const pattern of NOTE_INR_PATTERNS) {
    const match = pattern.exec(text);
    if (!match) continue;
    const amount = Number(String(match[1]).replace(/,/g, ''));
    if (!Number.isNaN(amount) && amount > 0) return amount;
  }
  return null;
}

export function applyOperatorNotes(
  entry: LedgerEntry,
  operatorNotes: string
): { entry: LedgerEntry; overrides: string[]; fusion: string } {
  const notes = operatorNotes.trim();
  if (!notes) {
    return { entry, overrides: [], fusion: 'No operator notes — used document facts only.' };
  }

  const overrides: string[] = [];
  const next: LedgerEntry = { ...entry };
  const lower = notes.toLowerCase();

  const inr = parseInrFromOperatorNotes(notes);
  if (inr !== null) {
    next.amount = inr;
    if (next.gstAmount && next.gstAmount > 0 && next.gstAmount < inr) {
      next.netAmount = Number((inr - next.gstAmount).toFixed(2));
    } else if (!next.netAmount) {
      next.netAmount = inr;
    }
    next.requiresInrConversion = false;
    overrides.push('amount');
  }

  const pay = smartMapValue(undefined, PaymentModes, notes, 'paymentMode');
  if (
    pay.method !== 'Default Payment Mode' &&
    pay.resolved !== next.paymentMode
  ) {
    next.paymentMode = pay.resolved;
    overrides.push('paymentMode');
  }

  if (lower.includes('idfc') || lower.includes('wow')) {
    next.idfcWowCard = true;
    next.paymentMode = 'International Card';
    if (!overrides.includes('paymentMode')) overrides.push('paymentMode');
    overrides.push('idfcWowCard');
  }

  if (lower.includes('gst') && (lower.includes('applicable') || lower.includes('yes') || lower.includes('charged'))) {
    next.gstApplicable = true;
    overrides.push('gstApplicable');
  }

  if (lower.includes('not gst') || lower.includes('no gst') || lower.includes('gst not')) {
    next.gstApplicable = false;
    overrides.push('gstApplicable');
  }

  const purposeHint = notes.replace(/\s+/g, ' ').trim();
  const paymentOnlyNote =
    /^(used\s+)?(idfc|wow|upi|visa|mastercard|card)(\s+\w+){0,5}$/i.test(purposeHint) ||
    purposeHint.length < 12;
  if (!paymentOnlyNote) {
    if (!next.businessPurpose || next.businessPurpose.length < 8) {
      next.businessPurpose = purposeHint.slice(0, 220);
      overrides.push('businessPurpose');
    } else {
      const existing = next.notes || '';
      if (!existing.toLowerCase().includes(purposeHint.slice(0, 40).toLowerCase())) {
        next.notes = [existing, purposeHint].filter(Boolean).join('\n').slice(0, 1800);
      }
    }
  }

  const typeHint = smartMapValue(undefined, Types, notes, 'type');
  if (typeHint.method.startsWith('Context Keyword') && typeHint.resolved !== next.type) {
    next.type = typeHint.resolved;
    overrides.push('type');
  }

  const catHint = smartMapValue(undefined, Categories, notes, 'category');
  if (catHint.method.includes('Heuristics') && catHint.resolved !== next.category) {
    next.category = catHint.resolved;
    overrides.push('category');
  }

  next.operatorOverrides = [...new Set(overrides)];
  const fusion =
    overrides.length > 0
      ? `Operator notes took priority for: ${overrides.join(', ')}. Invoice/OCR supplied the remaining merchant facts.`
      : 'Operator notes were read as extra context. They did not override structured fields; they stay in Notes.';

  return { entry: next, overrides: next.operatorOverrides, fusion };
}

export function applyBusinessRules(raw: LedgerEntry, extraNotes?: string): LedgerEntry {
  const next: LedgerEntry = { ...raw };

  next.gstApplicable = next.gstApplicable === true;
  next.idfcWowCard = next.idfcWowCard === true;

  if (next.type === 'Expense') {
    next.customer = null;
  }

  const fy = next.date ? indianFyFromDate(next.date) : null;
  if (fy) {
    next.financialYear = fy.financialYear;
    next.month = fy.month;
  }

  if (next.isSubscription !== true) next.isSubscription = false;
  if (!next.subscriptionFrequency || !SubscriptionFrequencies.includes(next.subscriptionFrequency)) {
    next.subscriptionFrequency = next.isSubscription ? 'Monthly' : 'One-time';
  }

  if (typeof next.amount !== 'number' || Number.isNaN(next.amount)) next.amount = 0;
  if (typeof next.netAmount !== 'number' || Number.isNaN(next.netAmount)) next.netAmount = next.amount;
  if (typeof next.gstAmount !== 'number' || Number.isNaN(next.gstAmount)) next.gstAmount = 0;

  next.amount = Number(next.amount.toFixed(2));
  next.netAmount = Number(next.netAmount.toFixed(2));
  next.gstAmount = Number(next.gstAmount.toFixed(2));

  if (extraNotes) {
    const fused = applyOperatorNotes(next, extraNotes);
    fused.entry.sourceFusion = fused.fusion;
    return fused.entry;
  }

  return next;
}

export function clipText(value: unknown, max = 1800): string {
  return String(value ?? '')
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, max);
}

export function validateLedgerEntry(raw: unknown): { ok: true; entry: LedgerEntry } | { ok: false; error: string } {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'Entry must be an object.' };
  }
  const data = raw as Record<string, unknown>;
  const transactionName = clipText(data.transactionName, 180);
  if (!transactionName) return { ok: false, error: 'Transaction name is required.' };

  const date = clipText(data.date, 32);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: 'Date must be YYYY-MM-DD.' };
  }

  const type = smartMapValue(clipText(data.type, 40), Types, transactionName, 'type').resolved;
  const category = smartMapValue(clipText(data.category, 60), Categories, transactionName, 'category').resolved;
  const paymentMode = smartMapValue(
    clipText(data.paymentMode, 60),
    PaymentModes,
    `${transactionName} ${clipText(data.notes, 200)}`,
    'paymentMode'
  ).resolved;
  const taxClass = smartMapValue(clipText(data.taxClass, 60), TaxClasses, transactionName, 'taxClass').resolved;
  const dealType = smartMapValue(clipText(data.dealType, 60), DealTypes, transactionName, 'dealType').resolved;

  const amount = Number(data.amount);
  if (Number.isNaN(amount) || amount < 0) return { ok: false, error: 'Amount must be a non-negative number.' };

  const freqRaw = clipText(data.subscriptionFrequency, 20);
  const subscriptionFrequency = SubscriptionFrequencies.includes(freqRaw as SubscriptionFrequency)
    ? (freqRaw as SubscriptionFrequency)
    : 'One-time';

  const entry: LedgerEntry = {
    transactionName,
    type,
    category,
    amount: Number(amount.toFixed(2)),
    netAmount: Number((Number(data.netAmount) || amount).toFixed(2)),
    gstAmount: Number((Number(data.gstAmount) || 0).toFixed(2)),
    date,
    paymentMode,
    taxClass,
    dealType,
    vendor: clipText(data.vendor, 180),
    customer: data.customer ? clipText(data.customer, 180) : null,
    invoiceNumber: clipText(data.invoiceNumber, 80),
    businessPurpose: clipText(data.businessPurpose, 400),
    idfcWowCard: data.idfcWowCard === true,
    gstApplicable: data.gstApplicable === true,
    financialYear: clipText(data.financialYear, 24),
    month: clipText(data.month, 20),
    notes: clipText(data.notes, 1800),
    requiresInrConversion: data.requiresInrConversion === true,
    isSubscription: data.isSubscription === true,
    subscriptionFrequency,
  };

  const fy = indianFyFromDate(entry.date);
  if (fy) {
    entry.financialYear = fy.financialYear;
    entry.month = fy.month;
  }

  if (entry.type === 'Expense') entry.customer = null;

  return { ok: true, entry };
}

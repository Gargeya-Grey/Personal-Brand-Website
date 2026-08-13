export const Types = [
  'Income',
  'Expense',
  'Asset Purchase',
  'Refund',
  'Transfer',
] as const;

export const Categories = [
  'Platform Subscription',
  'Pilot Revenue',
  'Implementation Fee',
  'Training Revenue',
  'Custom Development',
  'Other Revenue',
  'AI / API Credits',
  'SaaS Tools',
  'Hosting & Cloud',
  'Domain & DNS',
  'Laptop & Equipment',
  'Internet & Utilities',
  'Marketing & Ads',
  'Contractor / Freelancer',
  'Professional Fees',
  'Travel',
  'Office & Misc',
  'Bank Charges',
] as const;

export const PaymentModes = [
  'UPI',
  'Business Current Account',
  'Personal Card - Reimbursable',
  'NEFT / IMPS',
  'Cash',
  'Auto Debit',
  'International Card',
] as const;

export const TaxClasses = [
  'Fully Deductible',
  'Partly Deductible',
  'Capital Asset - Depreciation',
  'Not Deductible',
  'Revenue - Taxable',
] as const;

export const DealTypes = [
  'Subscription',
  'Pilot',
  'Implementation',
  'Export',
  'Training',
  'Custom Development',
  'Internal',
] as const;

export const Months = [
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
  'January',
  'February',
  'March',
] as const;

export const SubscriptionFrequencies = ['Monthly', 'Yearly', 'One-time'] as const;

export type LedgerType = (typeof Types)[number];
export type LedgerCategory = (typeof Categories)[number];
export type LedgerPaymentMode = (typeof PaymentModes)[number];
export type LedgerTaxClass = (typeof TaxClasses)[number];
export type LedgerDealType = (typeof DealTypes)[number];
export type LedgerMonth = (typeof Months)[number];
export type SubscriptionFrequency = (typeof SubscriptionFrequencies)[number];
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'ABSENT';

export const CALENDAR_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

export const MONTH_INDEX: Record<string, number> = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

export type LedgerEntry = {
  transactionName: string;
  type: string;
  category: string;
  amount: number;
  netAmount: number;
  gstAmount: number;
  date: string;
  paymentMode: string;
  taxClass: string;
  dealType: string;
  vendor: string;
  customer?: string | null;
  invoiceNumber: string;
  businessPurpose: string;
  idfcWowCard: boolean;
  gstApplicable: boolean;
  financialYear: string;
  month: string;
  notes: string;
  requiresInrConversion?: boolean;
  chainOfThought?: string;
  confidence_flags?: Record<string, ConfidenceLevel>;
  isSubscription?: boolean;
  subscriptionFrequency?: SubscriptionFrequency;
  /** Fields the operator notes overrode or supplied. */
  operatorOverrides?: string[];
  /** Short explanation of how notes + document were fused. */
  sourceFusion?: string;
};

export const MAX_LEDGER_FILE_BYTES = 6 * 1024 * 1024;
export const MAX_LEDGER_TEXT_CHARS = 80_000;
export const MAX_OPERATOR_NOTES_CHARS = 8_000;
export const MAX_LEDGER_BATCH = 12;
export const ALLOWED_LEDGER_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export function financialYearOptions(now = new Date()): string[] {
  const calendarYear = now.getFullYear();
  const currentFyStart = now.getMonth() >= 3 ? calendarYear : calendarYear - 1;
  const start = currentFyStart - 1;
  return [0, 1, 2, 3].map((offset) => {
    const fy = start + offset;
    return `FY ${fy}-${String(fy + 1).slice(-2)}`;
  });
}

export function isAllowedMime(mime: string | undefined | null): boolean {
  if (!mime) return false;
  return ALLOWED_LEDGER_MIMES.has(mime.toLowerCase().trim());
}

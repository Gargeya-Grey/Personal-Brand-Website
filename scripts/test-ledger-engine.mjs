/**
 * Calendar + harvest checks.
 * Run: npm run test:ledger
 */
import assert from 'node:assert/strict';
import {
  applyHarvestLocks,
  collectAmounts,
  collectInvoiceNumbers,
  guessVendor,
  harvestDocumentSignals,
  parseFlexibleDate,
} from '../lib/ledger-parse.ts';

function indianFyFromDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((isoDate || '').trim());
  if (!match) return null;
  const year = Number(match[1]);
  const monthNum = Number(match[2]);
  const day = Number(match[3]);
  if (!year || monthNum < 1 || monthNum > 12 || day < 1 || day > 31) return null;
  const monthIndex = monthNum - 1;
  const fyStart = monthIndex >= 3 ? year : year - 1;
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return { financialYear: `FY ${fyStart}-${String(fyStart + 1).slice(-2)}`, month: months[monthIndex] };
}

function clampDayInMonth(year, monthIndex, day) {
  const maxDays = new Date(year, monthIndex + 1, 0).getDate();
  const safeDay = Math.min(Math.max(1, day), maxDays);
  return { day: safeDay, truncated: safeDay !== day };
}

function dateForFyMonth(targetMonth, originalDay, fyStartYear) {
  const MONTH_INDEX = {
    January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
    July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
  };
  const monthIdx = MONTH_INDEX[targetMonth] ?? 3;
  const targetYear = monthIdx >= 3 ? fyStartYear : fyStartYear + 1;
  const { day, truncated } = clampDayInMonth(targetYear, monthIdx, originalDay);
  return {
    date: `${targetYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    truncated,
    year: targetYear,
  };
}

assert.deepEqual(indianFyFromDate('2026-04-01'), { financialYear: 'FY 2026-27', month: 'April' });
assert.deepEqual(indianFyFromDate('2026-03-31'), { financialYear: 'FY 2025-26', month: 'March' });
assert.equal(indianFyFromDate('bad'), null);

const feb = dateForFyMonth('February', 31, 2026);
assert.equal(feb.date, '2027-02-28');
assert.equal(feb.truncated, true);
assert.equal(dateForFyMonth('June', 31, 2026).date, '2026-06-30');
assert.equal(dateForFyMonth('April', 15, 2026).date, '2026-04-15');

assert.equal(parseFlexibleDate('July 20, 2026'), '2026-07-20');
assert.equal(parseFlexibleDate('Jul 20 2026'), '2026-07-20');
assert.equal(parseFlexibleDate('20 July 2026'), '2026-07-20');
assert.equal(parseFlexibleDate('2026-07-20'), '2026-07-20');
assert.equal(parseFlexibleDate('20/07/2026'), '2026-07-20');

const receipt = `
Receipt
Invoice number BJWTF8LV 0001
Receipt number 2726 6648
Date paid July 20, 2026
Grok xAI
1450 Page Mill Road
Bill to Gargeya
₹700.00 paid on July 20, 2026
SuperGrok
Jul 20 Aug 20, 2026
Amount paid ₹700.00
Visa - 0542
`;

const signals = harvestDocumentSignals(receipt, 'Paid on IDFC WOW. Keep SuperGrok.');
assert.equal(signals.dates.includes('2026-07-20'), true);
assert.equal(signals.vendor, 'Grok xAI');
assert.equal(signals.amounts[0], 700);
assert.equal(signals.hasInr, true);
assert.ok(collectInvoiceNumbers(receipt).some((value) => /BJWTF8LV/i.test(value)));
assert.equal(
  collectInvoiceNumbers(receipt).find((value) => /BJWTF8LV/i.test(value)),
  'BJWTF8LV 0001'
);
assert.ok(!collectInvoiceNumbers(receipt).some((value) => /receipt nu/i.test(value)));
assert.equal(signals.picks.invoiceNumber, 'BJWTF8LV 0001');
assert.equal(guessVendor('support@x.ai SuperGrok'), 'Grok xAI');
assert.ok(collectAmounts('Total ₹1,847.50').includes(1847.5));

const notesWin = harvestDocumentSignals(receipt, 'Bank debit INR 1847 on 21 July 2026');
assert.equal(notesWin.dates[0], '2026-07-21');
assert.equal(notesWin.picks.date, '2026-07-21');
assert.equal(signals.complete, true);
assert.equal(signals.picks.date, '2026-07-20');
assert.equal(signals.picks.amount, 700);
assert.match(signals.picks.dateReason, /labeled date/i);

const locked = applyHarvestLocks(
  { date: '', vendor: '', amount: 0, transactionName: 'Untitled transaction' },
  signals
);
assert.equal(locked.date, '2026-07-20');
assert.equal(locked.vendor, 'Grok xAI');
assert.equal(locked.amount, 700);

console.log('ledger engine checks passed');

/**
 * Calendar + notes fusion checks (mirrors lib/ledger-engine.ts).
 * Run: npm run test:ledger
 */
import assert from 'node:assert/strict';

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

function parseInrFromOperatorNotes(notes) {
  const patterns = [
    /(?:inr|rs\.?|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
    /(?:bank|charged|deducted|paid|actual)\s*(?:amount|as)?\s*(?:is|=|:)?\s*(?:inr|rs\.?|₹)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(notes.trim());
    if (!match) continue;
    const amount = Number(String(match[1]).replace(/,/g, ''));
    if (!Number.isNaN(amount) && amount > 0) return amount;
  }
  return null;
}

// Indian FY
assert.deepEqual(indianFyFromDate('2026-04-01'), { financialYear: 'FY 2026-27', month: 'April' });
assert.deepEqual(indianFyFromDate('2026-03-31'), { financialYear: 'FY 2025-26', month: 'March' });
assert.equal(indianFyFromDate('bad'), null);

// Leap / 31st clamp
const feb = dateForFyMonth('February', 31, 2026);
assert.equal(feb.date, '2027-02-28');
assert.equal(feb.truncated, true);
const june = dateForFyMonth('June', 31, 2026);
assert.equal(june.date, '2026-06-30');
const april = dateForFyMonth('April', 15, 2026);
assert.equal(april.date, '2026-04-15');
assert.equal(april.truncated, false);

// Operator INR wins
assert.equal(parseInrFromOperatorNotes('Bank shows INR 1,847 charged on IDFC WOW'), 1847);
assert.equal(parseInrFromOperatorNotes('₹20.50 from UPI'), 20.5);
assert.equal(parseInrFromOperatorNotes('no money mentioned'), null);

console.log('ledger engine checks passed');

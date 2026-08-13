import 'server-only';
import { Client } from '@notionhq/client';
import { MAX_LEDGER_BATCH } from '@/lib/ledger-schema';
import { validateLedgerEntry } from '@/lib/ledger-engine';
import type { LedgerEntry } from '@/lib/ledger-schema';
import type { LedgerCredentials } from '@/lib/ledger-settings';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function richText(content: string) {
  return { rich_text: [{ text: { content: content || '' } }] };
}

async function createNotionPage(notion: Client, databaseId: string, data: LedgerEntry) {
  return notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      'Transaction Name': {
        title: [{ text: { content: data.transactionName || '' } }],
      },
      Type: { select: { name: data.type || 'Expense' } },
      Category: { select: { name: data.category || 'Office & Misc' } },
      Amount: { number: data.amount || 0 },
      'Net Amount': { number: data.netAmount || 0 },
      'GST Amount': { number: data.gstAmount || 0 },
      Date: { date: { start: data.date } },
      'Payment Mode': { select: { name: data.paymentMode || 'UPI' } },
      'Tax Class': { select: { name: data.taxClass || 'Not Deductible' } },
      'Deal Type': { select: { name: data.dealType || 'Internal' } },
      'Vendor / Party': richText(data.vendor || ''),
      ...(data.customer ? { Customer: richText(data.customer) } : {}),
      'Invoice Number': richText(data.invoiceNumber || ''),
      'Business Purpose': richText(data.businessPurpose || ''),
      'IDFC WOW Card': { checkbox: !!data.idfcWowCard },
      'GST Applicable': { checkbox: !!data.gstApplicable },
      'Financial Year': { select: { name: data.financialYear } },
      Month: { select: { name: data.month } },
      Notes: richText(data.notes || ''),
    },
  });
}

export async function testNotionConnection(creds: LedgerCredentials): Promise<{ ok: true; title: string } | { ok: false; error: string }> {
  try {
    const notion = new Client({ auth: creds.notionToken });
    const db = await notion.databases.retrieve({ database_id: creds.databaseId });
    const title =
      'title' in db && Array.isArray(db.title)
        ? db.title.map((part) => ('plain_text' in part ? part.plain_text : '')).join('') || 'Untitled database'
        : 'Notion database';
    return { ok: true, title };
  } catch (error) {
    return { ok: false, error: humanizeNotionError(error) };
  }
}

export async function saveLedgerEntries(
  creds: LedgerCredentials,
  payload: unknown
): Promise<{ success: true; count: number; urls: string[]; results: Array<{ url: string; transactionName: string; month: string }> }> {
  const list = Array.isArray(payload) ? payload : [payload];
  if (list.length === 0) throw new Error('Nothing to save.');
  if (list.length > MAX_LEDGER_BATCH) {
    throw new Error(`Batch too large. Max ${MAX_LEDGER_BATCH} rows.`);
  }

  const entries: LedgerEntry[] = [];
  for (const item of list) {
    const checked = validateLedgerEntry(item);
    if (!checked.ok) throw new Error(checked.error);
    entries.push(checked.entry);
  }

  const notion = new Client({ auth: creds.notionToken });
  const createdIds: string[] = [];
  const results: Array<{ url: string; transactionName: string; month: string }> = [];

  try {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]!;
      let lastError: unknown = null;
      let page: Awaited<ReturnType<typeof createNotionPage>> | null = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          page = await createNotionPage(notion, creds.databaseId, entry);
          break;
        } catch (error) {
          lastError = error;
          if (attempt === 3) throw error;
          await delay(2 ** attempt * 300 + Math.random() * 200);
        }
      }

      if (page?.id) {
        createdIds.push(page.id);
        results.push({
          url: 'url' in page && typeof page.url === 'string' ? page.url : '',
          transactionName: entry.transactionName,
          month: entry.month,
        });
      }

      if (entries.length > 1 && i < entries.length - 1) {
        await delay(350);
      }
    }
  } catch (error) {
    for (const pageId of createdIds) {
      try {
        await notion.pages.update({ page_id: pageId, archived: true });
      } catch (archiveError) {
        console.error('[ledger-notion] rollback failed', pageId, archiveError);
      }
    }
    throw new Error(humanizeNotionError(error));
  }

  return {
    success: true,
    count: results.length,
    urls: results.map((row) => row.url),
    results,
  };
}

function humanizeNotionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('multiple data sources')) {
    return 'That ID looks like a linked or synced Notion database. Open the original database, copy its URL, and use that ID.';
  }
  if (message.includes('Could not find database with ID')) {
    return 'Notion could not find that database. Open the database → ⋯ → Connections → add your integration.';
  }
  if (message.includes('unauthorized') || message.includes('API token is invalid')) {
    return 'Notion rejected the integration token. Create a new internal integration and share the database with it.';
  }
  return message;
}

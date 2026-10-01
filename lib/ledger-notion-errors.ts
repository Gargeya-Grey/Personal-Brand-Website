/** Keep upstream failures identifiable without exposing credentials or request bodies. */
export function humanizeNotionError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('Cross-cell memcached access is not allowed')) {
    const requestId = typeof error === 'object' && error !== null && 'request_id' in error
      && typeof error.request_id === 'string' ? error.request_id : null;
    return 'Notion returned an internal server error (cross-cell cache access). Keep this review open and check the Notion database before retrying. If it persists, contact Notion support.'
      + (requestId ? ` Request ID: ${requestId}.` : '');
  }
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

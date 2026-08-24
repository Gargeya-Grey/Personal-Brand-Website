# Finance Ledger — setup for you or a fork

Private invoice extractor behind the same Google OAuth wall as `/editorial`.

## What you get

- `/ledger` — drop a PDF or photo, write extra notes, review, save to **your** Notion database.
- Operator notes outrank the invoice when they conflict (INR bank debit, card, purpose).
- PDF text layer is read in the browser. Scanned PDFs render page 1 as an image for vision models.
- Notion keys are encrypted per signed-in email (`ledger_settings`). Env vars work as a fallback.

## 1. Auth (already on this site)

Add your Google address to `ALLOWED_EMAILS`. Anyone not on that list cannot open `/ledger` or call the APIs.

## 2. Database

In Supabase SQL Editor, run `data/sql/ledger_settings.sql`.

Set `X_TOKEN_ENCRYPTION_KEY` (32+ random characters). Reuse the X Lab key if you already have one.

## 3. AI

Gemini is the default, same as the old app. OpenRouter is a toggle on `/ledger`.

| Env | Notes |
| :--- | :--- |
| `GEMINI_API_KEY` | Default extractor. Required unless you only use OpenRouter. |
| `GEMINI_MODEL` | Optional. Defaults to `gemini-flash-latest`. |
| `GEMINI_MODEL_FALLBACK` | Optional. Defaults to `gemini-flash-latest`. |
| `OPENROUTER_API_KEY` | Needed to use the OpenRouter toggle. |
| `LEDGER_OPENROUTER_MODEL` | **The OpenRouter model name.** Change this in `.env` and restart. |

If `LEDGER_OPENROUTER_MODEL` is empty, the ledger uses `OPENROUTER_MODEL` (the same key as Editorial). Prefer `LEDGER_OPENROUTER_MODEL` so a ledger model swap does not change blog AI.

Never put these in client code or git. Restart the Next server after any `.env` model change.

## 4. Notion

1. [Create an internal integration](https://www.notion.so/my-integrations).
2. Open your **original** ledger database (not a linked view) → ⋯ → Connections → add the integration.
3. Copy the database ID from the URL (`notion.so/..../32hex?v=...`).
4. Either:
   - Paste token + ID in `/ledger` → Notion setup → Save & test, or
   - Set `NOTION_API_KEY` and `NOTION_DATABASE_ID` on the server.

Property names must match the original Founder Finance Ledger schema (Transaction Name, Type, Category, Amount, …).

## 5. Use it

Sign in → `/ledger` → attach invoice → write the facts only you know → Extract → review → Save.

Invoices are not stored. Only the Notion row you approve is written.

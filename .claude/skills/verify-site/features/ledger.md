# Finance Ledger

## Sub-features

- Upload an invoice (image or PDF), operator notes, extract.
- Review the extracted entry (enums, amounts, dates), then send to Notion.
- Settings: per-user Notion key and database id (stored encrypted; never shown in full).

## How to get to it (user POV)

Sign in, press "Ledger" in the private header, or open `/ledger`.

## Driving it with the browser pane

1. Navigate to `/ledger`. Expect the upload step and the settings entry point.
2. Open settings; expect the Notion fields with the not-configured state. Close without saving.

## Gotchas

- Extract calls Gemini or OpenRouter (model slug per provider under Extraction model; effort for OpenRouter) and fails without keys; the error message is the expected end state locally.
- Never press the Notion send control during a check.

# Public evaluation dashboard

Permanent route: `/playground/evals`. The project registry supplies its Playground listing,
shared SVG cover, and sitemap entry. EduDojo and Eval dashboard lead the default Playground;
the relative order of the other projects and the existing filters remain unchanged.

## Current publication state

No verified model runs are published. The page deliberately renders zero verified runs and
unavailable measurements. Illustrative examples, setup checks, and blocked attempts are not
performance evidence. There is no seeded leaderboard or synthetic score.

The page validates the reviewed V2 static export in `data/eval-results.json` on the server.
Unsupported versions, unknown fields, or invalid records fail the build. The current reviewed
export has no runs. Do not substitute raw runner output or a private dashboard bundle.

For an approved update, keep the supplied export outside the website checkout first. Run
`node --experimental-strip-types --import ./scripts/security-test-register.mjs scripts/import-eval-results.mjs <reviewed-export.json>`.
This validates before replacing site data and writes only the approved projection. Invalid
input is rejected with a generic error, without copying it into the public repository. Review
the diff and public build output before committing. Importing records does not run evaluations.

## Publication boundary

This route is public and read-only. Owner execution remains in the private local workflow.
It has no execution endpoint, upload form, provider credentials, or subscription login.

Before adding results:

- Review the export contract and require explicit public-safe fields. Reject unexpected fields
  rather than serializing them into HTML or client props.
- Exclude prompts, private source and repository links, evaluator definitions, internal paths,
  raw logs, account data, and credentials from the website repository and public build.
- Publish only verified, approved records. Keep missing metrics unavailable; preserve the
  distinction between completed evaluations and examples, setup checks, or blocked runs.
- Compare compatible task sets and conditions. Show dates, coverage, metric units, and
  limitations; do not treat unlike runs as a model ranking.
- Keep the route permanent, and verify public output as well as source files before release.

## Importer preparation

`lib/eval-export-validation.ts` provides exact nested object validation, approved value choices,
bounded identifiers/arrays/numbers, explicit null preservation, and version dispatch. The V2
adapter in `lib/eval-results.ts` registers exact reviewed fields, canonical case/type pairing,
count consistency, valid UTC dates, unique public run IDs, and constrained approved labels.
Withheld metadata must use the contract's unknown values. Unknown versions/fields fail
publication; they must not be silently treated as an empty successful report.

Free text is not a safe label allowlist. Use reviewed choices for model/version/effort/harness
labels and website-owned contextual copy. Validators build a fresh projection and use generic
errors that do not echo untrusted keys, values, or paths.

Run `node --experimental-strip-types scripts/test-eval-export-validation.mjs` for synthetic
adversarial validation checks. These test inputs are not result data or the publication contract.

Run `node --experimental-strip-types --import ./scripts/security-test-register.mjs scripts/test-eval-results.mjs`
for V2 adapter and aggregation checks. Its optional output path writes a synthetic fixture for
local browser testing only. Never publish that fixture as measured model results.

## Reading metrics

Summary success rates use only evaluator-verified completed success/fail runs. Blocked and
self-reported records appear in history and sample counts, but do not enter that denominator.
Mean elapsed time uses only observed durations for verified completed runs; null stays missing,
while measured zero remains zero. Counts show the observed duration denominator explicitly.
Task comparisons are separated by suite, task type, setup ID, and published label metadata.
Filters select task, suite, or setup without altering the underlying history. Dated history shows
stable public run IDs and UTC dates; unknown dates remain unavailable. Details reveal only the
approved summary fields, including check counts, interventions, and usage visibility, not logs.
The contract exports no token quantities or cost; the dashboard does not invent these.

## Verification

Run the project-cover check, lint, production build, and existing ledger/newsletter checks.
Inspect Playground and the dashboard in both themes at desktop and 320px. Verify default
ordering, category filters, search and reset, dashboard/Edudojo links, mobile overflow, and
no private asset leakage in HTML, RSC payloads, or the dashboard's client resources.

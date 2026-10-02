# Public evaluation dashboard

Permanent route: `/playground/evals`. The project registry supplies its Playground listing,
shared SVG cover, and sitemap entry. EduDojo and Eval dashboard lead the default Playground;
the relative order of the other projects and the existing filters remain unchanged.

## Current publication state

No verified model runs are published. The page deliberately renders zero verified runs and
unavailable measurements. Illustrative examples, setup checks, and blocked attempts are not
performance evidence. There is no seeded leaderboard or synthetic score.

The initial page has no result import. Data integration is pending a finalized, reviewed
sanitized export contract. Do not substitute raw runner output or a private dashboard bundle.

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

## Verification

Run the project-cover check, lint, production build, and existing ledger/newsletter checks.
Inspect Playground and the dashboard in both themes at desktop and 320px. Verify default
ordering, category filters, search and reset, dashboard/Edudojo links, mobile overflow, and
no private asset leakage in HTML, RSC payloads, or the dashboard's client resources.

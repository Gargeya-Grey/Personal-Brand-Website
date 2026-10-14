---
name: verify-site
description: Launch sgargeya.com (Next.js) locally, sign in to the private atelier with a test account, and drive any page the way the owner does, in light and dark mode, at desktop and 375px. Use to prove a UI change on public pages, /login, /editorial (Blog CMS, Notes, X To-Do, X Lab, Growth Strategy) or /ledger before reporting it done.
---

# Verify the site

The surface is a web UI. Drive it with the Claude desktop app's built-in browser (`mcp__Claude_Browser__*`). There is no Playwright suite.

## Launch

1. Install once per checkout: `npm ci` (about 1 minute).
2. Create `.env.local` (gitignored) with one test line, so the dev-only mock sign-in has an allowlisted address:

   ```bash
   printf 'ALLOWED_EMAILS=verify@example.test\n' > .env.local
   ```

   No other secret is needed. Without Supabase keys the private pages run on local data: the Blog CMS lists the essays in `data/`, X To-Do reads `data/x-content-packs.json`, X Lab shows its not-connected state, Notes shows local weeks or an empty state. Do not copy the owner's real `.env`: the private pages write to production Supabase and Notion when keys are present.
3. Start the server with `preview_start` and the name `site` (`.claude/launch.json`: `npx next dev -p 3107`). Ready = `http://localhost:3107/` renders the homepage heading "I build tools for how we learn to think."

## Doctor

Run in a page on `http://localhost:3107` with `javascript_tool`:

```js
await fetch('/api/auth/me').then(r => r.json()).then(j => ({ authenticated: j.authenticated, reason: j.reason }))
```

- `reason: 'no-cookie'`: not signed in yet; run Sign in below.
- `reason: 'not-allowlisted'`: `.env.local` is missing or the server started before it existed; restart the server.
- A fetch failure: the server is down; check `preview_logs` for a compile error.

## Sign in (dev mock login)

On any page of `http://localhost:3107`:

```js
await fetch('/api/auth/mock-login', { method: 'POST' }).then(r => r.status)  // 200
```

The route exists only when `NODE_ENV !== 'production'`. It signs a session for the first `ALLOWED_EMAILS` entry. The cookie is shared by every tab in the browser pane.

## Drive

- Pages: `/login`, `/editorial` (Blog CMS), `/editorial?workspace=notes`, `/editorial?workspace=x`, `/editorial?workspace=lab`, `/editorial?workspace=strategy`, `/ledger`. Feature files in `features/` give the details.
- Several agents may share the pane. Each opens its own tab (`tabs_create`, then `navigate` with that `tabId`) and passes its `tabId` to every call.
- Dark mode: do not click the theme toggle. It writes `localStorage.theme`, which every tab shares. Instead, for the current tab only:

  ```js
  document.documentElement.classList.add('dark')     // dark
  document.documentElement.classList.remove('dark')  // light
  ```

  A reload returns to the stored or system theme.
- Phone width: `resize_window` with `preset: 'mobile'` (375 x 812) on your tab; reset with `preset: 'desktop'` when done.
- Prefer `read_page` / `find` for text and structure; take a screenshot for every visual claim.

## Evidence

A proof has, for each changed page: a screenshot in light and in dark at desktop width, one at 375px, and the action you drove (for example "opened an essay in the editor, typed in the title"). Screenshots stay in the session transcript. State which pages you did not check and why. A change that writes data (save, publish, ingest, Notion) is checked only up to the confirm step: never press a control that sends, publishes, deletes or writes to a remote service.

## Cleanup

`preview_stop` with the server id that `preview_start` returned. Close the tabs you created (`tabs_close`). Leave `.env.local` in place for the next run; it holds only the test address.

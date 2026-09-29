# Publish a project

`data/selected-work.ts` is the project registry. Every record generates a project page, a Playground listing, and a sitemap entry. Homepage selection is the short `selectedWork` list at the end of that file. The existing browser apps use the same `ProjectDetail` layout.

## Required cover artwork

Before adding a project or changing its art, follow `docs/project-cover-system.md`. Every record requires a deliberate `cover`; the shared renderer uses it on the homepage, Playground, and project page. The cover metadata check is part of publishing, alongside the demo checks below.

## Choose what visitors can do

| Project | Visitor experience | What to add |
| --- | --- | --- |
| A browser app in this repository | Run it inside its project page | A native client component and a `demo` record |
| An independently hosted public app | Click to load it here, or open it separately | An HTTPS `embed` demo record |
| Desktop, mobile, CLI, or other installed software | Watch a short recording, then open source/setup | One or more `recordings` |
| A project with both | Play and watch on the same page | Both fields |
| No public demo yet | Read the project and its labelled explanation | Leave media fields absent |

These fields are reviewed code, not an upload CMS. Do not publish placeholder URLs or pretend illustrative examples are the running product.

## A browser app hosted here

1. Create a client component under `app/playground/your-app/`. Keep the app separate from page navigation and footer.
2. Add its key to `ProjectDemo` in `lib/project-media.ts` and a dynamic import/render branch in `components/project-experience.tsx`. The overlap lab and idea mixer are working examples.
3. Add a `WorkProject` record to `data/selected-work.ts`, with a unique URL-safe `id`, accurate copy and evidence links, `kind: 'In your browser'`, and:

```ts
demo: {
  kind: 'native',
  app: 'your-app', // after registering this key
  title: 'Try it yourself.',
  description: 'A sentence explaining what to do first.',
},
```

The generic `/playground/[slug]` page handles new IDs. A custom page is only needed for a genuinely different layout. Existing static app pages delegate to the shared layout. New IDs must not collide with a reserved route.

## A public app hosted elsewhere

```ts
demo: {
  kind: 'embed',
  url: 'https://YOUR-PUBLIC-DEMO-URL',
  title: 'Try the public demo.',
  description: 'Use the sample workspace to try one complete task.',
},
```

The iframe is created only after the visitor selects **Load interactive demo**. It runs sandboxed with scripts and forms; it has no same-origin privilege, microphone/camera permission, or top navigation. An **Open separately** link is always available. Use a public sample app that supports embedding. Authentication, clipboard, popups, and apps requiring origin storage may need a separate window; verify the actual deployed app before adding it. Do not weaken the sandbox for private tools.

This portfolio hosts the presentation. An independently deployed app still needs its own hosting and backend; adding its URL does not deploy it.

## Add a recording

Record one useful task in about 20–45 seconds. Start with the problem, perform the action, and show the result. For Odicto, supply separate desktop landscape and Android portrait clips. Use sample material you are comfortable publishing.

Small recordings may live under `public/demos/<project>/`. For larger files, use a direct HTTPS MP4/WebM URL on your media host. Prefer H.264 MP4 for broad playback support; verify the actual file on mobile before publishing. A YouTube watch-page URL is not a direct video file.

Add to the project record:

```ts
recordings: [
  {
    id: 'desktop',
    title: 'Dictate into an everyday app',
    description: 'From the hotkey to text at the cursor.',
    src: '/demos/odicto/desktop.mp4',
    poster: '/demos/odicto/desktop-poster.webp',
    orientation: 'landscape', // use 'portrait' for a phone recording
    captions: { src: '/demos/odicto/desktop-en.vtt', language: 'en', label: 'English' },
    transcript: 'Describe the action and visible result. Include any spoken explanation.',
  },
],
```

Only use this configuration once the named files exist. Captions are optional for silent clips; a written walkthrough is required. Keep VTT captions same-origin; verify CORS if hosting them elsewhere. The native video player has controls, inline playback, no autoplay, and `preload="none"`. The written walkthrough and direct-file link remain available alongside it. No video libraries or tracking embeds are needed.

## Verify and publish

- Run the build and changed-file lint.
- Check the project from its Playground link. Verify the actual demo or recording, keyboard input, portrait/landscape layout, phone widths, and both themes.
- Confirm missing media creates no blank player or broken action. Check app storage/reset behavior and separate-window fallback.
- Review the PR's Vercel preview before merging.

Secrets stay on the server. Editorial and ledger routes are not demo destinations. Public descriptions and screenshots must not contain private records or credentials.

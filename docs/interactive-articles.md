# Interactive articles

In **Editorial → Blog**, use **Interactive** in the writing toolbar. It inserts a working compounding slider. Edit its title, description, HTML, CSS, and JavaScript in the source pane, then use **Run interactive** in Preview. Save/publish through the existing article workflow.

The block is part of the article's Markdown, so it travels through the same storage and publishing path. Existing articles need no migration. Normal `html` code fences remain displayed code.

````markdown
```interactive title="Explore an idea" description="Explain what readers can change and what to look for." height=360
<style>
  output { color: var(--accent); font-size: 2rem; }
</style>
<label for="amount">Choose a number</label>
<input id="amount" type="range" min="1" max="10" value="5">
<output id="answer" aria-live="polite">25</output>
<script>
  const amount = document.getElementById('amount');
  amount.addEventListener('input', () => {
    document.getElementById('answer').textContent = Number(amount.value) ** 2;
  });
</script>
```
````

Use a unique, meaningful title, a short explanation, labelled controls, keyboard support, and responsive widths. Keep the explanation of the idea in the article too, so it remains useful without running the example. Blocks run only when a reader starts them; Reset recreates the initial state and Stop removes the frame.

## Styling and motion

The frame follows the site's light/dark theme. Available CSS variables: `--paper`, `--ink`, `--muted`, `--accent`, `--soft`, `--line`. Use system fonts and inline SVG or data images. Use flexible widths (`width:100%`, `max-width:100%`), not a fixed desktop canvas.

The initial `height` is clamped to 160–1200px; the frame then reports its content height, capped at 1600px with internal scrolling for larger content. Avoid viewport-height layouts or code that repeatedly sizes itself to the containing iframe, which can cause a resize loop.

CSS animations pause when off screen or when the browser tab is hidden. Reduced-motion preferences suppress CSS movement. For JavaScript/canvas loops, listen for `article-preferences` on `window`; `event.detail` contains `theme`, `reducedMotion`, and `paused`. Authors must stop their own animation loops when appropriate. Stop always destroys the frame.

## Isolation

Self-contained HTML/CSS/JavaScript runs in `srcdoc` with `sandbox="allow-scripts"`, without same-origin access. A restrictive CSP blocks fetch, external scripts/styles/fonts, nested frames, and form submissions. Use inline assets; remote libraries and API calls are intentionally unsupported. Do not put credentials or private data in article source.

The frame cannot read the article's DOM, cookies, or local storage. Resize messages are accepted only from that block's frame, with a matching identifier and a finite bounded height. This is isolation for owner-authored examples, not a resource quota: an infinite loop can still exhaust browser resources. Follow [MDN's iframe sandbox guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox).

## Local preview and checks

Run `npm run dev` and open `/journal/interactive-preview` for a complete example using the real article renderer. The preview is noindex, omitted from the journal/sitemap, and returns 404 in production. It does not create or publish an article.

Run `npm run test:articles` for parser and document-policy checks. Browser checks must also exercise slider input, reset/stop, navigation, narrow widths, theme changes, and frame isolation. Interactive source code is excluded from the editor's reading-time estimate.

/** HTML runs only inside an opaque-origin iframe, never in the article document. */
export const INTERACTIVE_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  'img-src data: blob:',
  "connect-src 'none'",
  "font-src 'none'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]!));

export function buildInteractiveDocument(source: string, title: string, id: string) {
  const safeId = JSON.stringify(id).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${INTERACTIVE_CSP}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>${escapeHtml(title)}</title>
<style>
:root { color-scheme: light; --paper:#fbfdfd; --ink:#142936; --muted:#526773; --accent:#08796d; --soft:#e7eff1; --line:#14293626; }
:root[data-theme="dark"] { color-scheme:dark; --paper:#242a2d; --ink:#d2d5d2; --muted:#b5bebc; --accent:#8acdb5; --soft:#30373a; --line:#d2d5d22b; }
* { box-sizing:border-box; }
html { margin:0; background:var(--paper); color:var(--ink); font:16px/1.6 system-ui,sans-serif; }
body { margin:0; padding:clamp(16px,4vw,32px); overflow-wrap:anywhere; }
#article-interactive-root { display:flow-root; min-width:0; }
:where(img,svg,canvas,video) { max-width:100%; }
:where(button,input,select,textarea) { font:inherit; accent-color:var(--accent); }
:where(button) { cursor:pointer; }
:where(input[type="range"]) { width:100%; min-height:44px; }
:focus-visible { outline:2px solid var(--accent); outline-offset:4px; }
html[data-paused="true"] *,html[data-paused="true"] *::before,html[data-paused="true"] *::after { animation-play-state:paused!important; }
@media(prefers-reduced-motion:reduce) { *,*::before,*::after { animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; scroll-behavior:auto!important; } }
html[data-reduced-motion="true"] *,html[data-reduced-motion="true"] *::before,html[data-reduced-motion="true"] *::after { animation-duration:.01ms!important; animation-iteration-count:1!important; transition-duration:.01ms!important; }
</style></head><body><div id="article-interactive-root">${source}</div>
<script>
(() => {
  const id = ${safeId};
  let lastHeight = 0;
  const reportSize = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    if (height !== lastHeight) {
      lastHeight = height;
      parent.postMessage({type:'article-interactive:resize',id,height}, '*');
    }
  };
  new ResizeObserver(reportSize).observe(document.body);
  window.addEventListener('load', reportSize);
  window.addEventListener('message', (event) => {
    if (event.source !== parent || event.data?.type !== 'article-interactive:preferences' || event.data.id !== id) return;
    const {theme, reducedMotion, paused} = event.data;
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.reducedMotion = String(Boolean(reducedMotion));
    document.documentElement.dataset.paused = String(Boolean(paused));
    window.dispatchEvent(new CustomEvent('article-preferences', {detail:{theme,reducedMotion,paused}}));
    reportSize();
  });
  reportSize();
})();
</script></body></html>`;
}

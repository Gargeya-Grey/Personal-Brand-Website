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
  return `<!doctype html><html lang="en" data-fonts="pending"><head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="${INTERACTIVE_CSP}">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>${escapeHtml(title)}</title>
<style>
:root { color-scheme: light; --paper:#ffffff; --ink:#1b1a18; --muted:#5e5a55; --accent:#b04a00; --soft:#f1ede7; --line:#1b1a1826; }
:root[data-theme="dark"] { color-scheme:dark; --paper:#1c1b19; --ink:#e0ddd8; --muted:#ada7a0; --accent:#ff9f45; --soft:#25211d; --line:#e0ddd82b; }
* { box-sizing:border-box; }
html { margin:0; background:var(--paper); color:var(--ink); font:16px/1.6 var(--font-body); }
:root { --font-body:"Instrument Sans",system-ui,sans-serif; --font-reading:"Literata",Georgia,serif; --font-mono:"IBM Plex Mono",ui-monospace,monospace; }
html[data-fonts="pending"] body { visibility:hidden; }
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
  let revealed = false;
  let fontsReceived = false;
  const announceFonts = (fonts) => window.dispatchEvent(new CustomEvent('article-fonts', {detail:{fonts}}));
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    delete document.documentElement.dataset.fonts;
    reportSize();
  };
  setTimeout(() => {
    if (revealed) return;
    reveal();
    announceFonts(false);
  }, 600);
  const FAMILY_VARIABLES = {body:'--font-body', reading:'--font-reading', mono:'--font-mono'};
  const setFamilies = (families) => {
    for (const [key, variable] of Object.entries(FAMILY_VARIABLES)) {
      const list = families?.[key];
      if (typeof list === 'string' && list.length > 0 && list.length < 300) document.documentElement.style.setProperty(variable, list);
    }
  };
  const loadFonts = (fonts) => {
    const loads = [];
    for (const entry of Array.isArray(fonts) ? fonts.slice(0, 12) : []) {
      try {
        if (typeof entry?.family !== 'string' || entry.family.length >= 100 || !(entry.source instanceof ArrayBuffer)) continue;
        const descriptors = {};
        for (const key of ['style', 'weight', 'stretch', 'unicodeRange']) {
          if (typeof entry.descriptors?.[key] === 'string') descriptors[key] = entry.descriptors[key];
        }
        const face = new FontFace(entry.family, entry.source, descriptors);
        document.fonts.add(face);
        loads.push(face.load());
      } catch {}
    }
    Promise.allSettled(loads).then((results) => {
      reveal();
      announceFonts(results.some((result) => result.status === 'fulfilled'));
    });
  };
  window.addEventListener('message', (event) => {
    if (event.source !== parent || event.data?.id !== id) return;
    if (event.data.type === 'article-interactive:fonts') {
      if (fontsReceived) return;
      fontsReceived = true;
      setFamilies(event.data.families);
      loadFonts(event.data.fonts);
      return;
    }
    if (event.data.type !== 'article-interactive:preferences') return;
    const {theme, reducedMotion, paused} = event.data;
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.dataset.reducedMotion = String(Boolean(reducedMotion));
    document.documentElement.dataset.paused = String(Boolean(paused));
    window.dispatchEvent(new CustomEvent('article-preferences', {detail:{theme,reducedMotion,paused}}));
    reportSize();
  });
  reportSize();
  parent.postMessage({type:'article-interactive:ready',id}, '*');
})();
</script></body></html>`;
}

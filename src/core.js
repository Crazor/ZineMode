// ZineMode: re-renders the current article in paged, magazine-style columns.
import { Readability } from "@mozilla/readability";

const CSS = `
:root{--bg:#fbf8f2;--fg:#1d1b18;--mute:#77716a;--rule:#e2dccf;--accent:#a8322d}
:root[data-mv-theme=dark]{--bg:#161514;--fg:#e9e4da;--mute:#9a938a;--rule:#34312d;--accent:#e2766f}
:root[data-mv-theme=sepia]{--bg:#f3e9d4;--fg:#3b2f22;--mute:#85735c;--rule:#dccbaa;--accent:#8c3b1e}
html,body{margin:0!important;padding:0!important;height:100%!important;overflow:hidden!important;background:var(--bg)!important}
#mv{position:fixed;inset:0;background:var(--bg);color:var(--fg);-webkit-text-size-adjust:100%;
  font-family:"Iowan Old Style","Palatino",Georgia,serif;font-size:var(--mv-size,19px);line-height:1.5}
#mv *{box-sizing:border-box}
#mv{--mv-tpad:env(safe-area-inset-top,0px);--mv-bpad:env(safe-area-inset-bottom,0px);--mv-lres:0px;--mv-th:2.6rem;--mv-bh:2.4rem}
#mv.mv-fs.mv-touch{--mv-tpad:max(env(safe-area-inset-top,0px),24px);--mv-bpad:max(env(safe-area-inset-bottom,0px),18px);--mv-lres:76px;--mv-th:3.4rem}
#mv .mv-frame{position:absolute;top:calc(var(--mv-tpad) + var(--mv-th));bottom:calc(var(--mv-bpad) + var(--mv-bh));left:max(5vw,env(safe-area-inset-left));right:max(5vw,env(safe-area-inset-right))}
#mv .mv-p1{position:absolute;inset:0;display:flex;flex-direction:column}
#mv .mv-p1 .mv-col{flex:1;min-height:0}
#mv .mv-c2{position:absolute;inset:0}
#mv .mv-col{height:100%;width:100%;overflow:hidden;clip-path:inset(0);column-fill:auto;column-gap:var(--mv-gap);column-rule:1px solid var(--rule);
  text-align:justify;hyphens:auto;-webkit-hyphens:auto;orphans:2;widows:2}
#mv header{flex:none;margin:0 0 1.4em;padding-bottom:1em;border-bottom:2px solid var(--fg);text-align:left}
#mv .mv-site{font:600 .72em/1 -apple-system,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 .8em}
#mv h1{font-size:2.3em;line-height:1.08;margin:0 0 .35em;font-weight:700;letter-spacing:-.01em;hyphens:manual;-webkit-hyphens:manual}
#mv .mv-dek{font-size:1.12em;font-style:italic;color:var(--mute);margin:0 0 .6em}
#mv .mv-by{font:500 .75em/1.3 -apple-system,system-ui,sans-serif;color:var(--mute);margin:0}
#mv p{margin:0;text-indent:1.4em}
#mv header p,#mv p.mv-cont{text-indent:0}
#mv .mv-col>p:first-child,#mv hr+p,#mv h2+p,#mv h3+p,#mv h4+p,#mv figure+p,#mv blockquote+p,#mv ul+p,#mv ol+p{text-indent:0}
#mv p.mv-first{text-indent:0}
#mv p.mv-first::first-letter{float:left;font-size:3.9em;line-height:.8;padding:.06em .08em 0 0;font-weight:700;color:var(--accent)}
#mv h2,#mv h3,#mv h4{font-family:-apple-system,system-ui,sans-serif;font-size:.95em;line-height:1.25;margin:1.3em 0 .4em;text-align:left;break-after:avoid;hyphens:manual;-webkit-hyphens:manual}
#mv h2{font-size:1.05em}
#mv a{color:inherit;text-decoration-color:var(--accent);text-underline-offset:2px}
#mv img,#mv video,#mv svg,#mv picture{display:block;max-width:100%!important;width:auto;height:auto!important;max-height:62vh;object-fit:contain;margin:.4em auto;break-inside:avoid}
#mv figure{margin:.8em 0;break-inside:avoid;-webkit-column-break-inside:avoid}
#mv figcaption{font:.68em/1.35 -apple-system,system-ui,sans-serif;color:var(--mute);text-align:left;margin-top:.3em}
#mv blockquote{margin:.8em 0;padding:0 0 0 .9em;border-left:3px solid var(--accent);font-style:italic;text-align:left}
#mv ul,#mv ol{margin:.5em 0;padding-left:1.3em;text-align:left}
#mv pre,#mv code{font:.78em/1.4 ui-monospace,Menlo,monospace;white-space:pre-wrap;word-break:break-word}
#mv pre{text-align:left;break-inside:avoid}
#mv table{font-size:.75em;border-collapse:collapse;max-width:100%;break-inside:avoid}
#mv td,#mv th{border:1px solid var(--rule);padding:.2em .4em}
#mv iframe{max-width:100%}
#mv .mv-bar{position:absolute;left:0;right:0;display:flex;align-items:center;gap:.5rem;padding:0 max(5vw,env(safe-area-inset-left));
  font:500 12px/1 -apple-system,system-ui,sans-serif;color:var(--mute)}
#mv .mv-top{top:0;height:calc(var(--mv-tpad) + var(--mv-th));padding-top:var(--mv-tpad);padding-left:calc(max(5vw,env(safe-area-inset-left)) + var(--mv-lres))}
#mv .mv-bot{bottom:0;height:calc(var(--mv-bpad) + var(--mv-bh));padding-bottom:var(--mv-bpad);justify-content:center}
#mv .mv-top .mv-t{flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;opacity:.75}
#mv button{font:inherit;color:inherit;background:none;border:0;padding:0;margin:0;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
#mv svg.mv-i{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;display:block;max-height:none;margin:0}
#mv .mv-mbtn{flex:none;width:44px;height:44px;margin-right:-10px;display:grid;place-items:center;color:var(--fg);opacity:.3;transition:opacity .2s}
#mv .mv-mbtn:hover{opacity:.65}
#mv.mv-open .mv-mbtn{opacity:0}
/* popover: grows out of the menu icon, styled like Safari's full-screen control */
#mv .mv-pop{position:absolute;z-index:5;top:calc(var(--mv-tpad) + (var(--mv-th) - 44px) / 2);right:calc(max(5vw,env(safe-area-inset-right)) - 10px);
  width:min(304px,calc(100vw - 24px));padding:12px;border-radius:22px;color:#fff;text-align:left;
  background:rgba(70,70,74,.92);-webkit-backdrop-filter:blur(26px) saturate(1.8);backdrop-filter:blur(26px) saturate(1.8);
  box-shadow:0 12px 40px rgba(0,0,0,.22);font:500 16px/1.2 -apple-system,system-ui,sans-serif;
  -webkit-clip-path:inset(0 0 calc(100% - 44px) calc(100% - 44px) round 22px);clip-path:inset(0 0 calc(100% - 44px) calc(100% - 44px) round 22px);
  opacity:0;pointer-events:none;transition:clip-path .34s cubic-bezier(.2,.85,.25,1),-webkit-clip-path .34s cubic-bezier(.2,.85,.25,1),opacity .2s}
#mv.mv-open .mv-pop{-webkit-clip-path:inset(0 round 22px);clip-path:inset(0 round 22px);opacity:1;pointer-events:auto}
#mv .mv-pop>*{transition:opacity .2s .08s;opacity:0}
#mv.mv-open .mv-pop>*{opacity:1}
#mv .mv-row{display:flex;gap:8px;margin-top:8px}
#mv .mv-row:first-child{margin-top:0}
#mv .mv-pop button{flex:1;height:54px;border-radius:15px;background:rgba(255,255,255,.13);display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;transition:background .15s}
#mv .mv-pop button:active{background:rgba(255,255,255,.28)}
#mv .mv-pop .mv-a1{font:600 17px/1 "Iowan Old Style",Georgia,serif}
#mv .mv-pop .mv-a2{font:600 28px/1 "Iowan Old Style",Georgia,serif}
#mv .mv-pop .mv-sz{flex:none;width:52px;display:grid;place-items:center;font-size:13px;opacity:.75;font-variant-numeric:tabular-nums}
#mv .mv-pop .mv-sw{background:none}
#mv .mv-pop .mv-sw span{width:38px;height:38px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15);display:grid;place-items:center;font:600 15px/1 "Iowan Old Style",Georgia,serif}
#mv .mv-pop .mv-sw.mv-sel span{outline:2.5px solid #fff;outline-offset:3px}
#mv .mv-pop .mv-wide{justify-content:flex-start;padding:0 16px;font-size:16px}
#mv.mv-fs.mv-touch .mv-fsrow{display:none}
#mv .mv-toast{position:absolute;left:50%;top:calc(var(--mv-tpad) + var(--mv-th) + 10px);transform:translateX(-50%);z-index:4;display:flex;align-items:center;gap:14px;
  padding:8px 8px 8px 16px;border-radius:16px;background:rgba(70,70,74,.92);-webkit-backdrop-filter:blur(26px);backdrop-filter:blur(26px);color:#fff;
  font:500 14px/1.2 -apple-system,system-ui,sans-serif;transition:opacity .5s;white-space:nowrap}
#mv .mv-toast button{padding:8px 12px;border-radius:11px;background:rgba(255,255,255,.16);color:#fff;font-weight:600}
#mv .mv-hint{position:absolute;left:50%;bottom:calc(var(--mv-bpad) + var(--mv-bh) + 14px);transform:translateX(-50%);z-index:4;padding:10px 16px;border-radius:14px;
  background:rgba(70,70,74,.92);-webkit-backdrop-filter:blur(26px);backdrop-filter:blur(26px);color:#fff;font:500 14px/1.2 -apple-system,system-ui,sans-serif;
  pointer-events:none;transition:opacity .5s;white-space:nowrap}
#mv .mv-prog{position:absolute;left:0;bottom:0;height:2px;background:var(--accent);transition:width .25s}
`;

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

// opts.fullscreenRequested: the caller already asked for full screen inside a tap (userscript button).
export function run(opts = {}) {
  if (window.__zm) { window.__zm.leave(); return null; }   // second tap on the bookmarklet toggles off

  const T = (window.__zmStats = { t: {}, layouts: 0 }).t, t0 = performance.now();
  const lang = document.documentElement.lang || "en";
  const clone = document.cloneNode(true);
  // Utility-CSS class names (Tailwind's "group/header-newsletter", "lg:hidden", …) trip Readability's
  // "this is page chrome" heuristics and can make it discard the whole article. They carry no meaning, so drop them.
  clone.querySelectorAll("[class]").forEach(e => {
    const c = e.getAttribute("class");
    if (/[:\/\[]/.test(c)) e.setAttribute("class", c.split(/\s+/).filter(t => !/[:\/\[\]]/.test(t)).join(" "));
  });
  // Newsletter sign-up boxes inside articles.
  clone.querySelectorAll('input[type="email"]').forEach(i => {
    const box = i.closest("section,aside,form,[class*=newsletter],[class*=signup],[id*=newsletter]") || i;
    ((box.tagName === "FORM" && box.closest("section,aside")) || box).remove();
  });
  // A higher threshold makes Readability retry with looser rules when the first pass finds suspiciously little text;
  // it then keeps the longest result.
  const art = new Readability(clone, { charThreshold: 1500, keepClasses: false }).parse();
  // Readability falls back to the full <title> ("Headline | Site Name") when the cleaned-up headline is
  // four words or fewer. Prefer the page's own headline when the <title> starts with it.
  if (art && art.title) {
    const h = [...document.querySelectorAll("h1")].map(e => e.textContent.replace(/\s+/g, " ").trim())
      .find(t => t.length >= 8 && t.length < art.title.length && art.title.startsWith(t));
    if (h) art.title = h;
  }
  T.readability = performance.now() - t0;
  if (!art || !art.content) { alert("ZineMode: couldn’t find an article on this page."); return; }

  const pageTitle = document.title;
  // Set the page aside (not destroyed) so leaving ZineMode restores it instantly, scroll position included.
  const H = document.documentElement, B = document.body;
  const saved = {
    title: pageTitle, x: scrollX, y: scrollY,
    htmlStyle: H.getAttribute("style"), bodyStyle: B.getAttribute("style"), bodyClass: B.getAttribute("class"),
    styles: [], kids: document.createDocumentFragment(), vp: null, vpContent: null
  };
  document.querySelectorAll('link[rel~="stylesheet"],style').forEach(n => { saved.styles.push([n, n.parentNode, n.nextSibling]); n.remove(); });
  B.removeAttribute("style"); B.removeAttribute("class"); H.removeAttribute("style");
  while (B.firstChild) saved.kids.appendChild(B.firstChild);
  const ac = new AbortController(), sig = { signal: ac.signal };
  let left = false;

  const st = el("style"); st.textContent = CSS; document.head.appendChild(st);
  let vp = document.querySelector('meta[name=viewport]');
  saved.vp = vp; saved.vpContent = vp && vp.getAttribute("content");
  if (!vp) { vp = el("meta"); vp.name = "viewport"; document.head.appendChild(vp); }
  const ourVp = vp;
  vp.content = "width=device-width,initial-scale=1,viewport-fit=cover";

  const root = el("div"); root.id = "mv"; root.lang = lang;
  const top = el("div", "mv-bar mv-top");
  const tTitle = el("span", "mv-t", art.siteName || location.hostname.replace(/^www\./, ""));
  const ICON = {
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    full: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
    unfull: '<path d="M9 4v4a1 1 0 0 1-1 1H4M20 9h-4a1 1 0 0 1-1-1V4M15 20v-4a1 1 0 0 1 1-1h4M4 15h4a1 1 0 0 1 1 1v4"/>',
    // "Leave ZineMode": the column page folds back into a single sheet
    leave: '<rect x="10" y="3.5" width="10.5" height="17" rx="2"/><path d="M13.5 8h3.5M13.5 11.5h3.5M13.5 15h2"/><path d="M8 12H2.5M5.5 8.5 2 12l3.5 3.5"/>'
  };
  const svg = n => '<svg class="mv-i" viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>';
  const mBtn = el("button", "mv-mbtn"); mBtn.innerHTML = svg("menu"); mBtn.title = "Menu"; mBtn.setAttribute("aria-label", "ZineMode menu");
  top.append(tTitle, mBtn);
  if (navigator.maxTouchPoints > 1) root.classList.add("mv-touch");

  const pop = el("div", "mv-pop"); pop.setAttribute("role", "menu");
  const row = (...kids) => { const r = el("div", "mv-row"); r.append(...kids); pop.appendChild(r); return r; };
  const bSmall = el("button"); bSmall.innerHTML = '<span class="mv-a1">A</span>'; bSmall.setAttribute("aria-label", "Smaller text");
  const bBig = el("button"); bBig.innerHTML = '<span class="mv-a2">A</span>'; bBig.setAttribute("aria-label", "Larger text");
  const szLabel = el("span", "mv-sz");
  row(bSmall, szLabel, bBig);
  const THEMES = { light: ["#fbf8f2", "#1d1b18"], sepia: ["#f3e9d4", "#3b2f22"], dark: ["#161514", "#e9e4da"] };
  const swatches = Object.entries(THEMES).map(([k, [bg, fg]]) => {
    const b = el("button", "mv-sw"); b.dataset.t = k; b.setAttribute("aria-label", k[0].toUpperCase() + k.slice(1) + " theme");
    b.innerHTML = '<span style="background:' + bg + ';color:' + fg + '">Aa</span>'; return b;
  });
  row(...swatches);
  const bFull = el("button", "mv-wide");
  const fsRow = row(bFull); fsRow.classList.add("mv-fsrow");
  const bClose = el("button", "mv-wide"); bClose.innerHTML = svg("leave") + "<span>Leave ZineMode</span>";
  const closeRow = row(bClose);   // only shown where full screen isn't available (leaving full screen leaves ZineMode)

  const frame = el("div", "mv-frame");
  const p1 = el("div", "mv-p1"), c1 = el("div", "mv-col"), c2 = el("div", "mv-col mv-c2");
  const header = el("header");
  if (art.siteName) header.appendChild(el("p", "mv-site", art.siteName));
  header.appendChild(el("h1", "", art.title || pageTitle));
  if (art.excerpt && art.excerpt.length < 300 && !art.textContent.trim().startsWith(art.excerpt.trim().slice(0, 60)))
    header.appendChild(el("p", "mv-dek", art.excerpt));
  const by = [art.byline, art.publishedTime && new Date(art.publishedTime).toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" })]
    .filter(Boolean).join(" · ");
  if (by) header.appendChild(el("p", "mv-by", by));
  p1.append(header, c1);
  frame.append(p1, c2);

  const bot = el("div", "mv-bar mv-bot");
  const count = el("span");
  const prog = el("div", "mv-prog");
  bot.append(count, prog);
  root.append(top, frame, bot, pop);
  document.body.appendChild(root);
  document.title = art.title || pageTitle;

  // Clean the article once; every layout rebuilds from this HTML.
  const src = el("div");
  src.innerHTML = art.content;
  src.querySelectorAll("img").forEach(img => {
    const ds = img.getAttribute("data-src") || img.getAttribute("data-original");
    if (ds && !img.getAttribute("src")) img.setAttribute("src", ds);
    img.removeAttribute("loading"); img.removeAttribute("srcset"); img.removeAttribute("sizes");
    const w = parseInt(img.getAttribute("width")), h = parseInt(img.getAttribute("height"));
    if (w > 20 && h > 20) { img.setAttribute("width", w); img.setAttribute("height", h); img.dataset.sized = "1"; }
    else { img.removeAttribute("width"); img.removeAttribute("height"); }
  });
  // Unwrap single-child wrapper divs so we split at paragraph level.
  let base = src;
  while (base.children.length === 1 && /^(DIV|SECTION|ARTICLE|MAIN)$/.test(base.firstElementChild.tagName)) base = base.firstElementChild;
  // Drop short leading lines that repeat what the header already shows (byline, headline).
  const norm = t => (t || "").replace(/\s+/g, " ").trim().toLowerCase();
  const dupes = [norm(art.byline), norm(art.title)].filter(t => t.length > 2);
  for (let i = 0, n = base.firstElementChild; n && i < 4; i++) {
    const next = n.nextElementSibling, t = norm(n.textContent);
    if (t.length > 0 && t.length < 120 && !n.querySelector("img,figure,picture") && dupes.some(d => t.includes(d))) n.remove();
    n = next;
  }
  const firstP = [...base.querySelectorAll("p")].find(p => p.textContent.trim().length > 80);
  if (firstP) firstP.classList.add("mv-first");
  const srcHTML = base.innerHTML;

  const seen = new Set();
  let relayoutT, needFill = false;
  function watchImages(scope) {
    scope.querySelectorAll("img").forEach(img => {
      if (img.complete) { if (img.naturalWidth && img.naturalWidth < 4) img.remove(); return; }
      if (img.dataset.sized) return;            // space already reserved
      img.addEventListener("load", () => {
        if (img.naturalWidth < 4) img.remove();
        const key = img.currentSrc || img.src;
        if (seen.has(key)) return;
        seen.add(key);
        if (c1.contains(img)) needFill = true;
        clearTimeout(relayoutT); relayoutT = setTimeout(() => needFill ? layout() : recount(), 250);
      }, { once: true });
    });
  }

  // ---------- page 1 fill: move content into c1 until it overflows, split the boundary node ----------
  const fits = () => c1.scrollWidth <= c1.clientWidth + 1;
  const CONTAINER = /^(DIV|SECTION|ARTICLE|MAIN|UL|OL|BLOCKQUOTE|ASIDE)$/;
  const TEXTY = /^(P|LI|DD|DT|BLOCKQUOTE)$/;

  function splitText(node) {
    // node is in c1 and overflows. Keep the largest word-prefix that fits; return the remainder (or the node itself).
    const stops = [], walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let t; (t = walker.nextNode());) {
      const re = /\s+/g; let m;
      while ((m = re.exec(t.data))) stops.push([t, m.index + m[0].length]);
    }
    if (!stops.length) return null;
    const parent = node.parentNode, next = node.nextSibling;
    parent.removeChild(node);
    const head = node.cloneNode(false);
    parent.insertBefore(head, next);
    const prefix = i => { const r = document.createRange(); r.setStart(node, 0); r.setEnd(stops[i][0], stops[i][1]); return r; };
    let lo = -1, hi = stops.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi + 1) / 2);
      head.textContent = ""; head.appendChild(prefix(mid).cloneContents());
      if (fits()) lo = mid; else hi = mid - 1;
    }
    if (lo < 0) { parent.removeChild(head); return node; }
    head.textContent = ""; head.appendChild(prefix(lo).cloneContents());
    const r = document.createRange(); r.setStart(stops[lo][0], stops[lo][1]); r.setEnd(node, node.childNodes.length);
    const tail = node.cloneNode(false);
    tail.appendChild(r.cloneContents());
    tail.classList.remove("mv-first"); tail.classList.add("mv-cont");
    if (tail.tagName === "LI") tail.style.listStyle = "none";
    return tail;
  }

  function splitNode(node) {
    // node has just been appended into c1 and caused overflow. Returns what should go to c2 (or null).
    if (node.nodeType !== 1) { node.remove(); return node; }
    if (CONTAINER.test(node.tagName) && node.children.length > 1) {
      const kids = [...node.childNodes];
      kids.forEach(k => node.removeChild(k));
      const rest = node.cloneNode(false);
      for (let i = 0; i < kids.length; i++) {
        node.appendChild(kids[i]);
        if (fits()) continue;
        const r = splitNode(kids[i]);
        if (r) rest.appendChild(r);
        kids.slice(i + 1).forEach(k => rest.appendChild(k));
        break;
      }
      if (!node.childNodes.length) node.remove();
      return rest.childNodes.length ? rest : null;
    }
    if (TEXTY.test(node.tagName) || /^H[2-6]$/.test(node.tagName) === false && node.textContent.length > 200 && !node.querySelector("img,figure,table,pre")) {
      if (!/^H[1-6]$/.test(node.tagName)) return splitText(node);
    }
    node.remove(); return node;
  }

  function fill() {
    c1.textContent = ""; c2.textContent = "";
    const tmp = el("div"); tmp.innerHTML = srcHTML;
    const nodes = [...tmp.childNodes];
    let i = 0;
    for (; i < nodes.length; i++) {
      c1.appendChild(nodes[i]);
      if (!fits()) break;
    }
    if (i < nodes.length) {
      const r = splitNode(nodes[i]);
      // Don't strand a heading at the bottom of page 1.
      const last = c1.lastElementChild;
      if (last && /^H[2-6]$/.test(last.tagName)) c2.appendChild(last);
      if (r) c2.appendChild(r);
      nodes.slice(i + 1).forEach(n => c2.appendChild(n));
    }
    watchImages(c1); watchImages(c2);
  }

  // ---------- paging ----------
  let page = 0, pages = 1, step = 1, gapPx = 0;
  let size = 0; try { size = +localStorage.getItem("zm-size") || 0; } catch (e) {}
  if (!size) size = innerWidth < 700 ? 17 : 19;
  let theme = null; try { theme = localStorage.getItem("zm-theme"); } catch (e) {}
  if (!theme) theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const themes = ["light", "sepia", "dark"];
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  // ---------- reading position: a character offset into the article, independent of layout ----------
  const caretAt = (x, y) => {
    if (document.caretPositionFromPoint) { const c = document.caretPositionFromPoint(x, y); return c && { node: c.offsetNode, offset: c.offset }; }
    if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); return r && { node: r.startContainer, offset: r.startOffset }; }
    return null;
  };
  function textOffset() {            // first character visible on the current page
    if (page === 0 || !c2.firstChild) return 0;
    const base = c1.textContent.length, fr = c2.getBoundingClientRect();
    for (let y = fr.top + 6; y < fr.bottom - 6; y += 16) {
      const hit = caretAt(fr.left + 6, y);
      if (!hit || hit.node.nodeType !== 3 || !c2.contains(hit.node)) continue;
      let n = 0; const w = document.createTreeWalker(c2, NodeFilter.SHOW_TEXT);
      for (let t; (t = w.nextNode());) { if (t === hit.node) return base + n + hit.offset; n += t.data.length; }
    }
    return null;
  }
  function pageFor(off) {
    if (!off) return 0;
    let n = c1.textContent.length;
    if (off < n) return 0;
    const w = document.createTreeWalker(c2, NodeFilter.SHOW_TEXT), c2r = c2.getBoundingClientRect();
    for (let t; (t = w.nextNode());) {
      if (n + t.data.length > off) {
        const r = document.createRange(), o = off - n;
        r.setStart(t, o); r.setEnd(t, Math.min(o + 1, t.data.length));
        const rect = r.getClientRects()[0] || r.getBoundingClientRect();
        return Math.min(pages - 1, 1 + Math.max(0, Math.floor((rect.left - c2r.left + c2.scrollLeft + 1) / step)));
      }
      n += t.data.length;
    }
    return pages - 1;
  }
  let readAnchor = null;              // set when the reader turns a page; layout changes keep it, so no drift
  const POS_KEY = "zm-pos", here = location.origin + location.pathname;
  const readPos = () => { try { return JSON.parse(localStorage.getItem(POS_KEY) || "{}"); } catch (e) { return {}; } };
  let posT = 0;
  function savePos(now) {
    clearTimeout(posT);
    const doSave = () => {
      const off = readAnchor; if (off == null) return;
      const all = readPos();
      if (off > 0) all[here] = { o: off, t: Date.now() }; else delete all[here];
      const keys = Object.keys(all).sort((a, b) => all[b].t - all[a].t);
      keys.slice(100).forEach(k => delete all[k]);          // remember the last 100 articles per site
      try { localStorage.setItem(POS_KEY, JSON.stringify(all)); } catch (e) {}
    };
    if (now) doSave(); else posT = setTimeout(doSave, 500);
  }

  function layout() {
    if (left) return;
    const lt = performance.now(); window.__zmStats.layouts++;
    const anchor = readAnchor != null ? readAnchor : (pages > 1 ? textOffset() : null), frac = pages > 1 ? page / pages : 0;
    root.style.setProperty("--mv-size", size + "px");
    document.documentElement.setAttribute("data-mv-theme", theme);
    p1.style.visibility = c2.style.visibility = "visible";
    const W = frame.clientWidth;
    const minCol = size * 15;                 // ~55–65 characters per line
    gapPx = Math.round(size * 2.2);
    const n = Math.max(1, Math.floor((W + gapPx) / (minCol + gapPx)));
    for (const c of [c1, c2]) { c.style.setProperty("--mv-gap", gapPx + "px"); c.style.columnCount = n; }
    step = W + gapPx;
    needFill = false;
    fill();
    recount(false);
    go(anchor != null ? pageFor(anchor) : Math.round(frac * pages), false);
    T.lastLayout = performance.now() - lt;
  }
  function recount(apply = true) {
    pages = 1 + (c2.childNodes.length ? Math.max(1, Math.round((c2.scrollWidth + gapPx) / step)) : 0);
    if (apply) go(page, false);
  }
  function go(p, remember = true) {
    page = Math.max(0, Math.min(pages - 1, p));
    p1.style.visibility = page === 0 ? "visible" : "hidden";
    c2.style.visibility = page === 0 ? "hidden" : "visible";
    if (page > 0) c2.scrollLeft = (page - 1) * step;
    tTitle.textContent = page === 0 ? "" : (art.title || pageTitle);
    count.textContent = (page + 1) + " / " + pages;
    prog.style.width = ((page + 1) / pages * 100) + "%";
    if (remember) { readAnchor = textOffset(); savePos(); }
  }

  const syncMenu = () => {
    szLabel.textContent = size + " pt";
    swatches.forEach(b => b.classList.toggle("mv-sel", b.dataset.t === theme));
    bFull.innerHTML = svg(fsEl() ? "unfull" : "full") + "<span>" + (fsEl() ? "Exit Full Screen" : "Full Screen") + "</span>";
  };
  let menuClosedAt = 0;
  const openMenu = on => { root.classList.toggle("mv-open", on); if (!on) menuClosedAt = Date.now(); else syncMenu(); };
  mBtn.onclick = e => { e.stopPropagation(); openMenu(!root.classList.contains("mv-open")); };
  root.addEventListener("pointerdown", e => {
    if (root.classList.contains("mv-open") && !pop.contains(e.target) && !mBtn.contains(e.target)) openMenu(false);
  }, true);
  bSmall.onclick = () => { size = Math.max(13, size - 1); save("zm-size", size); layout(); syncMenu(); };
  bBig.onclick = () => { size = Math.min(32, size + 1); save("zm-size", size); layout(); syncMenu(); };
  swatches.forEach(b => b.onclick = () => { theme = b.dataset.t; save("zm-theme", theme); layout(); syncMenu(); });
  bClose.onclick = () => leave();
  const de = document.documentElement;
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const exitFs = () => (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  const reqFs = de.requestFullscreen || de.webkitRequestFullscreen;
  function toggleFs() {
    if (fsEl()) { exitFs(); return; }
    try { const r = reqFs.call(de); if (r && r.catch) r.catch(() => {}); } catch (e) {}
  }
  const canFs = !!reqFs && document.fullscreenEnabled !== false && document.webkitFullscreenEnabled !== false;
  if (!canFs) fsRow.style.display = "none"; else closeRow.style.display = "none";
  bFull.onclick = () => { openMenu(false); toggleFs(); };
  let fsChangedAt = 0, wasFs = false;
  const onFs = () => {
    fsChangedAt = Date.now(); const on = !!fsEl();
    root.classList.toggle("mv-fs", on); syncMenu();
    if (on) { wasFs = true; disarm(); }
    else if (wasFs) { leave(); return; }   // leaving full screen leaves ZineMode
    setTimeout(layout, 60);
  };

  // ---------- automatic full screen ----------
  // Browsers only allow full screen from a tap or key press. Try right away (works when the
  // bookmarklet tap still counts); otherwise the reader's first tap or key enters full screen.
  let armed = false, hint = null, swallowClickUntil = 0;
  function disarm() {
    if (!armed) return; armed = false;
    ["touchend", "click", "keydown"].forEach(t => window.removeEventListener(t, onFirst, true));
    if (hint) { hint.style.opacity = "0"; setTimeout(() => hint && hint.remove(), 600); }
  }
  function onFirst(e) {
    if (e.type === "keydown" && (e.key === "Escape" || e.metaKey || e.ctrlKey || e.altKey)) return;
    if (e.target.closest && e.target.closest(".mv-pop,.mv-mbtn")) return;
    if (e.type === "touchend") swallowClickUntil = Date.now() + 700;
    else if (e.type === "click") { if (Date.now() < swallowClickUntil) { e.stopPropagation(); return; } e.stopPropagation(); }
    else if (e.type === "keydown") e.preventDefault(), e.stopPropagation();
    toggleFs(); disarm();
  }
  function arm() {
    if (armed || fsEl() || wasFs || left) return; armed = true;
    ["touchend", "click", "keydown"].forEach(t => window.addEventListener(t, onFirst, true));
    hint = el("div", "mv-hint", root.classList.contains("mv-touch") ? "Tap to read full screen" : "Click or press any key for full screen");
    root.appendChild(hint);
    setTimeout(() => { if (hint) hint.style.opacity = "0"; }, 3500);
  }
  if (canFs && opts.fullscreenRequested) {
    setTimeout(() => { if (!fsEl()) arm(); }, 800);          // only fall back if the caller's request failed
  } else if (canFs) {
    let r; try { r = reqFs.call(de); } catch (e) {}
    if (r && r.then) r.catch(() => arm());
    setTimeout(() => { if (!fsEl()) arm(); }, 350);
  }
  document.addEventListener("fullscreenchange", onFs, sig);
  document.addEventListener("webkitfullscreenchange", onFs, sig);

  // ---------- leave: put the original page back ----------
  function leave() {
    if (left) return; left = true;
    savePos(true);
    ac.abort(); disarm(); clearTimeout(relayoutT); clearTimeout(posT);
    if (fsEl()) { try { const r = exitFs(); if (r && r.catch) r.catch(() => {}); } catch (e) {} }
    root.remove(); st.remove();
    H.removeAttribute("data-mv-theme");
    const setAttr = (n, k, v) => v == null ? n.removeAttribute(k) : n.setAttribute(k, v);
    setAttr(H, "style", saved.htmlStyle); setAttr(B, "style", saved.bodyStyle); setAttr(B, "class", saved.bodyClass);
    B.appendChild(saved.kids);
    for (let i = saved.styles.length - 1; i >= 0; i--) {
      const [n, par, next] = saved.styles[i];
      par.insertBefore(n, next && next.parentNode === par ? next : null);
    }
    if (saved.vp) setAttr(saved.vp, "content", saved.vpContent); else ourVp.remove();
    document.title = saved.title;
    requestAnimationFrame(() => scrollTo(saved.x, saved.y));
    delete window.__zm;
  }
  window.__zm = { leave };

  document.addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (["ArrowRight", "PageDown", " ", "ArrowDown"].includes(e.key)) { e.preventDefault(); go(page + (e.shiftKey && e.key === " " ? -1 : 1)); }
    else if (["ArrowLeft", "PageUp", "ArrowUp"].includes(e.key)) { e.preventDefault(); go(page - 1); }
    else if (e.key === "Home") go(0); else if (e.key === "End") go(pages - 1);
    else if (e.key === "f" || e.key === "F") { e.preventDefault(); toggleFs(); }
    else if (e.key === "Escape" && root.classList.contains("mv-open")) openMenu(false);
    else if (e.key === "Escape" && !fsEl() && Date.now() - fsChangedAt > 600) leave();
  }, { capture: true, signal: ac.signal });

  // Touch: swipe to turn; tap the outer thirds to turn.
  let sx = 0, sy = 0;
  frame.addEventListener("touchstart", e => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  frame.addEventListener("touchend", e => {
    const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) go(page + (dx < 0 ? 1 : -1));
  }, { passive: true });
  frame.addEventListener("touchmove", e => { if (e.touches.length === 1) e.preventDefault(); }, { passive: false });
  frame.addEventListener("click", e => {
    if (e.target.closest("a,button,video,input,textarea") || String(getSelection()).length) return;
    if (Date.now() - menuClosedAt < 400) return;   // the tap that closed the menu
    const r = frame.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    if (x > 0.7) go(page + 1); else if (x < 0.3) go(page - 1);
  });
  // Trackpad / mouse wheel: one page per gesture.
  let wheelLock = 0;
  frame.addEventListener("wheel", e => {
    e.preventDefault();
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 12 || Date.now() < wheelLock) return;
    wheelLock = Date.now() + 450; go(page + (d > 0 ? 1 : -1));
  }, { passive: false });
  c2.addEventListener("scroll", () => { if (page > 0 && Math.abs(c2.scrollLeft - (page - 1) * step) > 2) c2.scrollLeft = (page - 1) * step; });

  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 120); }, sig);
  if (document.fonts && document.fonts.status === "loading") document.fonts.ready.then(layout);
  layout();
  scrollTo(0, 0);

  // Small message bar under the top bar, with an optional action button.
  function toast(text, action, onAction, ms = 6000) {
    root.querySelectorAll(".mv-toast").forEach(t => t.remove());
    const t = el("div", "mv-toast");
    t.append(el("span", "", text));
    if (action) {
      const b = el("button", "", action);
      b.onclick = e => { e.stopPropagation(); t.remove(); onAction && onAction(); };
      t.append(b);
    }
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 600); }, ms);
    return t;
  }

  // Resume where the reader left off.
  const prev = readPos()[here];
  if (prev && prev.o > 0) {
    readAnchor = prev.o;
    go(pageFor(prev.o), false);
    if (page > 0) toast("Resumed on page " + (page + 1), "Start over", () => go(0));   // go() resets the anchor and forgets the entry
  }

  return { toast, leave };
}


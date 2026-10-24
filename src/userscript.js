// Userscript entry: shows a small ZineMode button on pages that look like articles.
import { run } from "./core.js";
import { isProbablyReaderable } from "@mozilla/readability";

const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="4" width="17" height="16" rx="2.2"/><path d="M8.5 8h2.5M8.5 11h2.5M8.5 14h2.5M13 8h2.5M13 11h2.5M13 14h1.5"/></svg>';

function start() {
  if (window.__zm) { run(); return; }            // already reading: toggles off
  // Ask for full screen first, while the tap still counts as a user gesture.
  const de = document.documentElement, req = de.requestFullscreen || de.webkitRequestFullscreen;
  let asked = false;
  try { const r = req && req.call(de); asked = !!req; if (r && r.catch) r.catch(() => {}); } catch (e) {}
  try { run({ fullscreenRequested: asked }); } catch (e) { alert("ZineMode failed: " + e.message); }
}

function setup() {
  const host = document.createElement("div");
  host.setAttribute("data-zinemode-launcher", "");
  host.style.cssText = "all:initial;position:fixed;z-index:2147483646;right:max(16px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom))";
  const shadow = host.attachShadow({ mode: "closed" });
  shadow.innerHTML = `<style>
    button{all:unset;box-sizing:border-box;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;cursor:pointer;
      background:rgba(60,60,64,.62);-webkit-backdrop-filter:blur(20px) saturate(1.8);backdrop-filter:blur(20px) saturate(1.8);
      color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.18);opacity:.7;transition:opacity .2s,transform .15s;-webkit-tap-highlight-color:transparent}
    button:hover{opacity:1} button:active{transform:scale(.94)}
    svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
  </style><button title="Read in ZineMode (⌥⇧Z)" aria-label="Read in ZineMode">${ICON}</button>`;
  shadow.querySelector("button").addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); start(); });

  let lastUrl = "", readable = false;
  function check() {
    if (window.__zm) return;                      // reading: the page (and this button) is set aside
    if (location.href !== lastUrl) { lastUrl = location.href; readable = isProbablyReaderable(document); }
    if (readable && !host.isConnected) document.body.appendChild(host);
    if (!readable && host.isConnected) host.remove();
  }
  check();
  setTimeout(() => { lastUrl = ""; check(); }, 2500);  // pages that render their text late
  setInterval(check, 2000);                            // single-page sites changing article, or removing the button

  // Keyboard: Option-Shift-Z on the Mac (works on any page, article-like or not).
  addEventListener("keydown", e => {
    if (e.altKey && e.shiftKey && !e.metaKey && !e.ctrlKey && e.code === "KeyZ") { e.preventDefault(); start(); }
  }, true);
}

if (window.top === window && document.body) setup();

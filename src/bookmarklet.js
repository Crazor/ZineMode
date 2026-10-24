// Bookmarklet entry: run (or toggle off) immediately, then check once a day whether a newer version is published.
import { run } from "./core.js";

/* global __ZM_VERSION__, __ZM_HOME__ */
const newer = (a, b) => {                      // is version a newer than b? ("0.10.0" > "0.9.3")
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  return false;
};

function checkForUpdate(zm) {
  const KEY = "zm-update-check", DAY = 864e5;
  try { if (Date.now() - (+localStorage.getItem(KEY) || 0) < DAY) return; localStorage.setItem(KEY, Date.now()); } catch (e) {}
  // Some sites' security policy blocks this request; that only means no reminder on that site.
  fetch(__ZM_HOME__ + "version.json", { cache: "no-store" })
    .then(r => r.ok ? r.json() : null)
    .then(v => {
      if (v && v.version && newer(v.version, __ZM_VERSION__))
        zm.toast("ZineMode " + v.version + " is available", "Update", () => window.open(__ZM_HOME__, "_blank"), 10000);
    })
    .catch(() => {});
}

let zm = null;
try { zm = run(); } catch (e) { alert("ZineMode failed: " + e.message); }
if (zm) checkForUpdate(zm);

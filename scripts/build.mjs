// Builds the bookmarklet and the userscript into dist/.
// With --site, also assembles the GitHub Pages site into _site/.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const VERSION = pkg.version;
const HOME = pkg.homepage;                       // https://crazor.github.io/ZineMode/
const USERSCRIPT_URL = HOME + "ZineMode.user.js";

const common = {
  bundle: true, minify: true, format: "iife", target: "safari15", legalComments: "none", write: false,
  define: { __ZM_VERSION__: JSON.stringify(VERSION), __ZM_HOME__: JSON.stringify(HOME) },
};

mkdirSync("dist", { recursive: true });

// Bookmarklet
const bm = (await build({ ...common, entryPoints: ["src/bookmarklet.js"] })).outputFiles[0].text.trim();
const bookmarklet = "javascript:" + bm.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\n/g, "%0A");
writeFileSync("dist/zinemode.min.js", bm);
writeFileSync("dist/bookmarklet.txt", bookmarklet);

// Userscript
const us = (await build({ ...common, entryPoints: ["src/userscript.js"] })).outputFiles[0].text.trim();
const header = `// ==UserScript==
// @name         ZineMode
// @namespace    https://github.com/Crazor/ZineMode
// @version      ${VERSION}
// @description  Read web articles in paged, magazine-style columns.
// @homepageURL  ${HOME}
// @updateURL    ${USERSCRIPT_URL}
// @downloadURL  ${USERSCRIPT_URL}
// @match        *://*/*
// @run-at       document-idle
// @noframes
// @grant        none
// ==/UserScript==
// Includes Mozilla Readability (Apache License 2.0), https://github.com/mozilla/readability
`;
writeFileSync("dist/ZineMode.user.js", header + us + "\n");

console.log(`ZineMode ${VERSION}: bookmarklet ${(bookmarklet.length / 1024).toFixed(1)} KB, userscript ${((header + us).length / 1024).toFixed(1)} KB`);

// GitHub Pages site
if (process.argv.includes("--site")) {
  mkdirSync("_site", { recursive: true });
  const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Function replacements: the minified code contains "$&"-style sequences that string replacements would expand.
  const vars = { VERSION, BOOKMARKLET_KB: String(Math.round(bookmarklet.length / 1024)), BOOKMARKLET_HREF: esc(bookmarklet), USERSCRIPT_URL };
  const html = readFileSync("site/index.html", "utf8").replace(/\{\{(\w+)\}\}/g, (m, k) => k in vars ? vars[k] : m);
  writeFileSync("_site/index.html", html);
  for (const f of readdirSync("site")) if (f !== "index.html") copyFileSync("site/" + f, "_site/" + f);
  copyFileSync("dist/ZineMode.user.js", "_site/ZineMode.user.js");
  writeFileSync("_site/bookmarklet.txt", bookmarklet);
  writeFileSync("_site/version.json", JSON.stringify({ version: VERSION }) + "\n");
  writeFileSync("_site/.nojekyll", "");
  console.log("site assembled in _site/");
}

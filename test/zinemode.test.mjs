// End-to-end tests in WebKit (Safari's engine). Run with `npm test` (builds first).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { webkit } from "playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = name => pathToFileURL(root + "test/fixtures/" + name).href;
const BOOKMARKLET = readFileSync(root + "dist/zinemode.min.js", "utf8");
const USERSCRIPT = readFileSync(root + "dist/ZineMode.user.js", "utf8");
const VERSION = JSON.parse(readFileSync(root + "package.json", "utf8")).version;
const HOME = JSON.parse(readFileSync(root + "package.json", "utf8")).homepage;

const IPAD = { viewport: { width: 1180, height: 820 }, hasTouch: true };
const TOUCH = "Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5})";
// Safari refuses full screen without a user gesture; emulate that for the first (automatic) request.
const DENY_FIRST_FULLSCREEN = `(()=>{const o=Element.prototype.requestFullscreen;let n=0;
  Element.prototype.requestFullscreen=function(){if(n++===0)return Promise.reject(new TypeError('no gesture'));return o.call(this)}})()`;

let browser;
before(async () => { browser = await webkit.launch(); });
after(async () => { await browser.close(); });

async function open(name, { ctx = IPAD, init = [], routeVersion } = {}) {
  const context = await browser.newContext(ctx);
  for (const s of init) await context.addInitScript(s);
  if (routeVersion) await context.route(HOME + "version.json", r =>
    r.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify({ version: routeVersion }) }));
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(fixture(name));
  return { page, context, errors };
}
const pager = page => page.evaluate(() => document.querySelector("#mv .mv-bot span").textContent);
const pageNo = async page => +(await pager(page)).split(" / ")[0];
const firstWords = page => page.evaluate(() => {
  const c = document.querySelector(".mv-c2"), r = c.getBoundingClientRect();
  for (let y = r.top + 6; y < r.bottom; y += 16) {
    const h = document.caretRangeFromPoint(r.left + 6, y);
    if (h && h.startContainer.nodeType === 3 && c.contains(h.startContainer)) return h.startContainer.data.slice(h.startOffset, h.startOffset + 30);
  }
});

test("extracts the article and lays it out in pages and columns", async () => {
  const { page, context, errors } = await open("essay.html");
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(400);
  const info = await page.evaluate(() => ({
    title: document.querySelector("#mv h1")?.textContent,
    site: document.querySelector("#mv .mv-site")?.textContent,
    columns: getComputedStyle(document.querySelector("#mv .mv-p1 .mv-col")).columnCount,
    dropCap: !!document.querySelector("#mv p.mv-first"),
    text: document.getElementById("mv").textContent,
  }));
  assert.equal(info.title, "The Case for Columns");
  assert.equal(info.site, "The Margin Review");
  assert.equal(info.columns, "3");
  assert.ok(info.dropCap, "first paragraph gets a drop cap");
  assert.ok(info.text.includes("horizontal thinking"), "article end is present");
  assert.ok(!info.text.includes("By ZineMode Contributors"), "byline is not repeated in the body");
  assert.ok(!info.text.includes("Advertisement") && !info.text.includes("Privacy"), "page chrome is gone");
  assert.match(await pager(page), /^1 \/ [2-9]$/);
  assert.deepEqual(errors, []);
  await context.close();
});

test("survives utility-CSS class names that confuse Readability (TIME's 2026 template)", async () => {
  const { page, context } = await open("tailwind.html");
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(400);
  const text = await page.evaluate(() => document.getElementById("mv").textContent);
  assert.ok(text.length > 20000, "the full article body is extracted, got " + text.length + " chars");
  assert.ok(!text.includes("The Brief Daily"), "newsletter sign-up box is removed");
  await context.close();
});

test("page turns: keys, taps on the outer thirds, and no page turn from the tap that closes the menu", async () => {
  const { page, context } = await open("long.html", { init: [TOUCH] });
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(400);
  await page.keyboard.press("ArrowRight");
  assert.equal(await pageNo(page), 2);
  await page.mouse.click(1100, 400);
  assert.equal(await pageNo(page), 3);
  await page.mouse.click(80, 400);
  assert.equal(await pageNo(page), 2);
  await page.click(".mv-mbtn");
  await page.waitForTimeout(400);
  await page.mouse.click(1100, 400);                 // closes the menu only
  await page.waitForTimeout(400);
  assert.equal(await pageNo(page), 2);
  await context.close();
});

test("leaving restores the original page exactly, including scroll position", async () => {
  const { page, context } = await open("long.html");
  await page.evaluate(() => scrollTo(0, 1500));
  const snap = () => page.evaluate(() => ({ y: scrollY, html: document.body.innerHTML, styles: document.querySelectorAll("style").length, title: document.title }));
  const before = await snap();
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(400);
  await page.evaluate(() => document.exitFullscreen && document.fullscreenElement && document.exitFullscreen());
  await page.evaluate(() => window.__zm && window.__zm.leave());
  await page.waitForTimeout(200);
  assert.deepEqual(await snap(), before);
  assert.ok(await page.evaluate(() => !document.documentElement.hasAttribute("data-mv-theme") && !window.__zm));
  await context.close();
});

test("exiting full screen leaves ZineMode", async () => {
  const { page, context } = await open("long.html", { init: [TOUCH] });
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(500);
  assert.ok(await page.evaluate(() => !!document.fullscreenElement));
  await page.evaluate(() => document.exitFullscreen());
  await page.waitForTimeout(400);
  assert.ok(await page.evaluate(() => !document.getElementById("mv")));
  await context.close();
});

test("first tap enters full screen when Safari refused the automatic request, without turning the page", async () => {
  const { page, context } = await open("long.html", { init: [TOUCH, DENY_FIRST_FULLSCREEN] });
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(500);
  assert.ok(await page.evaluate(() => !document.fullscreenElement && !!document.querySelector(".mv-hint")));
  await page.mouse.click(1100, 400);
  await page.waitForTimeout(500);
  assert.ok(await page.evaluate(() => !!document.fullscreenElement));
  assert.equal(await pageNo(page), 1);
  await context.close();
});

test("reading position: resumes after leaving, and survives font size changes and rotation", async () => {
  const { page, context } = await open("long.html");
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(400);
  for (let i = 0; i < 9; i++) await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  const anchor = await firstWords(page);
  const p = await pageNo(page);

  const bump = async (i, n) => {
    await page.click(".mv-mbtn"); await page.waitForTimeout(350);
    const b = page.locator(".mv-pop .mv-row").nth(0).locator("button").nth(i);
    for (let k = 0; k < n; k++) { await b.click(); await page.waitForTimeout(100); }
    await page.mouse.click(600, 400); await page.waitForTimeout(450);
  };
  await bump(1, 4); await bump(0, 4);
  assert.equal(await firstWords(page), anchor, "same text at top after A+ ×4, A− ×4");
  await page.setViewportSize({ width: 820, height: 1180 }); await page.waitForTimeout(500);
  await page.setViewportSize({ width: 1180, height: 820 }); await page.waitForTimeout(500);
  assert.equal(await firstWords(page), anchor, "same text at top after rotating and back");

  await page.evaluate(() => window.__zm.leave());
  await page.reload();
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(500);
  assert.equal(await pageNo(page), p);
  assert.equal(await firstWords(page), anchor);
  assert.match(await page.evaluate(() => document.querySelector(".mv-toast")?.textContent || ""), /Resumed on page/);
  await page.click(".mv-toast button");               // Start over
  await page.waitForTimeout(700);
  assert.equal(await pageNo(page), 1);
  await context.close();
});

test("bookmarklet shows an update notice when a newer version is published", async () => {
  const [maj, min] = VERSION.split(".").map(Number);
  const { page, context } = await open("essay.html", { routeVersion: `${maj}.${min + 1}.0` });
  await page.evaluate(() => localStorage.removeItem("zm-update-check"));
  await page.evaluate(BOOKMARKLET);
  await page.waitForTimeout(800);
  assert.match(await page.evaluate(() => document.querySelector(".mv-toast")?.textContent || ""), /is available/);
  await context.close();

  const same = await open("essay.html", { routeVersion: VERSION });
  await same.page.evaluate(() => localStorage.removeItem("zm-update-check"));
  await same.page.evaluate(BOOKMARKLET);
  await same.page.waitForTimeout(800);
  assert.equal(await same.page.evaluate(() => document.querySelector(".mv-toast")), null);
  await same.context.close();
});

test("userscript: button only on articles; tapping it opens ZineMode in full screen", async () => {
  const shop = await open("nonarticle.html", { init: [TOUCH] });
  await shop.page.evaluate(USERSCRIPT);
  await shop.page.waitForTimeout(300);
  assert.equal(await shop.page.evaluate(() => !!document.querySelector("[data-zinemode-launcher]")), false);
  await shop.context.close();

  const { page, context, errors } = await open("essay.html", { init: [TOUCH, DENY_FIRST_FULLSCREEN.replace("n++===0", "false")] });
  await page.evaluate(USERSCRIPT);
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => !!document.querySelector("[data-zinemode-launcher]")));
  await page.mouse.click(1180 - 16 - 22, 820 - 16 - 22);
  await page.waitForTimeout(600);
  assert.ok(await page.evaluate(() => !!document.getElementById("mv") && !!document.fullscreenElement && !document.querySelector(".mv-hint")));
  await page.evaluate(() => document.exitFullscreen());
  await page.waitForTimeout(400);
  assert.ok(await page.evaluate(() => !document.getElementById("mv") && document.querySelector("[data-zinemode-launcher]").isConnected), "button is back after leaving");
  assert.deepEqual(errors, []);
  await context.close();
});

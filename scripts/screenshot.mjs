// Regenerates the preview images on the install page from the sample article (run after `npm run build`).
import { webkit } from "playwright";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const js = readFileSync(root + "dist/zinemode.min.js", "utf8");
const browser = await webkit.launch();
for (const [name, scheme] of [["preview.jpg", "light"], ["preview-dark.jpg", "dark"]]) {
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, deviceScaleFactor: 2, colorScheme: scheme });
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(root + "test/fixtures/essay.html").href);
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(js);
  await page.waitForTimeout(600);
  await page.screenshot({ path: root + "site/" + name, type: "jpeg", quality: 82 });
  await ctx.close();
}
await browser.close();
console.log("site/preview.jpg, site/preview-dark.jpg");

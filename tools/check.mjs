import fs from "node:fs";
import { chromium } from "playwright";

const files = process.argv.slice(2);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto("https://www.desmos.com/calculator", { waitUntil: "load" });
await page.waitForFunction(() => window.Calc && window.Calc.setState);
for (const f of files) {
  const s = JSON.parse(fs.readFileSync(f, "utf8"));
  const res = await page.evaluate(async (st) => {
    Calc.setState(st);
    await new Promise((r) => setTimeout(r, 4000));
    const a = Calc.expressionAnalysis;
    const bad = Object.entries(a).filter(([, v]) => v.isError).map(([id, v]) => `${id}: ${v.errorMessage}`);
    return { n: Object.keys(a).length, bad };
  }, s);
  console.log(f, res.n, "errors:", res.bad.length);
  for (const b of res.bad.slice(0, 40)) console.log("  ", b);
}
await browser.close();

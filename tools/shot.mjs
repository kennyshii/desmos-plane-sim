import fs from "node:fs";
import { chromium } from "playwright";

const [file, scenesJson, out = "/tmp/shot"] = process.argv.slice(2);
const scenes = JSON.parse(scenesJson.startsWith("[") ? scenesJson : fs.readFileSync(scenesJson, "utf8"));
const base = JSON.parse(fs.readFileSync(file, "utf8"));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: +(process.env.W || 1600), height: +(process.env.H || 900) }, deviceScaleFactor: +(process.env.DPR || 1) });
await page.goto("https://www.desmos.com/calculator", { waitUntil: "load" });
await page.waitForFunction(() => window.Calc && window.Calc.setState);
for (const [i, sc] of scenes.entries()) {
  const s = structuredClone(base);
  for (const [name, value] of Object.entries(sc.vars || {})) {
    const e = s.expressions.list.find((x) => x.latex && x.latex.startsWith(name + "="));
    if (e) e.latex = `${name}=${value}`; else console.error("missing var", name);
  }
  s.expressions.ticker.playing = sc.play ?? false;
  await page.evaluate((st) => { Calc.setState(st); Calc.updateSettings({ expressionsCollapsed: true }); }, s);
  await page.waitForTimeout((sc.wait ?? 3) * 1000);
  await page.screenshot({ path: `${out}-${i}.png`, clip: sc.clip });
}
await browser.close();

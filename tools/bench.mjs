import fs from "node:fs";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith("--")).map((a) => a.slice(2).split("=")));
const files = args.filter((a) => !a.startsWith("--"));
const vars = JSON.parse(opt.vars || "{}");
const rounds = +(opt.rounds || 3), secs = +(opt.secs || 8);
const prep = (f) => {
  const s = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const [name, value] of Object.entries(vars)) {
    const e = s.expressions.list.find((x) => x.latex && x.latex.startsWith(name + "="));
    if (e) e.latex = `${name}=${value}`;
  }
  if (!s.expressions.list.some((e) => e.latex && /^n_\{tk\}=/.test(e.latex))) {
    s.expressions.list.push({ type: "expression", id: "__ntk", latex: "n_{tk}=0", hidden: true });
    s.expressions.ticker.handlerLatex += ",n_{tk}\\to n_{tk}+1";
  }
  s.expressions.ticker.playing = true;
  return s;
};
const states = files.map(prep);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
await page.goto("https://www.desmos.com/calculator", { waitUntil: "load" });
await page.waitForFunction(() => window.Calc && window.Calc.setState);
const res = files.map(() => []);
for (let r = 0; r < rounds; r++) for (const [i, st] of states.entries()) {
  res[i].push(await page.evaluate(async ([s, ms]) => {
    Calc.setState(s); Calc.updateSettings({ expressionsCollapsed: true });
    const h = Calc.HelperExpression({ latex: "n_{tk}" });
    await new Promise((r) => setTimeout(r, 2500));
    const a = h.numericValue, t = performance.now();
    await new Promise((r) => setTimeout(r, ms));
    return (h.numericValue - a) / ((performance.now() - t) / 1000);
  }, [st, secs * 1000]));
}
await browser.close();
const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
files.forEach((f, i) => console.log(f.padEnd(28), "median", med(res[i]).toFixed(2), "runs", res[i].map((x) => x.toFixed(1)).join(" ")));
files.slice(1).forEach((f, j) => {
  const ratios = res[0].map((a, r) => res[j + 1][r] / a);
  console.log("ratio", f.padEnd(26), "median", med(ratios).toFixed(3), "rounds", ratios.map((x) => x.toFixed(2)).join(" "));
});

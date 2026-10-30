import { load, save, editor, num, arr, inline, autofold, mergePolygonRuns } from "./lib.mjs";
import { addChase } from "./chase.mjs";
import { addNight } from "./night.mjs";

const [src, out] = process.argv.slice(2);
const s = load(src);
const E = editor(s);

const bands = [0, 0.015, 0.032, 0.052, 0.076, 0.104, 0.136, 0.173, 0.215, 0.263, 0.318, 0.38, 0.45, 0.53, 0.62, 0.72, 0.84];
const haze = [176, 204, 232], zenith = [62, 124, 208];
const mix = (t) => haze.map((h, k) => Math.round(h + (zenith[k] - h) * Math.pow(t, 0.85)));
const cols = bands.slice(0, -1).map((_, i) => mix((i + 0.5) / (bands.length - 1)));
E.drop("e96", "e97", "e98", "e99");
E.set("e100", "\\operatorname{polygon}\\left(\\left(\\operatorname{join}\\left(X_k\\left(-0.4,B_s\\right),X_k\\left(0,B_r\\right)\\right),\\operatorname{join}\\left(Y_k\\left(-0.4,B_s\\right),Y_k\\left(0,B_r\\right)\\right)\\right)\\right)");
E.after("e95",
  E.v("sk1", `W_{a}=${arr(bands.slice(0, -1))}`),
  E.v("sk2", `W_{b}=${arr(bands.slice(1))}`),
  E.v("sk3", `W_{R}=${arr(cols.map((c) => c[0]))}`),
  E.v("sk4", `W_{G}=${arr(cols.map((c) => c[1]))}`),
  E.v("sk5", `W_{B}=${arr(cols.map((c) => c[2]))}`),
  E.v("sk7", "B_{t}=\\left[-66,-52.8...66\\right]\\frac{\\pi}{180}"),
  E.v("sk8", "B_{u}=\\left[66,52.8...-66\\right]\\frac{\\pi}{180}"),
  E.p("sk6", `\\operatorname{polygon}\\left(\\left(\\operatorname{join}\\left(X_k\\left(W_{a}\\left[i\\right],B_{t}\\right),X_k\\left(W_{b}\\left[i\\right]+0.012,B_{u}\\right)\\right),\\operatorname{join}\\left(Y_k\\left(W_{a}\\left[i\\right],B_{t}\\right),Y_k\\left(W_{b}\\left[i\\right]+0.012,B_{u}\\right)\\right)\\right)\\right)\\operatorname{for}i=\\left[1...${bands.length - 1}\\right]`, "#a4c8ec", { colorLatex: "\\operatorname{rgb}\\left(W_{R},W_{G},W_{B}\\right)" }),
);

const ridge = (a, terms) => `${a}+${terms.map(([amp, k, ph]) => `${amp}\\sin\\left(${k}t+${ph}\\right)`).join("+")}`;
E.after("e100",
  E.v("mt1", "M_{d}=\\frac{\\pi}{90}"),
  E.v("mt2", "M_{t}=M_{d}\\left(\\operatorname{floor}\\left(\\frac{a_h}{M_{d}}\\right)+\\left[-33...33\\right]\\right)"),
  E.v("mt8", "M_{r}=1.02r_x"),
  E.v("mt9", "M_{w}=\\frac{-C_y}{M_{r}}"),
  E.v("mt4", `M_{h}(t,i)=M_{w}+\\frac{\\left\\{i=1:${ridge("170", [[110, 3, 1], [70, 7, 2.1], [40, 13, 0.4], [20, 29, 1.7]])},${ridge("90", [[70, 5, 2.6], [42, 11, 0.3], [26, 19, 4.1], [13, 41, 2.2]])}\\right\\}}{M_{r}}`),
  E.p("mt6", "\\operatorname{polygon}\\left(\\left(\\operatorname{join}\\left(X_k\\left(M_{h}\\left(M_{t},i\\right),M_{t}-a_h\\right),X_k\\left(M_{w}-0.01+0B_{u},B_{u}\\right)\\right),\\operatorname{join}\\left(Y_k\\left(M_{h}\\left(M_{t},i\\right),M_{t}-a_h\\right),Y_k\\left(M_{w}-0.01+0B_{u},B_{u}\\right)\\right)\\right)\\right)\\operatorname{for}i=\\left[1,2\\right]", "#a2bad3", { colorLatex: "\\operatorname{rgb}\\left(\\left[162,150\\right],\\left[186,176\\right],\\left[211,196\\right]\\right)" }),
);

E.drop("e142", "e143", "e144", "e147", "e148", "e149", "e152", "e153", "e154", "e157", "e158", "e159", "e160", "e161", "e162");
E.after("e139",
  E.v("tg1", "k_{q}=31-\\operatorname{floor}\\left(\\frac{I_q-1}{16}\\right)"),
  E.v("tg2", "b_{qc}=a_h+\\left(\\operatorname{mod}\\left(I_q-1,16\\right)-7.5\\right)0.152716"),
  E.v("tg3", "r_{q}=r_ng_r^{k_{q}+0.5}"),
  E.v("tg4", "x_{c}=X_p+r_{q}\\sin\\left(b_{qc}\\right)"),
  E.v("tg5", "z_{c}=Z_p+r_{q}\\cos\\left(b_{qc}\\right)"),
  E.v("tg6", "T_{x}(x,z)=350\\left(\\frac{\\cos\\left(\\frac{x}{2300}+1.3+k_s\\right)\\sin\\left(\\frac{z}{1850}+0.4+0.7k_s\\right)}{2300}+\\frac{0.56\\cos\\left(\\frac{x+0.6z}{1250}+2+1.3k_s\\right)}{1250}+\\frac{0.28\\cos\\left(\\frac{x-0.8z}{610}+0.9+0.4k_s\\right)}{610}+\\frac{0.14\\cos\\left(\\frac{z}{280}+\\frac{x}{330}+k_s\\right)}{330}\\right)"),
  E.v("tg7", "T_{z}(x,z)=350\\left(\\frac{\\sin\\left(\\frac{x}{2300}+1.3+k_s\\right)\\cos\\left(\\frac{z}{1850}+0.4+0.7k_s\\right)}{1850}+\\frac{0.336\\cos\\left(\\frac{x+0.6z}{1250}+2+1.3k_s\\right)}{1250}-\\frac{0.224\\cos\\left(\\frac{x-0.8z}{610}+0.9+0.4k_s\\right)}{610}+\\frac{0.14\\cos\\left(\\frac{z}{280}+\\frac{x}{330}+k_s\\right)}{280}\\right)"),
  E.v("tg8", "g_{w}=S_s\\left(\\frac{d_s\\left(x_{c},z_{c}\\right)-900}{4200}\\right)\\left\\{h_q>0.5:1,0\\right\\}"),
  E.v("tg9", "g_{x}=g_{w}T_{x}\\left(x_{c},z_{c}\\right)"),
  E.v("tg10", "g_{z}=g_{w}T_{z}\\left(x_{c},z_{c}\\right)"),
);
E.set("e163", "n_l=\\frac{0.42g_{x}+0.76-0.5g_{z}}{\\sqrt{1+g_{x}^{2}+g_{z}^{2}}}");
E.drop("e166");
E.set("e168", E.get("e168").latex.replaceAll("\\frac{x_1+x_3}{14}", "\\frac{x_{c}}{7}").replaceAll("\\frac{z_1+z_3}{23}", "\\frac{z_{c}}{11.5}").replaceAll("\\frac{x_1+x_3}{26}", "\\frac{x_{c}}{13}").replaceAll("\\frac{z_1+z_3}{12}", "\\frac{z_{c}}{6}").replace("0.1M_x", "0.07M_x").replaceAll("\\frac{x_1+x_3}{2}", "x_{c}").replaceAll("\\frac{z_1+z_3}{2}", "z_{c}").replace("r_q", "r_{q}"));
E.set("e167", "f_q=0.95\\left(1-e^{-\\left(\\frac{r_{q}}{0.45r_x}\\right)^{1.3}}\\right)");
E.set("e219", "F_o(d)=0.95\\left(1-e^{-\\left(\\frac{d}{0.45r_x}\\right)^{1.3}}\\right)");

const rects = [];
const seg = { a: [0, 1, 1, 1], b: [1, 1, 0.5, 1], c: [1, 1, 0, 0.5], d: [0, 1, 0, 0], e: [0, 0, 0, 0.5], f: [0, 0, 0.5, 1], g: [0, 1, 0.5, 0.5] };
const digits = { 3: "abcdg", 6: "afedcg", 8: "abcdefg" };
const W = 9, H = 24, T = 2.2;
const glyph = (ch, u0) => {
  if (ch === "1") return [[u0 + W / 2 - T / 2, u0 + W / 2 + T / 2, 0, H]];
  return [...digits[ch]].map((k) => {
    const [ua, ub, va, vb] = seg[k];
    const uL = ua === ub ? (ua ? W - T : 0) : 0, uR = ua === ub ? (ua ? W : T) : W;
    const vL = va === vb ? (va === 1 ? H - T : va === 0.5 ? H / 2 - T / 2 : 0) : va * H;
    const vR = va === vb ? (va === 1 ? H : va === 0.5 ? H / 2 + T / 2 : T) : vb * H;
    return [u0 + uL, u0 + uR, vL, vR];
  });
};
const place = (text, z0, dir) => {
  [...text].forEach((ch, i) => glyph(ch, i === 0 ? -11 : 2).forEach(([u0, u1, v0, v1]) => {
    const x = [dir * u0, dir * u1].sort((p, q) => p - q), z = [z0 + dir * v0, z0 + dir * v1].sort((p, q) => p - q);
    rects.push([x[0], x[1], z[0], z[1]]);
  }));
};
place("36", 34, 1);
place("18", 1766, -1);
const tdz = [[150, [[5, 6.5], [7.5, 9], [10, 11.5]], 22.5], [300, [[6, 10.5]], 45], [450, [[5, 6.5], [7.5, 9]], 22.5], [600, [[5, 6.5]], 22.5]];
for (const [d, bars, len] of tdz) for (const [a, b] of bars) for (const side of [-1, 1]) {
  const x = [side * a, side * b].sort((p, q) => p - q);
  rects.push([x[0], x[1], d, d + len]);
  rects.push([x[0], x[1], 1800 - d - len, 1800 - d]);
}
const base = [[-22.5, 22.5, 0, 1800, 0], [-21.6, -20.7, 0, 1800, 1], [20.7, 21.6, 0, 1800, 1], [-6, 6, 260, 620, 2], [-6, 6, 1180, 1540, 2]];
for (let k = 0; k < 28; k++) base.push([-0.35, 0.35, 100 + 60 * k, 130 + 60 * k, 1]);
for (let k = 0; k < 8; k++) { const x = -17.5 + 5 * k; base.push([x - 0.8, x + 0.8, 6, 26, 1], [x - 0.8, x + 0.8, 1774, 1794, 1]); }
const all = [...base, ...rects.map((r) => [...r, 1])];
const pal = [[58, 60, 66], [232, 232, 232], [44, 45, 50]];
E.drop(...Array.from({ length: 38 }, (_, i) => `e${180 + i}`));
const P = (f, X, z) => `\\left\\{v_{rw}=1:P_${f}\\left(${X},12.05,${z}\\right),9\\right\\}`;
const pt = (X, z) => `\\left(${P("x", X, z)},${P("y", X, z)}\\right)`;
E.after("e179",
  E.v("rm1", `R_{x0}=${arr(all.map((r) => r[0]))}`),
  E.v("rm2", `R_{x1}=${arr(all.map((r) => r[1]))}`),
  E.v("rm3", `R_{z0}=${arr(all.map((r) => r[2]))}`),
  E.v("rm4", `R_{z1}=${arr(all.map((r) => r[3]))}`),
  E.v("rm5", `R_{R}=${arr(all.map((r) => pal[r[4]][0]))}`),
  E.v("rm6", `R_{G}=${arr(all.map((r) => pal[r[4]][1]))}`),
  E.v("rm7", `R_{B}=${arr(all.map((r) => pal[r[4]][2]))}`),
  E.v("rw1", "l_{rw}=L_z\\left(R_{x0},12.05,R_{z0},R_{z1}\\right)"),
  E.v("rw2", "h_{rw}=H_z\\left(R_{x0},12.05,R_{z0},R_{z1}\\right)"),
  E.v("rw3", "m_{rw}=L_z\\left(R_{x1},12.05,R_{z0},R_{z1}\\right)"),
  E.v("rw4", "k_{rw}=H_z\\left(R_{x1},12.05,R_{z0},R_{z1}\\right)"),
  E.v("rw5", "v_{rw}=\\left\\{l_{rw}<h_{rw}:\\left\\{m_{rw}<k_{rw}:1,0\\right\\},0\\right\\}"),
  E.p("rw6", `\\operatorname{polygon}\\left(${pt("R_{x0}", "l_{rw}")},${pt("R_{x1}", "m_{rw}")},${pt("R_{x1}", "k_{rw}")},${pt("R_{x0}", "h_{rw}")}\\right)`, "#3a3c42", { colorLatex: "\\operatorname{rgb}\\left(R_{R},R_{G},R_{B}\\right)" }),
);

{
const val = (name) => +E.list.find((e) => e.latex && e.latex.startsWith(name + "=")).latex.slice(name.length + 1);
const [X0, Z0, H0] = [val("X_{p}"), val("Z_{p}"), val("a_{h}")];
E.set("e283", `J_{i0}=${Math.floor((X0 + 400 * Math.sin(H0)) / 90)}`);
E.set("e284", `J_{j0}=${Math.floor((Z0 + 400 * Math.cos(H0)) / 90)}`);
E.set("e355", `Y_{i0}=${Math.floor(X0 / 1100)}`);
E.set("e356", `Y_{j0}=${Math.floor(Z0 / 1100)}`);
const cell = (v, ex, size) => `\\left\\{\\left|\\operatorname{floor}\\left(\\frac{${ex}}{${size}}\\right)-${v}\\right|>0.5:${v}\\to\\operatorname{floor}\\left(\\frac{${ex}}{${size}}\\right)\\right\\}`;
const tk = s.expressions.ticker;
tk.handlerLatex = tk.handlerLatex.replace("\\left\\{A_y>6:h_f\\to1\\right\\}", "\\left\\{A_y>6:\\left\\{h_f=0:h_f\\to1\\right\\}\\right\\}");
tk.handlerLatex += "," + [cell("J_{i0}", "J_{cx}", 90), cell("J_{j0}", "J_{cz}", 90), cell("Y_{i0}", "X_p", 1100), cell("Y_{j0}", "Z_p", 1100)].join(",");
const jk = E.get("e295").latex;
const jsplit = jk.indexOf("\\left\\{J_{w}>0.02:1,0\\right\\}");
const jAirport = jk.slice(jsplit + "\\left\\{J_{w}>0.02:1,0\\right\\}".length, jk.indexOf("\\left\\{\\left(J_{x}-C_x\\right)F_x"));
E.before("e295",
  E.v("cj1", `J_{ck}=\\left\\{J_{h1}<J_{f}\\left(J_{x},J_{z}\\right):1,0\\right\\}${jAirport}`),
  E.v("cj2", "J_{gh}=G_h\\left(J_{x},J_{z}\\right)"),
);
E.set("e295", "J_{k}=J_{ck}\\left\\{J_{w}>0.02:1,0\\right\\}\\left\\{\\left(J_{x}-C_x\\right)F_x+\\left(J_{z}-C_z\\right)F_z>-60:1,0\\right\\}");
E.set("e299", "J_{g}=J_{gh}\\left[J_{I}\\right]");
E.before("e376", E.v("cy1", "Y_{ck}=\\left\\{Y_{h1}<Y_{f}\\left(Y_{x},Y_{z}\\right):1,0\\right\\}"));
E.set("e376", E.get("e376").latex.replace("Y_{kk}=\\left\\{Y_{h1}<Y_{f}\\left(Y_{x},Y_{z}\\right):1,0\\right\\}", "Y_{kk}=Y_{ck}"));
}

{
  const v = (name) => +E.list.find((e) => e.latex && e.latex.startsWith(name + "=")).latex.slice(name.length + 1);
  const [ah, ap, ar, yp] = [v("a_{h}"), v("a_{p}"), v("a_{r}"), v("Y_{p}")];
  const [sh, ch, sp, cp, sr, cr] = [Math.sin(ah), Math.cos(ah), Math.sin(ap), Math.cos(ap), Math.sin(ar), Math.cos(ar)];
  const az = Math.max(yp - 12, 0), rn = Math.max(6, 0.6 * Math.min(az, 900)), rx = 6000 + 3 * Math.min(az, 3000);
  const trig = { s_h: "\\sin\\left(a_h\\right)", c_h: "\\cos\\left(a_h\\right)", s_p: "\\sin\\left(a_p\\right)", c_p: "\\cos\\left(a_p\\right)", s_r: "\\sin\\left(a_r\\right)", c_r: "\\cos\\left(a_r\\right)" };
  const expand = (latex) => latex.replace(/[sc]_[hpr]/g, (m) => trig[m]);
  const live = [
    ["e38", sh], ["e39", ch], ["e40", sp], ["e41", cp], ["e42", sr], ["e43", cr],
    ["e47", sh * cp], ["e48", sp], ["e49", ch * cp],
    ["e50", ch * cr + sh * sp * sr], ["e51", -cp * sr], ["e52", -sh * cr + ch * sp * sr],
    ["e53", -sh * sp * cr + ch * sr], ["e54", cp * cr], ["e55", -ch * sp * cr - sh * sr],
    ["e64", 12], ["e113", Math.pow(rx / rn, 1 / 32)], ["e600", Math.acos(Math.max(-1, Math.min(1, 0.27869 * ap / 0.17)))],
  ];
  E.after("e33", E.v("rd1", "R_{d}(x)=\\frac{\\operatorname{round}\\left(10^{6}x\\right)}{10^{6}}"));
  const acts = [];
  for (const [id, init] of live) {
    const e = E.get(id);
    const k = e.latex.indexOf("=");
    acts.push(`${e.latex.slice(0, k)}\\to R_{d}\\left(${expand(e.latex.slice(k + 1))}\\right)`);
    e.latex = `${e.latex.slice(0, k)}=${+init.toFixed(6)}`;
  }
  const tk = s.expressions.ticker;
  for (const name of ["X_p", "Y_p", "Z_p", "a_h", "a_p", "a_r"]) {
    const head = `\\left\\{m_g=1:${name}\\to `;
    const i = tk.handlerLatex.indexOf(head);
    if (i < 0) throw new Error("no ticker action for " + name);
    let depth = 0, j = i;
    for (; j < tk.handlerLatex.length; j++) {
      if (tk.handlerLatex.startsWith("\\left", j)) depth++;
      if (tk.handlerLatex.startsWith("\\right", j)) { depth--; if (depth === 0) break; }
    }
    const rhs = tk.handlerLatex.slice(i + head.length, j);
    tk.handlerLatex = tk.handlerLatex.slice(0, i) + head + `R_{d}\\left(${rhs}\\right)` + tk.handlerLatex.slice(j);
  }
  tk.handlerLatex += "," + acts.join(",");
  E.set("e281", "J_{cx}=X_p+400s_h");
  E.set("e282", "J_{cz}=Z_p+400c_h");
  E.set("e601", "m_a=a_r-1.5707963");
}

const folds = ["S_{x1}", "S_{y1}", "S_{x2}", "S_{y2}", "S_{x3}", "S_{y3}", "S_{x4}", "S_{y4}", "R_q", "G_q", "B_q", "n_l", "k_{q}", "Y_v",
  "O_{u1}", "O_{v1}", "O_{u2}", "O_{v2}", "O_{u3}", "O_{v3}", "O_{u4}", "O_{v4}", "O_{u5}", "O_{v5}",
  "J_{a1}", "J_{b1}", "J_{a2}", "J_{b2}", "J_{a3}", "J_{b3}", "J_{a4}", "J_{b4}", "J_{a5}", "J_{b5}", "J_{c1}", "J_{d1}", "J_{c2}", "J_{d2}", "J_{c3}", "J_{d3}", "J_{c4}", "J_{d4}",
  "Y_{a1}", "Y_{b1}", "Y_{a2}", "Y_{b2}", "Y_{a3}", "Y_{b3}", "Y_{a4}", "Y_{b4}", "Y_{a5}", "Y_{b5}", "Y_{a6}", "Y_{b6}", "Y_{a7}", "Y_{b7}", "Y_{a8}", "Y_{b8}"];
for (const f of folds) inline(s, f);
console.log("autofold", autofold(s, ["m_g", "r_e", "t_d", "u_x", "u_y", "y_t", "v_d", "h_f"]));

const panels = s.expressions.list.filter((e) => e.type === "folder" && /Cockpit|Screens/.test(e.title || "")).map((e) => e.id);
console.log("merged", mergePolygonRuns(s, panels), "static and", mergePolygonRuns(s, panels, { clickable: true }), "button polygons");

const flying = "\\left\\{\\left|m_g-3\\right|=2:1,0\\right\\}";
E.set("e746", "\\left(u_x,u_y\\right)", { pointOpacity: "\\left\\{\\left|m_g-3\\right|=2:\\left\\{\\left|u_x-k_x\\right|+\\left|u_y-k_y\\right|>0.004:1,0\\right\\},0\\right\\}", pointStyle: "OPEN", pointSize: "26", color: "#ffd27a" });
E.set("e747", "\\left(-1.72,y_t\\right)", { pointOpacity: flying });
for (const [id, min, max] of [["e26", "1.41", "1.83"], ["e27", "-0.83", "-0.41"], ["e28", "-0.9", "-0.44"]]) s.expressions.list.find((e) => e.id === id).slider = { hardMin: true, hardMax: true, min, max, step: "0.001" };
const stickSpeed = 0.0003;
E.after("e27",
  E.v("sk12", "k_{x}=1.62"),
  E.v("sk13", "k_{y}=-0.62"),
  E.v("sk14", `K_{f}\\left(t\\right)=M_n\\left(1,\\frac{${stickSpeed}M_n\\left(t,50\\right)}{\\sqrt{\\left(u_x-k_x\\right)^{2}+\\left(u_y-k_y\\right)^{2}}}\\right)`),
);
E.set("e35", "s_x=C_l\\left(\\frac{k_x-1.62}{0.21},-1,1\\right)");
E.set("e36", "s_y=C_l\\left(\\frac{k_y+0.62}{0.21},-1,1\\right)");
const lagging = "\\left|u_x-k_x\\right|+\\left|u_y-k_y\\right|>0";
s.expressions.ticker.handlerLatex += ["x", "y"].map((a) => `,\\left\\{${lagging}:k_${a}\\to R_{d}\\left(k_${a}+\\left(u_${a}-k_${a}\\right)K_{f}\\left(\\operatorname{dt}\\right)\\right)\\right\\}`).join("");
for (const e of s.expressions.list) {
  const c = e.clickableInfo;
  if (c && c.latex.includes("m_g\\to1") && c.latex.includes("u_x\\to1.62,u_y\\to-0.62")) c.latex = c.latex.replace("u_x\\to1.62,u_y\\to-0.62", "u_x\\to1.62,u_y\\to-0.62,k_x\\to1.62,k_y\\to-0.62");
}

const knob = (id, latex, size) => ({ ...E.v(id, `${latex}\\left\\{\\left|m_g-3\\right|=2\\right\\}`), hidden: false, color: "#ff9f0a", pointSize: size });
E.before("e746",
  { ...E.v("sk9", "\\operatorname{polygon}\\left(\\left(1.62,-0.62\\right),\\left(k_x,k_y\\right)\\right)"), hidden: false, color: "#8b909c", lines: true, fill: false, lineWidth: "10", lineOpacity: flying },
  knob("sk10", "\\left(k_x,k_y\\right)", "24"),
  knob("sk11", "\\left(-1.72,y_t\\right)", "22"),
);
console.log("chase faces", addChase(s, E));
console.log("night", addNight(s, E));
save(out, s);
console.log("rects", rects.length, "exprs", s.expressions.list.length);

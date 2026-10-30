import { num, arr, button } from "./lib.mjs";

const splitTop = (latex) => {
  const out = [];
  let depth = 0, cur = "";
  for (let i = 0; i < latex.length; i++) {
    if (latex.startsWith("\\left", i)) depth++;
    if (latex.startsWith("\\right", i)) depth--;
    if (latex[i] === "," && depth === 0) { out.push(cur); cur = ""; } else cur += latex[i];
  }
  out.push(cur);
  return out;
};
const head = "\\operatorname{rgb}\\left(";
const tint = (colorLatex, f) => {
  if (!colorLatex.startsWith(head) || !colorLatex.endsWith("\\right)")) throw new Error("unexpected color " + colorLatex.slice(0, 40));
  const parts = splitTop(colorLatex.slice(head.length, -"\\right)".length));
  return `${head}${parts.map((p, i) => `${f[i]}\\left(${p}\\right)`).join(",")}\\right)`;
};
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgb = (c) => `${head}${c.join(",")}\\right)`;

const rng = (seed) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const parse = (E, name) => JSON.parse(E.list.find((e) => e.latex && e.latex.startsWith(name + "=")).latex.slice(name.length + 1).replace(/\\left\[/g, "[").replace(/\\right\]/g, "]"));

function windows(E) {
  const k = ["x1", "y1", "z1", "x2", "y2", "z2", "y3", "nx", "ny", "nz", "cx"];
  const d = Object.fromEntries(k.map((n) => [n, parse(E, `O_{${n}}`)]));
  const r = rng(20261029), seen = new Set(), out = [];
  const warm = [[255, 214, 130], [255, 232, 170], [250, 196, 110]];
  for (let i = 0; i < d.cx.length; i++) {
    if (d.cx[i] < 300 || Math.abs(d.ny[i]) > 1e-6) continue;
    const [x1, y0, z1, x2, z2, top] = [d.x1[i], d.y1[i], d.z1[i], d.x2[i], d.z2[i], d.y3[i]];
    const len = Math.hypot(x2 - x1, z2 - z1), h = top - y0;
    const key = [x1, z1, x2, z2, y0, top].join(",");
    if (h < 3.5 || len < 4 || seen.has(key)) continue;
    seen.add(key);
    const cols = Math.max(1, Math.floor((len - 2) / 4));
    for (let y = y0 + 1.7; y < top - 0.9; y += 3.4) for (let j = 0; j < cols; j++) {
      if (r() > 0.5) continue;
      const t = (j + 0.5) / cols;
      out.push({ x: x1 + (x2 - x1) * t + 0.15 * d.nx[i], y, z: z1 + (z2 - z1) * t + 0.15 * d.nz[i], nx: d.nx[i], nz: d.nz[i], c: warm[Math.floor(r() * warm.length)] });
    }
  }
  return out;
}

export function addNight(s, E) {
  const dark = ["n_{R}", "n_{G}", "n_{B}"];
  const plane = ["\\left(1-0.5n_t\\right)", "\\left(1-0.47n_t\\right)", "\\left(1-0.35n_t\\right)"];
  E.after("cv27",
    E.v("nt1", "n_{t}=0"),
    E.v("nt2", "n_{R}=1-0.8n_t"),
    E.v("nt3", "n_{G}=1-0.75n_t"),
    E.v("nt4", "n_{B}=1-0.6n_t"),
  );

  for (const id of ["e90", "e95", "e100", "cm31"]) { const e = E.get(id); e.colorLatex = tint(rgb(hex(e.color)), dark); }
  for (const id of ["sk6", "mt6", "e175", "rw6", "e354", "e424"]) { const e = E.get(id); e.colorLatex = tint(e.colorLatex, dark); }
  E.get("cm32").colorLatex = tint(E.get("cm32").colorLatex, plane);
  E.get("cm30").fillOpacity = `\\left(1-0.6n_t\\right)${E.get("cm30").fillOpacity}`;
  E.get("e107").fillOpacity = "0.18\\left(1-n_t\\right)";
  Object.assign(E.get("e108"), { fillOpacity: "0.35-0.25n_t", colorLatex: rgb(["255-60n_t", "243-28n_t", "192+40n_t"]) });
  E.get("e109").colorLatex = rgb(["255-28n_t", "251-22n_t", "232-4n_t"]);

  const copies = ["C", "F", "B", "Q"].flatMap((v) => ["x", "y", "z"].map((a) => [v, a]));
  const tk = s.expressions.ticker;
  const acts = splitTop(tk.handlerLatex);
  const rhs = (prefix) => {
    const a = acts.find((x) => x.startsWith(prefix));
    if (!a) throw new Error("no ticker action " + prefix);
    return prefix.startsWith("\\left\\{") ? a.slice(prefix.length, -"\\right\\}".length) : a.slice(prefix.length);
  };
  const next = (a) => `\\left\\{m_g=1:${rhs(`\\left\\{m_g=1:${a.toUpperCase()}_p\\to `)},${a.toUpperCase()}_p\\right\\}+\\left\\{v_m=1:${rhs(`\\left\\{v_m=1:C_{o${a}}\\to `)},C_{o${a}}\\right\\}`;
  tk.handlerLatex += "," + copies.map(([v, a]) => `\\left\\{n_t=1:${v}_{n${a}}\\to ${v === "C" ? next(a) : rhs(`${v}_${a}\\to `)}\\right\\}`).join(",");
  E.after("nt4",
    ...copies.map(([v, a]) => E.v(`nc${v}${a}`, `${v}_{n${a}}=0`)),
    E.v("np1", "P_{nd}(x,y,z)=\\left(x-C_{nx}\\right)F_{nx}+\\left(y-C_{ny}\\right)F_{ny}+\\left(z-C_{nz}\\right)F_{nz}"),
    E.v("np2", "P_{nu}(x,y,z)=F_l\\frac{\\left(x-C_{nx}\\right)B_{nx}+\\left(y-C_{ny}\\right)B_{ny}+\\left(z-C_{nz}\\right)B_{nz}}{P_{nd}(x,y,z)}"),
    E.v("np3", "P_{nv}(x,y,z)=h_0+F_l\\frac{\\left(x-C_{nx}\\right)Q_{nx}+\\left(y-C_{ny}\\right)Q_{ny}+\\left(z-C_{nz}\\right)Q_{nz}}{P_{nd}(x,y,z)}"),
  );

  const r = rng(7);
  const stars = Array.from({ length: 240 }, () => ({ w: Math.asin(0.04 + 0.96 * r()), b: 2 * Math.PI * r(), k: r() < 0.18 ? 1 : 0 }));
  const sel = (k) => `\\left(Z_{x}\\left[Z_{sk}\\left[Z_{vi}\\right]=${k}\\right],Z_{y}\\left[Z_{sk}\\left[Z_{vi}\\right]=${k}\\right]\\right)`;
  const star = (id, k, size, opacity) => ({ ...E.v(id, sel(k)), hidden: false, color: "#e4ebff", pointSize: size, pointOpacity: opacity });
  const zdot = (v) => ["x", "y", "z"].map((a) => `Z_{d${a}}\\left[Z_{vi}\\right]${v}_{n${a}}`).join("+");
  E.after("e100",
    E.v("ns1", `Z_{dx}=${arr(stars.map((q) => Math.cos(q.w) * Math.sin(q.b)))}`),
    E.v("ns2", `Z_{dy}=${arr(stars.map((q) => Math.sin(q.w)))}`),
    E.v("ns3", `Z_{dz}=${arr(stars.map((q) => Math.cos(q.w) * Math.cos(q.b)))}`),
    E.v("ns4", `Z_{sk}=${arr(stars.map((q) => q.k))}`),
    E.v("ns5", "Z_{d}=Z_{dx}F_{nx}+Z_{dy}F_{ny}+Z_{dz}F_{nz}"),
    E.v("ns6", `Z_{vi}=\\left[1...${stars.length}\\right]\\left[Z_{d}>0.2\\right]`),
    E.v("ns7", `Z_{x}=F_l\\frac{${zdot("B")}}{Z_{d}\\left[Z_{vi}\\right]}`),
    E.v("ns8", `Z_{y}=h_0+F_l\\frac{${zdot("Q")}}{Z_{d}\\left[Z_{vi}\\right]}`),
    star("ns9", 0, "3", "0.65"),
    star("ns10", 1, "5", "1"),
  );

  const lights = parse(E, "W_{lx}").length;
  E.set("e232", "W_{ls}=M_x\\left(0.0024+0.0016n_t,M_n\\left(1-0.988n_t,\\frac{0.45+0.35n_t}{\\left(P_d\\left(W_{lx}\\left[W_{lI}\\right],12.6,W_{lz}\\left[W_{lI}\\right]\\right)\\right)}\\right)\\right)");
  const oct = Array.from({ length: 8 }, (_, i) => [Math.cos((Math.PI * i) / 4), Math.sin((Math.PI * i) / 4)]);
  const ring = (u, v, sz, scale) => oct.map(([c, q]) => `\\left(${u}+${num(scale * c)}${sz},${v}+${num(scale * q)}${sz}\\right)`).join(",");
  const lit = (L) => `${L}\\left[W_{ni}\\right]`;
  E.before("e233",
    E.v("nl1", "W_{nd}=P_{nd}\\left(W_{lx},12.6,W_{lz}\\right)"),
    E.v("nl2", `W_{ni}=\\left[1...${lights}\\right]\\left[\\left\\{W_{nd}>3:\\left\\{W_{nd}<3400:1,0\\right\\},0\\right\\}>0.5\\right]`),
    E.v("nl3", `W_{nu}=P_{nu}\\left(${lit("W_{lx}")},12.6,${lit("W_{lz}")}\\right)`),
    E.v("nl4", `W_{nv}=P_{nv}\\left(${lit("W_{lx}")},12.6,${lit("W_{lz}")}\\right)`),
    E.v("nl5", `W_{ns}=M_x\\left(0.004,M_n\\left(0.012,\\frac{0.8}{${lit("W_{nd}")}}\\right)\\right)`),
    E.p("nl6", `\\operatorname{polygon}\\left(${ring("W_{nu}", "W_{nv}", "W_{ns}", 3.4)}\\right)`, "#fff3c8", { fillOpacity: "0.3", colorLatex: rgb(["W_{lr}", "W_{lg}", "W_{lb}"].map(lit)) }),
  );

  const win = windows(E);
  const W = (f) => arr(win.map(f));
  const gate = (L) => `${L}\\left[n_t+0${L}>0.5\\right]`;
  const vis = (L) => `${L}\\left[U_{vi}\\right]`;
  const obstacle = [[-90, 41.6, 335], [90, 27.9, 170], [90, 27.9, 250]];
  const hangars = [[68.8, 111.2, 12, 27.5, 138.8, 201.2], [68.8, 111.2, 12, 27.5, 218.8, 281.2]];
  const corners = ([x0, x1, y0, y1, z0, z1]) => [x0, x1].flatMap((x) => [y0, y1].flatMap((y) => [z0, z1].map((z) => [x, y, z])));
  const occ = (b) => `\\left\\{H_{${b}5}>0.5:\\left\\{U_{px}>H_{${b}1}:\\left\\{U_{px}<H_{${b}2}:\\left\\{U_{py}>H_{${b}3}:\\left\\{U_{py}<H_{${b}4}:\\left\\{U_{pd}>H_{${b}5}:1,0\\right\\},0\\right\\},0\\right\\},0\\right\\},0\\right\\},0\\right\\}`;
  const obs = (f) => `${f}\\left(A_{ox}\\left[A_{oi}\\right],A_{oy}\\left[A_{oi}\\right],A_{oz}\\left[A_{oi}\\right]\\right)`;
  E.after("e354",
    E.v("nw1", `U_{wx}=${W((q) => q.x)}`),
    E.v("nw2", `U_{wy}=${W((q) => q.y)}`),
    E.v("nw3", `U_{wz}=${W((q) => q.z)}`),
    E.v("nw4", `U_{wn}=${W((q) => q.nx)}`),
    E.v("nw5", `U_{wm}=${W((q) => q.nz)}`),
    E.v("nw6", `U_{wr}=${W((q) => q.c[0])}`),
    E.v("nw7", `U_{wg}=${W((q) => q.c[1])}`),
    E.v("nw8", `U_{wb}=${W((q) => q.c[2])}`),
    ...["x", "y", "z", "n", "m", "r", "g", "b"].map((c, i) => E.v(`nw${9 + i}`, `U_{g${c}}=${gate(`U_{w${c}}`)}`)),
    E.v("nw17", "U_{vi}=\\left[1...\\operatorname{length}\\left(U_{gx}\\right)\\right]\\left[\\left\\{U_{gn}\\left(C_{nx}-U_{gx}\\right)+U_{gm}\\left(C_{nz}-U_{gz}\\right)>0:\\left\\{P_{nd}\\left(U_{gx},U_{gy},U_{gz}\\right)>2:\\left\\{\\left(U_{gx}-C_{nx}\\right)^{2}+\\left(U_{gz}-C_{nz}\\right)^{2}<2890000:1,0\\right\\},0\\right\\},0\\right\\}>0.5\\right]"),
    E.v("nw18", `U_{px}=P_{nu}\\left(${vis("U_{gx}")},${vis("U_{gy}")},${vis("U_{gz}")}\\right)`),
    E.v("nw19", `U_{py}=P_{nv}\\left(${vis("U_{gx}")},${vis("U_{gy}")},${vis("U_{gz}")}\\right)`),
    E.v("nw20", `U_{pd}=P_{nd}\\left(${vis("U_{gx}")},${vis("U_{gy}")},${vis("U_{gz}")}\\right)`),
    E.v("nh1", `H_{cx}=${arr(hangars.flatMap((b) => corners(b).map((c) => c[0])))}`),
    E.v("nh2", `H_{cy}=${arr(hangars.flatMap((b) => corners(b).map((c) => c[1])))}`),
    E.v("nh3", `H_{cz}=${arr(hangars.flatMap((b) => corners(b).map((c) => c[2])))}`),
    E.v("nh7", "H_{u}=P_{nu}\\left(H_{cx},H_{cy},H_{cz}\\right)"),
    E.v("nh8", "H_{w}=P_{nv}\\left(H_{cx},H_{cy},H_{cz}\\right)"),
    E.v("nh9", "H_{d}=P_{nd}\\left(H_{cx},H_{cy},H_{cz}\\right)"),
    ...["a", "b"].flatMap((b, k) => {
      const part = (L) => `${L}\\left[\\left[${8 * k + 1}...${8 * k + 8}\\right]\\right]`;
      return [["1", "\\min", "H_{u}"], ["2", "\\max", "H_{u}"], ["3", "\\min", "H_{w}"], ["4", "\\max", "H_{w}"], ["5", "\\min", "H_{d}"]].map(([n, f, L]) => E.v(`nh${b}${n}`, `H_{${b}${n}}=R_{d}\\left(${f}\\left(${part(L)}\\right)\\right)`));
    }),
    E.v("nw21", `U_{oi}=\\left[1...\\operatorname{length}\\left(U_{px}\\right)\\right]\\left[${occ("a")}+${occ("b")}<0.5\\right]`),
    { ...E.v("nw22", "\\left(U_{px}\\left[U_{oi}\\right],U_{py}\\left[U_{oi}\\right]\\right)"), hidden: false, color: "#ffd98a", pointSize: "4", colorLatex: rgb(["U_{gr}", "U_{gg}", "U_{gb}"].map((c) => `${vis(c)}\\left[U_{oi}\\right]`)) },
    E.v("no1", `A_{ox}=${arr(obstacle.map((p) => p[0]))}`),
    E.v("no2", `A_{oy}=${arr(obstacle.map((p) => p[1]))}`),
    E.v("no3", `A_{oz}=${arr(obstacle.map((p) => p[2]))}`),
    E.v("no4", `A_{oi}=\\left[1...${obstacle.length}\\right]\\left[P_{nd}\\left(A_{ox},A_{oy},A_{oz}\\right)>1\\right]`),
    ...[["no5", "16", "0.3"], ["no6", "6", "1"]].map(([id, size, op]) => ({ ...E.v(id, `\\left(${obs("P_{nu}")},${obs("P_{nv}")}\\right)`), hidden: false, color: "#ff3b30", pointSize: size, pointOpacity: op })),
  );

  const nav = [[-5.62, 0.45, 0.35, [255, 50, 50]], [5.62, 0.45, 0.35, [60, 255, 110]], [0, 1, -4.92, [255, 255, 245]], [0, 2.32, -4.6, [255, 40, 40]]];
  const L = (k) => arr(nav.map((p) => p[k]));
  const camL = (k, p) => `N_{${k}1}L_{${p}x}+N_{${k}2}L_{${p}y}+N_{${k}3}L_{${p}z}`;
  const navPts = (p, depth) => `\\left(F_l\\frac{${camL(1, p)}+N_{tx}}{${depth}},h_0+F_l\\frac{${camL(2, p)}+N_{ty}}{${depth}}\\right)`;
  const navColor = rgb([0, 1, 2].map((c) => `${arr(nav.slice(0, 3).map((p) => p[3][c]))}\\left[L_{gi}\\right]`));
  const flash = "\\left\\{\\operatorname{mod}\\left(t_f,1.1\\right)<0.12:1,0\\right\\}";
  E.after("cm32", ...[
    E.v("nn1", `L_{bx}=${L(0)}`),
    E.v("nn2", `L_{by}=${L(1)}`),
    E.v("nn3", `L_{bz}=${L(2)}`),
    E.v("nn4", "L_{gi}=\\left[1,2,3\\right]\\left[\\left[1,2,3\\right]g_{cv}n_t>0.5\\right]"),
    E.v("nn5", "L_{hi}=\\left[4\\right]\\left[\\left[4\\right]g_{cv}n_t>0.5\\right]"),
    ...["x", "y", "z"].flatMap((a, i) => [E.v(`nn6${a}`, `L_{s${a}}=L_{b${a}}\\left[L_{gi}\\right]`), E.v(`nn7${a}`, `L_{e${a}}=L_{b${a}}\\left[L_{hi}\\right]`)]),
    E.v("nn6", `L_{cz}=${camL(3, "s")}+N_{tz}`),
    E.v("nn7", `L_{dz}=${camL(3, "e")}+N_{tz}`),
    ...[["nn8", "20", "0.35"], ["nn9", "8", "1"]].map(([id, size, op]) => ({ ...E.v(id, navPts("s", "L_{cz}")), hidden: false, color: "#ffffff", pointSize: size, pointOpacity: op, colorLatex: navColor })),
    ...[["nn10", "24", `0.4${flash}`], ["nn11", "9", flash]].map(([id, size, op]) => ({ ...E.v(id, navPts("e", "L_{dz}")), hidden: false, color: "#ff2828", pointSize: size, pointOpacity: op })),
  ].map((e) => ({ ...e, folderId: "fcv" })));

  button(E, {
    after: "cvb4", id: "ntb", x: 1.52, y: 0.828, half: 0.18,
    click: `n_t\\to1-n_t,${copies.map(([v, a]) => `${v}_{n${a}}\\to0`).join(",")}`,
    labels: [["n_t=0", "TIME: DAY"], ["n_t=1", "TIME: NIGHT"]],
  });

  const howto = E.list.find((e) => e.id === "t3");
  howto.text = howto.text.replace("behind the plane.", "behind the plane. TIME (top right) switches between day and night.");
  return { stars: stars.length, windows: win.length };
}

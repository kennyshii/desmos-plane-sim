import { num, arr, button } from "./lib.mjs";

const S = (a) => `\\sin\\left(${a}\\right)`;
const C = (a) => `\\cos\\left(${a}\\right)`;
const dot = (a, b) => a.map((x, i) => [x, b[i]]).filter(([x, y]) => x !== "0" && y !== "0").map(([x, y]) => `\\left(${x}\\right)\\left(${y}\\right)`).join("+");

function model() {
  const faces = [];
  const white = [236, 237, 241], red = [200, 36, 40], glass = [46, 66, 92], dark = [44, 45, 52];
  const face = (pts, col, hint) => faces.push({ pts, col, hint });
  const from = (p) => ({ from: p });
  const dir = (d) => ({ dir: d });

  const sec = (z, w, yb, yt) => [[-w, yb, z], [w, yb, z], [w, yt, z], [-w, yt, z]];
  const st = [sec(3.3, 0.22, 0.32, 0.72), sec(2.6, 0.5, 0.05, 0.95), sec(0.9, 0.6, -0.02, 1.05), sec(-1.2, 0.58, 0, 1.05), sec(-4.7, 0.12, 0.62, 0.98)];
  for (let k = 0; k < st.length - 1; k++) {
    const [a, b] = [st[k], st[k + 1]];
    const mid = [0, (a[0][1] + a[2][1] + b[0][1] + b[2][1]) / 4, (a[0][2] + b[0][2]) / 2];
    face([a[0], a[1], b[1], b[0]], white, from(mid));
    face([a[1], a[2], b[2], b[1]], white, from(mid));
    if (k !== 2) face([a[2], a[3], b[3], b[2]], white, from(mid));
    face([a[3], a[0], b[0], b[3]], white, from(mid));
  }
  face(st[4], white, dir([0, 0, -1]));
  const tip = [0, 0.52, 3.75];
  for (let k = 0; k < 4; k++) face([st[0][k], st[0][(k + 1) % 4], tip], red, from([0, 0.52, 3.3]));

  const cv = (s, y, z, w) => [s * w, y, z];
  const bf = (s) => cv(s, 1.05, 0.9, 0.6), tf = (s) => cv(s, 1.55, 0.2, 0.42), tb = (s) => cv(s, 1.55, -0.6, 0.42), bb = (s) => cv(s, 1.05, -1.2, 0.58);
  const cin = from([0, 1.1, -0.15]);
  face([bf(-1), bf(1), tf(1), tf(-1)], glass, cin);
  face([tf(-1), tf(1), tb(1), tb(-1)], white, cin);
  face([bf(-1), tf(-1), tb(-1), bb(-1)], glass, cin);
  face([bf(1), bb(1), tb(1), tf(1)], glass, cin);
  face([tb(-1), tb(1), bb(1), bb(-1)], glass, cin);

  for (const s of [-1, 1]) {
    const span = [[0.6, 0.18, 0.02, 1.3, -0.4], [4.6, 0.436, 0.324, 0.98, -0.24], [5.6, 0.5, 0.4, 0.9, -0.2]];
    const P = (i, top, le) => { const [x, yt, yb, zl, zt] = span[i]; return [s * x, top ? yt : yb, le ? zl : zt]; };
    for (const [i, col] of [[0, white], [1, red]]) {
      face([P(i, 1, 1), P(i, 1, 0), P(i + 1, 1, 0), P(i + 1, 1, 1)], col, dir([0, 1, 0]));
      face([P(i, 0, 1), P(i, 0, 0), P(i + 1, 0, 0), P(i + 1, 0, 1)], col, dir([0, -1, 0]));
      face([P(i, 1, 0), P(i, 0, 0), P(i + 1, 0, 0), P(i + 1, 1, 0)], col, dir([0, 0, -1]));
      face([P(i, 1, 1), P(i, 0, 1), P(i + 1, 0, 1), P(i + 1, 1, 1)], col, dir([0, 0, 1]));
    }
    face([P(2, 1, 1), P(2, 1, 0), P(2, 0, 0), P(2, 0, 1)], red, dir([s, 0, 0]));

    const hs = [[0.17, 0.84, 0.76, -3.75, -4.7], [2.1, 0.84, 0.78, -4.15, -4.65]];
    const Hp = (i, top, le) => { const [x, yt, yb, zl, zt] = hs[i]; return [s * x, top ? yt : yb, le ? zl : zt]; };
    face([Hp(0, 1, 1), Hp(0, 1, 0), Hp(1, 1, 0), Hp(1, 1, 1)], white, dir([0, 1, 0]));
    face([Hp(0, 0, 1), Hp(0, 0, 0), Hp(1, 0, 0), Hp(1, 0, 1)], white, dir([0, -1, 0]));
    face([Hp(0, 1, 0), Hp(0, 0, 0), Hp(1, 0, 0), Hp(1, 1, 0)], white, dir([0, 0, -1]));
    face([Hp(1, 1, 1), Hp(1, 1, 0), Hp(1, 0, 0), Hp(1, 0, 1)], red, dir([s, 0, 0]));

    face([[s * 0.05, 0.98, -3.4], [s * 0.05, 0.98, -4.7], [s * 0.05, 2.25, -4.85], [s * 0.05, 2.25, -4.35]], red, dir([s, 0, 0]));
  }
  face([[-0.05, 0.98, -4.7], [0.05, 0.98, -4.7], [0.05, 2.25, -4.85], [-0.05, 2.25, -4.85]], red, dir([0, 0, -1]));
  face([[-0.05, 2.25, -4.35], [0.05, 2.25, -4.35], [0.05, 2.25, -4.85], [-0.05, 2.25, -4.85]], red, dir([0, 1, 0]));

  const box = (x, z, w, y0, y1, l) => {
    const p = (sx, sy, sz) => [x + sx * w, sy ? y1 : y0, z + sz * l / 2];
    const c = from([x, (y0 + y1) / 2, z]);
    face([p(-1, 0, -1), p(1, 0, -1), p(1, 0, 1), p(-1, 0, 1)], dark, c);
    face([p(-1, 0, 1), p(1, 0, 1), p(1, 1, 1), p(-1, 1, 1)], dark, c);
    face([p(-1, 0, -1), p(1, 0, -1), p(1, 1, -1), p(-1, 1, -1)], dark, c);
    face([p(-1, 0, -1), p(-1, 0, 1), p(-1, 1, 1), p(-1, 1, -1)], dark, c);
    face([p(1, 0, -1), p(1, 0, 1), p(1, 1, 1), p(1, 1, -1)], dark, c);
  };
  box(-1.3, 0.25, 0.11, -0.6, 0.06, 0.6);
  box(1.3, 0.25, 0.11, -0.6, 0.06, 0.6);
  box(0, 2.6, 0.09, -0.6, 0.08, 0.5);

  const verts = [], index = new Map();
  const vid = (p) => { const k = p.map((v) => num(v)).join(","); if (!index.has(k)) { index.set(k, verts.length + 1); verts.push(p); } return index.get(k); };
  const sub = (a, b) => a.map((v, i) => v - b[i]);
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const out = faces.map(({ pts, col, hint }) => {
    const q = pts.length === 3 ? [...pts, pts[2]] : pts;
    const c = [0, 1, 2].map((i) => pts.reduce((t, p) => t + p[i], 0) / pts.length);
    let n = pts.length === 3 ? cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])) : cross(sub(q[2], q[0]), sub(q[3], q[1]));
    const len = Math.hypot(...n);
    n = n.map((v) => v / len);
    const want = hint.dir || sub(c, hint.from);
    if (n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0) n = n.map((v) => -v);
    return { idx: q.map(vid), c, n, k: n[0] * c[0] + n[1] * c[1] + n[2] * c[2], col };
  });
  return { verts, faces: out };
}

export function addChase(s, E) {
  const y0 = 2.7, d0 = 17, follow = 0.6, tilt = 0.1, rate = 2.5;
  const { verts, faces } = model();
  const n = faces.length;
  const tk = s.expressions.ticker;

  const val = (name) => +E.list.find((e) => e.latex && e.latex.startsWith(name + "=")).latex.slice(name.length + 1);
  const [ah, ap, ar] = [val("a_{h}"), val("a_{p}"), val("a_{r}")];
  E.after("sk13",
    E.v("cv1", "v_{m}=0"),
    E.v("cv2", `a_{hc}=${ah}`),
    E.v("cv3", `a_{pc}=${num(follow * ap - tilt)}`),
    E.v("cv4", `a_{ch}=${ah}`),
    E.v("cv5", `s_{pc}=${+Math.sin(ap).toFixed(6)}`),
    E.v("cv6", `c_{pc}=${+Math.cos(ap).toFixed(6)}`),
    E.v("cv7", `s_{rc}=${+Math.sin(ar).toFixed(6)}`),
    E.v("cv8", `c_{rc}=${+Math.cos(ar).toFixed(6)}`),
    E.v("cv9", "C_{ox}=0"),
    E.v("cv10", "C_{oy}=1.3"),
    E.v("cv11", "C_{oz}=0"),
    ...[1, 2, 3].flatMap((i) => [1, 2, 3].map((j) => E.v(`cvn${i}${j}`, `N_{${i}${j}}=${i === j ? 1 : 0}`))),
    E.v("cv12", "N_{tx}=0"),
    E.v("cv13", "N_{ty}=0"),
    E.v("cv14", "N_{tz}=0"),
    E.v("cv15", "w_{x}=0"),
    E.v("cv16", "w_{y}=0"),
    E.v("cv17", "w_{z}=0"),
    E.v("cv18", "l_{x}=0"),
    E.v("cv19", "l_{y}=1"),
    E.v("cv20", "l_{z}=0"),
    E.v("cv21", "j_{x}=0"),
    E.v("cv22", "j_{y}=1"),
    E.v("cv23", "j_{z}=0"),
    E.v("cv24", "h_{s}=0"),
    E.v("cv25", `K_{x}(h,p)=-\\sin\\left(h\\right)\\left(${y0}\\sin\\left(p\\right)+${d0}\\cos\\left(p\\right)\\right)`),
    E.v("cv26", `K_{z}(h,p)=-\\cos\\left(h\\right)\\left(${y0}\\sin\\left(p\\right)+${d0}\\cos\\left(p\\right)\\right)`),
    E.v("cv27", `K_{y}(h,p)=M_x\\left(${y0}\\cos\\left(p\\right)-${d0}\\sin\\left(p\\right),1.5-A_y\\right)`),
  );
  E.set("e44", "C_x=X_p+C_{ox}");
  E.set("e45", "C_y=Y_p+C_{oy}");
  E.set("e46", "C_z=Z_p+C_{oz}");

  const camH = "\\left\\{v_m=1:a_{hc},a_h\\right\\}", camP = "\\left\\{v_m=1:a_{pc},a_p\\right\\}", camR = "\\left\\{v_m=1:0,a_r\\right\\}";
  for (const name of ["F_x", "F_y", "F_z", "B_x", "B_y", "B_z", "Q_x", "Q_y", "Q_z"]) {
    const head = `${name}\\to R_{d}\\left(`;
    const i = tk.handlerLatex.indexOf(head);
    if (i < 0) throw new Error("no ticker action for " + name);
    let depth = 0, j = i + name.length;
    for (; j < tk.handlerLatex.length; j++) {
      if (tk.handlerLatex.startsWith("\\left", j)) depth++;
      if (tk.handlerLatex.startsWith("\\right", j)) { depth--; if (depth === 0) break; }
    }
    const body = tk.handlerLatex.slice(i, j).replaceAll("\\left(a_h\\right)", `\\left(${camH}\\right)`).replaceAll("\\left(a_p\\right)", `\\left(${camP}\\right)`).replaceAll("\\left(a_r\\right)", `\\left(${camR}\\right)`);
    tk.handlerLatex = tk.handlerLatex.slice(0, i) + body + tk.handlerLatex.slice(j);
  }

  const h = "a_{hc}", p = "a_{pc}", H = "a_h", P = "a_p", R = "a_r";
  const Bc = [C(h), "0", `-${S(h)}`];
  const Qc = [`-${S(h)}${S(p)}`, C(p), `-${C(h)}${S(p)}`];
  const Fc = [`${S(h)}${C(p)}`, S(p), `${C(h)}${C(p)}`];
  const Bp = [`${C(H)}${C(R)}+${S(H)}${S(P)}${S(R)}`, `-${C(P)}${S(R)}`, `-${S(H)}${C(R)}+${C(H)}${S(P)}${S(R)}`];
  const Qp = [`-${S(H)}${S(P)}${C(R)}+${C(H)}${S(R)}`, `${C(P)}${C(R)}`, `-${C(H)}${S(P)}${C(R)}-${S(H)}${S(R)}`];
  const Fp = [`${S(H)}${C(P)}`, S(P), `${C(H)}${C(P)}`];
  const off = ["x", "y", "z"].map((a) => `K_{${a}}\\left(a_{hc},a_{pc}\\right)`);
  const sun = ["-0.6179", "0.2756", "0.7364"];
  const gate = (name, rhs) => `\\left\\{v_m=1:${name}\\to R_{d}\\left(${rhs}\\right)\\right\\}`;
  const step = `\\frac{${rate}\\min\\left(\\operatorname{dt},50\\right)}{1000}`;
  const cams = [Bc, Qc, Fc], planes = [Bp, Qp, Fp];
  tk.handlerLatex += "," + [
    gate("a_{hc}", `a_{hc}+\\left(a_h-a_{hc}\\right)${step}`),
    gate("a_{pc}", `a_{pc}+\\left(${follow}a_p-${tilt}-a_{pc}\\right)${step}`),
    `a_{ch}\\to${camH}`,
    `s_{pc}\\to R_{d}\\left(${S(camP)}\\right)`,
    `c_{pc}\\to R_{d}\\left(${C(camP)}\\right)`,
    `s_{rc}\\to R_{d}\\left(${S(camR)}\\right)`,
    `c_{rc}\\to R_{d}\\left(${C(camR)}\\right)`,
    ...["x", "y", "z"].map((a, i) => gate(`C_{o${a}}`, off[i])),
    ...[0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => gate(`N_{${i + 1}${j + 1}}`, dot(cams[i], planes[j])))),
    ...["x", "y", "z"].map((a, i) => gate(`N_{t${a}}`, `-\\left(${dot(cams[i], off)}\\right)`)),
    ...["x", "y", "z"].map((a, i) => gate(`w_{${a}}`, dot(planes[i], off))),
    ...["x", "y", "z"].map((a, i) => gate(`l_{${a}}`, `3.6284\\left(${dot(planes[i], sun)}\\right)`)),
    ...["x", "y", "z"].map((a, i) => gate(`j_{${a}}`, planes[i][1])),
    gate("h_{s}", "A_y"),
  ].join(",");

  for (const id of ["e85", "e87"]) E.set(id, E.get(id).latex.replaceAll("c_p", "c_{pc}").replaceAll("s_p", "s_{pc}").replace("\\sin(w)", "R_{d}\\left(\\sin(w)\\right)"));
  for (const id of ["e88", "e89", "e95", "e316", "e317", "e403", "e404"]) E.set(id, E.get(id).latex.replaceAll("c_r", "c_{rc}").replaceAll("s_r", "s_{rc}"));
  for (const id of ["mt2", "mt6", "e118", "tg2"]) E.set(id, E.get(id).latex.replaceAll("a_h", "a_{ch}"));
  E.set("e119", "x_v=C_x+r_v\\sin\\left(b_v\\right)");
  E.set("e120", "z_v=C_z+r_v\\cos\\left(b_v\\right)");
  E.set("tg4", "x_{c}=C_x+r_{q}\\sin\\left(b_{qc}\\right)");
  E.set("tg5", "z_{c}=C_z+r_{q}\\cos\\left(b_{qc}\\right)");

  const frame = E.get("e426m");
  frame.latex = frame.latex.replace("\\operatorname{for}i=\\left[1...8\\right]", "\\operatorname{for}i=\\left[1+6v_m...8\\right]");
  frame.colorLatex = frame.colorLatex.replace(/\\left\[([0-9,]+)\\right\]/g, "\\left[$1\\right]\\left[\\left[1+6v_m...8\\right]\\right]");

  const col = (k) => arr(faces.map((f) => f.col[k]));
  const V = (k) => arr(verts.map((v) => v[k]));
  const F = (k) => arr(faces.map((f) => f.idx[k]));
  const ring = Array.from({ length: 20 }, (_, i) => (2 * Math.PI * i) / 20);
  const sil = [[0, 3.75], [0.22, 3.3], [0.5, 2.6], [0.6, 1.3], [5.6, 0.9], [5.6, -0.2], [0.6, -0.4], [0.58, -1.2], [0.17, -3.75], [2.1, -4.15], [2.1, -4.65], [0.12, -4.7]];
  const outline = [...sil, ...sil.slice(1).reverse().map(([x, z]) => [-x, z])].filter(([x], i, a) => !(x === 0 && i === a.length - 1));
  const flyingGate = "\\left\\{v_m=1:\\left\\{\\left|m_g-3\\right|=2:1,0\\right\\},0\\right\\}";
  const term = (X, k, j) => (/^[0-9.]+$/.test(X) ? `${X}N_{${k}${j}}` : `N_{${k}${j}}${X}`);
  const cam = (X, Y, Z, k) => `${term(X, k, 1)}+${term(Y, k, 2)}+${term(Z, k, 3)}`;
  const proj = (X, Y, Z, depth) => `\\left(F_l\\frac{${cam(X, Y, Z, 1)}+N_{tx}}{${depth}},h_0+F_l\\frac{${cam(X, Y, Z, 2)}+N_{ty}}{${depth}}\\right)`;
  const at = (L, k) => `${L}\\left[f_{${k}}\\left[f_{o}\\right]\\right]`;

  const folder = { type: "folder", id: "fcv", title: "Chase view", collapsed: true };
  const inF = (e) => ({ ...e, folderId: "fcv" });
  const i425 = E.list.findIndex((e) => e.id === "f425");
  E.list.splice(i425, 0, folder, ...[
    E.v("cm1", `V_{bx}=${V(0)}`),
    E.v("cm2", `V_{by}=${V(1)}`),
    E.v("cm3", `V_{bz}=${V(2)}`),
    ...["a", "b", "c", "d"].map((k, i) => E.v(`cmf${k}`, `f_{${k}}=${F(i)}`)),
    E.v("cm4", `n_{x}=${arr(faces.map((f) => f.n[0]))}`),
    E.v("cm5", `n_{y}=${arr(faces.map((f) => f.n[1]))}`),
    E.v("cm6", `n_{z}=${arr(faces.map((f) => f.n[2]))}`),
    E.v("cm7", `f_{k}=${arr(faces.map((f) => f.k))}`),
    E.v("cm8", `c_{fx}=${arr(faces.map((f) => f.c[0]))}`),
    E.v("cm9", `c_{fy}=${arr(faces.map((f) => f.c[1]))}`),
    E.v("cm10", `c_{fz}=${arr(faces.map((f) => f.c[2]))}`),
    E.v("cm11", `f_{R}=${col(0)}`),
    E.v("cm12", `f_{G}=${col(1)}`),
    E.v("cm13", `f_{B}=${col(2)}`),
    E.v("cm14", `R_{px}=${arr(ring.map((t) => 0.95 * Math.cos(t)))}`),
    E.v("cm15", `R_{py}=${arr(ring.map((t) => 0.52 + 0.95 * Math.sin(t)))}`),
    E.v("cm16", `S_{bx}=${arr(outline.map((q) => q[0]))}`),
    E.v("cm17", `S_{bz}=${arr(outline.map((q) => q[1]))}`),
    E.v("cm18", `V_{cz}=${cam("V_{bx}", "V_{by}", "V_{bz}", 3)}+N_{tz}`),
    E.v("cm19", `g_{cv}=${flyingGate}\\left\\{\\min\\left(V_{cz}\\right)>0.5:1,0\\right\\}`),
    E.v("cm19a", "R_{gx}=R_{px}\\left[g_{cv}+0R_{px}>0.5\\right]"),
    E.v("cm19b", "R_{gy}=R_{py}\\left[g_{cv}+0R_{py}>0.5\\right]"),
    E.v("cm19c", "S_{gx}=S_{bx}\\left[g_{cv}+0S_{bx}>0.5\\right]"),
    E.v("cm19d", "S_{gz}=S_{bz}\\left[g_{cv}+0S_{bz}>0.5\\right]"),
    E.v("cm20", `V_{sx}=F_l\\frac{${cam("V_{bx}", "V_{by}", "V_{bz}", 1)}+N_{tx}}{V_{cz}}`),
    E.v("cm21", `V_{sy}=h_0+F_l\\frac{${cam("V_{bx}", "V_{by}", "V_{bz}", 2)}+N_{ty}}{V_{cz}}`),
    E.v("cm22", `f_{v}=\\left[1...${n}\\right]\\left[g_{cv}\\left(n_{x}w_{x}+n_{y}w_{y}+n_{z}w_{z}-f_{k}\\right)>0\\right]`),
    E.v("cm23", "f_{o}=\\operatorname{sort}\\left(f_{v},-\\left(c_{fx}\\left[f_{v}\\right]-w_{x}\\right)^{2}-\\left(c_{fy}\\left[f_{v}\\right]-w_{y}\\right)^{2}-\\left(c_{fz}\\left[f_{v}\\right]-w_{z}\\right)^{2}\\right)"),
    E.v("cm24", "f_{s}=M_n\\left(1,0.58+0.1\\left(n_{x}j_{x}+n_{y}j_{y}+n_{z}j_{z}\\right)+0.124M_x\\left(0,n_{x}l_{x}+n_{y}l_{y}+n_{z}l_{z}\\right)\\right)"),
    E.v("cm25", "t_{sh}=S_{gx}j_{x}+0.15j_{y}+S_{gz}j_{z}+h_{s}"),
    E.v("cm26", "Q_{sx}=S_{gx}-l_{x}t_{sh}"),
    E.v("cm27", "Q_{sy}=0.15-l_{y}t_{sh}"),
    E.v("cm28", "Q_{sz}=S_{gz}-l_{z}t_{sh}"),
    E.v("cm29", `Q_{cz}=${cam("Q_{sx}", "Q_{sy}", "Q_{sz}", 3)}+N_{tz}`),
    E.p("cm30", `\\operatorname{polygon}${proj("Q_{sx}", "Q_{sy}", "Q_{sz}", "Q_{cz}")}`, "#1e2a1c", { fillOpacity: "0.3g_{cv}M_x\\left(0,1-\\frac{h_{s}}{120}\\right)\\left\\{\\min\\left(Q_{cz}\\right)>0.5:1,0\\right\\}" }),
    E.p("cm31", `\\operatorname{polygon}${proj("R_{gx}", "R_{gy}", "3.55", `\\left(${cam("R_{gx}", "R_{gy}", "3.55", 3)}+N_{tz}\\right)`)}`, "#d6d8de", { fillOpacity: "0.22" }),
    E.p("cm32", `\\operatorname{polygon}\\left(${["a", "b", "c", "d"].map((k) => `\\left(${at("V_{sx}", k)},${at("V_{sy}", k)}\\right)`).join(",")}\\right)`, "#eceef2", { lines: true, lineWidth: "1", lineOpacity: "1", colorLatex: "\\operatorname{rgb}\\left(f_{R}\\left[f_{o}\\right]f_{s}\\left[f_{o}\\right],f_{G}\\left[f_{o}\\right]f_{s}\\left[f_{o}\\right],f_{B}\\left[f_{o}\\right]f_{s}\\left[f_{o}\\right]\\right)" }),
  ].map(inF));

  button(E, {
    after: "e692", id: "cvb", x: -1.52, y: 0.828, half: 0.22,
    click: "v_m\\to1-v_m,a_{hc}\\to a_h,a_{pc}\\to0.6a_p-0.1,C_{ox}\\to0,C_{oy}\\to1.3,C_{oz}\\to0,N_{tz}\\to0",
    labels: [["v_m=0", "VIEW: COCKPIT"], ["v_m=1", "VIEW: 3RD PERSON"]],
  });

  for (const e of s.expressions.list) {
    const c = e.clickableInfo;
    if (c && c.latex.includes("m_g\\to1") && c.latex.includes("k_x\\to1.62")) c.latex = c.latex.replace("k_x\\to1.62", `a_{hc}\\to0,a_{pc}\\to-${tilt},k_x\\to1.62`);
  }

  const howto = E.list.find((e) => e.id === "t3");
  howto.text = howto.text.replace("CENTER STICK levels everything out.", "CENTER STICK levels everything out. VIEW (top left) switches between the cockpit and a 3rd-person camera behind the plane.");
  return n;
}

import fs from "node:fs";

export const load = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
export const save = (f, s) => fs.writeFileSync(f, JSON.stringify(s));

export function editor(state) {
  const list = state.expressions.list;
  const at = (id) => { const i = list.findIndex((e) => e.id === id); if (i < 0) throw new Error("missing " + id); return i; };
  const get = (id) => list[at(id)];
  const folderOf = (id) => get(id).folderId;
  const make = (id, latex, extra = {}, folderId) => ({ type: "expression", id, latex, color: "#000000", hidden: true, ...(folderId ? { folderId } : {}), ...extra });
  return {
    list,
    get,
    set(id, latex, extra = {}) { Object.assign(get(id), { latex }, extra); },
    drop(...ids) { for (const id of ids) list.splice(at(id), 1); },
    after(id, ...exprs) { const f = folderOf(id); list.splice(at(id) + 1, 0, ...exprs.map((e) => (e.folderId === undefined && f ? { ...e, folderId: f } : e))); },
    before(id, ...exprs) { const f = folderOf(id); list.splice(at(id), 0, ...exprs.map((e) => (e.folderId === undefined && f ? { ...e, folderId: f } : e))); },
    v: (id, latex, extra) => make(id, latex, extra),
    p: (id, latex, color, extra = {}) => make(id, latex, { hidden: false, color, fill: true, lines: false, fillOpacity: "1", ...extra }),
  };
}

export const num = (x) => String(+x.toFixed(4));
export const arr = (a) => `\\left[${a.map(num).join(",")}\\right]`;

export function inline(state, name) {
  const list = state.expressions.list;
  const esc = name.replace(/[\\{}()[\]^$.|?*+]/g, (c) => "\\" + c);
  const defRe = new RegExp("^" + esc + "=");
  const defs = list.filter((e) => e.latex && defRe.test(e.latex));
  if (defs.length !== 1) throw new Error(`inline ${name}: ${defs.length} definitions`);
  const def = defs[0];
  const body = `\\left(${def.latex.slice(name.length + 1)}\\right)`;
  const use = new RegExp(esc + (name.includes("_") ? "" : "(?![A-Za-z0-9_{])"), "g");
  let n = 0;
  for (const e of list) {
    if (e === def) continue;
    for (const k of ["latex", "colorLatex"]) if (e[k]) e[k] = e[k].replace(use, () => (n++, body));
  }
  if (state.expressions.ticker.handlerLatex.match(use)) throw new Error(`inline ${name}: used by ticker`);
  list.splice(list.indexOf(def), 1);
  return n;
}

const TOK = /\\[a-zA-Z]+(?:_\{[^}]*\}|_[A-Za-z0-9])?|[A-Za-z](?:_\{[^}]*\}|_[A-Za-z0-9])?/g;
const DEF = /^\s*(\\[a-zA-Z]+(?:_\{[^}]*\}|_[A-Za-z0-9])?|[A-Za-z](?:_\{[^}]*\}|_[A-Za-z0-9])?)\s*(\([^)]*\))?\s*=/;
const norm = (n) => n.replace(/[{}]/g, "");

export function analyze(state, quiet = []) {
  const list = state.expressions.list.filter((e) => e.type === "expression");
  const tk = state.expressions.ticker?.handlerLatex || "";
  const actions = [tk, ...state.expressions.list.map((e) => e.clickableInfo?.latex || "")].join(" ");
  const assigned = new Set([...actions.matchAll(/(\\?[A-Za-z]+(?:_\{[^}]*\}|_[A-Za-z0-9])?)\\to/g)].map((m) => norm(m[1])));
  const perTick = new Set([...tk.matchAll(/(\\?[A-Za-z]+(?:_\{[^}]*\}|_[A-Za-z0-9])?)\\to/g)].map((m) => norm(m[1])));
  for (const q of quiet) perTick.delete(q);
  perTick.add("dt");
  const info = list.map((e) => {
    const m = (e.latex || "").match(DEF);
    const params = new Set(m && m[2] ? m[2].slice(1, -1).split(",").map((p) => norm(p.trim())) : []);
    const name = m ? norm(m[1]) : null;
    const used = new Set([...((e.latex || "") + " " + (e.colorLatex || "")).matchAll(TOK)].map((t) => norm(t[0])).filter((t) => !params.has(t) && t !== name));
    return { e, name, isFn: !!(m && m[2]), used };
  });
  const dyn = new Set(perTick);
  let grew = true;
  while (grew) { grew = false; for (const x of info) if (x.name && !dyn.has(x.name) && [...x.used].some((u) => dyn.has(u))) { dyn.add(x.name); grew = true; } }
  return { info, dyn, assigned, actions };
}

export function autofold(state, quiet = [], skip = []) {
  let total = 0;
  for (let pass = 0; pass < 6; pass++) {
    const { info, dyn, assigned, actions } = analyze(state, quiet);
    const text = state.expressions.list.map((e) => (e.latex || "") + " " + (e.colorLatex || "") + " " + (e.label || "")).join(" ") + " " + actions;
    let n = 0;
    for (const x of info) {
      if (!x.name || !x.name.includes("_") || x.isFn || !x.e.hidden || x.e.slider || assigned.has(x.name) || !dyn.has(x.name) || skip.includes(x.name)) continue;
      if (x.e.latex.length > 260) continue;
      if (/^\\left\[/.test(x.e.latex.slice(x.e.latex.indexOf("=") + 1))) continue;
      const raw = x.e.latex.slice(0, x.e.latex.indexOf("=")).trim();
      const esc = raw.replace(/[\\{}()[\]^$.|?*+]/g, (c) => "\\" + c);
      const re = new RegExp(esc, "g");
      const uses = text.match(re)?.length || 0;
      if (uses !== 2) continue;
      if (actions.match(re)) continue;
      const target = state.expressions.list.find((e) => e !== x.e && ((e.latex || "") + (e.colorLatex || "")).match(re));
      if (!target || (target.latex || "").length + (target.colorLatex || "").length + x.e.latex.length > 2400) continue;
      try { inline(state, raw); n++; } catch { }
      break;
    }
    if (!n) break;
    total += n;
    pass--;
  }
  return total;
}

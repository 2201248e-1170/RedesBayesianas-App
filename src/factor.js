/*
 * factor.js — Factores y sus operaciones (Persona A: motor)
 *
 * Un factor es una tabla sobre un conjunto ordenado de variables:
 *   { vars: ["A","B"], states: {A:[..], B:[..]}, card: [nA, nB], table: [ ... ] }
 * La tabla está en orden "row-major": la ÚLTIMA variable cambia más rápido.
 *   índice = sum_i idx_i * stride_i, con stride_última = 1.
 *
 * Funciona en el navegador (global BN) y en Node (require).
 */
(function (root) {
  'use strict';
  const BN = (root.BN = root.BN || {});

  function layout(card) {
    const strides = new Array(card.length);
    let acc = 1;
    for (let i = card.length - 1; i >= 0; i--) {
      strides[i] = acc;
      acc *= card[i];
    }
    return { strides, size: acc };
  }

  /** Crea un factor lleno de `init` (0 por omisión). statesMap: id -> lista de estados. */
  function make(vars, statesMap, init) {
    const card = vars.map((v) => statesMap[v].length);
    const { size } = layout(card);
    const states = {};
    vars.forEach((v) => (states[v] = statesMap[v]));
    return {
      vars: vars.slice(),
      states,
      card,
      table: new Array(size).fill(init === undefined ? 0 : init),
    };
  }

  /** Índice lineal de una asignación {var: estado} (debe cubrir todas las vars del factor). */
  function indexOf(f, assignment) {
    const { strides } = layout(f.card);
    let k = 0;
    for (let i = 0; i < f.vars.length; i++) {
      const si = f.states[f.vars[i]].indexOf(assignment[f.vars[i]]);
      k += si * strides[i];
    }
    return k;
  }

  function get(f, assignment) {
    return f.table[indexOf(f, assignment)];
  }

  /** Factor inicial de un nodo: P(X | padres), sobre las variables [...padres, X]. */
  function fromNode(net, node) {
    const statesMap = {};
    net.nodes.forEach((n) => (statesMap[n.id] = n.states));
    const f = make(node.parents.concat([node.id]), statesMap);
    node.cpt.forEach((row) => {
      node.states.forEach((s) => {
        const a = Object.assign({}, row.given);
        a[node.id] = s;
        f.table[indexOf(f, a)] = row.probs[s];
      });
    });
    return f;
  }

  /** Producto de factores sobre la unión de sus variables. */
  function multiply(f, g) {
    const vars = f.vars.slice();
    g.vars.forEach((v) => {
      if (!vars.includes(v)) vars.push(v);
    });
    const statesMap = Object.assign({}, f.states, g.states);
    const out = make(vars, statesMap);
    const lf = layout(f.card);
    const lg = layout(g.card);
    const sf = vars.map((v) => {
      const i = f.vars.indexOf(v);
      return i < 0 ? 0 : lf.strides[i];
    });
    const sg = vars.map((v) => {
      const i = g.vars.indexOf(v);
      return i < 0 ? 0 : lg.strides[i];
    });
    const card = out.card;
    const idx = new Array(vars.length).fill(0);
    let a = 0;
    let b = 0;
    for (let k = 0; k < out.table.length; k++) {
      out.table[k] = f.table[a] * g.table[b];
      for (let d = vars.length - 1; d >= 0; d--) {
        idx[d]++;
        a += sf[d];
        b += sg[d];
        if (idx[d] < card[d]) break;
        a -= sf[d] * card[d];
        b -= sg[d] * card[d];
        idx[d] = 0;
      }
    }
    return out;
  }

  /** Suma sobre la variable v (marginalización). */
  function sumOut(f, v) {
    const i = f.vars.indexOf(v);
    if (i < 0) return f;
    const vars = f.vars.filter((x) => x !== v);
    const out = make(vars, f.states);
    const lo = layout(out.card);
    const so = f.vars.map((x) => (x === v ? 0 : lo.strides[out.vars.indexOf(x)]));
    const idx = new Array(f.vars.length).fill(0);
    let o = 0;
    for (let k = 0; k < f.table.length; k++) {
      out.table[o] += f.table[k];
      for (let d = f.vars.length - 1; d >= 0; d--) {
        idx[d]++;
        o += so[d];
        if (idx[d] < f.card[d]) break;
        o -= so[d] * f.card[d];
        idx[d] = 0;
      }
    }
    return out;
  }

  /** Fija la variable v = state y la elimina del factor (incorporar evidencia). */
  function restrict(f, v, state) {
    const i = f.vars.indexOf(v);
    if (i < 0) return f;
    const si = f.states[v].indexOf(state);
    if (si < 0) throw new Error('"' + state + '" no es un estado de "' + v + '".');
    const vars = f.vars.filter((x) => x !== v);
    const out = make(vars, f.states);
    const lo = layout(out.card);
    const so = f.vars.map((x) => (x === v ? 0 : lo.strides[out.vars.indexOf(x)]));
    const idx = new Array(f.vars.length).fill(0);
    let o = 0;
    for (let k = 0; k < f.table.length; k++) {
      if (idx[i] === si) out.table[o] = f.table[k];
      for (let d = f.vars.length - 1; d >= 0; d--) {
        idx[d]++;
        o += so[d];
        if (idx[d] < f.card[d]) break;
        o -= so[d] * f.card[d];
        idx[d] = 0;
      }
    }
    return out;
  }

  function total(f) {
    return f.table.reduce((a, b) => a + b, 0);
  }

  /** Divide entre la suma. Devuelve {factor, total}. */
  function normalize(f) {
    const t = total(f);
    const out = make(f.vars, f.states);
    out.table = f.table.map((x) => (t > 0 ? x / t : 0));
    return { factor: out, total: t };
  }

  BN.Factor = { make, indexOf, get, fromNode, multiply, sumOut, restrict, total, normalize };
  if (typeof module !== 'undefined' && module.exports) module.exports = BN;
})(typeof globalThis !== 'undefined' ? globalThis : this);

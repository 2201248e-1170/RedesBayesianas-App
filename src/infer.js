/*
 * infer.js — Eliminación de variables y cálculo de referencia (Persona A: motor)
 *
 *   BN.infer(net, queryVars, evidence, opts)      Variable Elimination
 *   BN.enumerate(net, queryVars, evidence)        Referencia independiente (enumeración completa)
 *   BN.compareResults(a, b)                       Diferencia máxima entre dos resultados
 *
 * Ambas devuelven:
 *   {
 *     query: [ids], evidence: {id: estado},
 *     pEvidence: P(evidencia),
 *     joint: [ { assignment: {q1: s, q2: s}, p } ],   // P(consultas | evidencia), todas las combinaciones
 *     marginals: { q1: {estado: p}, ... }              // marginal de cada variable consultada
 *   }
 * infer además devuelve: order (orden de eliminación), trace (pasos), prunedNodes (nodos irrelevantes).
 *
 * Requiere factor.js y validate.js cargados antes.
 */
(function (root) {
  'use strict';
  const BN = (root.BN = root.BN || {});
  const F = () => BN.Factor;
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  function checkQuery(net, queryVars, evidence) {
    const byId = {};
    net.nodes.forEach((n) => (byId[n.id] = n));
    if (!Array.isArray(queryVars) || queryVars.length === 0) {
      throw new Error('Seleccione al menos una variable de consulta.');
    }
    if (new Set(queryVars).size !== queryVars.length) throw new Error('Hay variables de consulta repetidas.');
    queryVars.forEach((q) => {
      if (!has(byId, q)) throw new Error('La variable de consulta "' + q + '" no existe en la red.');
      if (has(evidence, q)) throw new Error('"' + q + '" no puede ser consulta y evidencia a la vez.');
    });
    Object.keys(evidence).forEach((e) => {
      if (!has(byId, e)) throw new Error('La variable de evidencia "' + e + '" no existe en la red.');
      if (!byId[e].states.includes(evidence[e])) {
        throw new Error('"' + evidence[e] + '" no es un estado de "' + e + '".');
      }
    });
    return byId;
  }

  /** Todas las combinaciones de estados de las variables de consulta (la última cambia más rápido). */
  function allAssignments(byId, vars) {
    let acc = [{}];
    vars.forEach((v) => {
      const next = [];
      acc.forEach((a) => byId[v].states.forEach((s) => next.push(Object.assign({}, a, { [v]: s }))));
      acc = next;
    });
    return acc;
  }

  function buildOutput(byId, queryVars, evidence, probFn, pEvidence) {
    const joint = allAssignments(byId, queryVars).map((a) => ({ assignment: a, p: probFn(a) }));
    const marginals = {};
    queryVars.forEach((q) => {
      marginals[q] = {};
      byId[q].states.forEach((s) => (marginals[q][s] = 0));
    });
    joint.forEach((row) => queryVars.forEach((q) => (marginals[q][row.assignment[q]] += row.p)));
    return { query: queryVars.slice(), evidence: Object.assign({}, evidence), pEvidence, joint, marginals };
  }

  /** Ancestros (incluyéndose) de un conjunto de variables. */
  function ancestorsOf(byId, seeds) {
    const out = new Set();
    const stack = seeds.slice();
    while (stack.length) {
      const u = stack.pop();
      if (out.has(u)) continue;
      out.add(u);
      byId[u].parents.forEach((p) => stack.push(p));
    }
    return out;
  }

  function infer(net, queryVars, evidence, opts) {
    opts = opts || {};
    evidence = evidence || {};
    const v = BN.validateNetwork(net, { enforceSize: false });
    if (!v.ok) throw new Error('Red inválida: ' + v.errors.join(' | '));
    const byId = checkQuery(net, queryVars, evidence);
    const Fa = F();

    // Poda: los nodos que no son ancestros de consulta ni de evidencia no cambian el resultado
    // (su CPT suma 1), así que se omiten. Se puede desactivar con opts.prune = false.
    const relevant =
      opts.prune === false
        ? new Set(net.nodes.map((n) => n.id))
        : ancestorsOf(byId, queryVars.concat(Object.keys(evidence)));
    const prunedNodes = net.nodes.map((n) => n.id).filter((id) => !relevant.has(id));

    // 1) Un factor P(X | padres) por nodo relevante, 2) incorporar evidencia
    let factors = net.nodes
      .filter((n) => relevant.has(n.id))
      .map((n) => {
        let f = Fa.fromNode(net, n);
        Object.keys(evidence).forEach((e) => {
          f = Fa.restrict(f, e, evidence[e]);
        });
        return f;
      });

    // 3) Eliminar las variables ocultas (ni consulta ni evidencia)
    const hidden = net.nodes
      .map((n) => n.id)
      .filter((id) => relevant.has(id) && !queryVars.includes(id) && !has(evidence, id));
    const remaining = hidden.slice();
    const forced = (opts.order || []).filter((h) => remaining.includes(h));
    const order = [];
    const trace = [];

    function greedyPick() {
      // Heurística: eliminar primero la variable que produce el factor más pequeño.
      let best = null;
      let bestCost = Infinity;
      remaining.slice().sort().forEach((h) => {
        const vars = new Set();
        factors.filter((f) => f.vars.includes(h)).forEach((f) => f.vars.forEach((x) => vars.add(x)));
        vars.delete(h);
        let cost = 1;
        vars.forEach((x) => (cost *= byId[x].states.length));
        if (cost < bestCost) {
          bestCost = cost;
          best = h;
        }
      });
      return best;
    }

    while (remaining.length) {
      const h = forced.length ? forced.shift() : greedyPick();
      remaining.splice(remaining.indexOf(h), 1);
      order.push(h);
      const involved = factors.filter((f) => f.vars.includes(h));
      const rest = factors.filter((f) => !f.vars.includes(h));
      if (involved.length === 0) continue;
      const product = involved.reduce((a, b) => Fa.multiply(a, b));
      const summed = Fa.sumOut(product, h);
      factors = rest.concat([summed]);
      trace.push({
        eliminated: h,
        multiplied: involved.map((f) => f.vars.slice()),
        productVars: product.vars.slice(),
        resultVars: summed.vars.slice(),
      });
    }

    // 4) Multiplicar lo que queda y normalizar
    const finalF = factors.reduce((a, b) => Fa.multiply(a, b));
    const norm = Fa.normalize(finalF);
    if (!(norm.total > 0)) throw new Error('La evidencia tiene probabilidad 0: no se puede condicionar.');

    const out = buildOutput(byId, queryVars, evidence, (a) => Fa.get(norm.factor, a), norm.total);
    out.order = order;
    out.trace = trace;
    out.prunedNodes = prunedNodes;
    return out;
  }

  /**
   * Referencia independiente: suma la distribución conjunta completa (no usa factor.js).
   * Sirve para verificar a VE y como "cálculo de referencia" en la memoria.
   */
  function enumerate(net, queryVars, evidence) {
    evidence = evidence || {};
    const byId = checkQuery(net, queryVars, evidence);
    const nodes = net.nodes;
    const lookup = {};
    nodes.forEach((n) => {
      const m = new Map();
      n.cpt.forEach((r) => m.set(n.parents.map((p) => r.given[p]).join('\u0001'), r.probs));
      lookup[n.id] = m;
    });
    const sums = new Map();
    let pe = 0;
    const assign = {};
    const keyOf = (a) => queryVars.map((q) => a[q]).join('\u0001');

    function rec(i) {
      if (i === nodes.length) {
        let p = 1;
        for (const n of nodes) p *= lookup[n.id].get(n.parents.map((q) => assign[q]).join('\u0001'))[assign[n.id]];
        pe += p;
        const k = keyOf(assign);
        sums.set(k, (sums.get(k) || 0) + p);
        return;
      }
      const n = nodes[i];
      const options = has(evidence, n.id) ? [evidence[n.id]] : n.states;
      for (const s of options) {
        assign[n.id] = s;
        rec(i + 1);
      }
    }
    rec(0);
    if (!(pe > 0)) throw new Error('La evidencia tiene probabilidad 0: no se puede condicionar.');
    return buildOutput(byId, queryVars, evidence, (a) => (sums.get(keyOf(a)) || 0) / pe, pe);
  }

  /** Máxima diferencia absoluta entre dos resultados (misma consulta y evidencia). */
  function compareResults(a, b) {
    let d = Math.abs(a.pEvidence - b.pEvidence);
    a.joint.forEach((row, i) => {
      d = Math.max(d, Math.abs(row.p - b.joint[i].p));
    });
    return d;
  }

  BN.infer = infer;
  BN.enumerate = enumerate;
  BN.compareResults = compareResults;
  if (typeof module !== 'undefined' && module.exports) module.exports = BN;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/*
 * validate.js — Validación, carga y guardado de redes (Persona C: datos)
 *
 * Formato documentado en docs/FORMATO.md.
 *   validateNetwork(net)      -> { ok, errors: [string] }
 *   loadNetwork(textoJSON)    -> { net, errors }   (net = null si hay errores)
 *   serializeNetwork(net)     -> string JSON
 *   topologicalOrder(net)     -> [ids]  (padres antes que hijos)
 */
(function (root) {
  'use strict';
  const BN = (root.BN = root.BN || {});

  const MIN_NODES = 3;
  const MAX_NODES = 10;
  const TOL = 1e-6; // tolerancia para "las probabilidades suman 1"
  const SEP = '\u0001';

  const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

  function validateNetwork(net, opts) {
    opts = opts || {};
    const enforceSize = opts.enforceSize !== false;
    const errors = [];

    if (!isObj(net)) return { ok: false, errors: ['La red debe ser un objeto JSON con la lista "nodes".'] };
    if (!Array.isArray(net.nodes)) return { ok: false, errors: ['Falta la lista "nodes".'] };
    if (net.version !== undefined && net.version !== 1) {
      errors.push('Versión de formato no soportada: ' + net.version + ' (se esperaba 1).');
    }

    const n = net.nodes.length;
    if (enforceSize && (n < MIN_NODES || n > MAX_NODES)) {
      errors.push('La red debe tener entre ' + MIN_NODES + ' y ' + MAX_NODES + ' nodos (tiene ' + n + ').');
    }

    // 1) Identificadores únicos
    const byId = {};
    net.nodes.forEach((node, i) => {
      const label = 'Nodo #' + (i + 1);
      if (!isObj(node)) return errors.push(label + ': no es un objeto.');
      if (typeof node.id !== 'string' || node.id.trim() === '') {
        return errors.push(label + ': falta el identificador "id" (texto no vacío).');
      }
      if (Object.prototype.hasOwnProperty.call(byId, node.id)) {
        return errors.push('Identificador repetido: "' + node.id + '".');
      }
      byId[node.id] = node;
    });
    const ids = Object.keys(byId);

    // 2) Estados
    const statesOk = {};
    ids.forEach((id) => {
      const s = byId[id].states;
      statesOk[id] = false;
      if (!Array.isArray(s) || s.length < 2) {
        return errors.push('Nodo "' + id + '": "states" debe ser una lista de al menos 2 estados.');
      }
      if (s.some((x) => typeof x !== 'string' || x.trim() === '')) {
        return errors.push('Nodo "' + id + '": todos los estados deben ser texto no vacío.');
      }
      if (new Set(s).size !== s.length) {
        return errors.push('Nodo "' + id + '": hay estados repetidos.');
      }
      statesOk[id] = true;
    });

    // 3) Padres
    const parentsOk = {};
    ids.forEach((id) => {
      const p = byId[id].parents;
      parentsOk[id] = false;
      if (!Array.isArray(p)) return errors.push('Nodo "' + id + '": falta la lista "parents" (puede estar vacía).');
      let ok = true;
      p.forEach((x) => {
        if (x === id) {
          errors.push('Nodo "' + id + '": no puede ser su propio padre.');
          ok = false;
        } else if (!Object.prototype.hasOwnProperty.call(byId, x)) {
          errors.push('Nodo "' + id + '": el padre "' + x + '" no existe.');
          ok = false;
        }
      });
      if (new Set(p).size !== p.length) {
        errors.push('Nodo "' + id + '": hay padres repetidos.');
        ok = false;
      }
      parentsOk[id] = ok;
    });

    // 4) Aciclicidad (algoritmo de Kahn)
    const indeg = {};
    const kids = {};
    ids.forEach((id) => {
      indeg[id] = 0;
      kids[id] = [];
    });
    ids.forEach((id) => {
      if (!Array.isArray(byId[id].parents)) return;
      byId[id].parents.forEach((p) => {
        if (p !== id && kids[p]) {
          kids[p].push(id);
          indeg[id]++;
        }
      });
    });
    const queue = ids.filter((id) => indeg[id] === 0);
    let seen = 0;
    while (queue.length) {
      const u = queue.shift();
      seen++;
      kids[u].forEach((v) => {
        if (--indeg[v] === 0) queue.push(v);
      });
    }
    if (seen < ids.length) {
      const left = ids.filter((id) => indeg[id] > 0);
      errors.push(
        'La red contiene un ciclo (debe ser un grafo dirigido acíclico). Nodos implicados o que dependen de un ciclo: ' +
          left.join(', ') + '.'
      );
    }

    // 5) CPTs (solo si estados y padres del nodo y de sus padres son válidos)
    ids.forEach((id) => {
      const node = byId[id];
      if (!statesOk[id] || !parentsOk[id]) return;
      if (!node.parents.every((p) => statesOk[p])) return;
      checkCPT(node, byId, errors);
    });

    return { ok: errors.length === 0, errors };
  }

  function checkCPT(node, byId, errors) {
    const name = 'CPT de "' + node.id + '"';
    if (!Array.isArray(node.cpt)) return errors.push(name + ': falta la lista "cpt".');
    const expected = node.parents.reduce((a, p) => a * byId[p].states.length, 1);
    if (node.cpt.length !== expected) {
      errors.push(name + ': se esperaban ' + expected + ' filas (una por combinación de padres) y hay ' + node.cpt.length + '.');
    }
    const seen = new Set();
    node.cpt.forEach((row, i) => {
      const rn = name + ', fila ' + (i + 1);
      if (!isObj(row)) return errors.push(rn + ': no es un objeto.');
      const given = isObj(row.given) ? row.given : {};
      if (!isObj(row.given)) errors.push(rn + ': falta "given" (usar {} si no hay padres).');
      Object.keys(given).forEach((k) => {
        if (!node.parents.includes(k)) errors.push(rn + ': "given" incluye "' + k + '", que no es padre de "' + node.id + '".');
      });
      let keyOk = true;
      node.parents.forEach((p) => {
        if (!Object.prototype.hasOwnProperty.call(given, p)) {
          errors.push(rn + ': falta el estado del padre "' + p + '" en "given".');
          keyOk = false;
        } else if (!byId[p].states.includes(given[p])) {
          errors.push(rn + ': "' + given[p] + '" no es un estado de "' + p + '".');
          keyOk = false;
        }
      });
      if (keyOk) {
        const key = node.parents.map((p) => given[p]).join(SEP);
        if (seen.has(key)) errors.push(rn + ': combinación de padres repetida.');
        seen.add(key);
      }
      const probs = row.probs;
      if (!isObj(probs)) return errors.push(rn + ': falta "probs".');
      let sum = 0;
      let probsOk = true;
      node.states.forEach((s) => {
        const v = probs[s];
        if (typeof v !== 'number' || !isFinite(v) || v < 0 || v > 1) {
          errors.push(rn + ': P(' + node.id + '=' + s + ') debe ser un número entre 0 y 1.');
          probsOk = false;
        } else sum += v;
      });
      Object.keys(probs).forEach((s) => {
        if (!node.states.includes(s)) {
          errors.push(rn + ': "' + s + '" no es un estado de "' + node.id + '".');
          probsOk = false;
        }
      });
      if (probsOk && Math.abs(sum - 1) > TOL) {
        errors.push(rn + ': las probabilidades suman ' + +sum.toFixed(6) + ' y deben sumar 1.');
      }
    });
  }

  function loadNetwork(text) {
    let net;
    try {
      net = JSON.parse(text);
    } catch (e) {
      return { net: null, errors: ['JSON mal formado: ' + e.message] };
    }
    const v = validateNetwork(net);
    return v.ok ? { net, errors: [] } : { net: null, errors: v.errors };
  }

  function serializeNetwork(net) {
    const out = { version: 1, name: net.name || 'Red sin nombre', nodes: net.nodes };
    if (net.positions) out.positions = net.positions;
    return JSON.stringify(out, null, 2);
  }

  /** Orden topológico (padres antes que hijos). Asume una red válida. */
  function topologicalOrder(net) {
    const indeg = {};
    const kids = {};
    net.nodes.forEach((n) => {
      indeg[n.id] = n.parents.length;
      kids[n.id] = [];
    });
    net.nodes.forEach((n) => n.parents.forEach((p) => kids[p].push(n.id)));
    const queue = net.nodes.filter((n) => indeg[n.id] === 0).map((n) => n.id);
    const order = [];
    while (queue.length) {
      const u = queue.shift();
      order.push(u);
      kids[u].forEach((v) => {
        if (--indeg[v] === 0) queue.push(v);
      });
    }
    return order;
  }

  BN.MIN_NODES = MIN_NODES;
  BN.MAX_NODES = MAX_NODES;
  BN.validateNetwork = validateNetwork;
  BN.loadNetwork = loadNetwork;
  BN.serializeNetwork = serializeNetwork;
  BN.topologicalOrder = topologicalOrder;
  if (typeof module !== 'undefined' && module.exports) module.exports = BN;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/*
 * Pruebas — ejecutar con:  node tests/test.js   (o: npm test)
 * Sin dependencias.
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
require(path.join(root, 'src/factor.js'));
require(path.join(root, 'src/validate.js'));
require(path.join(root, 'src/infer.js'));
const BN = globalThis.BN;

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed++;
    console.log('  ✗ ' + name + '\n      ' + e.message);
  }
}
function assert(c, msg) {
  if (!c) throw new Error(msg || 'aserción falsa');
}
function near(a, b, tol, msg) {
  if (!(Math.abs(a - b) <= (tol === undefined ? 1e-9 : tol))) {
    throw new Error((msg || 'valores distintos') + ': ' + a + ' vs ' + b);
  }
}
function throws(fn, fragment) {
  try {
    fn();
  } catch (e) {
    if (fragment && !e.message.includes(fragment)) throw new Error('Mensaje inesperado: ' + e.message);
    return;
  }
  throw new Error('Se esperaba una excepción');
}
const clone = (x) => JSON.parse(JSON.stringify(x));
const load = (f) => JSON.parse(fs.readFileSync(path.join(root, 'ejemplos', f), 'utf8'));

// ---------------------------------------------------------------------------
console.log('\nEjemplo 1 (3 nodos): VE contra cálculo hecho a mano (ver docs/verificacion-ejemplo01.md)');
const ej1 = load('01-lluvia-3nodos.json');

test('el ejemplo 1 es una red válida', () => {
  const v = BN.validateNetwork(ej1);
  assert(v.ok, v.errors.join('; '));
});
test('P(Aspersor=encendido) = 0.322', () => {
  const r = BN.infer(ej1, ['Aspersor'], {});
  near(r.marginals.Aspersor.encendido, 0.2 * 0.01 + 0.8 * 0.4, 1e-12);
});
test('P(Pasto=mojado) = 0.44838 y P(seco) = 0.55162', () => {
  const r = BN.infer(ej1, ['Pasto'], {});
  near(r.marginals.Pasto.mojado, 0.44838, 1e-12);
  near(r.marginals.Pasto.seco, 0.55162, 1e-12);
});
test('P(Lluvia=sí | Pasto=mojado) = 0.16038 / 0.44838', () => {
  const r = BN.infer(ej1, ['Lluvia'], { Pasto: 'mojado' });
  near(r.marginals.Lluvia.sí, 0.16038 / 0.44838, 1e-12);
  near(r.pEvidence, 0.44838, 1e-12);
});
test('P(Aspersor=encendido | Pasto=mojado) = 0.28998 / 0.44838', () => {
  const r = BN.infer(ej1, ['Aspersor'], { Pasto: 'mojado' });
  near(r.marginals.Aspersor.encendido, 0.28998 / 0.44838, 1e-12);
});
test('consulta conjunta P(Lluvia, Aspersor | Pasto=mojado)', () => {
  const r = BN.infer(ej1, ['Lluvia', 'Aspersor'], { Pasto: 'mojado' });
  const p = (l, a) => r.joint.find((x) => x.assignment.Lluvia === l && x.assignment.Aspersor === a).p;
  near(p('sí', 'encendido'), 0.00198 / 0.44838, 1e-12);
  near(p('sí', 'apagado'), 0.1584 / 0.44838, 1e-12);
  near(p('no', 'encendido'), 0.288 / 0.44838, 1e-12);
  near(p('no', 'apagado'), 0, 1e-12);
});
test('poda: Pasto es irrelevante para P(Aspersor | Lluvia=no)', () => {
  const r = BN.infer(ej1, ['Aspersor'], { Lluvia: 'no' });
  assert(r.prunedNodes.includes('Pasto'), 'Pasto debería podarse');
  near(r.marginals.Aspersor.encendido, 0.4, 1e-12);
});
test('el orden de eliminación dado por el usuario se respeta y no cambia el resultado', () => {
  const a = BN.infer(ej1, ['Pasto'], {}, { order: ['Lluvia', 'Aspersor'] });
  const b = BN.infer(ej1, ['Pasto'], {}, { order: ['Aspersor', 'Lluvia'] });
  assert(a.order.join() === 'Lluvia,Aspersor' && b.order.join() === 'Aspersor,Lluvia', 'orden no respetado');
  near(a.marginals.Pasto.mojado, b.marginals.Pasto.mojado, 1e-12);
});
test('la traza describe cada paso de eliminación', () => {
  const r = BN.infer(ej1, ['Pasto'], {});
  assert(r.trace.length === 2 && r.trace[0].eliminated && r.trace[0].resultVars, 'traza incompleta');
});

// ---------------------------------------------------------------------------
console.log('\nErrores de consulta');
test('sin variable de consulta', () => throws(() => BN.infer(ej1, [], {}), 'al menos una'));
test('variable de consulta inexistente', () => throws(() => BN.infer(ej1, ['X'], {}), 'no existe'));
test('consulta y evidencia a la vez', () => throws(() => BN.infer(ej1, ['Lluvia'], { Lluvia: 'sí' }), 'a la vez'));
test('estado de evidencia inválido', () => throws(() => BN.infer(ej1, ['Lluvia'], { Pasto: 'azul' }), 'no es un estado'));
test('evidencia con probabilidad 0', () => {
  // Si P(Lluvia=sí) = 0, condicionar a Lluvia=sí es imposible (división entre 0).
  const n = clone(ej1);
  n.nodes[0].cpt[0].probs = { sí: 0, no: 1 };
  throws(() => BN.infer(n, ['Pasto'], { Lluvia: 'sí' }), 'probabilidad 0');
  throws(() => BN.enumerate(n, ['Pasto'], { Lluvia: 'sí' }), 'probabilidad 0');
});

// ---------------------------------------------------------------------------
console.log('\nValidación de redes');
test('menos de 3 nodos', () => {
  const n = clone(ej1);
  n.nodes = n.nodes.slice(0, 1);
  assert(!BN.validateNetwork(n).ok);
});
test('más de 10 nodos', () => {
  const n = clone(ej1);
  for (let i = 0; i < 8; i++) n.nodes.push({ id: 'X' + i, states: ['a', 'b'], parents: [], cpt: [{ given: {}, probs: { a: 0.5, b: 0.5 } }] });
  const v = BN.validateNetwork(n);
  assert(!v.ok && v.errors[0].includes('entre 3 y 10'), v.errors.join());
});
test('identificador repetido', () => {
  const n = clone(ej1);
  n.nodes[1].id = 'Lluvia';
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('repetido')));
});
test('padre inexistente', () => {
  const n = clone(ej1);
  n.nodes[1].parents = ['Nube'];
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('no existe')));
});
test('ciclo (Lluvia ← Pasto)', () => {
  const n = clone(ej1);
  n.nodes[0].parents = ['Pasto'];
  n.nodes[0].cpt = [
    { given: { Pasto: 'mojado' }, probs: { sí: 0.5, no: 0.5 } },
    { given: { Pasto: 'seco' }, probs: { sí: 0.5, no: 0.5 } },
  ];
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('ciclo')));
});
test('autociclo', () => {
  const n = clone(ej1);
  n.nodes[1].parents = ['Aspersor'];
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('propio padre')));
});
test('fila de CPT que no suma 1', () => {
  const n = clone(ej1);
  n.nodes[0].cpt[0].probs = { sí: 0.3, no: 0.8 };
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('suman 1.1')));
});
test('probabilidad fuera de [0,1]', () => {
  const n = clone(ej1);
  n.nodes[0].cpt[0].probs = { sí: 1.2, no: -0.2 };
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('entre 0 y 1')));
});
test('CPT incompleta (faltan filas)', () => {
  const n = clone(ej1);
  n.nodes[2].cpt.pop();
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('se esperaban 4 filas')));
});
test('estado desconocido en "given"', () => {
  const n = clone(ej1);
  n.nodes[1].cpt[0].given = { Lluvia: 'granizo' };
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('no es un estado')));
});
test('un nodo con 1 solo estado', () => {
  const n = clone(ej1);
  n.nodes[0].states = ['sí'];
  assert(BN.validateNetwork(n).errors.some((e) => e.includes('al menos 2')));
});
test('JSON mal formado', () => {
  const r = BN.loadNetwork('{ nodes: ');
  assert(r.net === null && r.errors[0].startsWith('JSON mal formado'));
});
test('guardar y volver a abrir no pierde información', () => {
  const text = BN.serializeNetwork(ej1);
  const r = BN.loadNetwork(text);
  assert(r.errors.length === 0, r.errors.join());
  assert(JSON.stringify(r.net.nodes) === JSON.stringify(ej1.nodes), 'los nodos cambiaron');
  assert(r.net.name === ej1.name);
});
test('orden topológico: padres antes que hijos', () => {
  const ord = BN.topologicalOrder(ej1);
  assert(ord.indexOf('Lluvia') < ord.indexOf('Aspersor') && ord.indexOf('Aspersor') < ord.indexOf('Pasto'));
});

// ---------------------------------------------------------------------------
console.log('\nVE vs. enumeración en redes aleatorias (3 a 10 nodos, 2-3 estados, consultas conjuntas)');

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomNet(rnd, n) {
  const nodes = [];
  for (let i = 0; i < n; i++) {
    const id = 'V' + i;
    const states = Array.from({ length: 2 + Math.floor(rnd() * 2) }, (_, k) => id + '_' + k);
    const cands = nodes.map((x) => x.id);
    const parents = cands.filter(() => rnd() < 0.4).slice(0, 3);
    nodes.push({ id, states, parents, cpt: [] });
  }
  const byId = {};
  nodes.forEach((x) => (byId[x.id] = x));
  nodes.forEach((x) => {
    let combos = [{}];
    x.parents.forEach((p) => {
      const nxt = [];
      combos.forEach((c) => byId[p].states.forEach((s) => nxt.push(Object.assign({}, c, { [p]: s }))));
      combos = nxt;
    });
    combos.forEach((given) => {
      let w = x.states.map(() => rnd());
      if (rnd() < 0.15) w[Math.floor(rnd() * w.length)] = 0; // ceros ocasionales
      if (w.every((v) => v === 0)) w[0] = 1;
      const sum = w.reduce((a, b) => a + b, 0);
      const probs = {};
      x.states.forEach((s, k) => (probs[s] = w[k] / sum));
      x.cpt.push({ given, probs });
    });
  });
  // desordenar la lista: el orden de "nodes" no debe importar
  for (let i = nodes.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [nodes[i], nodes[j]] = [nodes[j], nodes[i]];
  }
  return { version: 1, name: 'aleatoria', nodes };
}

test('300 redes aleatorias: infer == enumerate (diferencia < 1e-9)', () => {
  const rnd = mulberry32(2026);
  let compared = 0;
  let impossible = 0;
  let maxDiff = 0;
  for (let t = 0; t < 300; t++) {
    const n = 3 + Math.floor(rnd() * 8);
    const net = randomNet(rnd, n);
    const v = BN.validateNetwork(net);
    assert(v.ok, 'la red aleatoria debería ser válida: ' + v.errors.join('; '));
    const ids = net.nodes.map((x) => x.id).sort(() => rnd() - 0.5);
    const nq = 1 + Math.floor(rnd() * 2);
    const ne = Math.floor(rnd() * Math.min(4, ids.length - nq));
    const query = ids.slice(0, nq);
    const evidence = {};
    ids.slice(nq, nq + ne).forEach((id) => {
      const st = net.nodes.find((x) => x.id === id).states;
      evidence[id] = st[Math.floor(rnd() * st.length)];
    });
    let ref;
    try {
      ref = BN.enumerate(net, query, evidence);
    } catch (e) {
      // evidencia imposible: infer también debe rechazarla
      throws(() => BN.infer(net, query, evidence), 'probabilidad 0');
      impossible++;
      continue;
    }
    const ve = BN.infer(net, query, evidence);
    const d = BN.compareResults(ve, ref);
    maxDiff = Math.max(maxDiff, d);
    assert(d < 1e-9, 'diferencia ' + d + ' en la red #' + t);
    const s = ve.joint.reduce((a, r) => a + r.p, 0);
    near(s, 1, 1e-9, 'la distribución no suma 1');
    compared++;
  }
  console.log('      comparadas: ' + compared + ', evidencia imposible: ' + impossible + ', diferencia máxima: ' + maxDiff.toExponential(2));
  assert(compared > 200, 'muy pocas comparaciones válidas');
});

test('sin poda y con poda dan el mismo resultado', () => {
  const rnd = mulberry32(7);
  for (let t = 0; t < 50; t++) {
    const net = randomNet(rnd, 3 + Math.floor(rnd() * 8));
    const q = [net.nodes[0].id];
    const a = BN.infer(net, q, {});
    const b = BN.infer(net, q, {}, { prune: false });
    assert(BN.compareResults(a, b) < 1e-9);
  }
});

// ---------------------------------------------------------------------------
console.log('\nEjemplo 5 (10 nodos, fallas de una PC): VE contra cálculo hecho a mano (ver docs/verificacion-ejemplo05.md)');
const ej5 = load('05-pc-10nodos.json');

test('el ejemplo 5 es una red válida de 10 nodos', () => {
  const v = BN.validateNetwork(ej5);
  assert(v.ok, v.errors.join('; '));
  assert(ej5.nodes.length === 10, 'debe tener 10 nodos');
});
test('P(PCEnciende=Sí | RAM=Falla) = 0.6·0.46167 + 0.05·0.53833 ≈ 0.3039', () => {
  const r = BN.infer(ej5, ['PCEnciende'], { RAM: 'Falla' });
  near(r.marginals.PCEnciende['Sí'], 0.3039, 5e-5);
  near(r.pEvidence, 0.1078405, 1e-6);
});
test('ejemplo 5: consulta con dos evidencias coincide con la enumeración (≈ 0.6077)', () => {
  const q = ['PCEnciende'];
  const e = { PantallaAzul: 'Sí', SistemaOperativo: 'Arranca' };
  const r = BN.infer(ej5, q, e);
  assert(BN.compareResults(r, BN.enumerate(ej5, q, e)) < 1e-9, 'VE ≠ enumeración');
  near(r.marginals.PCEnciende['Sí'], 0.6077, 1e-4);
});

// ---------------------------------------------------------------------------
console.log('\nEjemplos del repositorio');
test('todos los ejemplos son válidos y VE coincide con la enumeración', () => {
  const dir = path.join(root, 'ejemplos');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  assert(files.length >= 1, 'no hay ejemplos');
  files.forEach((f) => {
    const net = load(f);
    const v = BN.validateNetwork(net);
    assert(v.ok, f + ': ' + v.errors.join('; '));
    const q = [net.nodes[net.nodes.length - 1].id];
    const e = { [net.nodes[0].id]: net.nodes[0].states[0] };
    if (q[0] === net.nodes[0].id) return;
    assert(BN.compareResults(BN.infer(net, q, e), BN.enumerate(net, q, e)) < 1e-9, f + ': VE ≠ enumeración');
  });
});
test('src/ejemplos.generated.js está al día (ejecuten: node tools/build-ejemplos.js)', () => {
  const gen = fs.readFileSync(path.join(root, 'src/ejemplos.generated.js'), 'utf8');
  assert(gen === require(path.join(root, 'tools/build-ejemplos.js')).build(), 'desactualizado');
});

console.log('\n' + passed + ' pruebas correctas, ' + failed + ' con error.');
process.exit(failed ? 1 : 0);

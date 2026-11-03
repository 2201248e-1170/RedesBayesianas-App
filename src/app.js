/*
 * app.js — Interfaz (Persona B: UI)
 *
 * Esqueleto funcional: cargar/guardar, grafo movible, panel de consulta/evidencia,
 * resultados con traza, reporte imprimible. Pendiente para B: formularios para crear
 * y editar nodos/estados/CPT (hoy se hace con el editor JSON).
 */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  let net = null;
  let cy = null;
  let lastResult = null; // { res, check }

  /* ---------- utilidades DOM (siempre textContent: nunca innerHTML con datos del usuario) ---------- */
  function el(tag, props) {
    const e = document.createElement(tag);
    if (props) {
      for (const k in props) {
        if (k === 'class') e.className = props[k];
        else if (k === 'text') e.textContent = props[k];
        else e.setAttribute(k, props[k]);
      }
    }
    for (let i = 2; i < arguments.length; i++) {
      [].concat(arguments[i]).forEach((c) => {
        if (c !== null && c !== undefined) e.append(c);
      });
    }
    return e;
  }
  const pr = (p) => p.toFixed(6);
  const evText = (ev) => {
    const k = Object.keys(ev);
    return k.length ? k.map((x) => x + '=' + ev[x]).join(', ') : 'sin evidencia';
  };

  /* ---------- mensajes ---------- */
  function showMessages(list, kind) {
    const box = $('mensajes');
    box.textContent = '';
    box.className = kind === 'ok' ? 'ok no-print' : 'no-print';
    if (!list.length) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    if (list.length === 1) box.textContent = list[0];
    else box.append(el('ul', null, list.map((m) => el('li', { text: m }))));
  }

  /* ---------- cargar / guardar ---------- */
  function setNetwork(n) {
    net = n;
    lastResult = null;
    $('nombre-red').textContent = '· ' + (net.name || 'sin nombre');
    renderGraph();
    renderQueryPanel();
    renderEditor();
    renderResult();
    renderReport();
    $('detalle').textContent = '';
  }

  function loadText(text) {
    const r = BN.loadNetwork(text);
    if (r.errors.length) {
      showMessages(['No se pudo cargar la red:'].concat(r.errors));
      return false;
    }
    setNetwork(r.net);
    showMessages(['Red "' + r.net.name + '" cargada (' + r.net.nodes.length + ' nodos).'], 'ok');
    return true;
  }

  function netForSave() {
    const copy = JSON.parse(JSON.stringify(net));
    if (cy) {
      copy.positions = {};
      cy.nodes().forEach((n) => {
        const p = n.position();
        copy.positions[n.id()] = { x: Math.round(p.x), y: Math.round(p.y) };
      });
    }
    return copy;
  }

  function save() {
    if (!net) return;
    const blob = new Blob([BN.serializeNetwork(netForSave())], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: (net.name || 'red').replace(/[^\p{L}\p{N}_-]+/gu, '_') + '.json' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- grafo ---------- */
  function renderGraph() {
    if (cy) {
      cy.destroy();
      cy = null;
    }
    const box = $('cy');
    box.textContent = '';
    if (typeof cytoscape === 'undefined') {
      box.textContent = 'No se pudo cargar la biblioteca de grafos (vendor/cytoscape.min.js o CDN).';
      return;
    }
    const hasPos = net.positions && net.nodes.every((n) => net.positions[n.id]);
    const els = [];
    net.nodes.forEach((n) => {
      const d = { data: { id: n.id, label: n.id } };
      if (hasPos) d.position = { x: net.positions[n.id].x, y: net.positions[n.id].y };
      els.push(d);
    });
    net.nodes.forEach((n) => n.parents.forEach((p) => els.push({ data: { id: p + '→' + n.id, source: p, target: n.id } })));
    cy = cytoscape({
      container: box,
      elements: els,
      layout: hasPos ? { name: 'preset' } : { name: 'breadthfirst', directed: true, spacingFactor: 1.3, padding: 20 },
      wheelSensitivity: 0.3,
      style: [
        { selector: 'node', style: { label: 'data(label)', 'text-valign': 'center', 'text-halign': 'center', shape: 'round-rectangle', 'background-color': '#e8eefc', 'border-width': 2, 'border-color': '#3b5bdb', color: '#1b1f3b', 'font-size': 14, padding: '10px', width: 'label', height: 'label' } },
        { selector: 'edge', style: { 'curve-style': 'bezier', 'target-arrow-shape': 'triangle', 'line-color': '#6b7280', 'target-arrow-color': '#6b7280', width: 2 } },
        { selector: 'node.consulta', style: { 'background-color': '#d3f9d8', 'border-color': '#2b8a3e' } },
        { selector: 'node.evidencia', style: { 'background-color': '#ffe8cc', 'border-color': '#d9480f' } },
        { selector: 'node:selected', style: { 'border-width': 4 } },
      ],
    });
    cy.on('tap', 'node', (ev) => showNodeDetail(ev.target.id()));
    refreshHighlights();
  }

  function cptTable(n) {
    const head = el('tr', null, n.parents.map((p) => el('th', { text: p })), n.states.map((s) => el('th', { text: 'P(' + n.id + '=' + s + ')' })));
    const rows = n.cpt.map((r) => el('tr', null, n.parents.map((p) => el('td', { text: r.given[p] })), n.states.map((s) => el('td', { class: 'num', text: String(r.probs[s]) }))));
    return el('div', { class: 'tabla-scroll' }, el('table', { class: 'tabla' }, el('thead', null, head), el('tbody', null, rows)));
  }

  function showNodeDetail(id) {
    const n = net.nodes.find((x) => x.id === id);
    const box = $('detalle');
    box.textContent = '';
    box.append(
      el('h3', { text: 'Nodo ' + n.id }),
      el('p', { text: 'Estados: ' + n.states.join(', ') }),
      el('p', { text: n.parents.length ? 'Padres: ' + n.parents.join(', ') : 'Sin padres (probabilidad a priori)' }),
      cptTable(n)
    );
  }

  /* ---------- panel de consulta ---------- */
  function readQuery() {
    const q = [];
    const e = {};
    $('variables').querySelectorAll('input[type=checkbox]').forEach((c) => c.checked && q.push(c.dataset.q));
    $('variables').querySelectorAll('select').forEach((s) => s.value && (e[s.dataset.e] = s.value));
    return { q, e };
  }

  function refreshHighlights() {
    if (!cy) return;
    const { q, e } = readQuery();
    cy.nodes().forEach((n) => {
      n.toggleClass('consulta', q.includes(n.id()));
      n.toggleClass('evidencia', has(e, n.id()));
    });
  }

  function renderQueryPanel() {
    const box = $('variables');
    box.textContent = '';
    net.nodes.forEach((n) => {
      const chk = el('input', { type: 'checkbox' });
      chk.dataset.q = n.id;
      const sel = el('select', null, el('option', { value: '', text: '(sin evidencia)' }), n.states.map((s) => el('option', { value: s, text: s })));
      sel.dataset.e = n.id;
      chk.addEventListener('change', () => {
        if (chk.checked) sel.value = '';
        refreshHighlights();
      });
      sel.addEventListener('change', () => {
        if (sel.value) chk.checked = false;
        refreshHighlights();
      });
      box.append(el('div', { class: 'fila-var' }, el('label', null, chk, ' consulta: ', el('strong', { text: n.id })), el('label', null, 'evidencia: ', sel)));
    });
  }

  /* ---------- ejecutar y mostrar resultados ---------- */
  function run() {
    if (!net) return;
    const { q, e } = readQuery();
    showMessages([]);
    try {
      const res = BN.infer(net, q, e);
      const check = $('comparar').checked ? BN.compareResults(res, BN.enumerate(net, q, e)) : null;
      lastResult = { res, check };
      renderResult();
      renderReport();
    } catch (err) {
      showMessages([err.message]);
    }
  }

  function marginalTable(variable, dist, withBars) {
    const rows = Object.keys(dist).map((s) =>
      el('tr', null, el('td', { text: s }), el('td', { class: 'num', text: pr(dist[s]) }), withBars ? el('td', null, el('div', { class: 'barra' }, el('span', { style: 'width:' + (dist[s] * 100).toFixed(1) + '%' }))) : null)
    );
    return el('table', { class: 'tabla' }, el('thead', null, el('tr', null, el('th', { text: variable }), el('th', { text: 'Probabilidad' }), withBars ? el('th') : null)), el('tbody', null, rows));
  }

  function jointTable(res) {
    const head = el('tr', null, res.query.map((q) => el('th', { text: q })), el('th', { text: 'Probabilidad' }));
    const rows = res.joint.map((r) => el('tr', null, res.query.map((q) => el('td', { text: r.assignment[q] })), el('td', { class: 'num', text: pr(r.p) })));
    return el('div', { class: 'tabla-scroll' }, el('table', { class: 'tabla' }, el('thead', null, head), el('tbody', null, rows)));
  }

  function resultBlocks(res, withBars) {
    const out = [
      el('h3', { text: 'P(' + res.query.join(', ') + (Object.keys(res.evidence).length ? ' | ' + evText(res.evidence) : '') + ')' }),
      el('ul', null,
        el('li', { text: 'Variables consultadas: ' + res.query.join(', ') }),
        el('li', { text: 'Evidencia utilizada: ' + evText(res.evidence) }),
        el('li', { text: 'P(evidencia) = ' + pr(res.pEvidence) })),
    ];
    res.query.forEach((q) => out.push(marginalTable(q, res.marginals[q], withBars)));
    if (res.query.length > 1) out.push(el('h4', { text: 'Distribución conjunta' }), jointTable(res));
    return out;
  }

  function renderResult() {
    const box = $('resultado');
    box.textContent = '';
    if (!lastResult) return;
    const { res, check } = lastResult;
    box.append(...resultBlocks(res, true));
    if (check !== null) {
      const ok = check < 1e-9;
      box.append(el('p', { class: 'verif' + (ok ? '' : ' mal'), text: (ok ? '✓ ' : '✗ ') + 'Verificación con enumeración completa: diferencia máxima ' + check.toExponential(2) }));
    }
    const steps = res.trace.map((t) =>
      el('li', { text: 'Eliminar ' + t.eliminated + ': multiplicar ' + t.multiplied.map((v) => 'f(' + v.join(',') + ')').join(' · ') + ' → f(' + t.productVars.join(',') + '), sumar sobre ' + t.eliminated + ' → f(' + t.resultVars.join(',') + ')' }));
    box.append(el('details', null, el('summary', { text: 'Orden y pasos de eliminación' }),
      el('p', { text: 'Orden: ' + (res.order.length ? res.order.join(' → ') : '(no había variables ocultas)') }),
      res.prunedNodes.length ? el('p', { text: 'Nodos irrelevantes omitidos: ' + res.prunedNodes.join(', ') }) : null,
      el('ol', null, steps)));
  }

  /* ---------- reporte imprimible ---------- */
  function renderReport() {
    const box = $('reporte');
    box.textContent = '';
    if (!net) return;
    box.append(
      el('h2', { text: 'Reporte: ' + (net.name || 'red') }),
      el('p', { class: 'nota', text: 'Generado el ' + new Date().toLocaleString('es-MX') + ' · ' + net.nodes.length + ' nodos' }),
      el('h3', { text: 'Estructura' }),
      el('ul', null, net.nodes.map((n) => el('li', { text: n.id + ' {' + n.states.join(', ') + '} ← ' + (n.parents.length ? n.parents.join(', ') : '(sin padres)') })))
    );
    box.append(el('h3', { text: 'Tablas de probabilidad condicional' }));
    net.nodes.forEach((n) => box.append(el('h4', { text: n.id }), cptTable(n)));
    if (lastResult) {
      box.append(el('h3', { text: 'Resultado de la consulta' }), ...resultBlocks(lastResult.res, false));
      box.append(el('p', { text: 'Orden de eliminación: ' + (lastResult.res.order.join(' → ') || '(ninguna variable oculta)') }));
    }
  }

  /* ---------- editor JSON temporal ---------- */
  function renderEditor() {
    $('editor').value = BN.serializeNetwork(netForSave());
  }

  /* ---------- arranque ---------- */
  function init() {
    const sel = $('ejemplos');
    const list = BN.EJEMPLOS || [];
    sel.append(el('option', { value: '', text: '— elegir —' }));
    list.forEach((e, i) => sel.append(el('option', { value: String(i), text: e.net.name || e.file })));
    sel.addEventListener('change', () => {
      if (sel.value !== '') setNetwork(JSON.parse(JSON.stringify(list[+sel.value].net)));
    });

    $('btn-abrir').addEventListener('click', () => $('archivo').click());
    $('archivo').addEventListener('change', async (ev) => {
      const f = ev.target.files[0];
      if (f) loadText(await f.text());
      ev.target.value = '';
    });
    $('btn-guardar').addEventListener('click', save);
    $('btn-imprimir').addEventListener('click', () => window.print());
    
// Función de Jesús: Exportar grafo a PNG
$('btn-exportar-img').addEventListener('click', () => {
    // cy.png() toma la foto directamente del lienzo con fondo blanco
    const pngUrl = cy.png({ bg: '#ffffff', full: true });
    
    // Crear un enlace invisible para forzar la descarga
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'grafo-red-bayesiana.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// Función de Jesús: Historial para Deshacer (Ctrl+Z) y Rehacer (Ctrl+Y)
    let historialRed = [];
    let pasoActual = -1;

    // Guarda una copia exacta de la red en el historial
    function guardarEstadoRed() {
        const estado = $('editor').value; // El editor JSON siempre tiene el estado actual
        if (pasoActual === -1 || historialRed[pasoActual] !== estado) {
            historialRed = historialRed.slice(0, pasoActual + 1);
            historialRed.push(estado);
            pasoActual++;
        }
    }

    // Guardar el estado inicial apenas cargue la página
    setTimeout(guardarEstadoRed, 500);

    // Si el usuario arrastra un nodo y lo suelta, guardamos el estado
    // Guardar estado al soltar el clic global (por si movieron un nodo)
document.addEventListener('mouseup', () => {
    setTimeout(guardarEstadoRed, 100);
});
    $('btn-aplicar').addEventListener('click', guardarEstadoRed);
 
    // Detectar atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl + Z (Deshacer)
        if (e.ctrlKey && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            if (pasoActual > 0) {
                pasoActual--;
                loadText(historialRed[pasoActual]);
            }
        }
        // Ctrl + Y (Rehacer)
        if (e.ctrlKey && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            if (pasoActual < historialRed.length - 1) {
                pasoActual++;
                loadText(historialRed[pasoActual]);
            }
        }
    });

    $('btn-ejecutar').addEventListener('click', run);
    $('btn-aplicar').addEventListener('click', () => loadText($('editor').value));
    $('btn-ayuda').addEventListener('click', () => {
      const d = $('ayuda');
      if (d.showModal) d.showModal();
      else d.setAttribute('open', '');
    });

    if (list.length) {
      sel.value = '0';
      setNetwork(JSON.parse(JSON.stringify(list[0].net)));
    } else {
      showMessages(['No hay ejemplos incluidos. Abra un archivo .json.']);
    }
  }
  init();


// ==========================================
// LÓGICA DE FORMULARIOS Y NODOS (Jesús)
// ==========================================

let nodoSeleccionadoId = null;

// 1. Detectar selección en el lienzo
document.addEventListener('mouseup', () => {
    setTimeout(() => {
        try {
            if (typeof cy !== 'undefined' && cy.$) {
                const sel = cy.$('node:selected');
                if (sel.length > 0) {
                    const id = sel[0].id();
                    const elEditor = document.getElementById('editor');
                    if (elEditor && elEditor.value) {
                        const data = JSON.parse(elEditor.value);
                        const nodo = data.nodes.find(n => n.id === id);
                        if (nodo) {
                            nodoSeleccionadoId = id;
                            document.getElementById('nodo-id').value = id;
                            document.getElementById('nodo-estados').value = nodo.states.join(', ');
                        }
                    }
                }
            }
        } catch(e) {}
    }, 150);
});

// Función para construir la tabla de probabilidades (CPT) exacta que pide el validador
function buildDefaultCPT(node, allNodes) {
    const parentNodes = node.parents.map(pId => allNodes.find(n => n.id === pId)).filter(Boolean);
    let combinations = [{}];
    
    // Producto cartesiano de los estados de todos los padres
    for (const p of parentNodes) {
        const newCombos = [];
        for (const c of combinations) {
            for (const state of p.states) {
                newCombos.push({ ...c, [p.id]: state });
            }
        }
        combinations = newCombos;
    }
    
    // Probabilidad equitativa por defecto
    const prob = Number((1 / node.states.length).toFixed(4));
    const probs = {};
    node.states.forEach(s => probs[s] = prob);
    
    return combinations.map(c => ({
        given: c,
        probs: { ...probs }
    }));
}

// 2. Radar global de clics
document.addEventListener('click', (e) => {
    
    // --- ACCIÓN: GUARDAR / RENOMBRAR NODO ---
    if (e.target && e.target.id === 'btn-guardar-nodo') {
        const inputId = document.getElementById('nodo-id');
        const inputEstados = document.getElementById('nodo-estados');
        const elEditor = document.getElementById('editor');
        
        if (!inputId || !inputEstados || !elEditor) return;
        
        const nuevoId = inputId.value.trim();
        const estados = inputEstados.value.split(',').map(s => s.trim()).filter(Boolean);
        
        if (!nuevoId || estados.length === 0) return alert("Faltan datos.");

        try {
            const data = JSON.parse(elEditor.value);
            let idViejo = nodoSeleccionadoId || 'Aspersor'; 
            let nodeIndex = data.nodes.findIndex(n => n.id === idViejo);
            
            if (nodeIndex !== -1 && idViejo !== nuevoId) {
                // Renombrar nodo
                data.nodes[nodeIndex].id = nuevoId;
                // Actualizar dependencias en hijos
                data.nodes.forEach(n => {
                    if (n.parents) n.parents = n.parents.map(p => p === idViejo ? nuevoId : p);
                });
                if (data.positions && data.positions[idViejo]) {
                    data.positions[nuevoId] = data.positions[idViejo];
                    delete data.positions[idViejo];
                }
            } else if (nodeIndex === -1) {
                // Crear nodo nuevo
                data.nodes.push({ id: nuevoId, type: "discrete", states: [], parents: [], cpt: [] });
                nodeIndex = data.nodes.length - 1;
            }

            let targetNode = data.nodes[nodeIndex];
            targetNode.states = estados;
            
            // Reconstruir CPT del nodo editado para que el validador lo acepte
            targetNode.cpt = buildDefaultCPT(targetNode, data.nodes);
            
            // Reconstruir CPT de TODOS los nodos hijos (Vital si le cambiaste el nombre o los estados al padre)
            data.nodes.forEach(n => {
                if (n.parents && n.parents.includes(nuevoId)) {
                    n.cpt = buildDefaultCPT(n, data.nodes);
                }
            });

            elEditor.value = JSON.stringify(data, null, 2);
            nodoSeleccionadoId = nuevoId;
            
            if (typeof loadText === 'function') loadText(elEditor.value);
            
        } catch (err) {
            alert("Error: " + err.message);
        }
    }
    
    // --- ACCIÓN: ELIMINAR NODO ---
    if (e.target && e.target.id === 'btn-eliminar-nodo') {
        const inputId = document.getElementById('nodo-id');
        const elEditor = document.getElementById('editor');
        if (!inputId || !elEditor) return;
        
        const id = inputId.value.trim();
        if (!id) return;
        
        try {
            const data = JSON.parse(elEditor.value);
            const nodeIndex = data.nodes.findIndex(n => n.id === id);
            
            if (nodeIndex !== -1) {
                data.nodes.splice(nodeIndex, 1);
                data.nodes.forEach(n => {
                    if (n.parents && n.parents.includes(id)) {
                        n.parents = n.parents.filter(p => p !== id);
                        n.cpt = buildDefaultCPT(n, data.nodes); // Reconstruir tabla sin ese padre
                    }
                });
                if (data.positions && data.positions[id]) delete data.positions[id];
                
                elEditor.value = JSON.stringify(data, null, 2);
                if (typeof loadText === 'function') loadText(elEditor.value);
                
                inputId.value = '';
                document.getElementById('nodo-estados').value = '';
                nodoSeleccionadoId = null;
            }
        } catch(err) {}
    }
});

})();
# Explicación del algoritmo implementado

> Esta sección forma parte de la memoria técnica del proyecto «Redes bayesianas: editor y consultas con eliminación de variables». Presupone los conceptos de la sección «Fundamentos de redes bayesianas y eliminación de variables» (factores, producto, suma fuera, restricción, normalización) y describe cómo se trasladan al código real. La validación de redes y el formato de archivo se documentan en la sección «Formato de datos»; la forma en que la interfaz invoca este motor se describe en «Módulo de interfaz y pruebas».

## 1. Ubicación y responsabilidades del código

El motor de inferencia vive en dos módulos que funcionan tanto en el navegador (objeto global `BN`) como en Node.js:

- **`src/factor.js`** — define la estructura de un factor y sus operaciones (creación desde una CPT, producto, suma fuera, restricción por evidencia y normalización).
- **`src/infer.js`** — implementa el algoritmo de eliminación de variables (`BN.infer`) y un cálculo de referencia independiente por enumeración completa (`BN.enumerate`), además de la comparación entre ambos (`BN.compareResults`).
- **`src/validate.js`** — validación de redes, carga y guardado (`BN.validateNetwork`, `BN.loadNetwork`, `BN.serializeNetwork`), usado al inicio de la inferencia para rechazar redes mal formadas.

## 2. Representación interna de un factor

Un factor es una tabla sobre un conjunto ordenado de variables:

```js
{ vars: ["A", "B"],           // alcance, ordenado
  states: { A: [..], B: [..] }, // estados de cada variable
  card: [nA, nB],             // cardinalidades
  table: [ ... ] }            // valores numéricos
```

La `table` se almacena en orden **row-major**: la **última** variable cambia más rápido. El índice lineal de una asignación es

```
índice = Σᵢ idxᵢ · strideᵢ,   con stride de la última variable = 1
```

y `strideᵢ = ∏_{j > i} cardⱼ`. Esta convención permite recorrer las tablas con aritmética de índices sin diccionarios, lo que mantiene las operaciones rápidas y deterministas.

## 3. Operaciones sobre factores (`src/factor.js`)

**`fromNode(net, node)`** construye el factor local `P(X | Pa(X))` a partir de la CPT. El alcance es `[ ...padres, X ]` y cada entrada se llena con `row.probs[s]` para la asignación `{ ...row.given, X: s }`:

```js
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
```

**`multiply(f, g)`** crea un factor sobre la unión de los alcances y asigna a cada celda el producto de las celdas correspondientes de `f` y `g`. Recorre la tabla de salida con un contador mixto (el mismo esquema de *strides*) y, para las variables ausentes en un factor, su *stride* se trata como 0 (la celda no cambia).

**`sumOut(f, v)`** marginaliza sobre `v`: suma, para cada combinación de las demás variables, todas las entradas que comparten esa combinación y difieren solo en el estado de `v`. El resultado pierde la variable `v` de su alcance.

**`restrict(f, v, state)`** incorpora evidencia: conserva únicamente las entradas cuyo índice para `v` coincide con el estado indicado y elimina `v` del alcance. Es la materialización de fijar `v = state`.

**`normalize(f)`** divide todas las entradas por su suma total `t = Σ table` y devuelve `{ factor, total }`. El valor `total` es justamente `P(evidencia)`, que la interfaz muestra y que las pruebas usan para verificar los cálculos a mano.

## 4. Algoritmo de eliminación de variables (`BN.infer`)

`BN.infer(net, queryVars, evidence, opts)` sigue el esquema general descrito en la sección de fundamentos, con dos añadidos prácticos: una **poda** previa de nodos irrelevantes y una **heurística greedy** para el orden de eliminación. Sus pasos son:

### 4.1. Validación de la red y de la consulta

Primero se llama a `BN.validateNetwork(net, { enforceSize: false })`: se comprueban identificadores, estados, padres, aciclicidad y coherencia de las CPT, pero sin imponer el límite de 3–10 nodos (ese límite ya se aplica al cargar/guardar; la inferencia puede operar sobre cualquier red estructuralmente válida). Después `checkQuery` valida la consulta:

- hay al menos una variable de consulta y no está repetida;
- toda variable de consulta y de evidencia existe en la red;
- ninguna variable es a la vez consulta y evidencia;
- cada estado de evidencia es un estado válido de su variable.

### 4.2. Poda de nodos irrelevantes

Se calcula el conjunto de **ancestros** (incluida la propia variable) de las variables de consulta y de evidencia:

```js
const relevant = ancestorsOf(byId, queryVars.concat(Object.keys(evidence)));
```

Los nodos que no son ancestros de `Q` ni de `E` se descartan. Esto es correcto porque la CPT de un nodo irrelevante suma 1 en cada fila, de modo que al marginalizarlo se anula su contribución y no altera el resultado final. La poda puede desactivarse con `opts.prune = false` (las pruebas verifican que ambos caminos coinciden).

### 4.3. Construcción de factores e incorporación de la evidencia

Para cada nodo relevante se crea su factor con `fromNode` y, a continuación, se aplica `restrict` por cada variable de evidencia:

```js
let factors = net.nodes
  .filter((n) => relevant.has(n.id))
  .map((n) => {
    let f = Fa.fromNode(net, n);
    Object.keys(evidence).forEach((e) => { f = Fa.restrict(f, e, evidence[e]); });
    return f;
  });
```

### 4.4. Orden de eliminación

Las variables ocultas son las relevantes que no son de consulta ni de evidencia. Si el usuario indica un orden (`opts.order`), las variables indicadas se respetan en ese orden. Las restantes se eligen con una **heurística greedy de mínimo tamaño**: en cada paso se elimina la variable que produce el factor resultante más pequeño (el producto de las cardinalidades de las variables de su alcance tras unir todos los factores que la contienen):

```js
function greedyPick() {
  let best = null, bestCost = Infinity;
  remaining.slice().sort().forEach((h) => {
    const vars = new Set();
    factors.filter((f) => f.vars.includes(h)).forEach((f) => f.vars.forEach((x) => vars.add(x)));
    vars.delete(h);
    let cost = 1;
    vars.forEach((x) => (cost *= byId[x].states.length));
    if (cost < bestCost) { bestCost = cost; best = h; }
  });
  return best;
}
```

Este criterio aproxima el orden óptimo sin garantizarlo: es una heurística de coste bajo, razonable para redes de hasta 10 nodos.

### 4.5. Bucle de eliminación

Para cada variable oculta, en el orden elegido, se multiplican todos los factores que la contienen y se suma fuera sobre ella; el factor resultante sustituye a los originales. Cada paso se registra en una **traza**:

```js
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
  trace.push({ eliminated: h, multiplied: involved.map((f) => f.vars.slice()),
               productVars: product.vars.slice(), resultVars: summed.vars.slice() });
}
```

### 4.6. Normalización y salida

Al terminar, se multiplican los factores restantes (que solo involucran variables de consulta) y se normaliza:

```js
const finalF = factors.reduce((a, b) => Fa.multiply(a, b));
const norm = Fa.normalize(finalF);
if (!(norm.total > 0)) throw new Error('La evidencia tiene probabilidad 0: no se puede condicionar.');
```

Si `total` es 0, la evidencia es imposible y la consulta no está definida; la aplicación lo informa como error en lugar de dividir entre cero.

El resultado devuelto contiene:

- `query` y `evidence` (la consulta y la evidencia utilizadas);
- `pEvidence` — la probabilidad de la evidencia, `P(E = e)`;
- `joint` — la distribución conjunta `P(Q | e)` para **todas** las combinaciones de estados de las variables de consulta;
- `marginals` — la marginal de cada variable consultada (suma de `joint` sobre las demás);
- `order`, `trace` y `prunedNodes` — el orden de eliminación, los pasos intermedios y los nodos podados, que la interfaz muestra para hacer el proceso inspeccionable.

## 5. Cálculo de referencia: enumeración completa (`BN.enumerate`)

Para poder verificar el resultado sin recurrir al propio VE, se implementó un segundo método **independiente**: `BN.enumerate(net, queryVars, evidence)` recorre recursivamente **todas** las combinaciones de estados de la red (restringiendo las variables de evidencia a su valor observado), acumula la probabilidad conjunta `∏ P(Xᵢ | Pa(Xᵢ))` de cada combinación y luego normaliza. Es el «cálculo de fuerza bruta» de la fórmula de factorización, sin usar `factor.js`. Al ser conceptualmente distinto de VE, su coincidencia numérica es una evidencia fuerte de corrección.

`BN.compareResults(a, b)` devuelve la máxima diferencia absoluta entre dos resultados (en `pEvidence` y en cada celda de `joint`). La interfaz muestra esta diferencia cuando el usuario activa la casilla «comparar con enumeración», y la suite de pruebas la usa como criterio de aceptación.

## 6. Complejidad y consideraciones numéricas

El coste de eliminar una variable es proporcional al tamaño del factor producto de los factores que la mencionan; en total, VE es `O(∑ tamaño de los factores intermedios)`. El tamaño de un factor es el producto de las cardinalidades de su alcance, por lo que el coste depende del orden de eliminación y, en el peor caso, crece de forma exponencial con la **anchura de árbol** de la red. La enumeración completa, en cambio, es siempre `O(∏ card(Xᵢ))`, es decir, exponencial en el número total de variables; VE solo se degrada hasta ese extremo cuando la red es muy densa.

La implementación usa aritmética de punto flotante de doble precisión. La normalización garantiza que la distribución resultante sume 1, y las diferencias observadas frente a la enumeración son del orden de `10⁻¹⁵` (véase la sección «Pruebas, resultados, limitaciones y posibles mejoras»), consistentes con el error de redondeo acumulado, no con un error del método.

## 7. Integración con la interfaz

La función `run()` de `src/app.js` lee las variables marcadas como consulta y la evidencia seleccionada en los selectores, ejecuta `BN.infer(net, q, e)` y, si está activada la comparación, `BN.compareResults(res, BN.enumerate(net, q, e))`. `renderResult()` muestra las marginales (con barras), la conjunta cuando hay varias variables de consulta, `P(evidencia)`, la verificación frente a la enumeración y el detalle desplegable «Orden y pasos de eliminación» construido a partir de `res.trace`. `renderReport()` compone el reporte imprimible con la estructura de la red, las CPT y el resultado. Los detalles de construcción de esa interfaz se describen en la sección «Módulo de interfaz y pruebas».

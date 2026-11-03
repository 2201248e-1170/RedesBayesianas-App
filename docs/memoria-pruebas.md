# Pruebas, resultados, limitaciones y posibles mejoras

> Esta sección forma parte de la memoria técnica del proyecto «Redes bayesianas: editor y consultas con eliminación de variables». Documenta la estrategia de validación del motor descrito en la sección «Explicación del algoritmo implementado» y de la aplicación en su conjunto, los resultados obtenidos, las limitaciones conocidas y las mejoras posibles. La teoría del método se expone en la sección «Fundamentos de redes bayesianas y eliminación de variables».

## 1. Estrategia de validación

La corrección matemática del método de eliminación de variables es el requisito central del proyecto. Para verificarla se combinaron tres niveles de evidencia independientes entre sí:

1. **Verificación a mano de los cinco ejemplos** (3, 4, 5, 6 y 10 nodos): cada red tiene una consulta resuelta con lápiz y papel, documentada en `docs/verificacion-ejemplo01.md` … `docs/verificacion-ejemplo05.md`, y contrastada contra la salida de la aplicación.
2. **Comparación automática contra enumeración completa**: la suite ejecuta `BN.infer` y `BN.enumerate` (método independiente descrito en la sección del algoritmo) sobre redes aleatorias y exige que la diferencia máxima sea menor a `10⁻⁹`.
3. **Prueba de interfaz en navegador real** (`tests/ui-smoke.py`), que automatiza un navegador Chromium para comprobar el flujo completo: cargar, dibujar el grafo, ejecutar una consulta y ver su verificación.

Las pruebas del motor son autónomas (sin dependencias) y se ejecutan con:

```bash
npm test          # equivalente a: node tests/test.js
```

La prueba de interfaz es opcional y requiere Playwright:

```bash
pip install playwright && playwright install chromium
python3 tests/ui-smoke.py
```

## 2. Pruebas del motor (`tests/test.js`)

La suite está organizada en bloques que cubren: el ejemplo 1 (9 pruebas), errores de consulta (5), validación de redes (14), comparación en redes aleatorias (2), ejemplos 2 a 5 (15) y ejemplos del repositorio (2). En total **47 pruebas, todas correctas (0 con error)**.

### 2.1. Ejemplo 1 (3 nodos, lluvia–aspersor–pasto)

Además de validar la red, se verifican marginales (`P(Aspersor = encendido) = 0.322`, `P(Pasto = mojado) = 0.44838`), condicionales (`P(Lluvia = sí | Pasto = mojado) = 0.16038 / 0.44838`), una consulta conjunta, la **poda** (`Pasto` es irrelevante para `P(Aspersor | Lluvia = no)` y debe aparecer en `prunedNodes`), el respeto del orden de eliminación indicado por el usuario y la presencia de una **traza** por cada paso.

### 2.2. Errores de consulta

Se comprueba que la aplicación rechace con mensajes claros: consulta vacía, variable inexistente, variable a la vez consulta y evidencia, estado de evidencia inválido y evidencia con probabilidad 0 (caso en el que condicionar es una división entre cero).

### 2.3. Validación de redes

Catorce pruebas ejercitan el validador (`BN.validateNetwork`) con casos que deben rechazarse: menos de 3 nodos, más de 10, identificador repetido, padre inexistente, ciclo (`Lluvia ← Pasto`), autociclo, fila de CPT que suma 1.1, probabilidad fuera de `[0, 1]`, CPT con filas faltantes, estado desconocido en `given`, nodo con un solo estado y JSON mal formado. También se comprueban dos casos positivos: **guardar y volver a abrir no pierde información** (los nodos re-serializados son idénticos) y el **orden topológico** (padres antes que hijos).

### 2.4. Comparación VE contra enumeración en redes aleatorias

Se generan **300 redes aleatorias** con una semilla fija (generador `mulberry32`, semilla 2026): de 3 a 10 nodos, 2–3 estados por variable, 1–2 variables de consulta y 0–3 de evidencia, con ceros ocasionales en las CPT. Para cada una se compara `BN.infer` contra `BN.enumerate`:

- **289 comparaciones válidas** (en 11 casos la evidencia tenía probabilidad 0 y ambos métodos la rechazaron correctamente);
- **diferencia máxima: 4.00 × 10⁻¹⁵** (el umbral de aceptación es `10⁻⁹`);
- se verifica además que toda distribución resultante suma 1, y que ejecutar con y sin poda produce el mismo resultado.

### 2.5. Ejemplos 2 a 5 y ejemplos del repositorio

Los bloques finales reproducen en forma de aserciones las verificaciones a mano de los ejemplos 2 a 5 (valores intermedios incluidos) y una prueba que valida y consulta **todos** los `.json` de `ejemplos/`, además de comprobar que `src/ejemplos.generated.js` esté actualizado.

## 3. Resultados de los cinco ejemplos

Cada red tiene un número distinto de nodos, una consulta resuelta con eliminación de variables, su `P(evidencia)` y su verificación a mano. Los valores mostrados por la aplicación coinciden con los cálculos manuales.

| # | Nodos | Red | Consulta | Resultado | P(evidencia) | Verificación |
|---|---|---|---|---|---|---|
| 1 | 3 | Lluvia, aspersor y pasto | `P(Lluvia = sí \| Pasto = mojado)` | 0.357688 | 0.448380 | `docs/verificacion-ejemplo01.md` |
| 2 | 4 | Examen y beca | `P(Estudia = sí \| Aprueba = sí)` | 0.802548 | 0.628000 | `docs/verificacion-ejemplo02.md` |
| 3 | 5 | Contagio, gripe y faltas | `P(Gripe = sí \| Falta = sí)` | 0.609260 | 0.300200 | `docs/verificacion-ejemplo03.md` |
| 4 | 6 | Tareas y beca (una variable de 3 estados) | `P(Dificultad = alta \| Calificacion = buena)` | 0.061789 | 0.615000 | `docs/verificacion-ejemplo04.md` |
| 5 | 10 | Fallas de una PC | `P(PCEnciende = Sí \| RAM = Falla)` | 0.303920 | 0.1078405 | `docs/verificacion-ejemplo05.md` |

Las capturas de cada consulta ejecutada en la aplicación están en `docs/evidencias/`.

## 4. Prueba de interfaz (`tests/ui-smoke.py`)

La prueba automatizada abre `index.html` en Chromium y comprueba, sin intervención manual: que Cytoscape.js esté cargado y el grafo se dibuje; que al marcar `Lluvia` como consulta y `Pasto = mojado` como evidencia el resultado muestre `0.357688` y `P(e) = 0.448380` con la verificación «✓» frente a la enumeración; que una consulta sin variables muestre el mensaje de error correspondiente; que una red inválida desde el editor (`{"nodes":[]}`) se rechace con «entre 3 y 10», y que no ocurran errores de JavaScript en la página.

Según el `README.md`, además de esta prueba automatizada en Linux/Chromium, la interfaz se probó manualmente en Linux (Firefox), Windows (Brave/Chrome), macOS (Safari/Chrome) y Android (Chrome), cubriendo carga, edición de nodos, consultas y exportación a PNG.

## 5. Limitaciones

A la vista de lo anterior, las limitaciones conocidas del sistema son:

- **Coste exponencial en el peor caso.** VE es exacto, pero su coste depende del orden de eliminación y puede crecer de forma exponencial con la anchura de árbol de la red. El límite de 10 nodos acota la red, pero **no** el número de estados por nodo; una red con variables de muchos estados (o muy densa) puede generar factores intermedios grandes y agotar memoria o tiempo.
- **Heurística de orden subóptima.** El criterio greedy de mínimo tamaño es barato y suficiente para las redes del proyecto, pero no garantiza el orden óptimo; existen heurísticas mejores (p. ej., *min-fill*).
- **Solo inferencia exacta y evidencia «dura».** No hay inferencia aproximada ni se admite evidencia blanda (*soft evidence*); la evidencia fija un único estado por variable.
- **Variables únicamente discretas y finitas.** No se modelan variables continuas ni gaussianas.
- **Sin compilación reutilizable.** Cada consulta se resuelve desde cero; no se compila la red (p. ej., un árbol de unión o circuito aritmético) para amortizar el coste entre consultas sucesivas.
- **La comparación con enumeración es opcional y costosa.** Al activarla, la enumeración completa es exponencial en el número de variables; en redes densas o con muchos estados puede resultar lenta, aunque para los casos de prueba (hasta 10 nodos) es manejable.
- **Precisión de punto flotante.** Los resultados usan doble precisión; las diferencias observadas frente a la referencia son del orden de `10⁻¹⁵`, insignificantes para la interpretación, pero inherentes a la aritmética flotante.

## 6. Posibles mejoras

- **Árbol de unión (junction tree / clique tree).** Compilar la red una sola vez y responder múltiples consultas reutilizando la estructura de cliques, lo que reduce el coste amortizado.
- **Mejores heurísticas de orden de eliminación** (*min-fill*, *min-weight*, búsqueda con poda) para reducir el tamaño de los factores intermedios en redes densas.
- **Evidencia blanda y variables continuas o híbridas**, ampliando la expresividad del modelo.
- **Compilación a circuito aritmético** o caché de factores para consultas repetidas con distinta evidencia.
- **Cobertura de pruebas adicional:** variables con 4 o más estados, redes más densas y pruebas basadas en propiedades (*property-based testing*).
- **Interoperabilidad:** importar/exportar otros formatos estándar (BIF, XDSL) y exportar el reporte de resultados a PDF o CSV.

# Redes bayesianas — editor y consultas con eliminación de variables

Proyecto de Modelos Probabilistas. Aplicación web (HTML + CSS + JavaScript, sin servidor) para **construir,
visualizar, guardar y consultar redes bayesianas** de 3 a 10 nodos usando el método de **eliminación de
variables** (Variable Elimination).

- Versión en línea: _[enlace a GitHub Pages — completar]_
- Manual de usuario y memoria técnica (PDF): _[enlaces/archivos — completar]_

## Qué hace

- Redes de 3 a 10 nodos con estados de cualquier tamaño (≥ 2) y tablas de probabilidad condicional (CPT).
- Validación: grafo dirigido acíclico, ids únicos, padres existentes, CPT completas con filas que suman 1.
- Grafo con nodos y flechas dirigidas; los nodos se pueden mover. Al tocar un nodo se ve su CPT.
- Consultas: una o más variables de consulta + evidencia; resultados con las variables consultadas, la
  evidencia, `P(evidencia)`, la distribución conjunta y las marginales, y el orden y los pasos de eliminación.
- Verificación: cada resultado se compara con una **enumeración completa** independiente.
- Guardar y abrir redes en JSON ([formato](docs/FORMATO.md)); imprimir un reporte de la red y del resultado.

## Instalación y ejecución

No hay nada que instalar ni compilar.

1. Clonar o descargar el repositorio.
2. Abrir **`index.html`** en el navegador (doble clic). Funciona sin conexión: Cytoscape.js viene en `vendor/`.
   - Alternativa con servidor local: `python3 -m http.server 8000` y abrir <http://localhost:8000>.

**Requisitos:** un navegador moderno (Chrome/Edge/Firefox/Safari recientes). Para las pruebas automáticas,
Node.js 18 o superior (sin dependencias adicionales).

**Plataformas probadas** _(completar con lo que prueben de verdad)_:

| Plataforma | Navegador | Resultado |
|---|---|---|
| Linux | Chromium (automatizado, Playwright) | ✔ cargar, consultar, guardar/abrir, imprimir |
| _Windows_ | _…_ | _…_ |
| _macOS_ | _…_ | _…_ |
| _Android_ | _…_ | _…_ |

## Pruebas

```bash
npm test          # o: node tests/test.js
```

Incluye: verificación contra el cálculo hecho a mano del ejemplo 1 ([detalle](docs/verificacion-ejemplo01.md)),
errores de validación y de consulta, y **300 redes aleatorias** (3–10 nodos) donde la eliminación de variables
coincide con la enumeración completa (diferencia máxima ≈ 10⁻¹⁵).

Prueba opcional de la interfaz en un navegador automatizado: `python3 tests/ui-smoke.py` (requiere Playwright).

## Estructura del repositorio

```
index.html            Aplicación
css/estilos.css       Estilos (responsivos, con estilos de impresión)
src/factor.js         Factores: producto, suma, evidencia, normalización
src/infer.js          Eliminación de variables + enumeración de referencia
src/validate.js       Validación, carga y guardado
src/app.js            Interfaz
src/ejemplos.generated.js   Generado por tools/build-ejemplos.js
ejemplos/             Redes de ejemplo (.json)
docs/                 Formato de archivo, verificaciones, evidencias
tests/                Pruebas
tools/                Utilidades
vendor/               Cytoscape.js (MIT)
PLAN.md               Plan de trabajo del equipo
```

Para agregar un ejemplo: guardar el `.json` en `ejemplos/` y ejecutar `node tools/build-ejemplos.js`.

## Cómo funciona (resumen)

Cada nodo aporta un factor `P(X | padres)`. Para una consulta `P(Q | e)`: (1) se descartan los nodos que no
son ancestros de `Q` ni de `e` (su CPT suma 1); (2) se incorpora la evidencia restringiendo los factores;
(3) cada variable oculta se elimina multiplicando los factores que la contienen y sumando sobre ella
(orden: la que genera el factor más pequeño, o el que se indique); (4) se multiplican los factores restantes
y se normaliza. Detalles en la memoria técnica.

## Integrantes y contribuciones

| Integrante | Contribución principal | Commits / archivos |
|---|---|---|
| _[Nombre A]_ | _Motor de inferencia, verificación, memoria (algoritmo)_ | _…_ |
| _[Nombre B]_ | _Interfaz gráfica, manual de usuario_ | _…_ |
| _[Nombre C]_ | _Formato de datos, ejemplos, documentación, repositorio_ | _…_ |

## Declaración de herramientas

_[Completar; ver PLAN.md, última sección.]_

# Redes bayesianas — editor y consultas con eliminación de variables

Proyecto de Modelos Probabilistas. Aplicación web (HTML + CSS + JavaScript, sin servidor) para **construir,
visualizar, guardar y consultar redes bayesianas** de 3 a 10 nodos usando el método de **eliminación de
variables** (Variable Elimination).

- Repositorio: <https://github.com/2201248e-1170/RedesBayesianas-App>
- Versión en línea: https://2201248e-1170.github.io/RedesBayesianas-App/
- Manual de usuario (PDF): [docs/Manual de Usuario - Redes Bayesianas.pdf](docs/Manual%20de%20Usuario%20-%20Redes%20Bayesianas.pdf)
- Memoria técnica (PDF): [docs/Memoria-tecnica.pdf](docs/Memoria-tecnica.pdf)

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

**Plataformas probadas**:

| Plataforma | Navegador | Resultado |
|---|---|---|
| Linux | Chromium (automatizado, Playwright) | ✔ cargar, consultar, guardar/abrir, imprimir |
| Linux (Ubuntu) | Firefox | ✔ cargar el ejemplo 5 (10 nodos) y ejecutar la consulta P(PCEnciende \| RAM=Falla) = 0.3039 |
| Windows | Brave / Chrome | ✔ la versión en línea carga y la interfaz se muestra sin errores |
| macOS | Safari / Chrome | ✔ la versión en línea carga y la interfaz se muestra sin errores |
| Android | Chrome | ✔ la versión en línea carga y la interfaz se muestra sin errores |

## Ejemplos incluidos

Cada red tiene un número distinto de nodos, una consulta con evidencia resuelta en la aplicación con eliminación de variables,
su cálculo a mano y su captura. La aplicación también muestra la diferencia con la enumeración completa (siempre menor a 10⁻¹⁵).

| # | Nodos | Red (archivo) | Consulta | Resultado | Verificación a mano |
|---|---|---|---|---|---|
| 1 | 3 | Lluvia, aspersor y pasto (`01-lluvia-3nodos.json`) | P(Lluvia=sí \| Pasto=mojado) | 0.357688 | [ejemplo 1](docs/verificacion-ejemplo01.md) |
| 2 | 4 | Examen y beca (`02-examen-4nodos.json`) | P(Estudia=sí \| Aprueba=sí) | 0.802548 | [ejemplo 2](docs/verificacion-ejemplo02.md) |
| 3 | 5 | Contagio, gripe y faltas (`03-gripe-5nodos.json`) | P(Gripe=sí \| Falta=sí) | 0.609260 | [ejemplo 3](docs/verificacion-ejemplo03.md) |
| 4 | 6 | Tareas y beca, con una variable de 3 estados (`04-tareas-6nodos.json`) | P(Dificultad=alta \| Calificacion=buena) | 0.061789 | [ejemplo 4](docs/verificacion-ejemplo04.md) |
| 5 | 10 | Fallas de una PC (`05-pc-10nodos.json`) | P(PCEnciende=Sí \| RAM=Falla) | 0.303920 | [ejemplo 5](docs/verificacion-ejemplo05.md) |

Las capturas de cada consulta están en `docs/evidencias/`.

## Pruebas

```bash
npm test          # o: node tests/test.js
```

Incluye: verificación contra el cálculo hecho a mano de los cinco ejemplos (ver la tabla de arriba),
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

| Integrante | Rol | Contribución |
|---|---|---|
| Uriel Guzman Cardoso | A · Motor y verificación | Secciones de la memoria técnica sobre los fundamentos de redes bayesianas y eliminación de variables, la explicación del algoritmo implementado, y las pruebas, resultados, limitaciones y posibles mejoras (`docs/memoria-fundamentos.md`, `docs/memoria-algoritmo.md` y `docs/memoria-pruebas.md`). |
| Jesús Rodríguez | B · Interfaz y Pruebas | Desarrollé la interfaz interactiva de formularios para la gestión de nodos (creación, renombrado, edición de estados y eliminación limpia de variables), integrando el recálculo automático de las tablas de probabilidad CPT para cumplir con el motor de validación y mantener las aristas del grafo. Implementé la exportación del grafo a imagen PNG y el sistema de historial en memoria para Deshacer/Rehacer (`Ctrl+Z` / `Ctrl+Y`) mediante atajos de teclado y eventos globales. Apoyé en la resolución de conflictos de control de versiones en Git y la depuración del código JavaScript en la rama `ui`. |
| Sebastián Rendon Silva (`se892`) | C · Datos, ejemplos y repositorio | Diseñé las redes de 4 nodos («Examen y beca»), 5 nodos («Contagio y gripe»), 6 nodos («Tareas y beca», con una variable de 3 estados) y 10 nodos («Fallas de una PC»): variables, estados y probabilidades, y las escribí en `ejemplos/02-…`, `03-…`, `04-…` y `05-…`. De cada una hice la verificación a mano ([`docs/verificacion-ejemplo02.md`](docs/verificacion-ejemplo02.md) a [`05`](docs/verificacion-ejemplo05.md)), la captura de evidencia (`docs/evidencias/`) y sus pruebas en `tests/test.js`. También subí la base del proyecto al repositorio y mezclé mi rama `datos` con `main`. El detalle está en el historial de commits. |

El detalle de cada contribución está en el historial de commits de GitHub.
## Declaración de herramientas

- **Asistencia de IA (Claude, de Anthropic).** El esqueleto inicial del repositorio (motor de eliminación de variables,
  validaciones, interfaz mínima, pruebas y `PLAN.md`) se hizo con ayuda de Claude y el equipo lo revisó.
- **Lo que yo (Sebastián Rendon Silva) hice con Claude:** lo usé para aprender a trabajar con Git y GitHub (ramas, commits,
  pull request) y para revisar mi cálculo a mano de la red de 10 nodos. Esa revisión me hizo ver dos errores míos:
  usé una fila equivocada de la tabla de PCEnciende y usé P(CPU) en lugar de P(CPU | RAM=Falla), porque CPU y RAM comparten
  a Motherboard. Los corregí yo mismo y el resultado final, 0.3039, coincide con la aplicación. Claude también me ayudó a
  pasar mis tablas al formato JSON de la aplicación y a darle formato a los archivos `verificacion-ejemplo02.md` a `05.md` y a las pruebas de los ejemplos 2 a 5.
  Las variables, los estados, las probabilidades y los cálculos a mano de mis redes son míos, y todos mis commits están hechos con mi cuenta.
- **Manual de usuario:** se completó (ejemplos con capturas, interpretación de resultados) y se le dio formato con ayuda de Claude, a partir del trabajo del equipo.
- **Bibliotecas:** Cytoscape.js (licencia MIT, en `vendor/`) para dibujar el grafo.



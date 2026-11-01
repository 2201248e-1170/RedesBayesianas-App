# PLAN — Proyecto: Redes bayesianas con eliminación de variables

**Entrega:** martes 3 de noviembre, 4:00 a.m. (Classroom)
**Meta interna:** lunes 2 de noviembre, 10:00 p.m. → la madrugada es solo colchón.
**Equipo:** 3 personas · **Tecnología:** solo web (HTML + CSS + JS, sin servidor)

> Este archivo reemplaza a `DIARIO.md` (la versión original quedó en `docs/diario-original.md`).
> Marquen las casillas en el repo; es el tablero del equipo.

---

## 0. Dónde estamos hoy (viernes 30)

Ya existe un esqueleto que **funciona y está probado**. Todo lo que sigue parte de él:

- [x] Modelo de datos genérico (estados de cualquier tamaño, CPT por combinación de padres) → `docs/FORMATO.md`
- [x] Validación: DAG, 3–10 nodos, ids únicos, padres existentes, CPT completa y con filas que suman 1 → `src/validate.js`
- [x] Factores y Variable Elimination (producto, suma, evidencia, orden, normalización, traza) → `src/factor.js`, `src/infer.js`
- [x] Referencia independiente por enumeración → `BN.enumerate`
- [x] 32 pruebas, incluidas 300 redes aleatorias (VE = enumeración, diferencia < 1e-14) → `npm test`
- [x] UI mínima: ejemplo, abrir, guardar, grafo movible, consulta/evidencia, resultados, reporte para imprimir
- [x] Ejemplo 1 (3 nodos) con verificación a mano → `docs/verificacion-ejemplo01.md`
- [ ] **Todo lo demás** (abajo)

**Importante:** el esqueleto es un punto de partida. Cada integrante debe poder **explicar el algoritmo y su parte** (lo exige el proyecto), así que lo primero es leerlo juntos (sección 1). Además, **consulten con el profesor si se permite partir de código generado con IA y declárenlo en el README y la memoria** (sección "Declaración de herramientas").

---

## 1. Hoy, juntos (1–1.5 h) — acuerdos

- [ ] Crear el repo en GitHub y subir este esqueleto (un solo commit inicial, el mensaje: «Esqueleto inicial»). Los tres como colaboradores.
- [ ] Leer en voz alta `src/factor.js` y `src/infer.js` y contestar: ¿qué factor aporta cada nodo? ¿qué hace `restrict`? ¿por qué se normaliza al final? ¿qué es la poda? Cada quien explica un fragmento a los demás.
- [ ] Ejecutar `npm test` y abrir `index.html` (los tres en su equipo).
- [ ] Verificar en Classroom la fecha/hora real de entrega.
- [ ] Repartir roles (abajo) y acordar: ramas por persona (`motor`, `ui`, `datos`) y *pull request* o merge diario. **Cada quien commitea con su propia cuenta.**

### Contrato entre partes (no cambiarlo sin avisar)

| Qué | Dónde | Firma |
|---|---|---|
| Formato de red | `docs/FORMATO.md` | `{version, name, nodes:[{id, states, parents, cpt}], positions?}` |
| Validar | `src/validate.js` | `BN.validateNetwork(net)` → `{ok, errors[]}` · `BN.loadNetwork(texto)` → `{net, errors}` |
| Inferir | `src/infer.js` | `BN.infer(net, queryVars, evidence, {order?, prune?})` → `{marginals, joint, pEvidence, order, trace, prunedNodes}` |
| Referencia | `src/infer.js` | `BN.enumerate(net, queryVars, evidence)` (misma forma de salida) |

---

## 2. Roles

| | Persona A · Motor y verificación | Persona B · Interfaz | Persona C · Datos, ejemplos y repo |
|---|---|---|---|
| **Nombre** | _[completar]_ | _[completar]_ | _[completar]_ |
| **Código** | Revisar y endurecer `factor.js`/`infer.js`; orden de eliminación elegido por el usuario (opcional); más pruebas | Formularios para crear/editar nodos, estados, padres y CPT; validación en vivo; pulir grafo y móvil | Redes de 4, 5, 6 y 10 nodos; `tools/build-ejemplos.js`; GitHub Pages |
| **Verificación** | Cálculo a mano **paso a paso con VE** de una consulta en cada ejemplo (ver sección 4) | Capturas de cada red ejecutándose en la app | Comprobar cada ejemplo contra `enumerate` y contra el cálculo a mano |
| **Documento** | **Memoria:** fundamentos, algoritmo, pruebas | **Manual:** instalación, interfaz, uso, capturas | **README**, formato de archivo, evidencias, ensamblado final de ambos PDFs |

Todos: leer los tres documentos y poder responder preguntas sobre cualquier parte del algoritmo.

---

## 3. Calendario

### Viernes 30 (tarde/noche)
- [ ] **Todos:** sección 1 (acuerdos y lectura del esqueleto)
- [ ] **A:** repasar `tests/test.js`; escribir 2–3 pruebas propias (p. ej. evidencia en varios nodos, consulta con 3 variables)
- [ ] **B:** diseñar en papel el formulario de nodo (nombre, estados, padres, tabla CPT) y empezar «Nueva red / Agregar nodo»
- [ ] **C:** definir las 4 redes restantes (temas, variables, estados, estructura) y escribir el JSON de la de 4 nodos

### Sábado 31
- [ ] **A:** verificación a mano de la red de 4 y 5 nodos; redactar «Fundamentos» y «Algoritmo» de la memoria
- [ ] **B:** editor de nodos/estados/padres/CPT completo con validación en vivo (reemplaza al editor JSON); eliminar nodo; renombrar
- [ ] **C:** JSON de las redes de 5, 6 y 10 nodos; `node tools/build-ejemplos.js`; publicar en GitHub Pages; README primera versión
- [ ] **Todos:** a las 20:00, 15 min de sincronía: ¿qué falta?, ¿qué bloquea?

### Domingo 1 de noviembre
- [ ] **Mediodía — integración:** todo en `main`, `npm test` en verde, las 5 redes cargan en la app
- [ ] **A:** verificación a mano de las redes de 6 y 10 nodos; sección «Pruebas y resultados» de la memoria
- [ ] **B:** pulido de UI y móvil; impresión revisada con «Guardar como PDF»; capturas de las 5 redes con una consulta cada una
- [ ] **C:** `docs/FORMATO.md` y README completos; tabla de contribuciones; probar en limpio (clonar el repo en otra carpeta/equipo)
- [ ] **Noche:** primer borrador completo de **manual** y **memoria** (aunque falten capturas)

### Lunes 2 de noviembre
- [ ] **12:00 — congelar el código** (solo correcciones de errores después)
- [ ] **Mañana:** B termina el manual; A y C terminan la memoria; C junta evidencias
- [ ] **Tarde:** revisión cruzada (cada quien revisa un documento que no escribió); probar el repo en limpio en **dos** equipos/navegadores; confirmar las 5 redes
- [ ] **20:00:** generar los dos PDF finales y revisarlos completos (imágenes, números, enlace al repo)
- [ ] **22:00 — ENTREGAR** en Classroom: enlace al repo + manual PDF + memoria PDF

---

## 4. Las cinco redes (cada una con un número de nodos distinto)

| # | Nodos | Estado | Sugerencia para facilitar la verificación a mano |
|---|---|---|---|
| 1 | 3 | ✅ listo | Lluvia → Aspersor, Lluvia → Pasto ← Aspersor |
| 2 | 4 | ☐ | Estructura con un colisionador o una cadena corta |
| 3 | 5 | ☐ | Mezcla de cadena y bifurcación; variables binarias |
| 4 | 6 | ☐ | Incluir una variable con 3 estados |
| 5 | 10 | ☐ | **Árbol o cadenas con pocos padres** y variables binarias; es la más trabajosa a mano |

Para cada una (esto es lo que se evalúa):
- [ ] JSON en `ejemplos/` (variables, estados, relaciones, CPT) y que **cargue sin errores** en la app
- [ ] Al menos **una consulta resuelta con VE en la app**, con evidencia (captura en `docs/evidencias/`)
- [ ] **Verificación independiente**: cálculo a mano (en `docs/verificacion-ejemploNN.md`, como `docs/verificacion-ejemplo01.md`) y comparación con `enumerate` (la app ya la muestra)
- [ ] Una prueba/entrada en `tests/test.js` con el valor esperado

> Tip para la red de 10 nodos: para consultar una variable con evidencia en una cadena, la **poda** ya descarta los nodos irrelevantes; en la verificación a mano expliquen por qué se pueden omitir (suman 1).

---

## 5. Lista de entrega (contra lo que pide el proyecto)

**Repositorio**
- [ ] Código fuente completo
- [ ] README: descripción, instalación, ejecución, dependencias, plataformas probadas, integrantes y contribuciones, enlace a la versión en línea
- [ ] Ejemplos de redes y pruebas (`ejemplos/`, `tests/`) con resultados esperados
- [ ] Formato de archivo documentado (`docs/FORMATO.md`)
- [ ] Evidencias de pruebas y funcionamiento (`docs/evidencias/`)
- [ ] Historial de Git con commits de **los tres** a lo largo de los días

**Manual de usuario (PDF)**
- [ ] Requisitos e instalación · [ ] Descripción de la interfaz · [ ] Crear nodos, estados, conexiones, probabilidades
- [ ] Importar, guardar, recuperar, modificar · [ ] Consultas y evidencia · [ ] Interpretar resultados · [ ] Imprimir
- [ ] Capturas y ejemplos de uso · [ ] Las 5 redes (3, 4, 5, 6 y 10 nodos) con consulta resuelta y verificación

**Memoria técnica (PDF)**
- [ ] Portada, introducción, problema, objetivos · [ ] Fundamentos (redes bayesianas y VE) · [ ] Justificación de herramientas
- [ ] Arquitectura y componentes · [ ] Representación interna (nodos, relaciones, distribuciones) · [ ] Explicación del algoritmo
- [ ] Interfaz y funciones · [ ] Pruebas, resultados, limitaciones, mejoras · [ ] Enlace al repo · [ ] Conclusiones y referencias
- [ ] **Quién hizo qué** (contribuciones individuales) · [ ] Declaración de herramientas (IA, bibliotecas)

> Los PDF se pueden redactar en Google Docs, Markdown o HTML y exportar/imprimir a PDF; lo que se entrega es el PDF.

---

## 6. Riesgos y qué hacer

| Riesgo | Prevención |
|---|---|
| Dejar los PDF para el final | Borradores desde el sábado; borrador completo el domingo en la noche |
| Ejemplos que no coinciden con el cálculo manual | Verificar cada red el mismo día que se crea; si difiere, revisar primero los números a mano |
| Un integrante sin commits | Commits pequeños y diarios desde cuenta propia; nada de «subir todo» al final |
| Que alguien no pueda explicar el algoritmo | Sesión de hoy (sección 1) y repaso corto el lunes: cada quien explica VE con la red 1 |
| Cambios que rompen a los demás | `npm test` antes de cada merge; no cambiar el contrato sin avisar |
| Algo que solo funciona en un equipo | Probar clonando en limpio y en al menos 2 navegadores / un celular |

## Declaración de herramientas (completar y copiar al README y la memoria)

- Esqueleto inicial del repositorio (motor de VE, validaciones, UI mínima, pruebas, plan) elaborado con asistencia de Claude (Anthropic). Cada integrante revisó y comprende el código; las partes posteriores las desarrolló el equipo según se indica en la tabla de contribuciones.
- Bibliotecas: Cytoscape.js (MIT) para el dibujo del grafo.
- _[Ajustar según lo que permita el profesor y lo que realmente haya pasado.]_

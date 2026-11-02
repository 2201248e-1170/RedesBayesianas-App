# Verificación a mano — Ejemplo 3 (5 nodos, contagio y gripe)

Red: `ejemplos/03-gripe-5nodos.json`. Variables binarias (sí / no).
Estructura: `Contagio → Gripe`, `Gripe → Fiebre`, `Gripe → Tos`, `Fiebre → Falta`.
Mezcla una cadena (Contagio → Gripe → Fiebre → Falta) y una bifurcación (Gripe tiene dos hijos: Fiebre y Tos).

Abreviaturas: C = Contagio, G = Gripe, F = Fiebre, T = Tos, Fal = Falta (a clases).

| | |
|---|---|
| P(C=sí) = 0.3 | P(C=no) = 0.7 |
| P(G=sí \| C=sí) = 0.8 | P(G=sí \| C=no) = 0.1 |
| P(F=sí \| G=sí) = 0.7 | P(F=sí \| G=no) = 0.1 |
| P(T=sí \| G=sí) = 0.6 | P(T=sí \| G=no) = 0.2 |
| P(Fal=sí \| F=sí) = 0.8 | P(Fal=sí \| F=no) = 0.1 |

## Consulta: P(Gripe = sí | Falta = sí)

**Poda:** Tos no es ancestro de G ni de Fal y no tiene evidencia; su tabla suma 1, así que se omite.
Quedan C, G, F, Fal. Evidencia Fal = sí; se eliminan C y F.

1. **Eliminar C:** `P(G) = Σ_C P(C) · P(G | C)`:
   - `P(G=sí) = 0.8·0.3 + 0.1·0.7 = 0.24 + 0.07 = 0.31`
   - `P(G=no) = 0.69`
2. **Evidencia y eliminar F:** `h(G) = Σ_F P(F | G) · P(Fal=sí | F)`:
   - `h(sí) = 0.7·0.8 + 0.3·0.1 = 0.56 + 0.03 = 0.59`
   - `h(no) = 0.1·0.8 + 0.9·0.1 = 0.08 + 0.09 = 0.17`
3. **Multiplicar por P(G):** `0.31 · 0.59 = 0.1829` y `0.69 · 0.17 = 0.1173`.
4. **Normalizar:** `P(Fal=sí) = 0.1829 + 0.1173 = 0.3002`.
   - **P(G=sí | Fal=sí) = 0.1829 / 0.3002 = 0.609260**
   - **P(G=no | Fal=sí) = 0.1173 / 0.3002 = 0.390740**

**En la aplicación:** consulta `Gripe`, evidencia `Falta = sí` → `0.609260 / 0.390740`, P(evidencia) = 0.300200.
Está en `tests/test.js` (pruebas del ejemplo 3).

## Otras consultas verificadas en las pruebas

| Consulta | Valor a mano |
|---|---|
| P(Gripe = sí) | 0.31 (paso 1) |
| P(Fiebre = sí) | 0.7·0.31 + 0.1·0.69 = 0.217 + 0.069 = 0.286 |
| P(Tos = sí) | 0.6·0.31 + 0.2·0.69 = 0.186 + 0.138 = 0.324 |
| P(Tos = sí \| Falta = sí) | (0.6·0.1829 + 0.2·0.1173) / 0.3002 = (0.10974 + 0.02346) / 0.3002 = 0.1332 / 0.3002 = 0.443704 |

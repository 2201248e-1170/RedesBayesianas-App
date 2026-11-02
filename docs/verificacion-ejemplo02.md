# Verificación a mano — Ejemplo 2 (4 nodos, examen y beca)

Red: `ejemplos/02-examen-4nodos.json`. Variables binarias (sí / no).
Estructura: `Estudia → Aprueba`, `Duerme → Aprueba`, `Aprueba → Beca`. Aprueba tiene dos padres (colisionador).

Abreviaturas: E = Estudia, D = Duerme, A = Aprueba, B = Beca.

| | |
|---|---|
| P(E=sí) = 0.6 | P(E=no) = 0.4 |
| P(D=sí) = 0.7 | P(D=no) = 0.3 |
| P(A=sí \| E=sí, D=sí) = 0.9 | P(A=sí \| E=sí, D=no) = 0.7 |
| P(A=sí \| E=no, D=sí) = 0.4 | P(A=sí \| E=no, D=no) = 0.1 |
| P(B=sí \| A=sí) = 0.8 | P(B=sí \| A=no) = 0.1 |

## Consulta: P(Estudia = sí | Aprueba = sí)

**Poda:** Beca no es ancestro de E ni de A y no tiene evidencia; su tabla suma 1, así que se omite.
Quedan E, D, A. Factores: `f1(E) · f2(D) · f3(E,D,A)`; evidencia A = sí; se elimina D.

1. Evidencia: `f3(E,D) = P(A=sí | E,D)` (0.9, 0.7, 0.4, 0.1).
2. Multiplicar por f2(D) y sumar sobre D: `g(E) = Σ_D P(D) · P(A=sí | E,D)`:
   - `g(sí) = 0.9·0.7 + 0.7·0.3 = 0.63 + 0.21 = 0.84`
   - `g(no) = 0.4·0.7 + 0.1·0.3 = 0.28 + 0.03 = 0.31`
3. Multiplicar por `f1(E)`: `0.6 · 0.84 = 0.504` y `0.4 · 0.31 = 0.124`.
4. Normalizar: `P(A=sí) = 0.504 + 0.124 = 0.628`.
   - **P(E=sí | A=sí) = 0.504 / 0.628 = 0.802548**
   - **P(E=no | A=sí) = 0.124 / 0.628 = 0.197452**

**En la aplicación:** consulta `Estudia`, evidencia `Aprueba = sí` → `0.802548 / 0.197452`, P(evidencia) = 0.628.
Está en `tests/test.js` (pruebas del ejemplo 2).

## Otras consultas verificadas en las pruebas

| Consulta | Valor a mano |
|---|---|
| P(Aprueba = sí) | 0.628 (el mismo P(evidencia) de arriba) |
| P(Beca = sí) | 0.628·0.8 + 0.372·0.1 = 0.5024 + 0.0372 = 0.5396 |
| P(Duerme = sí \| Aprueba = sí) | 0.7 · (0.9·0.6 + 0.4·0.4) / 0.628 = 0.7·0.70 / 0.628 = 0.49 / 0.628 = 0.780255 |

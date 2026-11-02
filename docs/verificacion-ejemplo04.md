# Verificación a mano — Ejemplo 4 (6 nodos, tareas y beca)

Red: `ejemplos/04-tareas-6nodos.json`. **Dificultad tiene 3 estados** (baja / media / alta); las demás variables son binarias.
Estructura: `Dificultad → Horas`, `Dificultad → Calificacion`, `Horas → Calificacion`, `Horas → Cansancio`, `Horas → Entrega`, `Calificacion → Beca`.
Calificacion tiene dos padres (Dificultad y Horas): 3 × 2 = 6 filas en su tabla.

Abreviaturas: D = Dificultad, H = Horas (muchas / pocas), C = Calificacion (buena / mala).

| | |
|---|---|
| P(D=baja) = 0.3 · P(D=media) = 0.5 · P(D=alta) = 0.2 | |
| P(H=muchas \| D=baja) = 0.7 | P(H=muchas \| D=media) = 0.5 |
| P(H=muchas \| D=alta) = 0.3 | |
| P(C=buena \| baja, muchas) = 0.9 | P(C=buena \| baja, pocas) = 0.7 |
| P(C=buena \| media, muchas) = 0.8 | P(C=buena \| media, pocas) = 0.5 |
| P(C=buena \| alta, muchas) = 0.4 | P(C=buena \| alta, pocas) = 0.1 |
| P(Beca=sí \| C=buena) = 0.8 | P(Beca=sí \| C=mala) = 0.1 |
| P(Cansancio=sí \| H=muchas) = 0.8 · P(… \| H=pocas) = 0.3 | P(Entrega=a tiempo \| H=muchas) = 0.9 · P(… \| H=pocas) = 0.4 |

## Consulta: P(Dificultad = alta | Calificacion = buena)

**Poda:** Cansancio, Entrega y Beca no son ancestros de D ni de C y no tienen evidencia; sus tablas suman 1, así que se omiten.
Quedan D, H, C. Factores: `f1(D) · f2(H,D) · f3(C,D,H)`; evidencia C = buena; se elimina H.

1. Evidencia: `f3(D,H) = P(C=buena | D,H)` (0.9, 0.7, 0.8, 0.5, 0.4, 0.1).
2. Multiplicar por `f2(H,D)` y sumar sobre H: `g(D) = Σ_H P(H | D) · P(C=buena | D,H)`:
   - `g(baja) = 0.7·0.9 + 0.3·0.7 = 0.63 + 0.21 = 0.84`
   - `g(media) = 0.5·0.8 + 0.5·0.5 = 0.40 + 0.25 = 0.65`
   - `g(alta) = 0.3·0.4 + 0.7·0.1 = 0.12 + 0.07 = 0.19`
3. Multiplicar por `f1(D)`: `0.3·0.84 = 0.252` · `0.5·0.65 = 0.325` · `0.2·0.19 = 0.038`.
4. Normalizar: `P(C=buena) = 0.252 + 0.325 + 0.038 = 0.615`.
   - P(D=baja | C=buena) = 0.252 / 0.615 = 0.409756
   - P(D=media | C=buena) = 0.325 / 0.615 = 0.528455
   - **P(D=alta | C=buena) = 0.038 / 0.615 = 0.061789**

(Suman 1: 0.409756 + 0.528455 + 0.061789 = 1.)

**En la aplicación:** consulta `Dificultad`, evidencia `Calificacion = buena` → `0.409756 / 0.528455 / 0.061789`, P(evidencia) = 0.615000.
Está en `tests/test.js` (pruebas del ejemplo 4).

## Otras consultas verificadas en las pruebas

| Consulta | Valor a mano |
|---|---|
| P(Horas = muchas) | 0.3·0.7 + 0.5·0.5 + 0.2·0.3 = 0.21 + 0.25 + 0.06 = 0.52 |
| P(Beca = sí) | 0.615·0.8 + 0.385·0.1 = 0.492 + 0.0385 = 0.5305 |
| P(Horas = muchas \| Calificacion = buena) | (0.3·0.7·0.9 + 0.5·0.5·0.8 + 0.2·0.3·0.4) / 0.615 = (0.189 + 0.2 + 0.024) / 0.615 = 0.413 / 0.615 = 0.671545 |

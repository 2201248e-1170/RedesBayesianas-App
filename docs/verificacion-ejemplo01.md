# Verificación a mano — Ejemplo 1 (3 nodos)

Red: `Lluvia → Aspersor`, `Lluvia → Pasto`, `Aspersor → Pasto` (`ejemplos/01-lluvia-3nodos.json`).

Abreviaturas: R = Lluvia (sí/no), S = Aspersor (enc/apag), W = Pasto (moj/sec).

| | |
|---|---|
| P(R=sí) = 0.2 | P(R=no) = 0.8 |
| P(S=enc \| R=sí) = 0.01 | P(S=enc \| R=no) = 0.4 |
| P(W=moj \| sí, enc) = 0.99 | P(W=moj \| sí, apag) = 0.8 |
| P(W=moj \| no, enc) = 0.9 | P(W=moj \| no, apag) = 0 |

## Consulta: P(Lluvia | Pasto = mojado)

**Con eliminación de variables** (factores `f1(R)·f2(R,S)·f3(R,S,W)`, evidencia W = moj, se elimina S):

1. Evidencia: `f3(R,S) = P(W=moj | R,S)`:

   | R | S | f3 |
   |---|---|---|
   | sí | enc | 0.99 |
   | sí | apag | 0.80 |
   | no | enc | 0.90 |
   | no | apag | 0.00 |

2. Multiplicar los factores que contienen S: `g(R,S) = f2(R,S) · f3(R,S)`:

   | R | S | g |
   |---|---|---|
   | sí | enc | 0.01 · 0.99 = 0.0099 |
   | sí | apag | 0.99 · 0.80 = 0.7920 |
   | no | enc | 0.40 · 0.90 = 0.3600 |
   | no | apag | 0.60 · 0.00 = 0 |

3. Sumar sobre S: `h(R) = Σ_S g(R,S)`: `h(sí) = 0.0099 + 0.7920 = 0.8019` · `h(no) = 0.3600`.
4. Multiplicar por `f1(R)`: `0.2 · 0.8019 = 0.16038` y `0.8 · 0.3600 = 0.28800`.
5. Normalizar: `P(W=moj) = 0.16038 + 0.288 = 0.44838`

   - **P(R=sí | W=moj) = 0.16038 / 0.44838 = 0.357688**
   - **P(R=no | W=moj) = 0.28800 / 0.44838 = 0.642312**

**Con la distribución conjunta (procedimiento independiente):**
`P(R,S,W=moj)` = (sí,enc) 0.2·0.01·0.99 = 0.00198 · (sí,apag) 0.2·0.99·0.8 = 0.1584 ·
(no,enc) 0.8·0.4·0.9 = 0.288 · (no,apag) 0.8·0.6·0 = 0. Suma = 0.44838 → mismos resultados.

**En la aplicación:** consulta `Lluvia`, evidencia `Pasto = mojado` → `0.357688 / 0.642312`,
P(evidencia) = 0.448380, diferencia con la enumeración completa 1.1·10⁻¹⁶.
Esta consulta está en `tests/test.js` (prueba «P(Lluvia=sí | Pasto=mojado)»).

## Otras consultas verificadas en las pruebas

| Consulta | Valor a mano |
|---|---|
| P(Aspersor = enc) | 0.2·0.01 + 0.8·0.4 = 0.322 |
| P(Pasto = moj) · P(Pasto = sec) | 0.44838 · 0.55162 |
| P(Aspersor = enc \| Pasto = moj) | (0.00198 + 0.288) / 0.44838 = 0.646751 |
| P(Lluvia, Aspersor \| Pasto = moj) | (sí,enc) 0.00198 · (sí,apag) 0.1584 · (no,enc) 0.288 · (no,apag) 0, todo entre 0.44838 |

> Plantilla para los ejemplos 2–5: copiar este archivo como `verificacion-ejemploNN.md` y cambiar la red,
> la consulta y los números. Mostrar siempre el orden de eliminación usado.

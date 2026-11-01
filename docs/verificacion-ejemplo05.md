# Verificación a mano — Ejemplo 5 (10 nodos, fallas de una PC)

Red: `ejemplos/05-pc-10nodos.json`. Todas las variables son binarias.
Estructura: EnergiaElectrica → FuenteAlimentacion, UPS · FuenteAlimentacion → Motherboard, DiscoDuro ·
Motherboard → CPU, RAM · DiscoDuro → SistemaOperativo · RAM → PantallaAzul · CPU, RAM → PCEnciende.
Solo PCEnciende tiene dos padres (CPU y RAM, que a su vez comparten a Motherboard). Las tablas completas están en `docs/red-propia.md`.

Abreviaturas: E = EnergiaElectrica, F = FuenteAlimentacion, M = Motherboard, C = CPU, R = RAM, P = PCEnciende (estados OK/Falla; P: Sí/No).

## Consulta: P(PCEnciende = Sí | RAM = Falla)

**Por qué se pueden omitir nodos (poda):** UPS, DiscoDuro, SistemaOperativo y PantallaAzul no son ancestros de P ni de R, y no tienen evidencia; sus tablas suman 1, así que al sumarlos se eliminan sin cambiar el resultado.
Quedan E, F, M, C, R, P.

**Paso 1 — Marginales hacia abajo (sin evidencia):**

- P(F=OK) = 0.95·0.9 + 0.3·0.1 = 0.885 · P(F=Falla) = 0.115
- P(M=OK) = 0.97·0.885 + 0.4·0.115 = 0.90445 · P(M=Falla) = 0.09555

**Paso 2 — Evidencia R = Falla.** CPU y RAM son hijas de Motherboard, por eso **no son independientes**: hay que usar P(C | R=Falla) y no P(C).

- P(R=Falla) = 0.04·0.90445 + 0.75·0.09555 = 0.036178 + 0.0716625 = **0.1078405** (es P(evidencia))
- P(M=OK | R=Falla) = 0.036178 / 0.1078405 ≈ 0.33547
- P(M=Falla | R=Falla) = 0.0716625 / 0.1078405 ≈ 0.66453

**Paso 3 — Sumar sobre M para obtener P(C | R=Falla):**

- P(C=OK | R=Falla) = 0.98·0.33547 + 0.2·0.66453 ≈ 0.4617
- P(C=Falla | R=Falla) = 0.02·0.33547 + 0.8·0.66453 ≈ 0.5383 (suma 1 ✓)

**Paso 4 — Sumar sobre C usando solo las filas de PCEnciende con RAM = Falla** (CPU=OK, RAM=Falla → 0.6 · CPU=Falla, RAM=Falla → 0.05):

P(P=Sí | R=Falla) = 0.6·0.4617 + 0.05·0.5383 = 0.277 + 0.0269 ≈ **0.3039**

**En la aplicación:** consulta `PCEnciende`, evidencia `RAM = Falla` → `0.303920 / 0.696080`,
P(evidencia) = 0.107841, diferencia con la enumeración completa 6.11·10⁻¹⁶.
Captura: `docs/evidencias/ejemplo05-consulta.png`. Está en `tests/test.js` (pruebas del ejemplo 5).

> Nota: un primer borrador de este cálculo usó P(C) en lugar de P(C | R=Falla) y una fila equivocada de la tabla de PCEnciende (daba 0.5905). Se corrigió en el segundo commit del historial (rama `datos`).

## Consulta avanzada: P(PCEnciende = Sí | PantallaAzul = Sí, SistemaOperativo = Arranca)

Se verifica por ejecución: la aplicación da **0.607746** y coincide con la enumeración completa (diferencia < 10⁻¹⁵).
No se hace a mano porque la evidencia de SistemaOperativo llega por la rama DiscoDuro ← FuenteAlimentacion y la de PantallaAzul por RAM, y ambas se cruzan en Motherboard.

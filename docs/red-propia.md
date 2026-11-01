RED BAYESIANA DE 10 NODOS — TEMA: FALLAS DE PC
Estructura: red sin ciclos dirigidos, ≤2 padres por nodo (solo N10 tiene 2: CPU y RAM, que comparten a Motherboard)

1) VARIABLES, PADRES Y ESTADOS

| # | Nodo | Padres | Estados |
|---|------|--------|---------|
| N1 | EnergíaEléctrica | — | {OK, Falla} |
| N2 | FuenteAlimentación | EnergíaEléctrica | {OK, Falla} |
| N3 | UPS | EnergíaEléctrica | {OK, Falla} |
| N4 | Motherboard | FuenteAlimentación | {OK, Falla} |
| N5 | CPU | Motherboard | {OK, Falla} |
| N6 | RAM | Motherboard | {OK, Falla} |
| N7 | DiscoDuro | FuenteAlimentación | {OK, Falla} |
| N8 | SistemaOperativo | DiscoDuro | {Arranca, NoArranca} |
| N9 | PantallaAzul | RAM | {Sí, No} |
| N10 | PCEnciende | CPU, RAM | {Sí, No} |

2) TABLAS DE PROBABILIDAD CONDICIONAL (CPTs)
Todas las filas suman 1. Todas binarias. Solo N10 tiene 2 padres (4 filas).

N1 · EnergíaEléctrica (sin padres)
| EnergíaEléctrica | P |
| OK | 0.9 |
| Falla | 0.1 |

N2 · FuenteAlimentación (padre: EnergíaEléctrica)
| EnergíaEléctrica | Fuente=OK | Fuente=Falla |
| OK | 0.95 | 0.05 |
| Falla | 0.3 | 0.7 |

N3 · UPS (padre: EnergíaEléctrica)
| EnergíaEléctrica | UPS=OK | UPS=Falla |
| OK | 0.98 | 0.02 |
| Falla | 0.6 | 0.4 |

N4 · Motherboard (padre: FuenteAlimentación)
| Fuente | MB=OK | MB=Falla |
| OK | 0.97 | 0.03 |
| Falla | 0.4 | 0.6 |

N5 · CPU (padre: Motherboard)
| MB | CPU=OK | CPU=Falla |
| OK | 0.98 | 0.02 |
| Falla | 0.2 | 0.8 |

N6 · RAM (padre: Motherboard)
| MB | RAM=OK | RAM=Falla |
| OK | 0.96 | 0.04 |
| Falla | 0.25 | 0.75 |

N7 · DiscoDuro (padre: FuenteAlimentación)
| Fuente | Disco=OK | Disco=Falla |
| OK | 0.97 | 0.03 |
| Falla | 0.3 | 0.7 |

N8 · SistemaOperativo (padre: DiscoDuro)
| Disco | SO=Arranca | SO=NoArranca |
| OK | 0.98 | 0.02 |
| Falla | 0.1 | 0.9 |

N9 · PantallaAzul (padre: RAM)
| RAM | BSOD=Sí | BSOD=No |
| OK | 0.05 | 0.95 |
| Falla | 0.85 | 0.15 |

N10 · PCEnciende (padres: CPU, RAM)
| CPU | RAM | PC=Sí | PC=No |
| OK | OK | 0.99 | 0.01 |
| OK | Falla | 0.6 | 0.4 |
| Falla | OK | 0.5 | 0.5 |
| Falla | Falla | 0.05 | 0.95 |

3) CONSULTA Y EVIDENCIA

Consulta: P(PCEnciende | PantallaAzul=Sí, SistemaOperativo=Arranca)
Consulta verificable a mano (referencia independiente): P(PCEnciende | RAM=Falla)

4) CÁLCULO MANUAL DE REFERENCIA

CORRECCIÓN DEL CÁLCULO MANUAL — P(PCEnciende=Sí | RAM=Falla)

Error 1 corregido: con RAM=Falla, las filas válidas de N10 son
  CPU=OK,    RAM=Falla → 0.6
  CPU=Falla, RAM=Falla → 0.05
(antes usé 0.5, que corresponde a CPU=Falla, RAM=OK — incorrecto)

Error 2 corregido: NO se usa P(CPU) marginal, porque CPU y RAM
NO son independientes (comparten Motherboard). Hay que usar
P(CPU | RAM=Falla).

Cálculo correcto:

P(PC=Sí | RAM=Falla) =
    0.6  · P(CPU=OK    | RAM=Falla)
  + 0.05 · P(CPU=Falla | RAM=Falla)

Ahora hay que calcular P(CPU | RAM=Falla). Como CPU y RAM son
ambas hijas de Motherboard (y MB depende de Fuente, y Fuente de
Energía), condicionar en RAM=Falla cambia la distribución de MB:

P(MB | RAM=Falla) ∝ P(RAM=Falla | MB) · P(MB)

P(F=OK)     = 0.95·0.9 + 0.3·0.1 = 0.885
P(F=Falla)  = 0.115
P(MB=OK)    = 0.97·0.885 + 0.4·0.115 = 0.90445
P(MB=Falla) = 0.09555

P(RAM=Falla | MB=OK)    = 0.04
P(RAM=Falla | MB=Falla) = 0.75

P(RAM=Falla) = 0.04·0.90445 + 0.75·0.09555
             = 0.036178 + 0.0716625
             = 0.1078405

P(MB=OK    | RAM=Falla) = 0.04·0.90445 / 0.1078405
                        = 0.036178 / 0.1078405
                        ≈ 0.33547

P(MB=Falla | RAM=Falla) = 0.75·0.09555 / 0.1078405
                        = 0.0716625 / 0.1078405
                        ≈ 0.66453

Ahora P(CPU | RAM=Falla) sumando sobre MB:

P(CPU=OK | RAM=Falla) =
    0.98·0.33547 + 0.2·0.66453
  = 0.3287606 + 0.132906
  = 0.4616666  ≈ 0.4617

P(CPU=Falla | RAM=Falla) =
    0.02·0.33547 + 0.8·0.66453
  = 0.0067094 + 0.531624
  = 0.5383334  ≈ 0.5383

(verificación: 0.4617 + 0.5383 = 1.0000 ✓)

Finalmente:

P(PC=Sí | RAM=Falla) =
    0.6  · 0.4616666
  + 0.05 · 0.5383334
  = 0.277       + 0.02691667
  = 0.30391667

RESULTADO CORREGIDO:
P(PCEnciende=Sí | RAM=Falla) ≈ 0.3039

5) NOTA DE ESTRATEGIA
- La consulta de 2 evidencias se documenta como "consulta avanzada" y su resultado se verifica por ejecución en la app.
- La consulta con RAM=Falla se usa como verificación independiente del motor de eliminación de variables.
- Aaron (responsable del algoritmo) debe reproducir 0.3039 con la app.
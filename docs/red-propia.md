RED BAYESIANA DE 10 NODOS — TEMA: FALLAS DE PC
Estructura: árbol binario, ≤2 padres por nodo (solo N10 tiene 2)

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

4) CÁLCULO MANUAL DE REFERENCIA (para validar la app)

P(PC=Sí | RAM=Falla) = Σ_{CPU} P(PC=Sí | CPU, RAM=Falla) · P(CPU)

Marginales:
P(F=OK)    = 0.95·0.9 + 0.3·0.1 = 0.885
P(F=Falla) = 0.115
P(MB=OK)   = 0.97·0.885 + 0.4·0.115 = 0.90445
P(MB=Falla)= 0.09555
P(CPU=OK)  = 0.98·0.90445 + 0.2·0.09555 = 0.905471
P(CPU=Falla)= 0.094529

P(PC=Sí | RAM=Falla) = 0.6·0.905471 + 0.5·0.094529
                     = 0.5432826 + 0.0472645
                     = 0.5905471 ≈ 0.5905

RESULTADO ESPERADO: P(PCEnciende=Sí | RAM=Falla) ≈ 0.5905

5) NOTA DE ESTRATEGIA
- La consulta de 2 evidencias se documenta como "consulta avanzada" y su resultado se verifica por ejecución en la app.
- La consulta con RAM=Falla se usa como verificación independiente del motor de eliminación de variables.
- Aaron (responsable del algoritmo) debe reproducir 0.5905 con la app.
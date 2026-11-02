// ARCHIVO GENERADO por tools/build-ejemplos.js — no editar a mano.
globalThis.BN = globalThis.BN || {};
BN.EJEMPLOS = [
 {
  "file": "01-lluvia-3nodos.json",
  "net": {
   "version": 1,
   "name": "Ejemplo 1 · Lluvia, aspersor y pasto (3 nodos)",
   "nodes": [
    {
     "id": "Lluvia",
     "states": [
      "sí",
      "no"
     ],
     "parents": [],
     "cpt": [
      {
       "given": {},
       "probs": {
        "sí": 0.2,
        "no": 0.8
       }
      }
     ]
    },
    {
     "id": "Aspersor",
     "states": [
      "encendido",
      "apagado"
     ],
     "parents": [
      "Lluvia"
     ],
     "cpt": [
      {
       "given": {
        "Lluvia": "sí"
       },
       "probs": {
        "encendido": 0.01,
        "apagado": 0.99
       }
      },
      {
       "given": {
        "Lluvia": "no"
       },
       "probs": {
        "encendido": 0.4,
        "apagado": 0.6
       }
      }
     ]
    },
    {
     "id": "Pasto",
     "states": [
      "mojado",
      "seco"
     ],
     "parents": [
      "Lluvia",
      "Aspersor"
     ],
     "cpt": [
      {
       "given": {
        "Lluvia": "sí",
        "Aspersor": "encendido"
       },
       "probs": {
        "mojado": 0.99,
        "seco": 0.01
       }
      },
      {
       "given": {
        "Lluvia": "sí",
        "Aspersor": "apagado"
       },
       "probs": {
        "mojado": 0.8,
        "seco": 0.2
       }
      },
      {
       "given": {
        "Lluvia": "no",
        "Aspersor": "encendido"
       },
       "probs": {
        "mojado": 0.9,
        "seco": 0.1
       }
      },
      {
       "given": {
        "Lluvia": "no",
        "Aspersor": "apagado"
       },
       "probs": {
        "mojado": 0,
        "seco": 1
       }
      }
     ]
    }
   ]
  }
 },
 {
  "file": "02-examen-4nodos.json",
  "net": {
   "version": 1,
   "name": "Ejemplo 2 · Examen y beca (4 nodos)",
   "nodes": [
    {
     "id": "Estudia",
     "states": [
      "sí",
      "no"
     ],
     "parents": [],
     "cpt": [
      {
       "given": {},
       "probs": {
        "sí": 0.6,
        "no": 0.4
       }
      }
     ]
    },
    {
     "id": "Duerme",
     "states": [
      "sí",
      "no"
     ],
     "parents": [],
     "cpt": [
      {
       "given": {},
       "probs": {
        "sí": 0.7,
        "no": 0.3
       }
      }
     ]
    },
    {
     "id": "Aprueba",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Estudia",
      "Duerme"
     ],
     "cpt": [
      {
       "given": {
        "Estudia": "sí",
        "Duerme": "sí"
       },
       "probs": {
        "sí": 0.9,
        "no": 0.1
       }
      },
      {
       "given": {
        "Estudia": "sí",
        "Duerme": "no"
       },
       "probs": {
        "sí": 0.7,
        "no": 0.3
       }
      },
      {
       "given": {
        "Estudia": "no",
        "Duerme": "sí"
       },
       "probs": {
        "sí": 0.4,
        "no": 0.6
       }
      },
      {
       "given": {
        "Estudia": "no",
        "Duerme": "no"
       },
       "probs": {
        "sí": 0.1,
        "no": 0.9
       }
      }
     ]
    },
    {
     "id": "Beca",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Aprueba"
     ],
     "cpt": [
      {
       "given": {
        "Aprueba": "sí"
       },
       "probs": {
        "sí": 0.8,
        "no": 0.2
       }
      },
      {
       "given": {
        "Aprueba": "no"
       },
       "probs": {
        "sí": 0.1,
        "no": 0.9
       }
      }
     ]
    }
   ]
  }
 },
 {
  "file": "03-gripe-5nodos.json",
  "net": {
   "version": 1,
   "name": "Ejemplo 3 · Contagio, gripe y faltas (5 nodos)",
   "nodes": [
    {
     "id": "Contagio",
     "states": [
      "sí",
      "no"
     ],
     "parents": [],
     "cpt": [
      {
       "given": {},
       "probs": {
        "sí": 0.3,
        "no": 0.7
       }
      }
     ]
    },
    {
     "id": "Gripe",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Contagio"
     ],
     "cpt": [
      {
       "given": {
        "Contagio": "sí"
       },
       "probs": {
        "sí": 0.8,
        "no": 0.2
       }
      },
      {
       "given": {
        "Contagio": "no"
       },
       "probs": {
        "sí": 0.1,
        "no": 0.9
       }
      }
     ]
    },
    {
     "id": "Fiebre",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Gripe"
     ],
     "cpt": [
      {
       "given": {
        "Gripe": "sí"
       },
       "probs": {
        "sí": 0.7,
        "no": 0.3
       }
      },
      {
       "given": {
        "Gripe": "no"
       },
       "probs": {
        "sí": 0.1,
        "no": 0.9
       }
      }
     ]
    },
    {
     "id": "Tos",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Gripe"
     ],
     "cpt": [
      {
       "given": {
        "Gripe": "sí"
       },
       "probs": {
        "sí": 0.6,
        "no": 0.4
       }
      },
      {
       "given": {
        "Gripe": "no"
       },
       "probs": {
        "sí": 0.2,
        "no": 0.8
       }
      }
     ]
    },
    {
     "id": "Falta",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Fiebre"
     ],
     "cpt": [
      {
       "given": {
        "Fiebre": "sí"
       },
       "probs": {
        "sí": 0.8,
        "no": 0.2
       }
      },
      {
       "given": {
        "Fiebre": "no"
       },
       "probs": {
        "sí": 0.1,
        "no": 0.9
       }
      }
     ]
    }
   ]
  }
 },
 {
  "file": "04-tareas-6nodos.json",
  "net": {
   "version": 1,
   "name": "Ejemplo 4 · Tareas, calificación y beca (6 nodos)",
   "nodes": [
    {
     "id": "Dificultad",
     "states": [
      "baja",
      "media",
      "alta"
     ],
     "parents": [],
     "cpt": [
      {
       "given": {},
       "probs": {
        "baja": 0.3,
        "media": 0.5,
        "alta": 0.2
       }
      }
     ]
    },
    {
     "id": "Horas",
     "states": [
      "muchas",
      "pocas"
     ],
     "parents": [
      "Dificultad"
     ],
     "cpt": [
      {
       "given": {
        "Dificultad": "baja"
       },
       "probs": {
        "muchas": 0.7,
        "pocas": 0.3
       }
      },
      {
       "given": {
        "Dificultad": "media"
       },
       "probs": {
        "muchas": 0.5,
        "pocas": 0.5
       }
      },
      {
       "given": {
        "Dificultad": "alta"
       },
       "probs": {
        "muchas": 0.3,
        "pocas": 0.7
       }
      }
     ]
    },
    {
     "id": "Cansancio",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Horas"
     ],
     "cpt": [
      {
       "given": {
        "Horas": "muchas"
       },
       "probs": {
        "sí": 0.8,
        "no": 0.2
       }
      },
      {
       "given": {
        "Horas": "pocas"
       },
       "probs": {
        "sí": 0.3,
        "no": 0.7
       }
      }
     ]
    },
    {
     "id": "Entrega",
     "states": [
      "a tiempo",
      "tarde"
     ],
     "parents": [
      "Horas"
     ],
     "cpt": [
      {
       "given": {
        "Horas": "muchas"
       },
       "probs": {
        "a tiempo": 0.9,
        "tarde": 0.1
       }
      },
      {
       "given": {
        "Horas": "pocas"
       },
       "probs": {
        "a tiempo": 0.4,
        "tarde": 0.6
       }
      }
     ]
    },
    {
     "id": "Calificacion",
     "states": [
      "buena",
      "mala"
     ],
     "parents": [
      "Dificultad",
      "Horas"
     ],
     "cpt": [
      {
       "given": {
        "Dificultad": "baja",
        "Horas": "muchas"
       },
       "probs": {
        "buena": 0.9,
        "mala": 0.1
       }
      },
      {
       "given": {
        "Dificultad": "baja",
        "Horas": "pocas"
       },
       "probs": {
        "buena": 0.7,
        "mala": 0.3
       }
      },
      {
       "given": {
        "Dificultad": "media",
        "Horas": "muchas"
       },
       "probs": {
        "buena": 0.8,
        "mala": 0.2
       }
      },
      {
       "given": {
        "Dificultad": "media",
        "Horas": "pocas"
       },
       "probs": {
        "buena": 0.5,
        "mala": 0.5
       }
      },
      {
       "given": {
        "Dificultad": "alta",
        "Horas": "muchas"
       },
       "probs": {
        "buena": 0.4,
        "mala": 0.6
       }
      },
      {
       "given": {
        "Dificultad": "alta",
        "Horas": "pocas"
       },
       "probs": {
        "buena": 0.1,
        "mala": 0.9
       }
      }
     ]
    },
    {
     "id": "Beca",
     "states": [
      "sí",
      "no"
     ],
     "parents": [
      "Calificacion"
     ],
     "cpt": [
      {
       "given": {
        "Calificacion": "buena"
       },
       "probs": {
        "sí": 0.8,
        "no": 0.2
       }
      },
      {
       "given": {
        "Calificacion": "mala"
       },
       "probs": {
        "sí": 0.1,
        "no": 0.9
       }
      }
     ]
    }
   ]
  }
 },
 {
  "file": "05-pc-10nodos.json",
  "net": {
   "version": 1,
   "name": "Ejemplo 5 · Fallas de una PC (10 nodos)",
   "nodes": [
    {
     "id": "EnergiaElectrica",
     "states": [
      "OK",
      "Falla"
     ],
     "parents": [],
     "cpt": [
      {
       "given": {},
       "probs": {
        "OK": 0.9,
        "Falla": 0.1
       }
      }
     ]
    },
    {
     "id": "FuenteAlimentacion",
     "states": [
      "OK",
      "Falla"
     ],
     "parents": [
      "EnergiaElectrica"
     ],
     "cpt": [
      {
       "given": {
        "EnergiaElectrica": "OK"
       },
       "probs": {
        "OK": 0.95,
        "Falla": 0.05
       }
      },
      {
       "given": {
        "EnergiaElectrica": "Falla"
       },
       "probs": {
        "OK": 0.3,
        "Falla": 0.7
       }
      }
     ]
    },
    {
     "id": "UPS",
     "states": [
      "OK",
      "Falla"
     ],
     "parents": [
      "EnergiaElectrica"
     ],
     "cpt": [
      {
       "given": {
        "EnergiaElectrica": "OK"
       },
       "probs": {
        "OK": 0.98,
        "Falla": 0.02
       }
      },
      {
       "given": {
        "EnergiaElectrica": "Falla"
       },
       "probs": {
        "OK": 0.6,
        "Falla": 0.4
       }
      }
     ]
    },
    {
     "id": "Motherboard",
     "states": [
      "OK",
      "Falla"
     ],
     "parents": [
      "FuenteAlimentacion"
     ],
     "cpt": [
      {
       "given": {
        "FuenteAlimentacion": "OK"
       },
       "probs": {
        "OK": 0.97,
        "Falla": 0.03
       }
      },
      {
       "given": {
        "FuenteAlimentacion": "Falla"
       },
       "probs": {
        "OK": 0.4,
        "Falla": 0.6
       }
      }
     ]
    },
    {
     "id": "CPU",
     "states": [
      "OK",
      "Falla"
     ],
     "parents": [
      "Motherboard"
     ],
     "cpt": [
      {
       "given": {
        "Motherboard": "OK"
       },
       "probs": {
        "OK": 0.98,
        "Falla": 0.02
       }
      },
      {
       "given": {
        "Motherboard": "Falla"
       },
       "probs": {
        "OK": 0.2,
        "Falla": 0.8
       }
      }
     ]
    },
    {
     "id": "RAM",
     "states": [
      "OK",
      "Falla"
     ],
     "parents": [
      "Motherboard"
     ],
     "cpt": [
      {
       "given": {
        "Motherboard": "OK"
       },
       "probs": {
        "OK": 0.96,
        "Falla": 0.04
       }
      },
      {
       "given": {
        "Motherboard": "Falla"
       },
       "probs": {
        "OK": 0.25,
        "Falla": 0.75
       }
      }
     ]
    },
    {
     "id": "DiscoDuro",
     "states": [
      "OK",
      "Falla"
     ],
     "parents": [
      "FuenteAlimentacion"
     ],
     "cpt": [
      {
       "given": {
        "FuenteAlimentacion": "OK"
       },
       "probs": {
        "OK": 0.97,
        "Falla": 0.03
       }
      },
      {
       "given": {
        "FuenteAlimentacion": "Falla"
       },
       "probs": {
        "OK": 0.3,
        "Falla": 0.7
       }
      }
     ]
    },
    {
     "id": "SistemaOperativo",
     "states": [
      "Arranca",
      "NoArranca"
     ],
     "parents": [
      "DiscoDuro"
     ],
     "cpt": [
      {
       "given": {
        "DiscoDuro": "OK"
       },
       "probs": {
        "Arranca": 0.98,
        "NoArranca": 0.02
       }
      },
      {
       "given": {
        "DiscoDuro": "Falla"
       },
       "probs": {
        "Arranca": 0.1,
        "NoArranca": 0.9
       }
      }
     ]
    },
    {
     "id": "PantallaAzul",
     "states": [
      "Sí",
      "No"
     ],
     "parents": [
      "RAM"
     ],
     "cpt": [
      {
       "given": {
        "RAM": "OK"
       },
       "probs": {
        "Sí": 0.05,
        "No": 0.95
       }
      },
      {
       "given": {
        "RAM": "Falla"
       },
       "probs": {
        "Sí": 0.85,
        "No": 0.15
       }
      }
     ]
    },
    {
     "id": "PCEnciende",
     "states": [
      "Sí",
      "No"
     ],
     "parents": [
      "CPU",
      "RAM"
     ],
     "cpt": [
      {
       "given": {
        "CPU": "OK",
        "RAM": "OK"
       },
       "probs": {
        "Sí": 0.99,
        "No": 0.01
       }
      },
      {
       "given": {
        "CPU": "OK",
        "RAM": "Falla"
       },
       "probs": {
        "Sí": 0.6,
        "No": 0.4
       }
      },
      {
       "given": {
        "CPU": "Falla",
        "RAM": "OK"
       },
       "probs": {
        "Sí": 0.5,
        "No": 0.5
       }
      },
      {
       "given": {
        "CPU": "Falla",
        "RAM": "Falla"
       },
       "probs": {
        "Sí": 0.05,
        "No": 0.95
       }
      }
     ]
    }
   ]
  }
 }
];

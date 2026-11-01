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
 }
];

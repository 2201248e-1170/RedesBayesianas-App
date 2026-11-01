# Formato de archivo de una red bayesiana (JSON)

Una red se guarda como un archivo de texto UTF-8 con extensión `.json`. El mismo formato se usa para
**guardar, abrir e importar** redes en la aplicación y para los ejemplos de `ejemplos/`.

## Estructura

```json
{
  "version": 1,
  "name": "Nombre de la red",
  "nodes": [
    {
      "id": "Lluvia",
      "states": ["sí", "no"],
      "parents": [],
      "cpt": [
        { "given": {}, "probs": { "sí": 0.2, "no": 0.8 } }
      ]
    },
    {
      "id": "Aspersor",
      "states": ["encendido", "apagado"],
      "parents": ["Lluvia"],
      "cpt": [
        { "given": { "Lluvia": "sí" }, "probs": { "encendido": 0.01, "apagado": 0.99 } },
        { "given": { "Lluvia": "no" }, "probs": { "encendido": 0.4,  "apagado": 0.6  } }
      ]
    }
  ],
  "positions": { "Lluvia": { "x": 120, "y": 40 }, "Aspersor": { "x": 60, "y": 180 } }
}
```

| Campo | Obligatorio | Descripción |
|---|---|---|
| `version` | no | Versión del formato. Hoy es `1`; si aparece con otro valor se rechaza. |
| `name` | no | Nombre para mostrar. |
| `nodes` | **sí** | Lista de nodos (3 a 10). |
| `nodes[].id` | **sí** | Nombre único del nodo (texto no vacío). |
| `nodes[].states` | **sí** | Estados posibles: lista de **2 o más** textos distintos. Pueden ser más de dos. |
| `nodes[].parents` | **sí** | Ids de los padres (lista; vacía si no tiene). Define las aristas dirigidas `padre → nodo`. |
| `nodes[].cpt` | **sí** | Tabla de probabilidad condicional: **una fila por cada combinación de estados de los padres**. |
| `cpt[].given` | **sí** | Estado de cada padre en esa fila: `{ "Padre1": "estado", ... }`. `{}` si no hay padres. |
| `cpt[].probs` | **sí** | `P(nodo = estado | given)` para **todos** los estados del nodo. |
| `positions` | no | Posición `{x, y}` de cada nodo en el grafo (solo visual). |

Los hijos y las aristas no se guardan: se derivan de `parents`.

## Reglas de validación

La aplicación rechaza (con un mensaje que indica el problema) cualquier red que:

1. Tenga menos de 3 o más de 10 nodos.
2. Tenga `id` vacíos o repetidos.
3. Tenga un nodo con menos de 2 estados, o estados vacíos o repetidos.
4. Tenga padres que no existen, repetidos, o un nodo que sea su propio padre.
5. Contenga **ciclos** (debe ser un grafo dirigido acíclico).
6. Tenga una CPT con un número de filas distinto al de combinaciones de padres, combinaciones repetidas,
   estados desconocidos en `given` o `probs`, o probabilidades fuera de [0, 1].
7. Tenga filas cuyas probabilidades **no sumen 1** (tolerancia 10⁻⁶).

## Consultas

Una consulta se describe con:

- **Variables de consulta:** una o más (ids de nodos).
- **Evidencia:** un objeto `{ "id": "estado", ... }`; las variables de evidencia no pueden ser de consulta.

Resultado: `P(consultas | evidencia)` — la distribución conjunta de las variables de consulta y la marginal
de cada una —, además de `P(evidencia)`.

## Ejemplos

Los archivos de `ejemplos/` siguen este formato. Para que la aplicación los ofrezca en el menú «Ejemplo»,
ejecutar `node tools/build-ejemplos.js` después de agregar o cambiar uno.

# Memoria técnica: secciones de Sebastián Rendon Silva

## Formato de datos

### Qué es el formato y para qué se usa

Una red bayesiana se almacena en un archivo de texto con formato JSON (codificación UTF-8, extensión `.json`). Ese mismo formato sirve tanto para que el usuario guarde su red y la vuelva a abrir después, como para importar redes ya hechas y para los ejemplos que trae la aplicación.

### Cómo se ve un nodo

El archivo tiene un objeto principal con la versión del formato, un nombre para mostrar y la lista de nodos. `version` y `name` son opcionales; lo único obligatorio es `nodes`. Cada nodo guarda su identificador único, la lista de valores que puede tomar, los identificadores de sus padres (vacía si no tiene) y su tabla de probabilidades condicionales. Por ejemplo, el nodo `Aspersor` tiene dos estados (`encendido` / `apagado`) y un solo padre (`Lluvia`), que también tiene dos estados (`sí` / `no`); por eso su tabla necesita exactamente dos filas: una para cuando `Lluvia=sí` y otra para cuando `Lluvia=no`. En cada fila se indica el estado de los padres y la probabilidad de cada estado del nodo, de modo que las probabilidades de una misma fila siempre suman 1. Opcionalmente se puede guardar también la posición de cada nodo en pantalla, pero eso es solo para dibujar el grafo y no afecta a los cálculos.

### Qué reglas valida la app

Antes de aceptar un archivo, la aplicación comprueba varias cosas: que la red tenga entre 3 y 10 nodos; que los identificadores no estén vacíos ni repetidos y que los padres existan y no formen ciclos (es decir, que el grafo sea dirigido acíclico); que cada nodo tenga al menos dos estados distintos; y que la tabla de probabilidades sea coherente, con una fila por cada combinación de estados de los padres, probabilidades entre 0 y 1 y filas que sumen 1 con una tolerancia de 10⁻⁶. Si algo falla, la app rechaza la red y avisa del problema. No se admiten ciclos porque, en una red bayesiana, la probabilidad de cada nodo depende solo de sus padres; si el grafo tuviera un ciclo, un nodo terminaría dependiendo de sí mismo a través del ciclo y la tabla de probabilidades dejaría de estar bien definida (no habría un orden para calcularla ni una distribución conjunta válida).
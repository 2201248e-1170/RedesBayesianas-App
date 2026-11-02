# Memoria técnica: secciones de Sebastián Rendon Silva

## Formato de datos

### Qué es el formato y para qué se usa

Una red bayesiana se almacena en un archivo de texto con formato JSON (codificación UTF-8, extensión `.json`). Ese mismo formato sirve tanto para que el usuario guarde su red y la vuelva a abrir después, como para importar redes ya hechas y para los ejemplos que trae la aplicación.

### Cómo se ve un nodo

El archivo tiene un objeto principal con la versión del formato, un nombre para mostrar y la lista de nodos. `version` y `name` son opcionales; lo único obligatorio es `nodes`. Cada nodo guarda su identificador único, la lista de valores que puede tomar, los identificadores de sus padres (vacía si no tiene) y su tabla de probabilidades condicionales. Por ejemplo, el nodo `Aspersor` tiene dos estados (`encendido` / `apagado`) y un solo padre (`Lluvia`), que también tiene dos estados (`sí` / `no`); por eso su tabla necesita exactamente dos filas: una para cuando `Lluvia=sí` y otra para cuando `Lluvia=no`. En cada fila se indica el estado de los padres y la probabilidad de cada estado del nodo, de modo que las probabilidades de una misma fila siempre suman 1. Opcionalmente se puede guardar también la posición de cada nodo en pantalla, pero eso es solo para dibujar el grafo y no afecta a los cálculos.

### Qué reglas valida la app

Antes de aceptar un archivo, la aplicación comprueba varias cosas: que la red tenga entre 3 y 10 nodos; que los identificadores no estén vacíos ni repetidos y que los padres existan y no formen ciclos (es decir, que el grafo sea dirigido acíclico); que cada nodo tenga al menos dos estados distintos; y que la tabla de probabilidades sea coherente, con una fila por cada combinación de estados de los padres, probabilidades entre 0 y 1 y filas que sumen 1 con una tolerancia de 10⁻⁶. Si algo falla, la app rechaza la red y avisa del problema. No se admiten ciclos porque, en una red bayesiana, la probabilidad de cada nodo depende solo de sus padres; si el grafo tuviera un ciclo, un nodo terminaría dependiendo de sí mismo a través del ciclo y la tabla de probabilidades dejaría de estar bien definida (no habría un orden para calcularla ni una distribución conjunta válida).

## Las cinco redes de ejemplo

### Red de 10 nodos (fallas de una PC)

**Qué modela:**
Esta red representa las causas y los síntomas de que una computadora personal falle. Tiene exactamente 10 nodos organizados como un grafo dirigido acíclico. En la raíz está `EnergiaElectrica`, de la cual dependen la `FuenteAlimentacion` y el `UPS`. La fuente alimenta a la `Motherboard` y al `DiscoDuro`. Un caso interesante ocurre con `Motherboard`: es el padre compartido de `CPU` y `RAM`, por lo que ambas comparten una causa en común. Esta estructura no es un árbol estricto, porque `CPU` y `RAM` vuelven a unirse más adelante en el nodo `PCEnciende` (que tiene dos padres), formando un rombo. El `DiscoDuro` determina si el `SistemaOperativo` arranca; la `RAM` influye en la `PantallaAzul`; y el nodo final, `PCEnciende`, depende de `CPU` y `RAM`.

**La consulta:**
La consulta elegida para verificar el motor de inferencia es **P(PCEnciende = Sí | RAM = Falla)**. Es decir, la probabilidad de que la computadora encienda sabiendo que la memoria RAM falla. El resultado esperado por la aplicación es **0.303920**.

**Cómo lo verifiqué:**
Para comprobar el algoritmo de eliminación de variables, realicé el cálculo a mano. Primero apliqué la **poda**: ignoré los nodos `UPS`, `DiscoDuro`, `SistemaOperativo` y `PantallaAzul`. La razón matemática es que sus tablas de probabilidad suman 1 en cada fila, por lo que al sumarlos (marginalizarlos) se eliminan de la ecuación sin alterar el resultado final. Tras la poda, el subgrafo relevante queda formado por seis nodos: `EnergiaElectrica`, `FuenteAlimentacion`, `Motherboard`, `CPU`, `RAM` y `PCEnciende`.

Un punto clave es que, como `CPU` y `RAM` comparten el padre `Motherboard`, **no son independientes**. Por lo tanto, al condicionar la consulta en `RAM=Falla`, es un error usar la probabilidad marginal P(CPU); hay que calcular P(CPU | RAM=Falla). De hecho, mi primer cálculo manual usó P(CPU) en lugar de P(CPU | RAM=Falla) y además una fila equivocada de la tabla de `PCEnciende`, y arrojó 0.5905, un resultado incorrecto. Al corregirlo y condicionar adecuadamente, obtuve los números intermedios correctos: P(evidencia) = 0.107841 y P(CPU=OK | RAM=Falla) ≈ 0.4617, lo que finalmente lleva al resultado de ≈ 0.3039. 

Este cálculo manual coincide con la respuesta de la aplicación (0.303920). Esta coincidencia, junto con las 47 pruebas automatizadas y la comparación contra el método de enumeración completa, da confianza en que el motor de inferencia está implementado correctamente.
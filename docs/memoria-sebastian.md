Memoria técnica: secciones de Sebastián Rendon Silva
Formato de datos
Qué es el formato y para qué se usa

Una red bayesiana se almacena en un archivo de texto con formato JSON (codificación UTF-8, extensión .json). Ese mismo formato sirve tanto para que el usuario guarde su red y la vuelva a abrir después, como para importar redes ya hechas y para los ejemplos que trae la aplicación.

Cómo se ve un nodo

El archivo tiene un objeto principal con la versión del formato, un nombre para mostrar y la lista de nodos. version y name son opcionales; lo único obligatorio es nodes. Cada nodo guarda su identificador único, la lista de valores que puede tomar, los identificadores de sus padres (vacía si no tiene) y su tabla de probabilidades condicionales. Por ejemplo, el nodo Aspersor tiene dos estados (encendido / apagado) y un solo padre (Lluvia), que también tiene dos estados (sí / no); por eso su tabla necesita exactamente dos filas: una para cuando Lluvia=sí y otra para cuando Lluvia=no. En cada fila se indica el estado de los padres y la probabilidad de cada estado del nodo, de modo que las probabilidades de una misma fila siempre suman 1. Opcionalmente se puede guardar también la posición de cada nodo en pantalla, pero eso es solo para dibujar el grafo y no afecta a los cálculos.

Qué reglas valida la app

Antes de aceptar un archivo, la aplicación comprueba varias cosas: que la red tenga entre 3 y 10 nodos; que los identificadores no estén vacíos ni repetidos y que los padres existan y no formen ciclos (es decir, que el grafo sea dirigido acíclico); que cada nodo tenga al menos dos estados distintos; y que la tabla de probabilidades sea coherente, con una fila por cada combinación de estados de los padres, probabilidades entre 0 y 1 y filas que sumen 1 con una tolerancia de 10⁻⁶. Si algo falla, la app rechaza la red y avisa del problema. No se admiten ciclos porque, en una red bayesiana, la probabilidad de cada nodo depende solo de sus padres; si el grafo tuviera un ciclo, un nodo terminaría dependiendo de sí mismo a través del ciclo y la tabla de probabilidades dejaría de estar bien definida (no habría un orden para calcularla ni una distribución conjunta válida).

Las cinco redes de ejemplo
Red de 3 nodos (lluvia, aspersor y pasto)

Qué modela: Esta es la red más pequeña del proyecto y representa las causas de que el pasto de un jardín esté mojado. Tiene 3 nodos binarios. En la raíz está Lluvia, de la cual dependen tanto el Aspersor como el estado del Pasto. Además, el Aspersor también influye en el Pasto, por lo que este nodo final tiene dos padres.

La consulta: La consulta resuelta fue P(Lluvia = sí | Pasto = mojado). Es decir, cuál es la probabilidad de que haya llovido sabiendo que el pasto está mojado. El resultado obtenido fue 0.357688 (y P(Lluvia = no | Pasto = mojado) = 0.642312).

Cómo lo verifiqué: Para verificarlo, apliqué el método de eliminación de variables. En esta red no hay nodos que podar, ya que los tres son relevantes (Lluvia es la consulta, Pasto es la evidencia y Aspersor es ancestro de Pasto). Por lo tanto, la variable oculta Aspersor se elimina sumando (marginalizando) sobre sus estados. Multiplicando los factores y aplicando la evidencia, obtuve que P(Pasto = mojado) = 0.448380. Al normalizar los valores, llegué al resultado de 0.357688 para Lluvia = sí. Este cálculo manual coincidió con la aplicación (la diferencia con la enumeración completa fue de 1.1·10⁻¹⁶).

Red de 4 nodos (examen y beca)

Qué modela: Esta red representa los factores que influyen en que un estudiante apruebe un examen y obtenga una beca. Tiene 4 nodos binarios. En la raíz están Estudia y Duerme, que son independientes entre sí. Ambas variables influyen en el nodo Aprueba, y el resultado de aprobar condiciona la probabilidad de que el estudiante reciba la Beca. Un detalle estructural importante es que Aprueba actúa como un colisionador (o convergencia): aunque Estudia y Duerme son independientes de origen, se vuelven dependientes al momento de condicionar sobre Aprueba.

La consulta: La consulta resuelta fue P(Estudia = sí | Aprueba = sí). Es decir, la probabilidad de que el estudiante haya estudiado, sabiendo que aprobó. El resultado obtenido fue ≈ 0.802548 (redondeado a 0.8025).

Cómo lo verifiqué: Para verificarlo, primero apliqué la poda: el nodo Beca no es ancestro de Estudia ni de Aprueba y no tiene evidencia; como su tabla de probabilidad suma 1, se puede omitir de los cálculos sin alterar el resultado. Tras la poda, el cálculo se reduce a tres nodos: Estudia, Duerme y Aprueba.

Debido a que Aprueba es un colisionador, tuve que sumar (marginalizar) sobre Duerme para calcular la probabilidad de que el estudiante apruebe. Obtuve un paso intermedio clave: P(Aprueba = sí) = 0.628. Finalmente, apliqué el teorema de Bayes para obtener P(Estudia = sí | Aprueba = sí) = 0.802548. El cálculo manual coincidió con el resultado de la aplicación.

Red de 5 nodos (contagio, gripe y faltas)

Qué modela: Esta red representa cómo un contagio influye en la probabilidad de que una persona tenga gripe, y cómo esta, a su vez, influye en la probabilidad de tener fiebre y tos. Finalmente, la fiebre influye en si la persona falta a clases o no. Tiene 5 nodos binarios y es una estructura de cadena con una bifurcación: Contagio es padre de Gripe; Gripe es padre de Fiebre y de Tos (esta es la bifurcación); y Fiebre es padre de Falta. No hay colisionadores (nodos con dos padres).

La consulta: La consulta resuelta fue P(Gripe = sí | Falta = sí). Es decir, la probabilidad de que la persona tenga gripe sabiendo que faltó a clases. El resultado obtenido fue 0.609260.

Cómo lo verifiqué: Para verificarlo, apliqué la eliminación de variables. Aquí sí hubo poda: el nodo Tos es una hoja que no es ancestro de la variable de consulta (Gripe) ni de la evidencia (Falta), y como su tabla de probabilidad suma 1, se puede omitir del cálculo sin alterar el resultado final.

Tras eliminar Tos, el cálculo se redujo a sumar (marginalizar) sobre Contagio y sobre Fiebre. Primero calculé la probabilidad de que la persona tenga gripe (P(Gripe = sí) = 0.31) y luego la probabilidad de que falte (P(Falta = sí) = 0.3002). Al aplicar el teorema de Bayes con estos pasos intermedios, obtuve el resultado de 0.609260, el cual coincide con el valor arrojado por la aplicación.

Red de 6 nodos (tareas y beca)

Qué modela: Esta red representa cómo la dificultad de una tarea y las horas de estudio influyen en la calificación, y cómo esta última influye en la obtención de una beca. Tiene 6 nodos. La estructura es la siguiente: Dificultad es el único nodo raíz (y tiene 3 estados: baja, media y alta). De Dificultad depende Horas (que es binario). A su vez, Horas influye en Cansancio, en Entrega y en Calificacion. Además, Dificultad también influye directamente en Calificacion (que tiene dos padres, Dificultad y Horas, que además están conectados entre sí). Finalmente, Calificacion influye en Beca.

La consulta: La consulta resuelta fue P(Dificultad = alta | Calificacion = buena). Es decir, la probabilidad de que la tarea haya sido de dificultad alta sabiendo que el estudiante obtuvo una buena calificación. El resultado obtenido fue 0.061789.

Cómo lo verifiqué: Para verificarlo, apliqué la eliminación de variables. Primero podé los nodos Cansancio, Entrega y Beca: al ser nodos hoja que no son ancestros de la consulta ni de la evidencia, y como sus tablas de probabilidad suman 1, se pueden omitir sin alterar el resultado.

Tras la poda, el cálculo se redujo a los nodos Dificultad, Horas y Calificacion. Para resolverlo, sumé (marginalicé) sobre Horas, pero usando la probabilidad condicional P(Horas | Dificultad), ya que Horas depende de Dificultad. Con eso obtuve las probabilidades de una calificación buena para cada nivel de dificultad (0.84 para baja, 0.65 para media y 0.19 para alta), y la probabilidad total de una calificación buena (0.615). Finalmente, apliqué el teorema de Bayes y obtuve 0.061789, el cual coincide con el resultado de la aplicación.

Red de 10 nodos (fallas de una PC)

Qué modela: Esta red representa las causas y los síntomas de que una computadora personal falle. Tiene exactamente 10 nodos organizados como un grafo dirigido acíclico. En la raíz está EnergiaElectrica, de la cual dependen la FuenteAlimentacion y el UPS. La fuente alimenta a la Motherboard y al DiscoDuro. Un caso interesante ocurre con Motherboard: es el padre compartido de CPU y RAM, por lo que ambas comparten una causa en común. Esta estructura no es un árbol estricto, porque CPU y RAM vuelven a unirse más adelante en el nodo PCEnciende (que tiene dos padres), formando un rombo. El DiscoDuro condiciona la probabilidad de que el SistemaOperativo arranque; la RAM influye en la PantallaAzul; y el nodo final, PCEnciende, depende de CPU y RAM.

La consulta: La consulta elegida para verificar el motor de inferencia es P(PCEnciende = Sí | RAM = Falla). Es decir, la probabilidad de que la computadora encienda sabiendo que la memoria RAM falla. El resultado esperado por la aplicación es 0.303920.

Cómo lo verifiqué: Para comprobar el algoritmo de eliminación de variables, realicé el cálculo a mano. Primero apliqué la poda: ignoré los nodos UPS, DiscoDuro, SistemaOperativo y PantallaAzul. La razón matemática es que sus tablas de probabilidad suman 1 en cada fila, por lo que al sumarlos (marginalizarlos) se eliminan de la ecuación sin alterar el resultado final. Tras la poda, el subgrafo relevante queda formado por seis nodos: EnergiaElectrica, FuenteAlimentacion, Motherboard, CPU, RAM y PCEnciende.

Un punto clave es que, como CPU y RAM comparten el padre Motherboard, no son independientes. Por lo tanto, al condicionar la consulta en RAM=Falla, es un error usar la probabilidad marginal P(CPU); hay que calcular P(CPU | RAM=Falla). De hecho, mi primer cálculo manual usó P(CPU) en lugar de P(CPU | RAM=Falla) y además una fila equivocada de la tabla de PCEnciende, y arrojó 0.5905, un resultado incorrecto. Al corregirlo y condicionar adecuadamente, obtuve los números intermedios correctos: P(evidencia) = 0.107841 y P(CPU=OK | RAM=Falla) ≈ 0.4617, lo que finalmente lleva al resultado de ≈ 0.3039.

Este cálculo manual coincide con la respuesta de la aplicación (0.303920). Esta coincidencia, junto con las 47 pruebas automatizadas y la comparación contra el método de enumeración completa, da confianza en que el motor de inferencia está implementado correctamente.
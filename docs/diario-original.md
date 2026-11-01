## ¿Qué hacer?
Veo que lo más adecuado sería desarrollar iterativa y progresivamente el código, es decir, primero realizamos la estructura mínima la UI mínima necesaria para interactuar con la red bayesiana, luego 
### Fases de desarrollo
- Fase 1: Interfaz de usuario mínima, y solución de una red bayesiana de tamaño fijo.
- Fase 2: 

### Aspectos del modelo
- [ ] Diseñar código que permita definir redes Bayesianas arbitrarias
- [ ] Sobre el código anterior, definir las funciones que permiten inferencia sobre estas.
- [ ] Definir cómo es que se va a guardar una red bayesiana en un archivo. Seguramente en JSON con los objetos.

### Aspectos de UI
- [ ] Diseñar el aspecto del sitio web, la interfaz
    - [ ] Definir la estructura HTML
    - [ ] Establecer que tipo de diseño CSS queremos en el sitio. Tiene que se adaptable a Android y PC.
    - [ ] Definir cómo es que se accede a las instrucciones de uso. Por ejemplo: un pequeño símbolo de interrogación que indique cómo se usa la UI.

### 
- [ ] 

## Idea de cómo se estructuraría
```js
myBayesianNetwork = {
    name: "myBaysianNetwork" # <-- Esto seguramente se puede omitir, es posible saber el nombre del objeto.
    children: undefined
}
``` 



# Plasmando el concepto de redes bayesianas en Pseudocódigo
Ocupamos aplicar inferencia Bayesiana, entonces ¿cómo es que la aplicaríamos pero en JS?

Yo imagino, un objeto `myBayesianNetwork` que contiene toda la información de una red bayesiana completa, ¿qué tiene una red bayesiana? Nodos, entonces la red bayesiana contiene un arreglo de nodos, tal como un grafo.
```js
myBayesianNetwork = {
    nodes: [ ... ]
}
```
Ahora, una red bayesiana tiene nodos entrada y salida, ¿cómo los distinguimos? ¿cómo decimos 'en estos se pone la entrada'? Podría ser una lista, pero esta lista tiene que hacer referencia a los nodos que ya tenemos

```js
myBayesianNetwork = {
    input_nodes: [ "A", "B", "C" ],
    output_nodes: [ "F", "G"],
    nodes: [A, B, C, D, E, F, G]
}
```
Con esto ya podemos empezar a almacenar los nodos en un objeto que representa la red bayesiana. Pero, ahora, la red bayesiana, necesita ser capaz de hacer inferencia, 'realizar inferencia' es una función, por lo tanto también ocupamos que la red bayesiana tenga funciones:
```js
myBayesianNetwork = {
    nodes: [A, B, C, D, E, F, G],
    edges: [ (A, D), (B, F), (C, F), (D, E), (D, F)],
    infer: function (query, evidence) {

    }
}
```
Un momento... ¿pero qué tipo de inferencias puede realizar? Puede hacer muchas:
- Puedo pedir P(A | F, !C).
- Puedo pedir P(F, G | A, B, C)
- Puedo pedir P(A,B | F,G)
- Puedo pedir P(D)

Yo estimo hasta 2^10=1024 consultas posibles, hay que ver qué tipo de consulta nos pide el profe y si podemos simplificar el modelo en base, es decir, ¿el profesor nos está pidiendo resolver todas las consultas?

> Se deberá implementar el método de eliminación de variables (Variable Elimination) estudiado en clase.
> El usuario deberá poder:
> Seleccionar una o más variables de consulta.
> Establecer evidencia mediante la asignación de estados a las variables correspondientes.
> Ejecutar el algoritmo sobre la red construida.
> Consultar los resultados probabilísticos obtenidos.
> Identificar las variables consultadas y la evidencia utilizada.

Es decir, las 1024 posibles consultas tienen que ser resueltas por nuestra función `infer`.
Por lo que la función es `.infer(query, evidence), ya internamente se usa eliminación de variables.


Ahora, ¿qué hay dentro de `.infer`? Ahí es donde debería de estar el algoritmo de eliminación de variables, y como recordamos este algoritmo:
- Tiene una lista de factores, todos estos factores son referentes a variables ocultas (que no son ni consulta ni evidencia).
    - Pero, ¿cómo identificamos los factores? Hasta ahora no tenemos ninguna forma de hacerlo, y es que los nodos por sí mismos tienen que contenerlos en sus tablas de probabilidades.

### ¿Cómo se definen los nodos?
```
C = {
    name: "C", /* Indispensable a menos que podamos referirnos al nombre del objeto. */
    children: [ D, E ],
    parents:
    /* Definimos tabla de verosimilitud */
    likelihood: function (parent_evidence)
}
```

¿Hacemos aproximación que define los vertices y aristas de un grafo o en los nodos explícitamente definimos las relaciones padre-hijo bidireccionales? ¿Cuál es más adecuada?
- Por facilidad, creo que Padre-hijo bidireccional es más fácil
```js
/* Esta solo define un único nodo */
C = {
    parents: [A, B],
    children: [ D],
}
```
- La notación de grafo, sería más complicada al inicio pero bastante más compacta.
```js
/* Esta define toda la red */
network = {

    vertices: [A , B, C, D],
    edges: [(A, C), (B, C), (C, D)],
    probs: function(query, evidence) {

    }
    probs: {
        A: 0.5, /* P(A) */
        B: {
            /* Consultamos en base a B y sus padres.*/
        }
        C: 0.2,
        D: 0.29,

    }
}
```
    - Esta aproximación es más adecuada, porque se vuelve trivial encontrar los factores existentes dentro de la red; solo buscamos en Edges y no mucho más.
    - Bajo esta aproximación, sin embargo, la obtención de las tablas de probabilidad es cuestión de la red, no de los nodos individuales
    







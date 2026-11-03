# Fundamentos de redes bayesianas y eliminación de variables

> Esta sección forma parte de la memoria técnica del proyecto «Redes bayesianas: editor y consultas con eliminación de variables». Se ubica después del planteamiento del problema y los objetivos, y antes de la justificación de las herramientas y la arquitectura del software. Los conceptos aquí expuestos son la base de la sección «Explicación del algoritmo implementado», donde se describe su traslado a código. El formato de archivo de una red se documenta en la sección «Formato de datos» y la interfaz gráfica en «Módulo de interfaz y pruebas».

## 1. Definición y componentes

Una **red bayesiana** es un modelo gráfico probabilístico que representa la distribución de probabilidad conjunta de un conjunto de variables aleatorias discretas mediante dos elementos complementarios:

- **Parte cualitativa (estructura).** Un **grafo dirigido acíclico (DAG)** `G = (V, E)`, donde cada vértice `v ∈ V` es una variable aleatoria y cada arista dirigida `u → v` expresa que `u` influye directamente sobre `v`. Se dice que `u` es **padre** de `v` y que `v` es **hijo** de `u`.
- **Parte cuantitativa (parámetros).** Para cada variable `X`, una **tabla de probabilidad condicional (CPT)** que especifica `P(X = x | Pa(X) = pa)` para cada estado `x` de `X` y cada combinación de estados `pa` de sus padres `Pa(X)`.

Formalmente, una red bayesiana sobre las variables `X₁, …, Xₙ` es un par `(G, Θ)` donde `G` es un DAG y `Θ = { P(Xᵢ | Pa(Xᵢ)) }` contiene la condicional local de cada variable dados sus padres. En este proyecto las variables son discretas con al menos dos estados cada una, la red debe tener entre 3 y 10 nodos, y las filas de cada CPT deben sumar 1. Las reglas exactas de validación se detallan en la sección «Formato de datos».

La restricción de que el grafo sea **acíclico** no es un detalle menor: garantiza que existe un orden topológico de las variables (padres antes que hijos) y, por tanto, que la factorización de la siguiente sección está bien definida. Si existiera un ciclo, una variable terminaría dependiendo de sí misma a través del ciclo y no habría una distribución conjunta consistente.

## 2. Factorización de la distribución conjunta

La propiedad central de una red bayesiana es la **factorización**: la distribución conjunta se descompone como el producto de las condicionales locales,

```
P(X₁, …, Xₙ) = ∏ᵢ P(Xᵢ | Pa(Xᵢ)).
```

Esta identidad se obtiene aplicando la regla de la cadena en un orden topológico y usando la **propiedad local de Markov**: cada variable es condicionalmente independiente de sus no descendientes dados sus padres. La red no afirma que las variables sean arbitrariamente independientes entre sí; afirma que, dados sus padres, cada variable queda determinada sin necesidad de mirar más nodos.

La factorización es lo que hace viable la inferencia. Si se almacenara la conjunta completa de `n` variables binarias se necesitarían `2ⁿ − 1` números independientes (por ejemplo, 1023 para 10 variables). En una red bayesiana se almacenan en su lugar las CPT locales: para un nodo con `k` estados y padres cuyos números de estados son `c₁, …, cₘ`, su CPT tiene `k · c₁ · … · cₘ` entradas (con `(k−1) · c₁ · … · cₘ` grados de libertad). En redes poco densas esta cantidad es mucho menor que `2ⁿ − 1`.

## 3. Independencia condicional y d-separación

### 3.1. Independencia y dependencia condicional

Dos variables `X` e `Y` son **independientes** si `P(X, Y) = P(X) · P(Y)`. Son **condicionalmente independientes dada `Z`** (se escribe `X ⟂ Y | Z`) si

```
P(X, Y | Z) = P(X | Z) · P(Y | Z).
```

En una red bayesiana, las aristas no son meras líneas: según su orientación relativa, determinan si la información puede «fluir» entre dos variables a través de un camino, y si observar (condicionar sobre) una variable intermedia bloquea o, por el contrario, abre ese flujo. Este comportamiento se formaliza con la **d-separación**.

### 3.2. Las tres estructuras locales

Cualquier camino no dirigido entre dos variables está compuesto por triples consecutivos de tres tipos:

**a) Cadena (head-to-tail):** `X → Z → Y`.

`Z` es causa de `Y` y efecto de `X`. En general `X` e `Y` son dependientes entre sí (el estado de `X` influye en `Y` a través de `Z`), pero si se observa `Z`, el camino queda **bloqueado** y `X ⟂ Y | Z`. Un ejemplo del proyecto es la cadena `Contagio → Gripe → Fiebre` (ejemplo 3): conocer `Contagio` informa sobre `Fiebre`; pero si ya se conoce `Gripe`, el valor de `Contagio` deja de aportar información sobre `Fiebre`.

**b) Bifurcación o causa común (tail-to-tail):** `X ← Z → Y`.

`Z` es causa común de `X` e `Y`, que son efectos correlacionados por compartir esa causa: `X` e `Y` son dependientes en general, pero observar `Z` **bloquea** el camino y vuelve a `X` e `Y` condicionalmente independientes: `X ⟂ Y | Z`.

**c) Colisionador o estructura en V (head-to-head):** `X → Z ← Y`.

Aquí `Z` recibe influencia de dos causas `X` e `Y` que, a priori, son **independientes**: `X ⟂ Y`. Sin embargo, observar `Z` (o uno de sus descendientes) **abre** el camino y hace que `X` e `Y` se vuelvan dependientes. Este fenómeno se conoce como *explaining away*: explicar el efecto a través de una causa reduce la necesidad de la otra. En el ejemplo 2 (examen y beca), `Aprueba` es colisionador de `Estudia` y `Duerme`: a priori, haber estudiado y haber dormido son independientes; pero condicionando sobre `Aprueba = sí`, ambas variables se correlacionan (sabiendo que el estudiante aprobó, si se entera de que durmió poco, aumenta la probabilidad de que haya estudiado mucho).

### 3.3. Definición de d-separación

Sea `S` un conjunto de variables observadas. Un **camino activo** entre `X` e `Y` dado `S` es aquel en el que todo triple consecutivo está «abierto»:

- en una cadena `→ Z →` o `← Z ←`, y en una bifurcación `← Z →`, el nodo intermedio `Z` **no** está en `S`;
- en un colisionador `→ Z ←`, el nodo intermedio `Z` **o alguno de sus descendientes** está en `S`.

Se dice que `S` **d-separa** a `X` de `Y` (o que `X` e `Y` son **d-separadas por `S`**) si **no existe ningún camino activo** entre ellas dado `S`. La definición se extiende a conjuntos: `S` d-separa los conjuntos `A` y `B` si d-separa todo par `X ∈ A`, `Y ∈ B`.

El resultado fundamental (teorema de **corrección/solidez**) es:

> Si `S` d-separa a `X` de `Y` en el grafo `G`, entonces `X ⟂ Y | S` se cumple en toda distribución que factorice según `G`.

La implicación recíproca (que toda independencia observada en los datos provenga de una d-separación del grafo) solo se cumple para distribuciones **fieles** al grafo; es una propiedad usual pero no universal. Por ello, la d-separación es la herramienta gráfica para *leer* las independencias que la red garantiza.

### 3.4. Cobertura de Markov

Como consecuencia de la d-separación, cada variable `X` es condicionalmente independiente de todas las demás variables de la red dados su **cobija de Markov** (*Markov blanket*): sus padres, sus hijos y los otros padres de sus hijos. Este es el conjunto mínimo que contiene toda la información necesaria para predecir `X`.

## 4. Consultas en una red bayesiana

Sobre una red construida pueden formularse tres tipos de consultas:

- **Marginal o a priori:** `P(X)`, la probabilidad de un nodo sin condicionar.
- **Conjunta:** `P(X, Y, …)`, la probabilidad de una combinación de estados.
- **Condicional o a posteriori:** `P(Q | E = e)`, la distribución de una o más variables de consulta `Q` dado que las variables de evidencia `E` toman los valores `e`.

En general, responder una consulta requiere **sumar (marginalizar) sobre todas las variables ocultas** —aquellas que no son de consulta ni de evidencia—:

```
P(Q | E = e) = Σₕ P(Q, H = h | E = e) ∝ Σₕ ∏ᵢ P(Xᵢ | Pa(Xᵢ)),
```

donde `H` son las variables ocultas. La suma sobre todas las combinaciones de estados de `H` es exacta pero costosa: crece con el producto de los tamaños de los dominios. El método de **eliminación de variables** evita calcular la conjunta completa explotando la factorización.

## 5. Eliminación de variables (Variable Elimination)

### 5.1. Factores

Un **factor** es una función `φ(alcance)` que asigna un número real no negativo a cada asignación de estados de un conjunto de variables llamado **alcance**. Las CPT de la red son factores: la del nodo `X` es `φ(P a(X) ∪ {X}) = P(X | Pa(X))`. El producto de factores y la suma sobre variables producen nuevos factores.

### 5.2. Operaciones sobre factores

1. **Producto punto a punto.** `(φ · ψ)(a) = φ(a) · ψ(a)`. El alcance del resultado es la unión de los alcances.
2. **Suma fuera (marginalización).** `(Σ_Z φ)(a) = Σ_{z ∈ dom(Z)} φ(a, Z = z)`. La variable `Z` desaparece del alcance.
3. **Restricción (evidencia).** Fijar `Z = z` y eliminar `Z` del alcance, conservando solo las entradas compatibles con la evidencia.
4. **Normalización.** Dividir todas las entradas por su suma total para obtener una distribución que suma 1.

La identidad que hace eficiente el método es la **propiedad distributiva**:

```
Σ_Z ( φ₁ · … · φₖ ) = (producto de los φᵢ que no mencionan a Z) · Σ_Z (producto de los φᵢ que mencionan a Z).
```

«Empujar» la suma hacia adentro reduce el tamaño de las tablas que se multiplican, que es exactamente lo que explota la eliminación de variables.

### 5.3. Algoritmo

Dada una red con factores locales `Φ`, variables de consulta `Q` y evidencia `E = e`:

```
VE(Φ, Q, E):
  1. F ← { factor local P(X | Pa(X)) por cada nodo X }
  2. F ← { restringir(f, E) para cada f en F }          # incorporar la evidencia
  3. H ← variables que no están en Q ni en E            # variables ocultas
  4. π ← orden de eliminación de H
  5. para cada Z en π:
        F' ← { f en F | Z está en el alcance de f }
        g ← Σ_Z ( ∏_{f en F'} f )                        # multiplicar y sumar fuera
        F ← (F \ F') ∪ { g }
  6. h ← ∏_{f en F} f                                     # factor final sobre Q
  7. devolver h / Σ_Q h                                   # normalizar → P(Q | E = e)
```

El resultado es exacto y no depende del orden de eliminación: cualquier orden produce la misma distribución. Lo que sí cambia con el orden es el **coste**: el tamaño de los factores intermedios. El coste de eliminar `Z` está dominado por el tamaño del factor producto (el producto de los tamaños de dominio de las variables de su alcance), de modo que el coste total depende de la elección de `π` y, en el peor caso, es exponencial en la **anchura de árbol** (*treewidth*) de la red. La sección «Explicación del algoritmo implementado» describe el criterio concreto (heurística *greedy*) que usa la aplicación para elegir el orden.

### 5.4. Ejemplo numérico ilustrativo

Considérese la cadena `A → B → C` con variables binarias y parámetros:

```
P(A = V) = 0.6                      P(A = F) = 0.4
P(B = V | A = V) = 0.8              P(B = V | A = F) = 0.3
P(C = V | B = V) = 0.9              P(C = V | B = F) = 0.2
```

Para la consulta `P(A = V | C = V)`:

1. **Factores:** `f_A(A)`, `f_B(A, B)`, `f_C(B, C)`.
2. **Evidencia `C = V`:** se restringe `f_C` a `f_C(B) = [0.9, 0.2]` para `B = V, F`.
3. **Eliminar `B`:** `g(A) = Σ_B f_B(A, B) · f_C(B)`:
   - `g(A = V) = 0.8 · 0.9 + 0.2 · 0.2 = 0.72 + 0.04 = 0.76`
   - `g(A = F) = 0.3 · 0.9 + 0.7 · 0.2 = 0.27 + 0.14 = 0.41`
4. **Multiplicar por `f_A`:** `h(A = V) = 0.6 · 0.76 = 0.456`, `h(A = F) = 0.4 · 0.41 = 0.164`.
5. **Normalizar:** `P(C = V) = 0.456 + 0.164 = 0.62`, de donde
   - `P(A = V | C = V) = 0.456 / 0.62 = 0.7355`
   - `P(A = F | C = V) = 0.164 / 0.62 = 0.2645`.

Obsérvese que en el paso 3 la suma se aplicó solo al producto de los dos factores que mencionan a `B`, y `f_A` se mantuvo aparte hasta el final: esa es la esencia del ahorro del método.

La sección «Explicación del algoritmo implementado» muestra cómo cada una de estas operaciones se materializa en los módulos `src/factor.js` y `src/infer.js`, y la sección «Pruebas, resultados, limitaciones y posibles mejoras» recoge la verificación numérica de estos resultados.

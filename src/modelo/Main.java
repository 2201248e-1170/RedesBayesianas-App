package modelo;

import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 1. Instanciar un nuevo nodo de prueba
        Nodo lluvia = new Nodo("Lluvia", Arrays.asList("Si", "No"));

        // 2. Instanciar su tabla de probabilidad
        TablaProbabilidad tablaLluvia = new TablaProbabilidad(Arrays.asList(lluvia));

        // 3. Inyectar los valores probabilísticos (Ej. 80% de probabilidad de lluvia)
        tablaLluvia.agregarProbabilidad("Lluvia=Si", 0.80);
        tablaLluvia.agregarProbabilidad("Lluvia=No", 0.20);

        // 4. Leer e imprimir los valores para comprobar que se guardaron bien
        System.out.println("Comprobacion del sistema base:");
        System.out.println("Probabilidad de que llueva: " + tablaLluvia.obtenerProbabilidad("Lluvia=Si"));
        System.out.println("Probabilidad de que no llueva: " + tablaLluvia.obtenerProbabilidad("Lluvia=No"));
    }
}
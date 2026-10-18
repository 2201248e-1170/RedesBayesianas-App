package modelo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

public class TablaProbabilidad {
    
    // Lista de variables (nodos) involucradas en esta tabla
    private List<Nodo> variables;
    
    // Mapa que asocia una combinación de estados (ej. "A=Sí, B=No") con su probabilidad
    private Map<String, Double> probabilidades;

    public TablaProbabilidad(List<Nodo> variables) {
        this.variables = new ArrayList<>(variables);
        this.probabilidades = new HashMap<>();
    }

    // Método para agregar una probabilidad a una combinación específica
    public void agregarProbabilidad(String combinacion, Double probabilidad) {
        this.probabilidades.put(combinacion, probabilidad);
    }

    // Método para obtener la probabilidad dada una combinación
    public Double obtenerProbabilidad(String combinacion) {
        return this.probabilidades.get(combinacion);
    }

    public List<Nodo> getVariables() {
        return variables;
    }

    public Map<String, Double> getProbabilidades() {
        return probabilidades;
    }
}
package modelo;

import java.util.ArrayList;
import java.util.List;

public class Nodo {
    private String identificador;
    private List<String> estados;
    private List<Nodo> padres;
    private List<Nodo> hijos;
    // Aquí después instanciaremos la clase TablaProbabilidad para la CPT
    
    public Nodo(String identificador, List<String> estados) {
        this.identificador = identificador;
        this.estados = estados;
        this.padres = new ArrayList<>();
        this.hijos = new ArrayList<>();
    }

    public String getIdentificador() {
        return identificador;
    }

    public List<String> getEstados() {
        return estados;
    }

    public List<Nodo> getPadres() {
        return padres;
    }

    public void agregarPadre(Nodo padre) {
        if (!this.padres.contains(padre)) {
            this.padres.add(padre);
            padre.agregarHijo(this);
        }
    }

    private void agregarHijo(Nodo hijo) {
        if (!this.hijos.contains(hijo)) {
            this.hijos.add(hijo);
        }
    }
}
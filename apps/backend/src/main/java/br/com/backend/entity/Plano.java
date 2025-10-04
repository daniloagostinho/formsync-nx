package br.com.backend.entity;

public enum Plano {
    FREE("Gratuito"),
    PESSOAL("Pessoal"),
    PROFISSIONAL("Profissional"),
    PROFISSIONAL_MENSAL("Profissional Mensal"),
    PROFISSIONAL_VITALICIO("Profissional Vitalício"),
    EMPRESARIAL("Empresarial");
    
    private final String descricao;
    
    Plano(String descricao) {
        this.descricao = descricao;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public static Plano fromString(String plano) {
        if (plano == null) {
            return FREE;
        }
        
        try {
            return valueOf(plano.toUpperCase());
        } catch (IllegalArgumentException e) {
            return FREE; // Plano padrão
        }
    }
    
    public boolean isGratuito() {
        return this == FREE;
    }
    
    public boolean isPago() {
        return this != FREE;
    }
    
    public boolean permiteUploadCsv() {
        return this == PROFISSIONAL || this == PROFISSIONAL_MENSAL || 
               this == PROFISSIONAL_VITALICIO || this == EMPRESARIAL;
    }
    
    public boolean permiteScheduler() {
        return this == EMPRESARIAL;
    }
}


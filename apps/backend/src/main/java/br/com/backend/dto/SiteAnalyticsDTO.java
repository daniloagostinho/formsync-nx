package br.com.backend.dto;

public class SiteAnalyticsDTO {
    private String dominio;
    private Integer quantidadePreenchimentos;
    private Double tempoMedio;

    public SiteAnalyticsDTO() {}

    public SiteAnalyticsDTO(String dominio, Integer quantidadePreenchimentos, Double tempoMedio) {
        this.dominio = dominio;
        this.quantidadePreenchimentos = quantidadePreenchimentos;
        this.tempoMedio = tempoMedio;
    }

    // Getters e Setters
    public String getDominio() {
        return dominio;
    }

    public void setDominio(String dominio) {
        this.dominio = dominio;
    }

    public Integer getQuantidadePreenchimentos() {
        return quantidadePreenchimentos;
    }

    public void setQuantidadePreenchimentos(Integer quantidadePreenchimentos) {
        this.quantidadePreenchimentos = quantidadePreenchimentos;
    }

    public Double getTempoMedio() {
        return tempoMedio;
    }

    public void setTempoMedio(Double tempoMedio) {
        this.tempoMedio = tempoMedio;
    }
}
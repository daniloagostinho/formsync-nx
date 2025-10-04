package br.com.backend.dto;

public class AnalyticsResponseDTO {
    private Integer totalPreenchimentos;
    private String tempoEconomizado;
    private Integer sitesUnicos;
    private Integer taxaSucesso;
    private String periodo;

    public AnalyticsResponseDTO() {}

    public AnalyticsResponseDTO(Integer totalPreenchimentos, String tempoEconomizado, 
                              Integer sitesUnicos, Integer taxaSucesso, String periodo) {
        this.totalPreenchimentos = totalPreenchimentos;
        this.tempoEconomizado = tempoEconomizado;
        this.sitesUnicos = sitesUnicos;
        this.taxaSucesso = taxaSucesso;
        this.periodo = periodo;
    }

    // Getters e Setters
    public Integer getTotalPreenchimentos() {
        return totalPreenchimentos;
    }

    public void setTotalPreenchimentos(Integer totalPreenchimentos) {
        this.totalPreenchimentos = totalPreenchimentos;
    }

    public String getTempoEconomizado() {
        return tempoEconomizado;
    }

    public void setTempoEconomizado(String tempoEconomizado) {
        this.tempoEconomizado = tempoEconomizado;
    }

    public Integer getSitesUnicos() {
        return sitesUnicos;
    }

    public void setSitesUnicos(Integer sitesUnicos) {
        this.sitesUnicos = sitesUnicos;
    }

    public Integer getTaxaSucesso() {
        return taxaSucesso;
    }

    public void setTaxaSucesso(Integer taxaSucesso) {
        this.taxaSucesso = taxaSucesso;
    }

    public String getPeriodo() {
        return periodo;
    }

    public void setPeriodo(String periodo) {
        this.periodo = periodo;
    }
}
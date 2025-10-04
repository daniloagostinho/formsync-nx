package br.com.backend.dto;

import java.time.LocalDateTime;

public class CampoAnalyticsDTO {
    private Long campoTemplateId;
    private String nomeCampo;
    private String nomeTemplate;
    private Integer quantidadeUsos;
    private LocalDateTime ultimoUso;

    public CampoAnalyticsDTO() {}

    public CampoAnalyticsDTO(Long campoTemplateId, String nomeCampo, String nomeTemplate, Integer quantidadeUsos, LocalDateTime ultimoUso) {
        this.campoTemplateId = campoTemplateId;
        this.nomeCampo = nomeCampo;
        this.nomeTemplate = nomeTemplate;
        this.quantidadeUsos = quantidadeUsos;
        this.ultimoUso = ultimoUso;
    }

    // Getters e Setters
    public Long getCampoTemplateId() {
        return campoTemplateId;
    }

    public void setCampoTemplateId(Long campoTemplateId) {
        this.campoTemplateId = campoTemplateId;
    }

    public String getNomeCampo() {
        return nomeCampo;
    }

    public void setNomeCampo(String nomeCampo) {
        this.nomeCampo = nomeCampo;
    }

    public String getNomeTemplate() {
        return nomeTemplate;
    }

    public void setNomeTemplate(String nomeTemplate) {
        this.nomeTemplate = nomeTemplate;
    }

    public Integer getQuantidadeUsos() {
        return quantidadeUsos;
    }

    public void setQuantidadeUsos(Integer quantidadeUsos) {
        this.quantidadeUsos = quantidadeUsos;
    }

    public LocalDateTime getUltimoUso() {
        return ultimoUso;
    }

    public void setUltimoUso(LocalDateTime ultimoUso) {
        this.ultimoUso = ultimoUso;
    }
}
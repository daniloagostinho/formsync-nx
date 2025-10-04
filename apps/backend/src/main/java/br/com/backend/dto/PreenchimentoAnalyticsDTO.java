package br.com.backend.dto;

import java.time.LocalDateTime;

public class PreenchimentoAnalyticsDTO {
    private LocalDateTime data;
    private Integer quantidade;
    private String site;
    private Long campoId;

    public PreenchimentoAnalyticsDTO() {}

    public PreenchimentoAnalyticsDTO(LocalDateTime data, Integer quantidade, String site, Long campoId) {
        this.data = data;
        this.quantidade = quantidade;
        this.site = site;
        this.campoId = campoId;
    }

    // Getters e Setters
    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public String getSite() {
        return site;
    }

    public void setSite(String site) {
        this.site = site;
    }

    public Long getCampoId() {
        return campoId;
    }

    public void setCampoId(Long campoId) {
        this.campoId = campoId;
    }
}
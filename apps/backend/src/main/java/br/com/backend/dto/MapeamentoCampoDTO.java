package br.com.backend.dto;

import java.time.LocalDateTime;

public class MapeamentoCampoDTO {
    
    private Long id;
    private Long campoTemplateId;
    private String urlSite;
    private String seletorCss;
    private String tipoCampo;
    private String atributoCampo;
    private String valorAtributo;
    private Double confianca;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private Integer totalUso;
    private LocalDateTime ultimoUso;
    private Boolean sucessoUltimoUso;
    
    // Construtores
    public MapeamentoCampoDTO() {}
    
    public MapeamentoCampoDTO(Long campoTemplateId, String urlSite, String seletorCss) {
        this.campoTemplateId = campoTemplateId;
        this.urlSite = urlSite;
        this.seletorCss = seletorCss;
        this.ativo = true;
        this.confianca = 0.0;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getCampoTemplateId() {
        return campoTemplateId;
    }
    
    public void setCampoTemplateId(Long campoTemplateId) {
        this.campoTemplateId = campoTemplateId;
    }
    
    public String getUrlSite() {
        return urlSite;
    }
    
    public void setUrlSite(String urlSite) {
        this.urlSite = urlSite;
    }
    
    public String getSeletorCss() {
        return seletorCss;
    }
    
    public void setSeletorCss(String seletorCss) {
        this.seletorCss = seletorCss;
    }
    
    public String getTipoCampo() {
        return tipoCampo;
    }
    
    public void setTipoCampo(String tipoCampo) {
        this.tipoCampo = tipoCampo;
    }
    
    public String getAtributoCampo() {
        return atributoCampo;
    }
    
    public void setAtributoCampo(String atributoCampo) {
        this.atributoCampo = atributoCampo;
    }
    
    public String getValorAtributo() {
        return valorAtributo;
    }
    
    public void setValorAtributo(String valorAtributo) {
        this.valorAtributo = valorAtributo;
    }
    
    public Double getConfianca() {
        return confianca;
    }
    
    public void setConfianca(Double confianca) {
        this.confianca = confianca;
    }
    
    public Boolean getAtivo() {
        return ativo;
    }
    
    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
    
    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
    
    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }
    
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
    
    public Integer getTotalUso() {
        return totalUso;
    }
    
    public void setTotalUso(Integer totalUso) {
        this.totalUso = totalUso;
    }
    
    public LocalDateTime getUltimoUso() {
        return ultimoUso;
    }
    
    public void setUltimoUso(LocalDateTime ultimoUso) {
        this.ultimoUso = ultimoUso;
    }
    
    public Boolean getSucessoUltimoUso() {
        return sucessoUltimoUso;
    }
    
    public void setSucessoUltimoUso(Boolean sucessoUltimoUso) {
        this.sucessoUltimoUso = sucessoUltimoUso;
    }
}

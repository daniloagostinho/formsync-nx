package br.com.backend.dto;

import java.time.LocalDateTime;

public class CampoTemplateDTO {
    
    private Long id;
    private String nome;
    private String valor;
    private String tipo;
    private Integer ordem;
    private Long templateId;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private Integer totalUso;
    private LocalDateTime ultimoUso;
    
    // Campos adicionais para suporte a diferentes tipos
    private String valorPadrao;
    private String placeholder;
    private String descricao;
    
    // Construtores
    public CampoTemplateDTO() {}
    
    public CampoTemplateDTO(String nome, String valor, Long templateId) {
        this.nome = nome;
        this.valor = valor;
        this.templateId = templateId;
        this.ativo = true;
    }
    
    public CampoTemplateDTO(String nome, String valor, String tipo, Integer ordem, Long templateId) {
        this(nome, valor, templateId);
        this.tipo = tipo;
        this.ordem = ordem;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getValor() {
        return valor;
    }
    
    public void setValor(String valor) {
        this.valor = valor;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public Integer getOrdem() {
        return ordem;
    }
    
    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
    }
    
    public Long getTemplateId() {
        return templateId;
    }
    
    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
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
    
    // Getters e Setters para campos adicionais
    public String getValorPadrao() {
        return valorPadrao;
    }
    
    public void setValorPadrao(String valorPadrao) {
        this.valorPadrao = valorPadrao;
    }
    
    public String getPlaceholder() {
        return placeholder;
    }
    
    public void setPlaceholder(String placeholder) {
        this.placeholder = placeholder;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
}

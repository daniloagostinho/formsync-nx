package br.com.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class TemplateDTO {
    
    private Long id;
    private String nome;
    private String descricao;
    private Long usuarioId;
    private List<CampoTemplateDTO> campos;
    private Boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private Integer totalUso;
    private LocalDateTime ultimoUso;
    
    // Construtores
    public TemplateDTO() {}
    
    public TemplateDTO(String nome, String descricao, Long usuarioId) {
        this.nome = nome;
        this.descricao = descricao;
        this.usuarioId = usuarioId;
        this.ativo = true;
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
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    public Long getUsuarioId() {
        return usuarioId;
    }
    
    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
    
    public List<CampoTemplateDTO> getCampos() {
        return campos;
    }
    
    public void setCampos(List<CampoTemplateDTO> campos) {
        this.campos = campos;
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
}

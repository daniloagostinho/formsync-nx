package br.com.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "campos_template")
public class CampoTemplate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private Template template;
    
    @Column(name = "nome", nullable = false)
    private String nome;
    
    @Column(name = "tipo", nullable = false)
    private String tipo; // text, email, password, number, etc.
    
    @Column(name = "descricao")
    private String descricao;
    
    @Column(name = "valor_padrao")
    private String valorPadrao;
    
    @Column(name = "placeholder")
    private String placeholder;
    
    @Column(name = "valor")
    private String valor; // Campo para compatibilidade com código existente
    
    @Column(name = "obrigatorio", nullable = false)
    private Boolean obrigatorio = false;
    
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;
    
    @Column(name = "ordem", nullable = false)
    private Integer ordem = 0;
    
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    @Column(name = "total_uso")
    private Integer totalUso = 0;
    
    @Column(name = "ultimo_uso")
    private LocalDateTime ultimoUso;
    
    // Construtores
    public CampoTemplate() {
        this.dataCriacao = LocalDateTime.now();
    }
    
    public CampoTemplate(String nome, String tipo, Template template) {
        this();
        this.nome = nome;
        this.tipo = tipo;
        this.template = template;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Template getTemplate() {
        return template;
    }
    
    public void setTemplate(Template template) {
        this.template = template;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
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
    
    public String getValor() {
        return valor;
    }
    
    public void setValor(String valor) {
        this.valor = valor;
    }
    
    public Boolean getObrigatorio() {
        return obrigatorio;
    }
    
    public void setObrigatorio(Boolean obrigatorio) {
        this.obrigatorio = obrigatorio;
    }
    
    public Boolean getAtivo() {
        return ativo;
    }
    
    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }
    
    public Integer getOrdem() {
        return ordem;
    }
    
    public void setOrdem(Integer ordem) {
        this.ordem = ordem;
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
        this.dataAtualizacao = LocalDateTime.now();
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
    
    // Métodos de negócio
    public void incrementarUso() {
        this.totalUso++;
        this.ultimoUso = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}

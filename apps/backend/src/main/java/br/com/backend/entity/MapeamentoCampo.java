package br.com.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mapeamentos_campo")
public class MapeamentoCampo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campo_template_id", nullable = false)
    private CampoTemplate campoTemplate;
    
    @Column(name = "url_site", nullable = false)
    private String urlSite;
    
    @Column(name = "seletor_css", nullable = false)
    private String seletorCss;
    
    @Column(name = "tipo_campo")
    private String tipoCampo; // input, textarea, select, etc.
    
    @Column(name = "atributo_campo")
    private String atributoCampo; // name, id, placeholder, etc.
    
    @Column(name = "valor_atributo")
    private String valorAtributo; // valor do atributo (ex: "email", "senha", etc.)
    
    @Column(name = "confianca", nullable = false)
    private Double confianca = 0.0; // 0.0 a 1.0 - nível de confiança do mapeamento
    
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;
    
    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;
    
    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;
    
    @Column(name = "total_uso")
    private Integer totalUso = 0;
    
    @Column(name = "ultimo_uso")
    private LocalDateTime ultimoUso;
    
    @Column(name = "sucesso_ultimo_uso")
    private Boolean sucessoUltimoUso = true;
    
    // Construtores
    public MapeamentoCampo() {
        this.dataCriacao = LocalDateTime.now();
    }
    
    public MapeamentoCampo(CampoTemplate campoTemplate, String urlSite, String seletorCss) {
        this();
        this.campoTemplate = campoTemplate;
        this.urlSite = urlSite;
        this.seletorCss = seletorCss;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public CampoTemplate getCampoTemplate() {
        return campoTemplate;
    }
    
    public void setCampoTemplate(CampoTemplate campoTemplate) {
        this.campoTemplate = campoTemplate;
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
        this.ultimoUso = LocalDateTime.now();
    }
    
    public Boolean getSucessoUltimoUso() {
        return sucessoUltimoUso;
    }
    
    public void setSucessoUltimoUso(Boolean sucessoUltimoUso) {
        this.sucessoUltimoUso = sucessoUltimoUso;
    }
    
    // Métodos de negócio
    public void incrementarUso() {
        this.totalUso++;
        this.ultimoUso = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public void registrarUso(Boolean sucesso) {
        incrementarUso();
        this.sucessoUltimoUso = sucesso;
        
        // Ajusta confiança baseado no sucesso
        if (sucesso) {
            this.confianca = Math.min(1.0, this.confianca + 0.1);
        } else {
            this.confianca = Math.max(0.0, this.confianca - 0.2);
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}

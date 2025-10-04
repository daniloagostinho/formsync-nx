package br.com.backend.dto;

import java.util.List;

public class PreenchimentoAutomaticoDTO {
    
    private Long templateId;
    private String urlSite;
    private List<CampoPreenchimentoDTO> campos;
    
    // Construtores
    public PreenchimentoAutomaticoDTO() {}
    
    public PreenchimentoAutomaticoDTO(Long templateId, String urlSite) {
        this.templateId = templateId;
        this.urlSite = urlSite;
    }
    
    // Getters e Setters
    public Long getTemplateId() {
        return templateId;
    }
    
    public void setTemplateId(Long templateId) {
        this.templateId = templateId;
    }
    
    public String getUrlSite() {
        return urlSite;
    }
    
    public void setUrlSite(String urlSite) {
        this.urlSite = urlSite;
    }
    
    public List<CampoPreenchimentoDTO> getCampos() {
        return campos;
    }
    
    public void setCampos(List<CampoPreenchimentoDTO> campos) {
        this.campos = campos;
    }
    
    // Classe interna para campos de preenchimento
    public static class CampoPreenchimentoDTO {
        private String nomeCampo;
        private String valor;
        private String seletorCss;
        private String tipoCampo;
        private Double confianca;
        
        public CampoPreenchimentoDTO() {}
        
        public CampoPreenchimentoDTO(String nomeCampo, String valor, String seletorCss) {
            this.nomeCampo = nomeCampo;
            this.valor = valor;
            this.seletorCss = seletorCss;
        }
        
        // Getters e Setters
        public String getNomeCampo() {
            return nomeCampo;
        }
        
        public void setNomeCampo(String nomeCampo) {
            this.nomeCampo = nomeCampo;
        }
        
        public String getValor() {
            return valor;
        }
        
        public void setValor(String valor) {
            this.valor = valor;
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
        
        public Double getConfianca() {
            return confianca;
        }
        
        public void setConfianca(Double confianca) {
            this.confianca = confianca;
        }
    }
}

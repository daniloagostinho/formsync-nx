package br.com.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CriarCheckoutDTO {
    
    @NotBlank(message = "Plano é obrigatório")
    @Pattern(regexp = "PESSOAL|PROFISSIONAL|EMPRESARIAL", 
             message = "Plano deve ser PESSOAL, PROFISSIONAL ou EMPRESARIAL")
    private String plano;
    
    @Email(message = "Email deve ter formato válido")
    private String email;
    
    private String successUrl;
    private String cancelUrl;
    
    // Construtores
    public CriarCheckoutDTO() {}
    
    public CriarCheckoutDTO(String plano, String email, String successUrl, String cancelUrl) {
        this.plano = plano;
        this.email = email;
        this.successUrl = successUrl;
        this.cancelUrl = cancelUrl;
    }
    
    // Getters e Setters
    public String getPlano() {
        return plano;
    }
    
    public void setPlano(String plano) {
        this.plano = plano;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getSuccessUrl() {
        return successUrl;
    }
    
    public void setSuccessUrl(String successUrl) {
        this.successUrl = successUrl;
    }
    
    public String getCancelUrl() {
        return cancelUrl;
    }
    
    public void setCancelUrl(String cancelUrl) {
        this.cancelUrl = cancelUrl;
    }
} 
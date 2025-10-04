package br.com.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class CriarAssinaturaDTO {
    
    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ter formato válido")
    private String email;
    
    @NotBlank(message = "Nome é obrigatório")
    private String nome;
    
    @NotBlank(message = "Senha é obrigatória")
    private String senha;
    
    @NotBlank(message = "Plano é obrigatório")
    @Pattern(regexp = "PESSOAL|PROFISSIONAL|EMPRESARIAL", 
             message = "Plano deve ser um dos valores válidos: PESSOAL, PROFISSIONAL, EMPRESARIAL")
    private String plano;
    
    private String fotoBase64;
    
    private Long usuarioId;
    
    // Construtores
    public CriarAssinaturaDTO() {}
    
    public CriarAssinaturaDTO(String email, String nome, String senha, String plano, String fotoBase64, Long usuarioId) {
        this.email = email;
        this.nome = nome;
        this.senha = senha;
        this.plano = plano;
        this.fotoBase64 = fotoBase64;
        this.usuarioId = usuarioId;
    }
    
    // Getters e Setters
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public String getSenha() {
        return senha;
    }
    
    public void setSenha(String senha) {
        this.senha = senha;
    }
    
    public String getPlano() {
        return plano;
    }
    
    public void setPlano(String plano) {
        this.plano = plano;
    }
    
    public String getFotoBase64() {
        return fotoBase64;
    }
    
    public void setFotoBase64(String fotoBase64) {
        this.fotoBase64 = fotoBase64;
    }
    
    public Long getUsuarioId() {
        return usuarioId;
    }
    
    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }
} 
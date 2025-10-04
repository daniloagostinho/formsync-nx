package br.com.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String nome;
    private String email;
    private String plano;
    
    @JsonProperty("id")
    private Integer id;
    
    public LoginResponseDTO(String token, String nome, String email, String plano, Integer id) {
        this.token = token;
        this.nome = nome;
        this.email = email;
        this.plano = plano;
        this.id = id;
    }
    
    public LoginResponseDTO(String token, String nome, String email, String plano) {
        this.token = token;
        this.nome = nome;
        this.email = email;
        this.plano = plano;
        this.id = null;
    }
} 
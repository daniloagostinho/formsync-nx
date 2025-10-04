package br.com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "codigos_login")
public class CodigoLogin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private Boolean usado = false;

    @Column(name = "expira_em", nullable = false)
    private LocalDateTime expiraEm;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Construtor manual para evitar problemas com Lombok
    public CodigoLogin(Long id, String email, String codigo, Boolean usado, LocalDateTime expiraEm, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.codigo = codigo;
        this.usado = usado;
        this.expiraEm = expiraEm;
        this.createdAt = createdAt;
    }

    // Getters e setters para compatibilidade
    public LocalDateTime getExpiracao() {
        return expiraEm;
    }

    public void setExpiracao(LocalDateTime expiracao) {
        this.expiraEm = expiracao;
    }
}

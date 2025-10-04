package br.com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "configuracoes_notificacao")
public class ConfiguracaoNotificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(nullable = false)
    private Integer diasAntesVencimento = 7;

    @Column(nullable = false)
    private Boolean emailAtivo = true;

    @Column(nullable = false)
    private Boolean pushAtivo = false;

    @Column(nullable = false)
    private Boolean smsAtivo = false;

    @Column(nullable = false)
    private String horarioNotificacao = "09:00";

    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime dataAtualizacao = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.dataAtualizacao = LocalDateTime.now();
    }
}

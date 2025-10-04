package br.com.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "notificacoes_vencimento")
public class NotificacaoVencimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @Column(nullable = false)
    private String tipo; // email, push, sms

    @Column(nullable = false)
    private String status; // pendente, enviada, lida

    @Column(nullable = false)
    private LocalDateTime dataVencimento;

    @Column(nullable = false)
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Column(nullable = false)
    private Boolean lida = false;

    @Column
    private LocalDateTime dataLeitura;

    @PreUpdate
    public void preUpdate() {
        if (this.lida && this.dataLeitura == null) {
            this.dataLeitura = LocalDateTime.now();
        }
    }
}

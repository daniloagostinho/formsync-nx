package br.com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String senha;

    @Column(name = "foto_base64")
    private String fotoBase64;

    @Column(nullable = false)
    private String plano = "PESSOAL";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Campos para LGPD
    @Column(name = "consentimento_lgpd")
    private Boolean consentimentoLGPD = false;

    @Column(name = "data_consentimento")
    private LocalDateTime dataConsentimento;

    @Column(name = "consentimento_marketing")
    private Boolean consentimentoMarketing = false;

    @Column(name = "consentimento_analytics")
    private Boolean consentimentoAnalytics = false;

    @Column(name = "data_exclusao")
    private LocalDateTime dataExclusao;

    @Column(name = "status_exclusao")
    private String statusExclusao = "ATIVO"; // ATIVO, PENDENTE_EXCLUSAO, EXCLUIDO

    @Column(name = "ip_consentimento")
    private String ipConsentimento;

    @Column(name = "user_agent_consentimento")
    private String userAgentConsentimento;
}
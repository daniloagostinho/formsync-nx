package br.com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "preenchimentos_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreenchimentoAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "site")
    private String site;

    @Column(name = "campo_id")
    private Long campoId;

    @Column(name = "data_preenchimento", nullable = false)
    private LocalDateTime dataPreenchimento;

    @Column(name = "tempo_economizado")
    private Integer tempoEconomizado; // em segundos

    @Column(name = "sucesso", nullable = false)
    @Builder.Default
    private Boolean sucesso = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
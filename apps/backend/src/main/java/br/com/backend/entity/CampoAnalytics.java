package br.com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "campos_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampoAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "campo_template_id", nullable = false)
    private Long campoTemplateId;

    @Column(name = "quantidade_usos", nullable = false)
    private Integer quantidadeUsos = 1;

    @Column(name = "ultimo_uso", nullable = false)
    private LocalDateTime ultimoUso = LocalDateTime.now();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
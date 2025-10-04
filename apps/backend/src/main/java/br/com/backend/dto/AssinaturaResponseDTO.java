package br.com.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AssinaturaResponseDTO {
    private Long id;
    private Long usuarioId;
    private String plano;
    private String status;
    private LocalDateTime dataInicio;
    private LocalDateTime dataProximaCobranca;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 
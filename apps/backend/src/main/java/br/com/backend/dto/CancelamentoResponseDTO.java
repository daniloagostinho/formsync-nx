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
public class CancelamentoResponseDTO {
    
    private Long assinaturaId;
    private String status;
    private String motivo;
    private LocalDateTime dataCancelamento;
    private LocalDateTime dataFim;
    private Boolean reembolsoSolicitado;
    private String tipoReembolso;
    private Double valorReembolso;
    private Boolean dentroDoArrependimento;
    private String mensagem;
    private LocalDateTime processadoEm;
} 
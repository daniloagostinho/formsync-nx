package br.com.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssinaturaAdminDTO {
    private Long id;
    private Long usuarioId;
    private String plano;
    private String status;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    private LocalDateTime dataProximaCobranca;
    
    // Campos do Stripe
    private String paymentIntentId;
    private String customerId;
    
    // Campos de reembolso
    private String refundId;
    private String refundStatus;
    private Double refundAmount;
    private LocalDateTime refundProcessedAt;
    
    // Campos de auditoria
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private String cancelledBy;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

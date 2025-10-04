package br.com.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assinaturas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Assinatura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(nullable = false)
    private String plano; // PESSOAL, PROFISSIONAL_MENSAL, PROFISSIONAL_VITALICIO, EMPRESARIAL, GRATIS, etc.

    @Column(nullable = false)
    private String status; // ATIVA, INADIMPLENTE, CANCELADA

    @Column(name = "data_inicio", nullable = false)
    private LocalDateTime dataInicio;

    @Column(name = "data_fim")
    private LocalDateTime dataFim;

    @Column(name = "data_proxima_cobranca")
    private LocalDateTime dataProximaCobranca;

    // ✅ CAMPO VALOR (obrigatório)
    @Column(nullable = false)
    private Double valor; // Valor da assinatura em reais

    @Column(name = "tentativas", nullable = false)
    @Builder.Default
    private int tentativas = 0;

    @Column(name = "ultima_tentativa")
    private LocalDateTime ultimaTentativa;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ✅ CAMPOS PARA INTEGRAÇÃO COM STRIPE
    @Column(name = "payment_intent_id")
    private String paymentIntentId; // ID do PaymentIntent no Stripe

    @Column(name = "customer_id")
    private String customerId; // ID do Customer no Stripe

    @Column(name = "subscription_id")
    private String subscriptionId; // ID da Subscription no Stripe (se aplicável)

    // ✅ CAMPOS PARA REEMBOLSOS
    @Column(name = "refund_id")
    private String refundId; // ID do Refund no Stripe

    @Column(name = "refund_status")
    private String refundStatus; // pending, succeeded, failed, canceled

    @Column(name = "refund_amount")
    private Double refundAmount; // Valor do reembolso em reais

    @Column(name = "refund_reason")
    private String refundReason; // Motivo do reembolso

    @Column(name = "refund_processed_at")
    private LocalDateTime refundProcessedAt; // Data do processamento do reembolso

    // ✅ CAMPOS PARA AUDITORIA
    @Column(name = "cancellation_reason")
    private String cancellationReason; // Motivo do cancelamento

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt; // Data do cancelamento

    @Column(name = "cancelled_by")
    private String cancelledBy; // Quem cancelou (USER, ADMIN, SYSTEM)
}
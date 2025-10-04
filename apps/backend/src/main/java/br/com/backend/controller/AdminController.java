package br.com.backend.controller;

import br.com.backend.dto.AdminDashboardDTO;
import br.com.backend.dto.AssinaturaAdminDTO;
import br.com.backend.entity.Assinatura;
import br.com.backend.service.AssinaturaService;
import br.com.backend.repository.AssinaturaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AssinaturaService assinaturaService;
    private final AssinaturaRepository assinaturaRepository;

    /**
     * Dashboard principal com estatísticas
     */
    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardDTO> getDashboard() {
        log.info("📊 Carregando dashboard admin");

        // Estatísticas gerais
        long totalAssinaturas = assinaturaRepository.count();
        long assinaturasAtivas = assinaturaRepository.findByUsuarioIdAndStatus(null, "ATIVA").size();
        long assinaturasCanceladas = assinaturaRepository.findByUsuarioIdAndStatus(null, "CANCELADA").size();
        
        // Reembolsos
        List<Assinatura> reembolsosPendentes = assinaturaRepository.findByRefundStatus("pending");
        List<Assinatura> reembolsosProcessados = assinaturaRepository.findByRefundStatus("succeeded");
        
        double valorTotalReembolsos = assinaturaRepository.findAssinaturasComReembolso("succeeded")
            .stream()
            .mapToDouble(a -> a.getRefundAmount() != null ? a.getRefundAmount() : 0.0)
            .sum();

        // Cancelamentos recentes (últimos 30 dias)
        LocalDateTime dataLimite = LocalDateTime.now().minusDays(30);
        List<Assinatura> cancelamentosRecentes = assinaturaRepository.findAll()
            .stream()
            .filter(a -> a.getCancelledAt() != null && a.getCancelledAt().isAfter(dataLimite))
            .collect(Collectors.toList());

        AdminDashboardDTO dashboard = AdminDashboardDTO.builder()
            .totalAssinaturas(totalAssinaturas)
            .assinaturasAtivas(assinaturasAtivas)
            .assinaturasCanceladas(assinaturasCanceladas)
            .reembolsosPendentes(reembolsosPendentes.size())
            .reembolsosProcessados(reembolsosProcessados.size())
            .valorTotalReembolsos(valorTotalReembolsos)
            .cancelamentosUltimos30Dias(cancelamentosRecentes.size())
            .build();

        return ResponseEntity.ok(dashboard);
    }

    /**
     * Lista todas as assinaturas com filtros
     */
    @GetMapping("/assinaturas")
    public ResponseEntity<Page<AssinaturaAdminDTO>> getAssinaturas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String plano,
            @RequestParam(required = false) String refundStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim) {

        log.info("📋 Carregando assinaturas - Página: {}, Tamanho: {}", page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // TODO: Implementar filtros customizados
        // Por enquanto, vamos retornar todas as assinaturas
        Page<Assinatura> assinaturas = assinaturaRepository.findAll(pageable);

        Page<AssinaturaAdminDTO> assinaturasDTO = assinaturas.map(this::convertToAdminDTO);

        return ResponseEntity.ok(assinaturasDTO);
    }

    /**
     * Lista reembolsos com filtros
     */
    @GetMapping("/reembolsos")
    public ResponseEntity<List<AssinaturaAdminDTO>> getReembolsos(
            @RequestParam(required = false) String status) {

        log.info("💰 Carregando reembolsos - Status: {}", status);

        List<Assinatura> assinaturas;
        
        if (status != null) {
            assinaturas = assinaturaRepository.findByRefundStatus(status);
        } else {
            assinaturas = assinaturaRepository.findAssinaturasComReembolso(null);
        }

        List<AssinaturaAdminDTO> reembolsos = assinaturas.stream()
            .filter(a -> a.getRefundId() != null)
            .map(this::convertToAdminDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(reembolsos);
    }

    /**
     * Estatísticas de cancelamentos por período
     */
    @GetMapping("/stats/cancelamentos")
    public ResponseEntity<Map<String, Object>> getStatsCancelamentos(
            @RequestParam(required = false, defaultValue = "30") int dias) {

        log.info("📈 Carregando estatísticas de cancelamentos - Últimos {} dias", dias);

        LocalDateTime dataLimite = LocalDateTime.now().minusDays(dias);
        
        List<Assinatura> cancelamentos = assinaturaRepository.findAll()
            .stream()
            .filter(a -> a.getCancelledAt() != null && a.getCancelledAt().isAfter(dataLimite))
            .collect(Collectors.toList());

        // Agrupar por motivo
        Map<String, Long> cancelamentosPorMotivo = cancelamentos.stream()
            .collect(Collectors.groupingBy(
                a -> a.getCancellationReason() != null ? a.getCancellationReason() : "Não informado",
                Collectors.counting()
            ));

        // Agrupar por plano
        Map<String, Long> cancelamentosPorPlano = cancelamentos.stream()
            .collect(Collectors.groupingBy(
                Assinatura::getPlano,
                Collectors.counting()
            ));

        Map<String, Object> stats = Map.of(
            "totalCancelamentos", cancelamentos.size(),
            "cancelamentosPorMotivo", cancelamentosPorMotivo,
            "cancelamentosPorPlano", cancelamentosPorPlano,
            "periodo", dias + " dias"
        );

        return ResponseEntity.ok(stats);
    }

    /**
     * Reprocessar reembolso manualmente
     */
    @PostMapping("/reembolsos/{assinaturaId}/reprocessar")
    public ResponseEntity<String> reprocessarReembolso(@PathVariable Long assinaturaId) {
        log.info("🔄 Reprocessando reembolso para assinatura: {}", assinaturaId);

        // TODO: Implementar lógica de reprocessamento
        // Por enquanto, apenas um placeholder

        return ResponseEntity.ok("Reembolso reprocessado com sucesso");
    }

    /**
     * Converte Assinatura para DTO administrativo
     */
    private AssinaturaAdminDTO convertToAdminDTO(Assinatura assinatura) {
        return AssinaturaAdminDTO.builder()
            .id(assinatura.getId())
            .usuarioId(assinatura.getUsuarioId())
            .plano(assinatura.getPlano())
            .status(assinatura.getStatus())
            .dataInicio(assinatura.getDataInicio())
            .dataFim(assinatura.getDataFim())
            .dataProximaCobranca(assinatura.getDataProximaCobranca())
            .paymentIntentId(assinatura.getPaymentIntentId())
            .customerId(assinatura.getCustomerId())
            .refundId(assinatura.getRefundId())
            .refundStatus(assinatura.getRefundStatus())
            .refundAmount(assinatura.getRefundAmount())
            .refundProcessedAt(assinatura.getRefundProcessedAt())
            .cancellationReason(assinatura.getCancellationReason())
            .cancelledAt(assinatura.getCancelledAt())
            .cancelledBy(assinatura.getCancelledBy())
            .createdAt(assinatura.getCreatedAt())
            .updatedAt(assinatura.getUpdatedAt())
            .build();
    }
}

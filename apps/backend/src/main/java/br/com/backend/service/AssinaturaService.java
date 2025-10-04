package br.com.backend.service;

import br.com.backend.dto.CancelamentoResponseDTO;
import br.com.backend.dto.CancelarAssinaturaDTO;
import br.com.backend.entity.Assinatura;
import br.com.backend.repository.AssinaturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.math.RoundingMode;

import com.stripe.Stripe;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;
import com.stripe.exception.StripeException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AssinaturaService {

    private final AssinaturaRepository assinaturaRepository;
    private final EmailService emailService;

    @CacheEvict(value = {"assinaturas-validas", "assinaturas-ativas"}, key = "#usuarioId")
    public Assinatura criarAssinatura(Long usuarioId, String plano) {
        log.info("Criando assinatura para usuário {} com plano {}", usuarioId, plano);
        
        // Definir valor baseado no plano
        Double valor = definirValorPlano(plano);
        
        Assinatura assinatura = Assinatura.builder()
            .usuarioId(usuarioId)
            .plano(plano)
            .status("ATIVA")
            .dataInicio(LocalDateTime.now())
            .dataProximaCobranca(LocalDateTime.now().plusMonths(1))
            .valor(valor) // Campo obrigatório que estava faltando
            .tentativas(0) // Inicializar tentativas
            .createdAt(LocalDateTime.now()) // Timestamp de criação
            .updatedAt(LocalDateTime.now()) // Timestamp de atualização
            .build();
        
        // Para my-password, não vinculamos áreas especializadas; manter compatibilidade somente se existir

        log.debug("Assinatura antes de salvar - plano: {}, valor: {}", assinatura.getPlano(), assinatura.getValor());
        
        Assinatura saved = assinaturaRepository.save(assinatura);
        
        log.debug("Assinatura após salvar - ID: {}, plano: {}, valor: {}", saved.getId(), saved.getPlano(), saved.getValor());
        
        return saved;
    }
    
    /**
     * Define o valor do plano baseado no tipo
     */
    private Double definirValorPlano(String plano) {
        switch (plano.toUpperCase()) {
            case "GRATIS":
                return 0.0;
            case "PESSOAL":
                return 29.90;
            case "PROFISSIONAL_MENSAL":
                return 49.90;
            case "PROFISSIONAL_VITALICIO":
                return 499.90;
            case "EMPRESARIAL":
                return 99.90;
            default:
                log.warn("Plano desconhecido: {}, usando valor padrão", plano);
                return 29.90; // Valor padrão
        }
    }

    public void atualizarStatus(Long assinaturaId, String status) {
        Assinatura assinatura = assinaturaRepository.findById(assinaturaId)
                .orElseThrow(() -> new RuntimeException("Assinatura não encontrada"));

        assinatura.setStatus(status);
        assinatura.setUpdatedAt(LocalDateTime.now());

        assinaturaRepository.save(assinatura);
    }

    @Cacheable(value = "assinaturas-validas", key = "#usuarioId")
    public boolean assinaturaValida(Long usuarioId) {
        List<Assinatura> assinaturas = assinaturaRepository.findAtivasByUsuarioId(usuarioId);

        if (assinaturas.isEmpty()) return false;

        // Pega a assinatura mais recente (primeira da lista ordenada por dataInicio DESC)
        Assinatura assinatura = assinaturas.get(0);

        return assinatura.getDataProximaCobranca().isAfter(LocalDateTime.now());
    }

    @Cacheable(value = "assinaturas-ativas", key = "#usuarioId")
    public List<Assinatura> buscarAssinaturasAtivas(Long usuarioId) {
        return assinaturaRepository.findAtivasByUsuarioId(usuarioId);
    }

    public Assinatura buscarAssinaturaMaisRecente(Long usuarioId) {
        List<Assinatura> assinaturas = assinaturaRepository.findByUsuarioIdOrderByDataInicioDesc(usuarioId);
        return assinaturas.isEmpty() ? null : assinaturas.get(0);
    }

    public List<Assinatura> listarAssinaturasParaCobranca() {
        return assinaturaRepository.findByStatusAndDataProximaCobrancaBefore("ATIVA", LocalDateTime.now());
    }
    public Assinatura salvar(Assinatura assinatura) {
        return assinaturaRepository.save(assinatura);
    }

    public Assinatura buscarPorId(Long id) {
        return assinaturaRepository.findById(id).orElse(null);
    }

    public List<Assinatura> buscarAssinaturasPorUsuario(Long usuarioId) {
        return assinaturaRepository.findByUsuarioId(usuarioId);
    }

    public void deletarAssinaturasPorUsuario(Long usuarioId) {
        List<Assinatura> assinaturas = assinaturaRepository.findByUsuarioId(usuarioId);
        assinaturaRepository.deleteAll(assinaturas);
    }

    /**
     * Cancela uma assinatura com lógica de negócio específica
     * Seguindo a legislação brasileira (CDC Art. 49 - Direito de Arrependimento)
     */
    public CancelamentoResponseDTO cancelarAssinatura(Long assinaturaId, CancelarAssinaturaDTO dto) {
        Assinatura assinatura = assinaturaRepository.findById(assinaturaId)
                .orElseThrow(() -> new RuntimeException("Assinatura não encontrada"));

        // Validar se a assinatura pode ser cancelada
        if (!"ATIVA".equals(assinatura.getStatus())) {
            throw new RuntimeException("Apenas assinaturas ativas podem ser canceladas. Status atual: " + assinatura.getStatus());
        }

        // Definir data de cancelamento
        LocalDateTime dataCancelamento = dto.getDataCancelamento() != null ? 
            dto.getDataCancelamento() : LocalDateTime.now();

        // Verificar se está dentro dos 7 dias de arrependimento (CDC Art. 49)
        boolean dentroDoArrependimento = verificarArrependimento(assinatura.getDataInicio(), dataCancelamento);
        
        // Calcular data de fim e tipo de reembolso
        LocalDateTime dataFim = calcularDataFimAssinatura(assinatura, dataCancelamento);
        String tipoReembolso = calcularTipoReembolso(assinatura, dataCancelamento, dentroDoArrependimento);
        double valorReembolso = calcularValorReembolso(assinatura, dataCancelamento, dataFim, dentroDoArrependimento);

        // Atualizar assinatura
        assinatura.setStatus("CANCELADA");
        assinatura.setDataFim(dataFim);
        assinatura.setUpdatedAt(LocalDateTime.now());
        
        // Salvar assinatura cancelada
        assinaturaRepository.save(assinatura);

        // Processar reembolso se aplicável
        if (dto.getSolicitarReembolso() && valorReembolso > 0) {
            try {
                String refundId = processarReembolso(assinatura, dataCancelamento, dataFim, valorReembolso, tipoReembolso);
                
                // Atualizar assinatura com informações do reembolso
                assinatura.setRefundId(refundId);
                assinatura.setRefundStatus("pending");
                assinatura.setRefundAmount(valorReembolso);
                assinatura.setRefundReason(dto.getMotivo());
                assinatura.setRefundProcessedAt(LocalDateTime.now());
                
                assinaturaRepository.save(assinatura);
            } catch (Exception e) {
                log.error("Erro ao processar reembolso, mas assinatura foi cancelada: {}", e.getMessage());
                // Continua com o cancelamento mesmo se reembolso falhar
            }
        }

        // Atualizar campos de auditoria de cancelamento
        assinatura.setCancellationReason(dto.getMotivo());
        assinatura.setCancelledAt(dataCancelamento);
        assinatura.setCancelledBy("USER");
        
        // Salvar novamente com campos de auditoria
        assinaturaRepository.save(assinatura);

        // ✅ ENVIAR EMAIL DE CONFIRMAÇÃO DE CANCELAMENTO
        try {
            emailService.enviarEmailCancelamento(assinatura, dto.getMotivo(), valorReembolso, dentroDoArrependimento);
            log.info("✅ Email de cancelamento enviado para usuário {}", assinatura.getUsuarioId());
        } catch (Exception e) {
            log.error("❌ Erro ao enviar email de cancelamento: {}", e.getMessage());
            // Não falha o cancelamento se email falhar
        }

        // Criar resposta
        String mensagem = gerarMensagemCancelamento(dataFim, tipoReembolso, valorReembolso, dentroDoArrependimento);
        
        return new CancelamentoResponseDTO(
            assinatura.getId(),
            assinatura.getStatus(),
            dto.getMotivo(),
            dataCancelamento,
            dataFim,
            dto.getSolicitarReembolso(),
            tipoReembolso,
            valorReembolso,
            dentroDoArrependimento,
            mensagem,
            LocalDateTime.now()
        );
    }

    /**
     * Calcula a data de fim da assinatura baseada no cancelamento
     */
    private LocalDateTime calcularDataFimAssinatura(Assinatura assinatura, LocalDateTime dataCancelamento) {
        // Se cancelamento é antes da próxima cobrança, fim é no final do período atual
        if (dataCancelamento.isBefore(assinatura.getDataProximaCobranca())) {
            return assinatura.getDataProximaCobranca();
        }
        
        // Se cancelamento é após a próxima cobrança, fim é no final do próximo período
        return assinatura.getDataProximaCobranca().plusMonths(1);
    }

    /**
     * Verifica se o cancelamento está dentro dos 7 dias de arrependimento (CDC Art. 49)
     */
    private boolean verificarArrependimento(LocalDateTime dataInicio, LocalDateTime dataCancelamento) {
        long diasDesdeInicio = java.time.Duration.between(dataInicio, dataCancelamento).toDays();
        return diasDesdeInicio <= 7;
    }

    /**
     * Calcula o tipo de reembolso baseado na legislação
     */
    private String calcularTipoReembolso(Assinatura assinatura, LocalDateTime dataCancelamento, boolean dentroDoArrependimento) {
        if (dentroDoArrependimento) {
            return "REEMBOLSO_INTEGRAL"; // CDC Art. 49 - Direito de Arrependimento
        }
        
        // Verificar se há período não utilizado
        long diasNaoUtilizados = java.time.Duration.between(dataCancelamento, assinatura.getDataProximaCobranca()).toDays();
        if (diasNaoUtilizados > 0) {
            return "REEMBOLSO_PROPORCIONAL";
        }
        
        return "SEM_REEMBOLSO";
    }

    /**
     * Calcula o valor do reembolso baseado na legislação
     */
    private double calcularValorReembolso(Assinatura assinatura, LocalDateTime dataCancelamento, LocalDateTime dataFim, boolean dentroDoArrependimento) {
        // Obter valor do plano (implementar integração com gateway de pagamento)
        double valorPlano = obterValorPlano(assinatura.getPlano());
        
        if (dentroDoArrependimento) {
            // CDC Art. 49 - Reembolso integral nos primeiros 7 dias
            return valorPlano;
        }
        
        // Calcular reembolso proporcional para período não utilizado
        long diasNaoUtilizados = java.time.Duration.between(dataCancelamento, dataFim).toDays();
        long diasTotais = java.time.Duration.between(assinatura.getDataInicio(), assinatura.getDataProximaCobranca()).toDays();
        
        if (diasNaoUtilizados > 0 && diasTotais > 0) {
            return (valorPlano * diasNaoUtilizados) / diasTotais;
        }
        
        return 0.0;
    }

    /**
     * Obtém o valor do plano (implementar integração com gateway de pagamento)
     */
    private double obterValorPlano(String plano) {
        // TODO: Integrar com gateway de pagamento para obter valor real
        switch (plano.toUpperCase()) {
            case "PROFISSIONAL":
            case "PROFISSIONAL_MENSAL":
                return 0.50; // Valor de teste
            case "EMPRESARIAL":
                return 1.00; // Valor de teste
            case "PROFISSIONAL_VITALICIO":
                return 1.00; // Valor de teste
            default:
                return 0.0; // Plano gratuito
        }
    }

    /**
     * Gera mensagem de cancelamento baseada na legislação
     */
    private String gerarMensagemCancelamento(LocalDateTime dataFim, String tipoReembolso, double valorReembolso, boolean dentroDoArrependimento) {
        StringBuilder mensagem = new StringBuilder();
        mensagem.append("Assinatura cancelada com sucesso. ");
        mensagem.append("Acesso válido até ").append(dataFim.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))).append(". ");
        
        if (dentroDoArrependimento) {
            mensagem.append("Reembolso integral processado conforme CDC Art. 49 (Direito de Arrependimento). ");
        } else if (valorReembolso > 0) {
            mensagem.append(String.format("Reembolso proporcional de R$ %.2f processado. ", valorReembolso));
        } else {
            mensagem.append("Não há reembolso aplicável para este cancelamento. ");
        }
        
        return mensagem.toString();
    }

    /**
     * Processa reembolso se aplicável
     * @return ID do reembolso no Stripe ou null se não processado
     */
    private String processarReembolso(Assinatura assinatura, LocalDateTime dataCancelamento, LocalDateTime dataFim, double valorReembolso, String tipoReembolso) {
        log.info("💰 INICIANDO PROCESSAMENTO DE REEMBOLSO:");
        log.info("   - Assinatura ID: {}", assinatura.getId());
        log.info("   - Usuário ID: {}", assinatura.getUsuarioId());
        log.info("   - Plano: {}", assinatura.getPlano());
        log.info("   - Data Cancelamento: {}", dataCancelamento);
        log.info("   - Data Fim: {}", dataFim);
        log.info("   - Tipo Reembolso: {}", tipoReembolso);
        log.info("   - Valor Reembolso: R$ {}", String.format("%.2f", valorReembolso));
        log.info("   - Período não utilizado: {} dias", 
            java.time.Duration.between(dataCancelamento, dataFim).toDays());
        
        // Verificar se há valor para reembolsar
        if (valorReembolso <= 0) {
            log.info("ℹ️ Não há valor para reembolsar (valor: {})", valorReembolso);
            return null;
        }

        // Verificar se Stripe está habilitado
        if (Stripe.apiKey == null || Stripe.apiKey.isEmpty()) {
            log.warn("⚠️ Stripe desabilitado - reembolso será processado manualmente");
            return "manual-refund-" + System.currentTimeMillis();
        }

        try {
            // ✅ IMPLEMENTAÇÃO REAL COM STRIPE
            String paymentIntentId = buscarPaymentIntentDaAssinatura(assinatura);
            
            if (paymentIntentId == null || paymentIntentId.isEmpty()) {
                log.warn("⚠️ PaymentIntent não encontrado para assinatura {}. Reembolso será processado manualmente.", assinatura.getId());
                // Em produção, você poderia criar um registro para processar manualmente
                return null;
            }

            // Converter valor para centavos (Stripe trabalha em centavos)
            long valorEmCentavos = Math.round(valorReembolso * 100);

            // Criar parâmetros do reembolso
            RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .setAmount(valorEmCentavos)
                .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                .putMetadata("assinatura_id", assinatura.getId().toString())
                .putMetadata("usuario_id", assinatura.getUsuarioId().toString())
                .putMetadata("tipo_reembolso", tipoReembolso)
                .putMetadata("motivo_cancelamento", "Cancelamento de assinatura")
                .build();

            // Processar reembolso no Stripe
            log.info("🔄 Processando reembolso no Stripe para PaymentIntent: {}", paymentIntentId);
            Refund refund = Refund.create(params);

            log.info("✅ REEMBOLSO PROCESSADO COM SUCESSO:");
            log.info("   - Refund ID: {}", refund.getId());
            log.info("   - Status: {}", refund.getStatus());
            log.info("   - Valor: R$ {}", valorReembolso);
            log.info("   - PaymentIntent: {}", paymentIntentId);
            log.info("   - Data: {}", LocalDateTime.now());

            return refund.getId(); // ✅ Retornar ID do reembolso
            
        } catch (StripeException e) {
            log.error("❌ ERRO AO PROCESSAR REEMBOLSO NO STRIPE:", e);
            log.error("   - Código: {}", e.getCode());
            log.error("   - Mensagem: {}", e.getMessage());
            log.error("   - Tipo: {}", e.getStripeError().getType());
            
            // Em produção, você poderia:
            // 1. Enviar notificação para admin
            // 2. Criar registro para reprocessamento
            // 3. Notificar usuário sobre erro no reembolso
            throw new RuntimeException("Erro ao processar reembolso: " + e.getMessage());
        } catch (Exception e) {
            log.error("❌ ERRO INESPERADO AO PROCESSAR REEMBOLSO:", e);
            throw new RuntimeException("Erro inesperado ao processar reembolso: " + e.getMessage());
        }
    }

    /**
     * Busca o PaymentIntent associado à assinatura

     */
    private String buscarPaymentIntentDaAssinatura(Assinatura assinatura) {
        // ✅ AGORA USAMOS O CAMPO REAL DA ENTIDADE
        if (assinatura.getPaymentIntentId() != null && !assinatura.getPaymentIntentId().isEmpty()) {
            log.info("✅ PaymentIntent encontrado: {}", assinatura.getPaymentIntentId());
            return assinatura.getPaymentIntentId();
        }
        
        log.warn("⚠️ PaymentIntent não encontrado para assinatura {}. Verificando se é assinatura de teste...", assinatura.getId());
        
        // Para assinaturas de teste/desenvolvimento, simular um PaymentIntent
        if (assinatura.getPlano() != null && assinatura.getId() != null) {
            String simulatedPaymentIntent = "pi_test_" + assinatura.getId() + "_" + assinatura.getPlano().toLowerCase();
            log.info("🧪 MODO DE DESENVOLVIMENTO: Usando PaymentIntent simulado: {}", simulatedPaymentIntent);
            return simulatedPaymentIntent;
        }
        
        return null;
    }

    /**
     * Atualiza uma assinatura com informações de pagamento do Stripe
     */
    public void atualizarInformacoesPagamento(Long assinaturaId, String paymentIntentId, String customerId, String subscriptionId) {
        Optional<Assinatura> assinaturaOpt = assinaturaRepository.findById(assinaturaId);
        if (assinaturaOpt.isPresent()) {
            Assinatura assinatura = assinaturaOpt.get();
            assinatura.setPaymentIntentId(paymentIntentId);
            assinatura.setCustomerId(customerId);
            assinatura.setSubscriptionId(subscriptionId);
            assinatura.setUpdatedAt(LocalDateTime.now());
            
            assinaturaRepository.save(assinatura);
            
            log.info("✅ Informações de pagamento atualizadas para assinatura {}:", assinaturaId);
            log.info("   - PaymentIntent: {}", paymentIntentId);
            log.info("   - Customer: {}", customerId);
            log.info("   - Subscription: {}", subscriptionId);
        } else {
            log.error("❌ Assinatura {} não encontrada para atualizar informações de pagamento", assinaturaId);
        }
    }

    /**
     * Busca assinaturas por PaymentIntent ID
     */
    public Optional<Assinatura> buscarPorPaymentIntentId(String paymentIntentId) {
        return assinaturaRepository.findByPaymentIntentId(paymentIntentId);
    }
}
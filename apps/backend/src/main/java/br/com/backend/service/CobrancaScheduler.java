package br.com.backend.service;

import br.com.backend.entity.Assinatura;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CobrancaScheduler {

    private final AssinaturaService assinaturaService;
    private final PagamentoService pagamentoService;

    @Scheduled(cron = "0 02 23 * * *") // Executa às 23:02:00 todos os dias
    public void processarCobrancas() {
        log.info("Iniciando processamento de cobranças agendadas");
        List<Assinatura> assinaturas = assinaturaService.listarAssinaturasParaCobranca();
        log.info("Encontradas {} assinaturas para cobrança", assinaturas.size());

        for (Assinatura assinatura : assinaturas) {
            // Limite de tentativas de retry
            int limiteTentativas = 3;
            if (assinatura.getTentativas() >= limiteTentativas) {
                assinatura.setStatus("INADIMPLENTE");
                assinaturaService.salvar(assinatura);
                log.warn("Assinatura {} marcada como inadimplente após {} tentativas", assinatura.getId(), assinatura.getTentativas());
                continue;
            }

            boolean sucesso = pagamentoService.cobrarUsuario(assinatura.getUsuarioId(), assinatura.getPlano());
            assinatura.setUltimaTentativa(java.time.LocalDateTime.now());
            assinatura.setTentativas(assinatura.getTentativas() + 1);

            if (sucesso) {
                assinatura.setDataProximaCobranca(assinatura.getDataProximaCobranca().plusMonths(1));
                assinatura.setTentativas(0); // Reset tentativas
                assinatura.setStatus("ATIVA");
                assinaturaService.salvar(assinatura);
                log.info("Cobrança processada com sucesso para assinatura {}", assinatura.getId());
            } else {
                if (assinatura.getTentativas() >= limiteTentativas) {
                    assinatura.setStatus("INADIMPLENTE");
                    log.warn("Assinatura {} marcada como inadimplente após {} tentativas", assinatura.getId(), assinatura.getTentativas());
                }
                assinaturaService.salvar(assinatura);
                log.warn("Falha na cobrança da assinatura {}, tentativa {}/{}", assinatura.getId(), assinatura.getTentativas(), limiteTentativas);
            }
        }
        log.info("Processamento de cobranças concluído");
    }
}
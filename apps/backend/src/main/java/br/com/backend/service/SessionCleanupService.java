package br.com.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import br.com.backend.service.SessionControlService;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionCleanupService {

    private final SessionControlService sessionControlService;

    /**
     * Executa limpeza automática de tokens revogados a cada hora
     */
    @Scheduled(fixedRate = 3600000) // 1 hora = 3.600.000 ms
    public void cleanupExpiredTokens() {
        log.info("🧹 Iniciando limpeza automática de tokens revogados...");
        
        try {
            sessionControlService.cleanupExpiredRevokedTokens();
            log.info("✅ Limpeza automática de tokens concluída com sucesso");
        } catch (Exception e) {
            log.error("❌ Erro durante limpeza automática de tokens: {}", e.getMessage());
            // Log the full stack trace for debugging but don't break the application
            log.debug("Stack trace completo:", e);
            
            // Se for erro de conexão, aguardar um pouco antes de tentar novamente
            if (e.getMessage() != null && e.getMessage().contains("JDBC Connection")) {
                log.warn("⚠️ Erro de conexão JDBC detectado. Aguardando 30s antes de próxima tentativa...");
                try {
                    Thread.sleep(30000); // 30 segundos
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    /**
     * Executa limpeza de tokens revogados a cada 6 horas (mais agressiva)
     */
    @Scheduled(fixedRate = 21600000) // 6 horas = 21.600.000 ms
    public void aggressiveCleanup() {
        log.info("🧹 Iniciando limpeza agressiva de tokens revogados...");
        
        try {
            sessionControlService.cleanupExpiredRevokedTokens();
            log.info("✅ Limpeza agressiva de tokens concluída com sucesso");
        } catch (Exception e) {
            log.error("❌ Erro durante limpeza agressiva de tokens: {}", e.getMessage());
            // Log the full stack trace for debugging but don't break the application
            log.debug("Stack trace completo:", e);
            
            // Se for erro de conexão, aguardar um pouco antes de tentar novamente
            if (e.getMessage() != null && e.getMessage().contains("JDBC Connection")) {
                log.warn("⚠️ Erro de conexão JDBC detectado na limpeza agressiva. Aguardando 30s...");
                try {
                    Thread.sleep(30000); // 30 segundos
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }
}

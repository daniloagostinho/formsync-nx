package br.com.backend.service;

import br.com.backend.dto.FileSecurityResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class SecurityNotificationService {

    @Value("${app.security.file.notification.enabled:true}")
    private boolean notificationEnabled;

    @Value("${app.security.file.notification.notify-admin-on-quarantine:true}")
    private boolean notifyAdminOnQuarantine;

    @Value("${app.security.file.notification.notify-user-on-rejection:true}")
    private boolean notifyUserOnRejection;

    /**
     * Notifica sobre arquivo rejeitado por segurança
     */
    public void notifyFileRejected(FileSecurityResult result, String userEmail) {
        if (!notificationEnabled || !notifyUserOnRejection) {
            return;
        }

        log.warn("🚫 NOTIFICAÇÃO: Arquivo rejeitado por segurança - Usuário: {}, Arquivo: {}, Motivo: {}", 
            userEmail, result.getFileName(), result.getMessage());

        // Em produção, implementar:
        // 1. Email para o usuário
        // 2. SMS (se configurado)
        // 3. Notificação push
        // 4. Log em sistema de monitoramento
    }

    /**
     * Notifica sobre arquivo colocado em quarentena
     */
    public void notifyFileQuarantined(FileSecurityResult result, String userEmail) {
        if (!notificationEnabled || !notifyAdminOnQuarantine) {
            return;
        }

        log.warn("🚫 NOTIFICAÇÃO: Arquivo colocado em quarentena - Usuário: {}, Arquivo: {}, Caminho: {}", 
            userEmail, result.getFileName(), result.getQuarantinePath());

        // Em produção, implementar:
        // 1. Email para administradores
        // 2. Alertas em sistema de monitoramento
        // 3. Dashboard de segurança
        // 4. Integração com SIEM
    }

    /**
     * Notifica sobre tentativa de upload malicioso
     */
    public void notifyMaliciousUploadAttempt(FileSecurityResult result, String userEmail, String userIp) {
        if (!notificationEnabled) {
            return;
        }

        log.error("🚨 ALERTA DE SEGURANÇA: Tentativa de upload malicioso - Usuário: {}, IP: {}, Arquivo: {}, Problema: {}", 
            userEmail, userIp, result.getFileName(), result.getSecurityIssues());

        // Em produção, implementar:
        // 1. Alerta imediato para equipe de segurança
        // 2. Bloqueio temporário do usuário/IP
        // 3. Análise forense
        // 4. Relatório para compliance
    }

    /**
     * Notifica sobre scan de malware concluído
     */
    public void notifyMalwareScanCompleted(FileSecurityResult result, String userEmail, long scanDuration) {
        if (!notificationEnabled) {
            return;
        }

        if (result.isSecure()) {
            log.info("✅ NOTIFICAÇÃO: Scan de malware concluído - Usuário: {}, Arquivo: {}, Duração: {}ms", 
                userEmail, result.getFileName(), scanDuration);
        } else {
            log.warn("⚠️ NOTIFICAÇÃO: Scan de malware detectou problema - Usuário: {}, Arquivo: {}, Problema: {}", 
                userEmail, result.getFileName(), result.getMessage());
        }
    }

    /**
     * Gera relatório de segurança
     */
    public String generateSecurityReport(FileSecurityResult result) {
        StringBuilder report = new StringBuilder();
        report.append("=== RELATÓRIO DE SEGURANÇA DE ARQUIVO ===\n");
        report.append("Data/Hora: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"))).append("\n");
        report.append("Arquivo: ").append(result.getFileName()).append("\n");
        report.append("Tamanho: ").append(result.getFileSize()).append(" bytes\n");
        report.append("Status: ").append(result.isSecure() ? "SEGURO" : "REJEITADO").append("\n");
        report.append("Mensagem: ").append(result.getMessage()).append("\n");
        
        if (result.getSecurityIssues() != null) {
            report.append("Problemas de Segurança: ").append(result.getSecurityIssues()).append("\n");
        }
        
        if (result.isQuarantined()) {
            report.append("Quarentenado: SIM\n");
            report.append("Caminho da Quarentena: ").append(result.getQuarantinePath()).append("\n");
        }
        
        if (result.getError() != null) {
            report.append("Erro: ").append(result.getError()).append("\n");
        }
        
        report.append("==========================================\n");
        
        return report.toString();
    }

    /**
     * Notifica sobre atualização de definições de vírus
     */
    public void notifyVirusDefinitionsUpdated(String version, LocalDateTime updateTime) {
        if (!notificationEnabled) {
            return;
        }

        log.info("🔄 NOTIFICAÇÃO: Definições de vírus atualizadas - Versão: {}, Data: {}", 
            version, updateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")));

        // Em produção, implementar:
        // 1. Notificação para administradores
        // 2. Log de auditoria
        // 3. Métricas de atualização
    }

    /**
     * Notifica sobre falha no sistema de segurança
     */
    public void notifySecuritySystemFailure(String error, String component) {
        if (!notificationEnabled) {
            return;
        }

        log.error("💥 ALERTA CRÍTICO: Falha no sistema de segurança - Componente: {}, Erro: {}", 
            component, error);

        // Em produção, implementar:
        // 1. Alerta crítico para equipe de segurança
        // 2. Escalação automática
        // 3. Fallback para modo de segurança
        // 4. Notificação para stakeholders
    }
}

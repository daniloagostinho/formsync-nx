package br.com.backend.service;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
@Slf4j
public class LogService {
    
    private static final String LOG_DIR = "logs";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss.SSS");
    
    // Cache para sessões de pagamento
    private final Map<String, PaymentSession> paymentSessions = new ConcurrentHashMap<>();
    
    @Data
    public static class PaymentSession {
        public String sessionId;
        public String email;
        public String plano;
        public LocalDateTime createdAt;
        public String status;
        public String webhookStatus;
        public String userCreated;
        public String errorMessage;
        
        public PaymentSession(String sessionId, String email, String plano) {
            this.sessionId = sessionId;
            this.email = email;
            this.plano = plano;
            this.createdAt = LocalDateTime.now();
            this.status = "CREATED";
        }
    }
    
    public void logCheckoutCreated(String sessionId, String email, String plano) {
        PaymentSession session = new PaymentSession(sessionId, email, plano);
        paymentSessions.put(sessionId, session);
        
        String logMessage = String.format("[CHECKOUT_CREATED] Session: %s | Email: %s | Plano: %s | Time: %s",
                sessionId, email, plano, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("checkout.log", logMessage);
        log.info("🔔 {}", logMessage);
    }
    
    public void logWebhookReceived(String sessionId, String eventType, String payload) {
        PaymentSession session = paymentSessions.get(sessionId);
        if (session != null) {
            session.webhookStatus = "RECEIVED";
        }
        
        String logMessage = String.format("[WEBHOOK_RECEIVED] Session: %s | Event: %s | Time: %s",
                sessionId, eventType, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("webhook.log", logMessage);
        writeToFile("webhook_payload.log", String.format("[%s] %s: %s", 
                LocalDateTime.now().format(TIME_FORMATTER), sessionId, payload));
        log.info("🔔 {}", logMessage);
    }
    
    public void logUserCreated(String sessionId, Long userId, String email, String plano) {
        PaymentSession session = paymentSessions.get(sessionId);
        if (session != null) {
            session.userCreated = "YES";
            session.status = "USER_CREATED";
        }
        
        String logMessage = String.format("[USER_CREATED] Session: %s | UserID: %d | Email: %s | Plano: %s | Time: %s",
                sessionId, userId, email, plano, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("user_creation.log", logMessage);
        log.info("✅ {}", logMessage);
    }
    
    public void logUserCreationFailed(String sessionId, String email, String error) {
        PaymentSession session = paymentSessions.get(sessionId);
        if (session != null) {
            session.userCreated = "NO";
            session.errorMessage = error;
            session.status = "USER_CREATION_FAILED";
        }
        
        String logMessage = String.format("[USER_CREATION_FAILED] Session: %s | Email: %s | Error: %s | Time: %s",
                sessionId, email, error, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("user_creation.log", logMessage);
        writeToFile("errors.log", logMessage);
        log.error("❌ {}", logMessage);
    }
    
    public void logAssinaturaCreated(String sessionId, Long assinaturaId, Long userId, String plano) {
        String logMessage = String.format("[ASSINATURA_CREATED] Session: %s | AssinaturaID: %d | UserID: %d | Plano: %s | Time: %s",
                sessionId, assinaturaId, userId, plano, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("assinatura.log", logMessage);
        log.info("✅ {}", logMessage);
    }
    
    public void logWebhookProcessed(String sessionId, String eventType, boolean success) {
        PaymentSession session = paymentSessions.get(sessionId);
        if (session != null) {
            session.webhookStatus = success ? "PROCESSED_SUCCESS" : "PROCESSED_FAILED";
        }
        
        String logMessage = String.format("[WEBHOOK_PROCESSED] Session: %s | Event: %s | Success: %s | Time: %s",
                sessionId, eventType, success, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("webhook.log", logMessage);
        log.info(success ? "✅ {}" : "❌ {}", logMessage);
    }
    
    public void logLoginAttempt(String email, boolean success, String error) {
        String logMessage = String.format("[LOGIN_ATTEMPT] Email: %s | Success: %s | Error: %s | Time: %s",
                email, success, error != null ? error : "N/A", LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("login.log", logMessage);
        log.info(success ? "🔑 {}" : "❌ {}", logMessage);
    }

    public void logSessionRevoked(String email, String reason) {
        String logMessage = String.format("[SESSION_REVOKED] Email: %s | Reason: %s | Time: %s",
                email, reason, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("session.log", logMessage);
        log.info("🚫 {}", logMessage);
    }

    public void logNewSession(String email, String sessionType) {
        String logMessage = String.format("[NEW_SESSION] Email: %s | Type: %s | Time: %s",
                email, sessionType, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("session.log", logMessage);
        log.info("✅ {}", logMessage);
    }
    
    public void logCodeSent(String email, String code) {
        String logMessage = String.format("[CODE_SENT] Email: %s | Code: %s | Time: %s",
                email, code, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("login_codes.log", logMessage);
        log.info("📧 {}", logMessage);
    }
    
    public void logCodeVerified(String email, boolean success, String error) {
        String logMessage = String.format("[CODE_VERIFIED] Email: %s | Success: %s | Error: %s | Time: %s",
                email, success, error != null ? error : "N/A", LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("login.log", logMessage);
        log.info(success ? "✅ {}" : "❌ {}", logMessage);
    }
    
    public void logError(String context, String error, String details) {
        String logMessage = String.format("[ERROR] Context: %s | Error: %s | Details: %s | Time: %s",
                context, error, details, LocalDateTime.now().format(TIME_FORMATTER));
        
        writeToFile("errors.log", logMessage);
        log.error("❌ {}", logMessage);
    }
    
    public void generateSessionReport(String sessionId) {
        PaymentSession session = paymentSessions.get(sessionId);
        if (session != null) {
            String report = String.format(
                "=== SESSION REPORT ===\n" +
                "Session ID: %s\n" +
                "Email: %s\n" +
                "Plano: %s\n" +
                "Created: %s\n" +
                "Status: %s\n" +
                "Webhook Status: %s\n" +
                "User Created: %s\n" +
                "Error: %s\n" +
                "===================",
                session.sessionId,
                session.email,
                session.plano,
                session.createdAt.format(TIME_FORMATTER),
                session.status,
                session.webhookStatus != null ? session.webhookStatus : "N/A",
                session.userCreated != null ? session.userCreated : "N/A",
                session.errorMessage != null ? session.errorMessage : "N/A"
            );
            
            writeToFile("session_reports.log", report);
            log.info("📊 Session Report generated for: {}", sessionId);
        }
    }
    
    public void generateDailyReport() {
        String today = LocalDateTime.now().format(DATE_FORMATTER);
        String report = String.format(
            "=== DAILY REPORT - %s ===\n" +
            "Total Sessions: %d\n" +
            "Successful Users: %d\n" +
            "Failed Users: %d\n" +
            "===================",
            today,
            paymentSessions.size(),
            paymentSessions.values().stream().filter(s -> "YES".equals(s.userCreated)).count(),
            paymentSessions.values().stream().filter(s -> "NO".equals(s.userCreated)).count()
        );
        
        writeToFile("daily_reports.log", report);
        log.info("📊 Daily Report generated for: {}", today);
    }
    
    private void writeToFile(String filename, String message) {
        try {
            // Criar diretório de logs se não existir
            java.io.File logDir = new java.io.File(LOG_DIR);
            if (!logDir.exists()) {
                logDir.mkdirs();
            }
            
            String filepath = LOG_DIR + "/" + filename;
            try (PrintWriter writer = new PrintWriter(new FileWriter(filepath, true))) {
                writer.println("[" + LocalDateTime.now().format(TIME_FORMATTER) + "] " + message);
            }
        } catch (IOException e) {
            log.error("Erro ao escrever log: {}", e.getMessage());
        }
    }
    
    public Map<String, PaymentSession> getAllSessions() {
        return new ConcurrentHashMap<>(paymentSessions);
    }
    
    public PaymentSession getSession(String sessionId) {
        return paymentSessions.get(sessionId);
    }
} 
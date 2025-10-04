package br.com.backend.service;

import br.com.backend.entity.UserSession;
import br.com.backend.repository.UserSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Primary
@Slf4j
@RequiredArgsConstructor
public class DatabaseSessionStorageService implements SessionStorageService {
    
    private final UserSessionRepository userSessionRepository;
    private final LogService logService;
    
    @Override
    @Transactional
    public void registerActiveToken(String email, String token) {
        try {
            // Usar uma abordagem mais robusta: deletar e flush antes de inserir
            userSessionRepository.deleteByEmail(email);
            userSessionRepository.flush(); // Força o commit da deleção
            
            log.info("🗑️ Sessões existentes removidas para usuário: {}", email);

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime expiresAt = now.plusHours(10); // 10 horas

            // Criar nova sessão
            UserSession userSession = new UserSession(email, token, now, expiresAt);
            userSessionRepository.save(userSession);
            
            log.info("✅ Token registrado no banco para usuário: {} - Expira em: {}", email, expiresAt);
            logService.logNewSession(email, "Login realizado");

        } catch (Exception e) {
            log.error("❌ Erro ao registrar token no banco para usuário: {} - {}", email, e.getMessage());
            throw new RuntimeException("Falha ao registrar sessão", e);
        }
    }
    
    @Override
    public boolean isTokenActive(String token) {
        try {
            int count = userSessionRepository.countActiveSessionsByToken(token, LocalDateTime.now());
            boolean isActive = count > 0;
            
            if (!isActive) {
                log.debug("🚫 Token não ativo no banco: {}", token.substring(0, Math.min(20, token.length())) + "...");
            }
            
            return isActive;
            
        } catch (Exception e) {
            log.error("❌ Erro ao verificar token no banco: {}", e.getMessage());
            return false;
        }
    }
    
    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public void revokeToken(String token) {
        try {
            List<UserSession> sessions = userSessionRepository.findActiveSessionsByEmail(
                userSessionRepository.findActiveSessionByToken(token, LocalDateTime.now())
                    .map(UserSession::getEmail)
                    .orElse("")
            );
            
            for (UserSession session : sessions) {
                if (session.getToken().equals(token)) {
                    session.setIsActive(false);
                    session.setRevokedAt(LocalDateTime.now());
                    userSessionRepository.save(session);
                    log.info("🚫 Token revogado no banco: {}", 
                            token.substring(0, Math.min(20, token.length())) + "...");
                    return;
                }
            }
            
            log.warn("⚠️ Token não encontrado para revogação: {}", 
                    token.substring(0, Math.min(20, token.length())) + "...");
            
        } catch (Exception e) {
            log.error("❌ Erro ao revogar token no banco: {}", e.getMessage());
            // Não re-throw para evitar quebrar o logout
            // O logout deve funcionar mesmo se a revogação falhar
        }
    }
    
    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public void revokeAllUserTokens(String email) {
        try {
            // Buscar e deletar todas as sessões ativas do usuário
            List<UserSession> activeSessions = userSessionRepository.findActiveSessionsByEmail(email);
            
            if (!activeSessions.isEmpty()) {
                userSessionRepository.deleteAll(activeSessions);
                log.info("🚫 {} tokens removidos do banco para usuário: {}", activeSessions.size(), email);
                try {
                    logService.logSessionRevoked(email, "Logout realizado");
                } catch (Exception logError) {
                    log.warn("⚠️ Erro ao registrar log de revogação, mas logout continuará: {}", logError.getMessage());
                }
            }
            
        } catch (Exception e) {
            log.error("❌ Erro ao revogar tokens no banco para usuário: {} - {}", email, e.getMessage());
            // Não re-throw para evitar quebrar o logout
        }
    }
    
    @Override
    public String getActiveToken(String email) {
        try {
            List<UserSession> sessions = userSessionRepository.findActiveSessionsByEmail(email);
            String token = sessions.isEmpty() ? null : sessions.get(0).getToken();
            
            log.debug("🔍 Token ativo encontrado no banco para usuário: {} - Existe: {}", email, token != null);
            return token;
            
        } catch (Exception e) {
            log.debug("🔍 Nenhum token ativo encontrado no banco para usuário: {}", email);
            return null;
        }
    }
    
    @Override
    public boolean hasActiveSession(String email) {
        try {
            int count = userSessionRepository.countActiveSessionsByEmail(email);
            boolean hasSession = count > 0;
            
            log.debug("🔍 Usuário {} tem sessão ativa no banco: {}", email, hasSession);
            return hasSession;
            
        } catch (Exception e) {
            log.error("❌ Erro ao verificar sessão no banco para usuário: {} - {}", email, e.getMessage());
            return false;
        }
    }
    
    @Override
    public Map<String, Object> getSessionStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Sessões ativas
            int activeSessions = userSessionRepository.countActiveSessionsByEmail("") + 
                userSessionRepository.countActiveSessionsByToken("", LocalDateTime.now());
            
            // Tokens revogados
            long totalSessions = userSessionRepository.count();
            int revokedTokens = (int) (totalSessions - activeSessions);
            
            // Usuários únicos com sessões ativas
            List<UserSession> activeSessionsList = userSessionRepository.findAll().stream()
                .filter(session -> session.getIsActive() && session.getExpiresAt().isAfter(LocalDateTime.now()))
                .toList();
            
            List<String> activeUsers = activeSessionsList.stream()
                .map(UserSession::getEmail)
                .distinct()
                .toList();
            
            stats.put("activeSessions", activeSessions);
            stats.put("revokedTokens", revokedTokens);
            stats.put("totalTokens", (int) totalSessions);
            stats.put("activeUsers", activeUsers);
            stats.put("storageType", "DATABASE");
            stats.put("lastUpdate", LocalDateTime.now().toString());
            
            log.debug("📊 Estatísticas de sessão do banco: {}", stats);
            return stats;
            
        } catch (Exception e) {
            log.error("❌ Erro ao obter estatísticas do banco: {}", e.getMessage());
            return Map.of("error", e.getMessage(), "storageType", "DATABASE");
        }
    }
    
    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public void cleanupExpiredTokens() {
        try {
            int updated = userSessionRepository.revokeExpiredSessions(LocalDateTime.now());
            log.info("🧹 Limpeza de tokens expirados concluída. {} sessões expiradas", updated);
            
        } catch (Exception e) {
            log.error("❌ Erro ao limpar tokens expirados: {}", e.getMessage());
            // Don't rethrow - this is a cleanup task that shouldn't break the application
        }
    }
    
    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public void forceLogoutAllUsers() {
        try {
            log.warn("🚨 FORÇANDO LOGOUT DE TODOS OS USUÁRIOS NO BANCO - AÇÃO DE EMERGÊNCIA");
            
            List<UserSession> activeSessions = userSessionRepository.findAll().stream()
                .filter(session -> session.getIsActive())
                .toList();
            
            for (UserSession session : activeSessions) {
                session.setIsActive(false);
                session.setRevokedAt(LocalDateTime.now());
            }
            
            userSessionRepository.saveAll(activeSessions);
            log.warn("🚨 Logout forçado no banco concluído. {} sessões revogadas", activeSessions.size());
            
        } catch (Exception e) {
            log.error("❌ Erro ao forçar logout em massa no banco: {}", e.getMessage());
            // Don't rethrow - this is an emergency action that shouldn't break the application
        }
    }
}

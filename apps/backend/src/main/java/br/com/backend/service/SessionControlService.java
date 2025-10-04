package br.com.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class SessionControlService {
    
    private final SessionStorageService sessionStorage;
    
    public SessionControlService(SessionStorageService sessionStorage) {
        this.sessionStorage = sessionStorage;
        log.info("🔐 SessionControlService inicializado com storage: {}", 
                sessionStorage.getClass().getSimpleName());
    }
    
    /**
     * Registra um novo token ativo para um usuário
     * Se já existir um token ativo, o anterior é automaticamente revogado
     */
    public String registerActiveToken(String email, String token) {
        log.info("🔐 Registrando novo token para usuário: {}", email);
        sessionStorage.registerActiveToken(email, token);
        return token;
    }
    
    /**
     * Verifica se um token está ativo (não foi revogado)
     */
    public boolean isTokenActive(String token) {
        return sessionStorage.isTokenActive(token);
    }
    
    /**
     * Revoga um token específico
     */
    public void revokeToken(String token) {
        sessionStorage.revokeToken(token);
    }
    
    /**
     * Revoga todos os tokens de um usuário específico
     */
    public void revokeAllUserTokens(String email) {
        sessionStorage.revokeAllUserTokens(email);
    }
    
    /**
     * Obtém o token ativo de um usuário
     */
    public String getActiveToken(String email) {
        return sessionStorage.getActiveToken(email);
    }
    
    /**
     * Verifica se um usuário tem uma sessão ativa
     */
    public boolean hasActiveSession(String email) {
        return sessionStorage.hasActiveSession(email);
    }
    
    /**
     * Limpa tokens revogados antigos
     */
    public void cleanupExpiredRevokedTokens() {
        sessionStorage.cleanupExpiredTokens();
    }
    
    /**
     * Obtém estatísticas de sessões
     */
    public Map<String, Object> getSessionStats() {
        return sessionStorage.getSessionStats();
    }
    
    /**
     * Força logout de todos os usuários (emergência)
     */
    public void forceLogoutAllUsers() {
        sessionStorage.forceLogoutAllUsers();
    }
    
    /**
     * Obtém informações detalhadas de uma sessão específica
     */
    public Map<String, Object> getSessionDetails(String email) {
        Map<String, Object> details = new java.util.HashMap<>();
        String token = sessionStorage.getActiveToken(email);
        
        details.put("email", email);
        details.put("hasActiveSession", token != null);
        details.put("tokenExists", token != null);
        details.put("tokenPreview", token != null ? token.substring(0, Math.min(20, token.length())) + "..." : "N/A");
        details.put("sessionCreated", token != null ? "SIM" : "NÃO");
        details.put("storageType", sessionStorage.getClass().getSimpleName());
        
        return details;
    }
}

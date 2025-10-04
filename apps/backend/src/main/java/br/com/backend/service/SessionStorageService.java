package br.com.backend.service;

import java.util.Map;

/**
 * Interface para abstrair o storage de sessões
 * Permite usar Redis, banco de dados ou memória local
 */
public interface SessionStorageService {
    
    /**
     * Registra um novo token ativo para um usuário
     */
    void registerActiveToken(String email, String token);
    
    /**
     * Verifica se um token está ativo
     */
    boolean isTokenActive(String token);
    
    /**
     * Revoga um token específico
     */
    void revokeToken(String token);
    
    /**
     * Revoga todos os tokens de um usuário
     */
    void revokeAllUserTokens(String email);
    
    /**
     * Obtém o token ativo de um usuário
     */
    String getActiveToken(String email);
    
    /**
     * Verifica se um usuário tem sessão ativa
     */
    boolean hasActiveSession(String email);
    
    /**
     * Obtém estatísticas de sessões
     */
    Map<String, Object> getSessionStats();
    
    /**
     * Limpa tokens expirados
     */
    void cleanupExpiredTokens();
    
    /**
     * Força logout de todos os usuários
     */
    void forceLogoutAllUsers();
}

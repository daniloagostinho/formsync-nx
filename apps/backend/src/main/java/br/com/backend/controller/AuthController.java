




package br.com.backend.controller;

import br.com.backend.service.LogService;
import br.com.backend.service.SessionControlService;
import br.com.backend.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
public class AuthController {

    private final SessionControlService sessionControlService;
    private final LogService logService;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * Endpoint para verificar status da sessão em tempo real (sem autenticação)
     * Útil para o frontend detectar quando a sessão foi revogada
     */
    @PostMapping("/check-session-status")
    public ResponseEntity<Map<String, Object>> checkSessionStatus(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(Map.of(
                "authenticated", false,
                "sessionActive", false,
                "reason", "Token não fornecido"
            ));
        }
        
        String token = authHeader.substring(7);
        
        try {
            String email = jwtTokenUtil.extractEmail(token);
            
            if (email == null) {
                return ResponseEntity.ok(Map.of(
                    "authenticated", false,
                    "sessionActive", false,
                    "reason", "Token inválido"
                ));
        }
        
            
            // VERIFICAÇÃO SIMPLES: Se o token está ativo
            boolean isSessionActive = sessionControlService.isTokenActive(token);
            
            Map<String, Object> result = Map.of(
                "authenticated", true,
                "email", email,
                "sessionActive", isSessionActive,
                "reason", isSessionActive ? "Sessão ativa" : "Sessão revogada"
            );
            
            log.debug("🔍 Status da sessão verificado para usuário: {} - Ativa: {}", email, isSessionActive);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ Erro ao verificar status da sessão: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "authenticated", false,
                "sessionActive", false,
                "reason", "Erro interno"
            ));
        }
    }

    /**
     * Endpoint GET para verificar status da sessão (compatível com frontend)
     * Útil para o frontend detectar quando a sessão foi revogada
     */
    @GetMapping("/session-status")
    public ResponseEntity<Map<String, Object>> getSessionStatus(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.ok(Map.of(
                "authenticated", false,
                "status", "INACTIVE",
                "reason", "Token não fornecido"
            ));
        }
        
        String token = authHeader.substring(7);
        
        try {
            String email = jwtTokenUtil.extractEmail(token);
            
            if (email == null) {
                return ResponseEntity.ok(Map.of(
                    "authenticated", false,
                    "status", "INACTIVE",
                    "reason", "Token inválido"
                ));
            }
            
            // VERIFICAÇÃO SIMPLES: Se o token está ativo
            boolean isSessionActive = sessionControlService.isTokenActive(token);
            
            Map<String, Object> result = Map.of(
                "authenticated", true,
                "email", email,
                "status", isSessionActive ? "ACTIVE" : "INACTIVE",
                "reason", isSessionActive ? "Sessão ativa" : "Sessão revogada"
            );
            
            log.debug("🔍 Status da sessão verificado para usuário: {} - Ativa: {}", email, isSessionActive);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ Erro ao verificar status da sessão: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "authenticated", false,
                "status", "ERROR",
                "reason", "Erro interno"
            ));
        }
    }

    /**
     * Endpoint padrão para logout
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Token não fornecido",
                "status", "ERROR"
            ));
        }
        
        String token = authHeader.substring(7);
        
        try {
            String email = jwtTokenUtil.extractEmail(token);
            
            if (email != null) {
                log.info("🔐 Logout realizado para usuário: {}", email);
                
                // Revogar token específico
                sessionControlService.revokeToken(token);
                SecurityContextHolder.clearContext();
                
                logService.logLoginAttempt(email, false, "Logout realizado");
                log.info("✅ Logout realizado com sucesso para usuário: {}", email);
                
                return ResponseEntity.ok(Map.of(
                    "message", "Logout realizado com sucesso",
                    "status", "SUCCESS",
                    "email", email
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "message", "Token inválido",
                    "status", "ERROR"
                ));
            }
            
        } catch (Exception e) {
            log.error("❌ Erro durante logout: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erro interno durante logout",
                "status", "ERROR"
            ));
        }
    }

    /**
     * Endpoint para simular logout em todas as abas (útil para testes)
     * Este endpoint força o logout do usuário atual, revogando sua sessão
     */
    @PostMapping("/force-logout-current")
    public ResponseEntity<Map<String, String>> forceLogoutCurrent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            log.info("🔐 Forçando logout para usuário atual: {}", email);

            sessionControlService.revokeAllUserTokens(email);
            SecurityContextHolder.clearContext();

            logService.logLoginAttempt(email, false, "Logout forçado via endpoint");
            log.info("✅ Logout forçado realizado para usuário: {}", email);

            return ResponseEntity.ok(Map.of(
                "message", "Logout forçado realizado com sucesso",
                "status", "SUCCESS",
                "email", email
            ));
        }

        log.warn("⚠️ Tentativa de logout forçado sem usuário autenticado");
        return ResponseEntity.badRequest().body(Map.of(
            "message", "Usuário não autenticado",
            "status", "ERROR"
        ));
    }

    /**
     * Endpoint de debug para limpar sessões órfãs e verificar estado
     */
    @GetMapping("/debug/sessions")
    public ResponseEntity<Map<String, Object>> debugSessions() {
        try {
            Map<String, Object> stats = sessionControlService.getSessionStats();
            
            log.info("🔍 Debug de sessões solicitado - Estatísticas: {}", stats);
            
            return ResponseEntity.ok(Map.of(
                "message", "Debug de sessões realizado",
                "status", "SUCCESS",
                "stats", stats,
                "timestamp", LocalDateTime.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("❌ Erro durante debug de sessões: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erro interno durante debug",
                "status", "ERROR",
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint para limpar sessões de um usuário específico
     */
    @PostMapping("/debug/clear-user-sessions")
    public ResponseEntity<Map<String, String>> clearUserSessions(@RequestParam String email) {
        try {
            log.warn("🚨 Limpeza de sessões solicitada para usuário: {}", email);
            
            sessionControlService.revokeAllUserTokens(email);
            
            log.warn("✅ Limpeza de sessões concluída para usuário: {}", email);
            
            return ResponseEntity.ok(Map.of(
                "message", "Sessões do usuário foram limpas com sucesso",
                "status", "SUCCESS",
                "email", email,
                "warning", "Todas as sessões deste usuário foram revogadas"
            ));
            
        } catch (Exception e) {
            log.error("❌ Erro durante limpeza de sessões do usuário: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erro interno durante limpeza",
                "status", "ERROR",
                "error", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint de emergência para limpar TODAS as sessões (útil para testes)
     */
    @PostMapping("/debug/clear-all-sessions")
    public ResponseEntity<Map<String, String>> clearAllSessions() {
        try {
            log.warn("🚨 LIMPEZA DE EMERGÊNCIA de todas as sessões solicitada");
            
            sessionControlService.forceLogoutAllUsers();
            
            log.warn("✅ Limpeza de emergência concluída - Todas as sessões foram revogadas");
            
            return ResponseEntity.ok(Map.of(
                "message", "Todas as sessões foram limpas com sucesso",
                "status", "SUCCESS",
                "warning", "Esta ação revogará TODAS as sessões ativas"
            ));
            
        } catch (Exception e) {
            log.error("❌ Erro durante limpeza de emergência: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "message", "Erro interno durante limpeza",
                "status", "ERROR",
                "error", e.getMessage()
            ));
        }
    }
}

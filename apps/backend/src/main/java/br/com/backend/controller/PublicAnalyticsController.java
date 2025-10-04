package br.com.backend.controller;

import br.com.backend.service.AdvancedAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/public/analytics")
@RequiredArgsConstructor
@Slf4j
public class PublicAnalyticsController {

    private final AdvancedAnalyticsService analyticsService;

    private static final String EXTENSION_KEY = "ext_2024_preenche_rapido_secure_key_987654321";

    /**
     * Endpoint público para rastrear preenchimento
     */
    @PostMapping("/track")
    public ResponseEntity<Map<String, Object>> trackPreenchimento(
            @RequestParam @NotBlank String site,
            @RequestParam(required = false) Long campoId,
            @RequestParam @Positive Long usuarioId,
            @RequestHeader(value = "X-Extension-Key", required = false) String extensionKey) {
        
        log.info("📊 [ANALYTICS] Rastreamento de preenchimento solicitado - Site: {}, Usuário: {}, Campo: {}", 
                site, usuarioId, campoId);
        
        // Verificar se a requisição vem da extensão
        if (!EXTENSION_KEY.equals(extensionKey)) {
            log.warn("🚫 [ANALYTICS] Tentativa de acesso sem chave válida para rastreamento de preenchimento");
            return ResponseEntity.status(403).body(Map.of(
                "error", "Acesso negado",
                "errorCode", "INVALID_EXTENSION_KEY"
            ));
        }
        
        try {
            analyticsService.trackPreenchimento(usuarioId, site, campoId);
            
            log.info("✅ [ANALYTICS] Preenchimento rastreado com sucesso - Site: {}, Usuário: {}, Campo: {}", 
                    site, usuarioId, campoId);
            
            Map<String, Object> response = Map.of(
                "message", "Preenchimento rastreado com sucesso",
                "site", site,
                "campoId", campoId,
                "usuarioId", usuarioId,
                "timestamp", java.time.LocalDateTime.now().toString()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao rastrear preenchimento - Site: {}, Usuário: {}, Campo: {}, Erro: {}", 
                    site, usuarioId, campoId, e.getMessage());
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erro ao rastrear preenchimento",
                "message", e.getMessage(),
                "site", site,
                "usuarioId", usuarioId
            ));
        }
    }

    /**
     * Endpoint público para rastrear tempo economizado
     */
    @PostMapping("/track-tempo")
    public ResponseEntity<Map<String, Object>> trackTempoEconomizado(
            @RequestParam @Positive Integer tempoSegundos,
            @RequestParam @Positive Long usuarioId,
            @RequestHeader(value = "X-Extension-Key", required = false) String extensionKey) {
        
        log.info("⏱️ [ANALYTICS] Rastreamento de tempo economizado solicitado - Usuário: {}, Tempo: {}s", 
                usuarioId, tempoSegundos);
        
        // Verificar se a requisição vem da extensão
        if (!EXTENSION_KEY.equals(extensionKey)) {
            log.warn("🚫 [ANALYTICS] Tentativa de acesso sem chave válida para rastreamento de tempo");
            return ResponseEntity.status(403).body(Map.of(
                "error", "Acesso negado",
                "errorCode", "INVALID_EXTENSION_KEY"
            ));
        }
        
        try {
            analyticsService.trackTempoEconomizado(usuarioId, tempoSegundos);
            
            log.info("✅ [ANALYTICS] Tempo economizado rastreado com sucesso - Usuário: {}, Tempo: {}s", 
                    usuarioId, tempoSegundos);
            
            Map<String, Object> response = Map.of(
                "message", "Tempo economizado rastreado com sucesso",
                "tempoSegundos", tempoSegundos,
                "usuarioId", usuarioId,
                "timestamp", java.time.LocalDateTime.now().toString()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao rastrear tempo economizado - Usuário: {}, Tempo: {}s, Erro: {}", 
                    usuarioId, tempoSegundos, e.getMessage());
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Erro ao rastrear tempo economizado",
                "message", e.getMessage(),
                "usuarioId", usuarioId,
                "tempoSegundos", tempoSegundos
            ));
        }
    }
} 
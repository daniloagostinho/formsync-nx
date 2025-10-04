package br.com.backend.controller;

import br.com.backend.dto.ExtensionNotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/public/extension")
@RequiredArgsConstructor
@Slf4j
public class ExtensionController {
    
    private static final String EXTENSION_KEY = "ext_2024_preenche_rapido_secure_key_987654321";

    /**
     * Endpoint para ping da extensão
     */
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping(
            @RequestHeader(value = "X-Extension-Key", required = false) String extensionKey) {
        
        if (!EXTENSION_KEY.equals(extensionKey)) {
            log.warn("Tentativa de acesso sem chave válida: {}", extensionKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Chave de acesso inválida ou ausente",
                "errorCode", "INVALID_EXTENSION_KEY"
            ));
        }

        log.info("✅ Extensão ativa - ping recebido");
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "message", "Extensão ativa e funcionando",
            "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * Endpoint para notificações da extensão
     */
    @PostMapping("/notify")
    public ResponseEntity<Map<String, Object>> notify(
            @RequestBody ExtensionNotificationDTO notification,
            @RequestHeader(value = "X-Extension-Key", required = false) String extensionKey) {
        
        if (!EXTENSION_KEY.equals(extensionKey)) {
            log.warn("Tentativa de notificação sem chave válida: {}", extensionKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Chave de acesso inválida ou ausente",
                "errorCode", "INVALID_EXTENSION_KEY"
            ));
        }

        try {
            log.info("🔔 Notificação recebida da extensão: {} - Template: {} (ID: {})", 
                notification.getAction(), notification.getTemplateName(), notification.getTemplateId());

            // Aqui você pode implementar lógica adicional para processar a notificação
            // Por exemplo, salvar em um log, enviar para outros serviços, etc.

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Notificação processada com sucesso",
                "action", notification.getAction(),
                "templateId", notification.getTemplateId(),
                "templateName", notification.getTemplateName(),
                "timestamp", System.currentTimeMillis()
            ));

        } catch (Exception e) {
            log.error("❌ Erro ao processar notificação da extensão: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Erro interno ao processar notificação",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Endpoint para forçar sincronização
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sync(
            @RequestHeader(value = "X-Extension-Key", required = false) String extensionKey) {
        
        if (!EXTENSION_KEY.equals(extensionKey)) {
            log.warn("Tentativa de sincronização sem chave válida: {}", extensionKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Chave de acesso inválida ou ausente",
                "errorCode", "INVALID_EXTENSION_KEY"
            ));
        }

        try {
            log.info("🔄 Sincronização forçada solicitada pela extensão");

            // Aqui você pode implementar lógica de sincronização
            // Por exemplo, verificar templates atualizados, limpar cache, etc.

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Sincronização realizada com sucesso",
                "timestamp", System.currentTimeMillis()
            ));

        } catch (Exception e) {
            log.error("❌ Erro na sincronização: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "Erro interno na sincronização",
                "message", e.getMessage()
            ));
        }
    }
}


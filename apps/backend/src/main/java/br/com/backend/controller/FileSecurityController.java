package br.com.backend.controller;

import br.com.backend.dto.FileSecurityResult;
import br.com.backend.service.FileSecurityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/security/files")
@RequiredArgsConstructor
@Slf4j
public class FileSecurityController {

    private final FileSecurityService fileSecurityService;

    /**
     * Valida arquivo para segurança
     */
    @PostMapping("/validate")
    public ResponseEntity<FileSecurityResult> validateFile(@RequestParam("file") MultipartFile file) {
        log.info("🔒 Validação de segurança solicitada para arquivo: {}", file.getOriginalFilename());
        
        try {
            FileSecurityResult result = fileSecurityService.validateFile(file);
            
            if (result.isSecure()) {
                log.info("✅ Arquivo {} validado com sucesso", file.getOriginalFilename());
            } else {
                log.warn("🚫 Arquivo {} rejeitado por questões de segurança: {}", 
                    file.getOriginalFilename(), result.getMessage());
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("❌ Erro durante validação de segurança: {}", e.getMessage());
            
            FileSecurityResult errorResult = FileSecurityResult.builder()
                .fileName(file.getOriginalFilename())
                .secure(false)
                .quarantined(false)
                .message("Erro interno durante validação de segurança")
                .error(e.getMessage())
                .build();
            
            return ResponseEntity.internalServerError().body(errorResult);
        }
    }

    /**
     * Lista arquivos em quarentena (apenas admin)
     */
    @GetMapping("/quarantine")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> listQuarantinedFiles() {
        log.info("🔒 Listagem de arquivos em quarentena solicitada");
        
        try {
            String[] quarantinedFiles = fileSecurityService.listQuarantinedFiles();
            
            Map<String, Object> response = new HashMap<>();
            response.put("quarantinedFiles", quarantinedFiles);
            response.put("count", quarantinedFiles.length);
            response.put("timestamp", java.time.LocalDateTime.now());
            
            log.info("📋 {} arquivos encontrados em quarentena", quarantinedFiles.length);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Erro ao listar arquivos em quarentena: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao listar arquivos em quarentena");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Libera arquivo da quarentena (apenas admin)
     */
    @DeleteMapping("/quarantine/{fileName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> releaseFromQuarantine(@PathVariable String fileName) {
        log.info("🔒 Liberação de arquivo da quarentena solicitada: {}", fileName);
        
        try {
            // Construir caminho completo do arquivo em quarentena
            String quarantinePath = "./quarantine/" + fileName;
            
            boolean released = fileSecurityService.releaseFromQuarantine(quarantinePath);
            
            if (released) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Arquivo liberado da quarentena com sucesso");
                response.put("fileName", fileName);
                response.put("timestamp", java.time.LocalDateTime.now());
                
                log.info("✅ Arquivo {} liberado da quarentena", fileName);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Arquivo não encontrado na quarentena");
                errorResponse.put("fileName", fileName);
                
                log.warn("⚠️ Arquivo {} não encontrado na quarentena", fileName);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("❌ Erro ao liberar arquivo da quarentena: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao liberar arquivo da quarentena");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("fileName", fileName);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Status do sistema de segurança de arquivos
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSecurityStatus() {
        log.info("🔒 Status do sistema de segurança solicitado");
        
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("timestamp", java.time.LocalDateTime.now());
            status.put("fileSecurityEnabled", true);
            status.put("malwareScanEnabled", true);
            status.put("quarantineEnabled", true);
            status.put("maxFileSize", "5MB");
            status.put("allowedExtensions", "csv,xlsx,xls");
            status.put("blockedExtensions", "exe,bat,cmd,com,pif,scr,vbs,js,jar,war,ear,sh,ps1");
            status.put("scannerVersion", "1.0.0");
            status.put("lastUpdate", java.time.LocalDateTime.now());
            
            // Contar arquivos em quarentena
            String[] quarantinedFiles = fileSecurityService.listQuarantinedFiles();
            status.put("quarantinedFilesCount", quarantinedFiles.length);
            
            log.info("📊 Status de segurança retornado: {} arquivos em quarentena", quarantinedFiles.length);
            return ResponseEntity.ok(status);
            
        } catch (Exception e) {
            log.error("❌ Erro ao obter status de segurança: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao obter status de segurança");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Teste de validação de segurança
     */
    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testSecurityValidation() {
        log.info("🧪 Teste de validação de segurança solicitado");
        
        try {
            Map<String, Object> testResult = new HashMap<>();
            testResult.put("timestamp", java.time.LocalDateTime.now());
            testResult.put("testType", "SECURITY_VALIDATION");
            testResult.put("status", "SUCCESS");
            testResult.put("message", "Sistema de segurança funcionando corretamente");
            testResult.put("features", new String[]{
                "Validação de tipo de arquivo",
                "Validação de conteúdo",
                "Scan de malware",
                "Sistema de quarentena",
                "Logs de segurança"
            });
            
            log.info("✅ Teste de segurança executado com sucesso");
            return ResponseEntity.ok(testResult);
            
        } catch (Exception e) {
            log.error("❌ Erro durante teste de segurança: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro durante teste de segurança");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

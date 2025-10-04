package br.com.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import br.com.backend.service.SecurityNotificationService;
import br.com.backend.dto.FileSecurityResult;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Slf4j
public class FileSecurityService {

    private final SecurityNotificationService notificationService;

    @Value("${app.security.file.quarantine.enabled:true}")
    private boolean quarantineEnabled;

    @Value("${app.security.file.quarantine.path:./quarantine}")
    private String quarantinePath;

    @Value("${app.security.file.scan.enabled:true}")
    private boolean scanEnabled;

    @Value("${app.security.file.scan.timeout:30000}")
    private long scanTimeout;

    @Value("${app.security.file.max-size:5242880}")
    private long maxFileSize;

    @Value("${app.security.file.allowed-extensions:csv,xlsx,xls}")
    private String allowedExtensions;

    @Value("${app.security.file.blocked-extensions:exe,bat,cmd,com,pif,scr,vbs,js,jar,war,ear,sh,ps1}")
    private String blockedExtensions;

    public FileSecurityService(SecurityNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Validação completa de segurança do arquivo
     */
    public FileSecurityResult validateFile(MultipartFile file) {
        log.info("🔒 Iniciando validação de segurança para arquivo: {}", file.getOriginalFilename());
        
        FileSecurityResult result = FileSecurityResult.builder()
            .fileName(file.getOriginalFilename())
            .fileSize(file.getSize())
            .timestamp(LocalDateTime.now())
            .secure(false)  // Inicializar como false por padrão
            .quarantined(false)  // Inicializar como false por padrão
            .build();

        try {
            // 1. Validação básica
            if (!validateBasicSecurity(file, result)) {
                return result;
            }

            // 2. Validação de extensão
            if (!validateFileExtension(file, result)) {
                return result;
            }

            // 3. Validação de conteúdo
            if (!validateFileContent(file, result)) {
                return result;
            }

            // 4. Scan de malware (se habilitado)
            if (scanEnabled && !performMalwareScan(file, result)) {
                return result;
            }

            // 5. Se tudo passou, arquivo é seguro
            result.setSecure(true);
            result.setMessage("Arquivo validado com sucesso");
            log.info("✅ Arquivo {} passou em todas as validações de segurança", file.getOriginalFilename());

        } catch (Exception e) {
            log.error("❌ Erro durante validação de segurança do arquivo {}: {}", file.getOriginalFilename(), e.getMessage());
            result.setSecure(false);
            result.setMessage("Erro durante validação de segurança: " + e.getMessage());
            result.setError(e.getMessage());
        }

        return result;
    }

    /**
     * Validação básica de segurança
     */
    private boolean validateBasicSecurity(MultipartFile file, FileSecurityResult result) {
        // Verificar se arquivo está vazio
        if (file.isEmpty()) {
            result.setSecure(false);
            result.setMessage("Arquivo está vazio");
            result.setSecurityIssues("ARQUIVO_VAZIO");
            return false;
        }

        // Verificar tamanho máximo
        if (file.getSize() > maxFileSize) {
            result.setSecure(false);
            result.setMessage("Arquivo excede o tamanho máximo permitido");
            result.setSecurityIssues("ARQUIVO_MUITO_GRANDE");
            return false;
        }

        // Verificar nome do arquivo
        if (file.getOriginalFilename() == null || file.getOriginalFilename().trim().isEmpty()) {
            result.setSecure(false);
            result.setMessage("Nome do arquivo inválido");
            result.setSecurityIssues("NOME_ARQUIVO_INVALIDO");
            return false;
        }

        return true;
    }

    /**
     * Validação de extensão do arquivo
     */
    private boolean validateFileExtension(MultipartFile file, FileSecurityResult result) {
        String fileName = file.getOriginalFilename().toLowerCase();
        
        // Verificar extensões bloqueadas
        String[] blocked = blockedExtensions.split(",");
        for (String ext : blocked) {
            if (fileName.endsWith("." + ext.trim())) {
                result.setSecure(false);
                result.setMessage("Tipo de arquivo não permitido por questões de segurança");
                result.setSecurityIssues("EXTENSAO_BLOQUEADA");
                log.warn("🚫 Arquivo com extensão bloqueada detectado: {}", fileName);
                
                // Notificar sobre tentativa de upload malicioso
                notificationService.notifyMaliciousUploadAttempt(result, "unknown", "unknown");
                
                return false;
            }
        }

        // Verificar extensões permitidas
        String[] allowed = allowedExtensions.split(",");
        boolean hasValidExtension = false;
        for (String ext : allowed) {
            if (fileName.endsWith("." + ext.trim())) {
                hasValidExtension = true;
                break;
            }
        }

        if (!hasValidExtension) {
            result.setSecure(false);
            result.setMessage("Tipo de arquivo não suportado");
            result.setSecurityIssues("EXTENSAO_NAO_SUPORTADA");
            return false;
        }

        return true;
    }

    /**
     * Validação de conteúdo do arquivo
     */
    private boolean validateFileContent(MultipartFile file, FileSecurityResult result) {
        try {
            // Verificar se é um arquivo de texto (CSV)
            if (file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
                return validateCsvContent(file, result);
            }
            
            // Verificar se é um arquivo Excel
            if (file.getOriginalFilename().toLowerCase().endsWith(".xlsx") || 
                file.getOriginalFilename().toLowerCase().endsWith(".xls")) {
                return validateExcelContent(file, result);
            }

            return true;
        } catch (Exception e) {
            log.error("Erro ao validar conteúdo do arquivo: {}", e.getMessage());
            result.setSecure(false);
            result.setMessage("Erro ao validar conteúdo do arquivo");
            result.setSecurityIssues("ERRO_VALIDACAO_CONTEUDO");
            return false;
        }
    }

    /**
     * Validação de conteúdo CSV
     */
    private boolean validateCsvContent(MultipartFile file, FileSecurityResult result) {
        try {
            byte[] content = file.getBytes();
            String contentStr = new String(content, "UTF-8");
            
            // Verificar se contém scripts maliciosos
            if (containsMaliciousContent(contentStr)) {
                result.setSecure(false);
                result.setMessage("Arquivo CSV contém conteúdo suspeito");
                result.setSecurityIssues("CONTEUDO_SUSPEITO_CSV");
                log.warn("🚫 Conteúdo suspeito detectado no CSV: {}", file.getOriginalFilename());
                
                // Notificar sobre conteúdo suspeito
                notificationService.notifyMaliciousUploadAttempt(result, "unknown", "unknown");
                
                return false;
            }

            return true;
        } catch (IOException e) {
            log.error("Erro ao ler conteúdo CSV: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validação de conteúdo Excel
     */
    private boolean validateExcelContent(MultipartFile file, FileSecurityResult result) {
        try {
            // Para Excel, vamos verificar apenas o cabeçalho
            // Implementação mais robusta seria com Apache POI
            byte[] content = file.getBytes();
            
            // Verificar assinatura do arquivo Excel
            if (content.length >= 4) {
                // Verificar assinatura XLSX (PK)
                if (content[0] == 0x50 && content[1] == 0x4B) {
                    return true;
                }
                // Verificar assinatura XLS (D0 CF 11 E0)
                if (content[0] == (byte)0xD0 && content[1] == (byte)0xCF && 
                    content[2] == 0x11 && content[3] == (byte)0xE0) {
                    return true;
                }
            }
            
            result.setSecure(false);
            result.setMessage("Arquivo Excel corrompido ou inválido");
            result.setSecurityIssues("ARQUIVO_EXCEL_CORROMPIDO");
            return false;
            
        } catch (IOException e) {
            log.error("Erro ao validar arquivo Excel: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Verifica se o conteúdo contém scripts maliciosos
     */
    private boolean containsMaliciousContent(String content) {
        String lowerContent = content.toLowerCase();
        
        // Padrões suspeitos
        String[] suspiciousPatterns = {
            "javascript:", "vbscript:", "data:text/html", "data:application/x-javascript",
            "<script", "</script>", "onload=", "onerror=", "onclick=", "onmouseover=",
            "eval(", "setTimeout(", "setInterval(", "document.cookie", "window.open",
            "location.href", "document.location", "innerHTML", "outerHTML"
        };
        
        for (String pattern : suspiciousPatterns) {
            if (lowerContent.contains(pattern)) {
                log.warn("🚫 Padrão suspeito detectado: {}", pattern);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Scan de malware (simulado - em produção integrar com ClamAV ou similar)
     */
    private boolean performMalwareScan(MultipartFile file, FileSecurityResult result) {
        log.info("🔍 Iniciando scan de malware para: {}", file.getOriginalFilename());
        
        try {
            // Simular scan (em produção, integrar com ClamAV, VirusTotal, etc.)
            boolean isClean = performSimulatedMalwareScan(file);
            
            if (!isClean) {
                result.setSecure(false);
                result.setMessage("Arquivo suspeito detectado pelo antivírus");
                result.setSecurityIssues("MALWARE_DETECTADO");
                log.warn("🚫 Malware detectado no arquivo: {}", file.getOriginalFilename());
                
                // Notificar sobre malware detectado
                notificationService.notifyMaliciousUploadAttempt(result, "unknown", "unknown");
                
                // Quarentenar arquivo se habilitado
                if (quarantineEnabled) {
                    quarantineFile(file, result);
                }
                
                return false;
            }
            
            log.info("✅ Scan de malware concluído - arquivo limpo: {}", file.getOriginalFilename());
            return true;
            
        } catch (Exception e) {
            log.error("❌ Erro durante scan de malware: {}", e.getMessage());
            result.setSecure(false);
            result.setMessage("Erro durante scan de malware");
            result.setSecurityIssues("ERRO_SCAN_MALWARE");
            return false;
        }
    }

    /**
     * Scan simulado de malware (substituir por integração real)
     */
    private boolean performSimulatedMalwareScan(MultipartFile file) {
        try {
            // Simular delay de scan
            Thread.sleep(100);
            
            // Em produção, implementar:
            // 1. Integração com ClamAV
            // 2. API VirusTotal
            // 3. Análise de comportamento
            // 4. Sandbox analysis
            
            // Por enquanto, sempre retorna true (arquivo limpo)
            // Implementar lógica real aqui
            return true;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    /**
     * Coloca arquivo em quarentena
     */
    private void quarantineFile(MultipartFile file, FileSecurityResult result) {
        try {
            // Criar diretório de quarentena se não existir
            Path quarantineDir = Paths.get(quarantinePath);
            if (!Files.exists(quarantineDir)) {
                Files.createDirectories(quarantineDir);
            }
            
            // Gerar nome único para arquivo em quarentena
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            String quarantineFileName = String.format("QUARANTINE_%s_%s_%s", 
                timestamp, uniqueId, file.getOriginalFilename());
            
            Path quarantineFile = quarantineDir.resolve(quarantineFileName);
            
            // Copiar arquivo para quarentena
            Files.copy(file.getInputStream(), quarantineFile, StandardCopyOption.REPLACE_EXISTING);
            
            result.setQuarantined(true);
            result.setQuarantinePath(quarantineFile.toString());
            result.setMessage("Arquivo colocado em quarentena por segurança");
            
            log.warn("🚫 Arquivo colocado em quarentena: {} -> {}", 
                file.getOriginalFilename(), quarantineFile);
            
        } catch (IOException e) {
            log.error("❌ Erro ao colocar arquivo em quarentena: {}", e.getMessage());
            result.setQuarantined(false);
            result.setError("Erro ao colocar em quarentena: " + e.getMessage());
        }
    }

    /**
     * Libera arquivo da quarentena
     */
    public boolean releaseFromQuarantine(String quarantinePath) {
        try {
            Path filePath = Paths.get(quarantinePath);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("✅ Arquivo liberado da quarentena: {}", quarantinePath);
                return true;
            }
            return false;
        } catch (IOException e) {
            log.error("❌ Erro ao liberar arquivo da quarentena: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Lista arquivos em quarentena
     */
    public String[] listQuarantinedFiles() {
        try {
            Path quarantineDir = Paths.get(quarantinePath);
            if (!Files.exists(quarantineDir)) {
                return new String[0];
            }
            
            return Files.list(quarantineDir)
                .filter(path -> path.getFileName().toString().startsWith("QUARANTINE_"))
                .map(path -> path.getFileName().toString())
                .toArray(String[]::new);
                
        } catch (IOException e) {
            log.error("❌ Erro ao listar arquivos em quarentena: {}", e.getMessage());
            return new String[0];
        }
    }
}

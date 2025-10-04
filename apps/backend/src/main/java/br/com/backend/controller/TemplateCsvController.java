package br.com.backend.controller;

import br.com.backend.service.TemplateCsvService;
import br.com.backend.service.AssinaturaService;
import br.com.backend.service.FileSecurityService;
import br.com.backend.dto.FileSecurityResult;
import br.com.backend.entity.Template;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/templates/csv")
@RequiredArgsConstructor
public class TemplateCsvController {
    
    private static final Logger logger = LoggerFactory.getLogger(TemplateCsvController.class);

    private final TemplateCsvService service;
    private final AssinaturaService assinaturaService;
    private final UsuarioRepository usuarioRepository;
    private final FileSecurityService fileSecurityService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadCsv(@RequestParam("file") MultipartFile file) {
        logger.info("=== Recebido CSV upload de templates ===");
        
        // ✅ VALIDAÇÃO 1: Verificar se usuário está autenticado
        Usuario usuario = getUsuarioAutenticado();
        logger.info("Usuário autenticado: {} (plano: {})", usuario.getEmail(), usuario.getPlano());
        
        // ✅ VALIDAÇÃO 2: Verificar se tem plano que permite upload CSV
        try {
            // Usar o PlanoLimiteService para validar upload CSV
            service.getPlanoLimiteService().validarUploadCsv(usuario);
        } catch (BusinessException e) {
            logger.warn("Tentativa de upload CSV por usuário sem plano adequado: {} (plano: {})", usuario.getEmail(), usuario.getPlano());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage());
        }
        
        // ✅ VALIDAÇÃO 3: Verificar se assinatura está válida
        if (!assinaturaService.assinaturaValida(usuario.getId())) {
            logger.warn("Tentativa de upload CSV por usuário com assinatura vencida: {}", usuario.getEmail());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Assinatura vencida ou inadimplente. Renove sua assinatura para continuar usando o serviço.");
        }
        
        // ✅ VALIDAÇÃO 4: Verificar tamanho do arquivo (máximo 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            logger.warn("Arquivo CSV muito grande: {} bytes", file.getSize());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Arquivo muito grande. Tamanho máximo permitido: 5MB");
        }
        
        // ✅ VALIDAÇÃO 5: Verificar tipo do arquivo (CSV e Excel)
        String fileName = file.getOriginalFilename().toLowerCase();
        boolean isCSV = file.getContentType().equals("text/csv") || fileName.endsWith(".csv");
        boolean isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");
        
        if (!isCSV && !isExcel) {
            logger.warn("Tipo de arquivo inválido: {}", file.getContentType());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Apenas arquivos CSV (.csv) e Excel (.xlsx, .xls) são aceitos");
        }
        
        logger.info("Nome original: {}, tamanho: {} bytes, contentType: {}",
                file.getOriginalFilename(),
                file.getSize(),
                file.getContentType());
        
        // ✅ VALIDAÇÃO 6: Validação de segurança completa (malware, conteúdo suspeito, etc.)
        logger.info("🔒 Iniciando validação de segurança do arquivo...");
        FileSecurityResult securityResult = fileSecurityService.validateFile(file);
        
                    if (!securityResult.isSecure()) {
            logger.warn("🚫 Arquivo rejeitado por questões de segurança: {}", securityResult.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Arquivo rejeitado por questões de segurança: " + securityResult.getMessage());
        }
        
        if (securityResult.isQuarantined()) {
            logger.warn("🚫 Arquivo colocado em quarentena: {}", securityResult.getQuarantinePath());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Arquivo colocado em quarentena por questões de segurança. Entre em contato com o suporte.");
        }
        
        logger.info("✅ Validação de segurança concluída com sucesso");
        
        try {
            // ✅ VALIDAÇÃO 7: Validar formato do arquivo (CSV ou Excel)
            if (isCSV) {
                service.validarFormatoCsv(file);
            } else {
                service.validarFormatoExcel(file);
            }
            
            // ✅ PROCESSAR ARQUIVO E Criar FormulárioS
            List<Template> templatesCriados = service.parseAndSaveTemplates(file, usuario);

            logger.info("Templates criados com sucesso: {}", templatesCriados.size());
            templatesCriados.forEach(template ->
                    logger.debug("  -> Template[id={}]: {} com {} campos", 
                            template.getId(), template.getNome(), template.getCampos().size())
            );
            
            // Retornar resposta estruturada
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "CSV processado com sucesso",
                "templatesCriados", templatesCriados.size(),
                "templates", templatesCriados.stream()
                    .map(template -> Map.of(
                        "id", template.getId(),
                        "nome", template.getNome(),
                        "descricao", template.getDescricao(),
                        "quantidadeCampos", template.getCampos().size()
                    ))
                    .collect(java.util.stream.Collectors.toList())
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Erro ao processar CSV de templates: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Erro ao processar CSV: " + e.getMessage());
        }
    }

    @GetMapping("/formato")
    public ResponseEntity<Map<String, Object>> getFormatoCsv() {
        Map<String, Object> formato = Map.of(
            "descricao", "Formato para upload de templates (CSV e Excel)",
            "formatos_suportados", List.of("CSV (.csv)", "Excel (.xlsx, .xls)"),
            "colunas", List.of(
                "NomeTemplate",
                "DescricaoTemplate", 
                "Campo1", "Valor1", "Tipo1",
                "Campo2", "Valor2", "Tipo2",
                "Campo3", "Valor3", "Tipo3"
            ),
            "exemplo", List.of(
                "Login Google",
                "Template para login no Google",
                "email", "usuario@email.com", "email",
                "senha", "123456", "password"
            ),
            "tipos_campo", List.of("text", "email", "password", "number", "tel", "url", "date"),
            "observacoes", List.of(
                "Primeiras 2 colunas são obrigatórias",
                "Campos são opcionais e seguem o padrão: Nome, Valor, Tipo",
                "Se Tipo não for especificado, será 'text' por padrão",
                "Suporte completo para CSV e Excel (.xlsx, .xls)"
            )
        );
        
        return ResponseEntity.ok(formato);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = Map.of(
            "status", "OK",
            "service", "Template CSV Service",
            "timestamp", System.currentTimeMillis()
        );
        
        return ResponseEntity.ok(health);
    }
    
    /**
     * Obtém o usuário autenticado do contexto de segurança
     */
    private Usuario getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                    "Usuário não encontrado: " + email));
    }
}

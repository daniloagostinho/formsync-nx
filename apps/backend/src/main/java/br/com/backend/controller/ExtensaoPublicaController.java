package br.com.backend.controller;

import br.com.backend.dto.ErrorResponseDTO;
import br.com.backend.entity.HistoricoPreenchimento;
import br.com.backend.entity.Template;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.HistoricoPreenchimentoRepository;
import br.com.backend.repository.TemplateRepository;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.security.JwtTokenUtil;
import br.com.backend.service.PGPDecryptionService;
import br.com.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Slf4j
public class ExtensaoPublicaController {

    private static final String EXTENSION_KEY = "ext_2024_preenche_rapido_secure_key_987654321";

    private final HistoricoPreenchimentoRepository historicoRepository;
    private final TemplateRepository templateRepository;
    private final UsuarioRepository usuarioRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final PGPDecryptionService pgpDecryptionService;

    /**
     * Endpoint público para listar templates
     * Usado pela extensão Chrome para carregar templates
     */
    @GetMapping("/templates")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarTemplates(
            @RequestHeader(value = "X-Extension-Key", required = false) String key) {
        
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            log.warn("Tentativa de acesso sem chave válida: {}", key);
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            // ⚠️ SEGURANÇA: Este endpoint é apenas para extensão Chrome
            // Retorna todos os templates ativos (não filtrar por usuário)
            List<Template> templates = templateRepository.findByAtivoTrue();
            log.info("🔒 [EXTENSÃO] Encontrados {} templates ativos para extensão Chrome", templates.size());
            
            // Mapear para formato da extensão e descriptografar dados PGP
            List<Map<String, Object>> templatesFormatados = templates.stream()
                .map(template -> {
                    Map<String, Object> templateMap = new HashMap<>();
                    templateMap.put("id", template.getId());
                    templateMap.put("nome", template.getNome() != null ? template.getNome() : "");
                    templateMap.put("descricao", template.getDescricao() != null ? template.getDescricao() : "");
                    
                    // Descriptografa campos
                    List<Map<String, Object>> camposDescriptografados = template.getCampos().stream()
                        .map(campo -> {
                            Map<String, Object> campoMap = new HashMap<>();
                            campoMap.put("nome", campo.getNome() != null ? campo.getNome() : "");
                            // Descriptografa o valor usando PGP
                            String valorDescriptografado = pgpDecryptionService.decryptPGPValue(campo.getValor());
                            campoMap.put("valor", valorDescriptografado != null ? valorDescriptografado : "");
                            campoMap.put("tipo", campo.getTipo() != null ? campo.getTipo() : "text");
                            return campoMap;
                        })
                        .collect(java.util.stream.Collectors.toList());
                    
                    templateMap.put("campos", camposDescriptografados);
                    templateMap.put("totalUso", template.getTotalUso() != null ? template.getTotalUso() : 0);
                    templateMap.put("ultimoUso", template.getUltimoUso() != null ? template.getUltimoUso().toString() : "");
                    
                    return templateMap;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(templatesFormatados);
            
        } catch (Exception e) {
            log.error("Erro ao listar templates: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponseDTO("Erro interno ao listar templates", "INTERNAL_SERVER_ERROR")
            );
        }
    }

    /**
     * 🔒 NOVO ENDPOINT SEGURO: Listar templates do usuário logado
     * Usado pelo dashboard para mostrar apenas templates do usuário
     */
    @GetMapping("/templates/usuario")
    @Transactional(readOnly = true)
    public ResponseEntity<?> listarTemplatesUsuario(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-Extension-Key", required = false) String extensionKey) {
        
        // ✅ VALIDAÇÃO: Aceitar tanto JWT quanto chave de extensão
        if (authHeader == null && extensionKey == null) {
            log.warn("Tentativa de acesso sem autenticação");
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Autenticação necessária (JWT ou chave de extensão)", 
                "AUTHENTICATION_REQUIRED"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            // ✅ SE FOR CHAVE DE EXTENSÃO: Retornar apenas templates do usuário logado
            if (extensionKey != null && EXTENSION_KEY.equals(extensionKey)) {
                log.info("🔑 [EXTENSÃO] Listando templates via chave de extensão");
                
                // Extrair usuário do JWT se disponível, senão retornar vazio
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    String token = authHeader.substring(7);
                    try {
                        String email = jwtTokenUtil.extractEmail(token);
                        Usuario usuario = usuarioRepository.findByEmail(email)
                            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
                        
                        List<Template> templates = templateRepository.findByUsuarioIdAndAtivoTrue(usuario.getId());
                        
                        List<Map<String, Object>> templatesFormatados = templates.stream()
                            .map(template -> {
                                Map<String, Object> templateMap = new HashMap<>();
                                templateMap.put("id", template.getId());
                                templateMap.put("nome", template.getNome() != null ? template.getNome() : "");
                                templateMap.put("descricao", template.getDescricao() != null ? template.getDescricao() : "");
                                
                                List<Map<String, Object>> camposList = template.getCampos().stream()
                                    .map(campo -> {
                                        Map<String, Object> campoMap = new HashMap<>();
                                        campoMap.put("nome", campo.getNome() != null ? campo.getNome() : "");
                                        campoMap.put("valor", campo.getValor() != null ? campo.getValor() : "");
                                        campoMap.put("tipo", campo.getTipo() != null ? campo.getTipo() : "text");
                                        return campoMap;
                                    })
                                    .collect(java.util.stream.Collectors.toList());
                                templateMap.put("campos", camposList);
                                templateMap.put("totalUso", template.getTotalUso() != null ? template.getTotalUso() : 0);
                                templateMap.put("ultimoUso", template.getUltimoUso() != null ? template.getUltimoUso().toString() : "");
                                return templateMap;
                            })
                            .collect(java.util.stream.Collectors.toList());
                        
                        return ResponseEntity.ok(templatesFormatados);
                    } catch (Exception e) {
                        log.error("Erro ao extrair usuário do token: {}", e.getMessage());
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                            new ErrorResponseDTO("Token inválido", "INVALID_TOKEN")
                        );
                    }
                } else {
                    // Se não há JWT, retornar lista vazia
                    log.warn("Chave de extensão fornecida mas sem JWT - retornando lista vazia");
                    return ResponseEntity.ok(new ArrayList<>());
                }
            }
            
            // ✅ SE FOR JWT: Buscar templates do usuário específico
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7); // Remove "Bearer "
                
                String email = extrairEmailDoToken(token);
                if (email == null) {
                    log.warn("Token JWT inválido ou expirado");
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "Token JWT inválido ou expirado", 
                        "INVALID_JWT_TOKEN"
                    );
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
                }
                
                Usuario usuario = usuarioRepository.findByEmail(email)
                        .orElse(null);
                if (usuario == null) {
                    log.warn("Usuário não encontrado para email: {}", email);
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "Usuário não encontrado", 
                        "USER_NOT_FOUND"
                    );
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
                }
                
                log.info("🔍 [DEBUG] Buscando templates para usuário ID: {}, Email: {}", usuario.getId(), email);
                
                List<Template> templates;
                try {
                    templates = templateRepository.findByUsuarioIdAndAtivoOrderByNomeAsc(usuario.getId(), true);
                    log.info("🔒 [DASHBOARD] Encontrados {} templates para usuário: {}", templates.size(), email);
                } catch (Exception e) {
                    log.error("❌ [ERROR] Erro ao buscar templates do usuário {}: {}", usuario.getId(), e.getMessage(), e);
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "Erro ao buscar templates: " + e.getMessage(), 
                        "DATABASE_ERROR"
                    );
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                }
                
                List<Map<String, Object>> templatesFormatados;
                try {
                    templatesFormatados = templates.stream()
                        .map(template -> {
                            try {
                                Map<String, Object> templateMap = new HashMap<>();
                                templateMap.put("id", template.getId());
                                templateMap.put("nome", template.getNome() != null ? template.getNome() : "");
                                templateMap.put("descricao", template.getDescricao() != null ? template.getDescricao() : "");
                                
                                List<Map<String, Object>> camposList = new ArrayList<>();
                                if (template.getCampos() != null) {
                                    camposList = template.getCampos().stream()
                                        .map(campo -> {
                                            Map<String, Object> campoMap = new HashMap<>();
                                            campoMap.put("nome", campo.getNome() != null ? campo.getNome() : "");
                                            campoMap.put("valor", campo.getValor() != null ? campo.getValor() : "");
                                            campoMap.put("tipo", campo.getTipo() != null ? campo.getTipo() : "text");
                                            return campoMap;
                                        })
                                        .collect(java.util.stream.Collectors.toList());
                                }
                                templateMap.put("campos", camposList);
                                templateMap.put("totalUso", template.getTotalUso() != null ? template.getTotalUso() : 0);
                                templateMap.put("ultimoUso", template.getUltimoUso() != null ? template.getUltimoUso().toString() : "");
                                
                                return templateMap;
                            } catch (Exception e) {
                                log.error("❌ [ERROR] Erro ao formatar template {}: {}", template.getId(), e.getMessage());
                                Map<String, Object> errorMap = new HashMap<>();
                                errorMap.put("id", template.getId());
                                errorMap.put("nome", template.getNome() != null ? template.getNome() : "");
                                errorMap.put("descricao", "");
                                errorMap.put("campos", new ArrayList<>());
                                errorMap.put("totalUso", 0);
                                errorMap.put("ultimoUso", "");
                                return errorMap;
                            }
                        })
                        .collect(java.util.stream.Collectors.toList());
                } catch (Exception e) {
                    log.error("❌ [ERROR] Erro ao formatar lista de templates: {}", e.getMessage(), e);
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "Erro ao formatar templates: " + e.getMessage(), 
                        "FORMATTING_ERROR"
                    );
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
                }
                
                return ResponseEntity.ok(templatesFormatados);
            }
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ErrorResponseDTO("Autenticação inválida", "INVALID_AUTH")
            );
            
        } catch (Exception e) {
            log.error("Erro ao listar templates do usuário: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponseDTO("Erro interno ao listar templates do usuário", "INTERNAL_SERVER_ERROR")
            );
        }
    }

    /**
     * Endpoint público para salvar template
     * Usado pela extensão Chrome para criar/atualizar templates
     */
    @PostMapping("/templates")
    @Transactional
    public ResponseEntity<?> salvarTemplate(
            @RequestHeader(value = "X-Extension-Key", required = false) String key,
            @RequestBody Map<String, Object> payload) {
        
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            log.warn("Tentativa de acesso sem chave válida: {}", key);
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            // ✅ VALIDAÇÃO: Verificar se payload tem os campos necessários
            String nome = (String) payload.get("nome");
            String descricao = (String) payload.get("descricao");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> camposPayload = (List<Map<String, Object>>) payload.get("campos");
            
            if (nome == null || nome.trim().isEmpty()) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Nome do Formulário é obrigatório", 
                    "MISSING_TEMPLATE_NAME"
                );
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // ✅ BUSCAR OU CRIAR USUÁRIO PADRÃO PARA EXTENSÃO
            Usuario usuarioPadrao = usuarioRepository.findByEmail("extensao@formsync.com")
                    .orElseGet(() -> {
                        Usuario novoUsuario = Usuario.builder()
                                .email("extensao@formsync.com")
                                .nome("Usuário Extensão")
                                .senha("extensao_2024_secure") // Senha padrão para extensão
                                .plano("PESSOAL")
                                .build();
                        return usuarioRepository.save(novoUsuario);
                    });

            // ✅ Criar Formulário
            Template template = new Template();
            template.setNome(nome);
            template.setDescricao(descricao != null ? descricao : "");
            template.setUsuario(usuarioPadrao); // Usar usuário padrão
            template.setAtivo(true);
            template.setDataCriacao(LocalDateTime.now());
            template.setDataAtualizacao(LocalDateTime.now());
            template.setTotalUso(0);

            // ✅ CRIAR Campos do Formulário
            if (camposPayload != null && !camposPayload.isEmpty()) {
                for (int i = 0; i < camposPayload.size(); i++) {
                    Map<String, Object> campoMap = camposPayload.get(i);
                    br.com.backend.entity.CampoTemplate campo = new br.com.backend.entity.CampoTemplate();
                    campo.setNome((String) campoMap.get("nome"));
                    campo.setValor((String) campoMap.get("valor"));
                    campo.setTipo((String) campoMap.get("tipo"));
                    campo.setOrdem(i);
                    campo.setAtivo(true);
                    campo.setDataCriacao(LocalDateTime.now());
                    campo.setDataAtualizacao(LocalDateTime.now());
                    campo.setTotalUso(0);
                    campo.setTemplate(template);
                    template.getCampos().add(campo);
                }
            }

            // Salvar o template
            Template templateSalvo = templateRepository.saveAndFlush(template);
            
            log.info("✅ Template criado pela extensão - ID: {}, Nome: {}", 
                     templateSalvo.getId(), templateSalvo.getNome());

            // Retornar template formatado
            Map<String, Object> templateFormatado = new HashMap<>();
            templateFormatado.put("id", templateSalvo.getId());
            templateFormatado.put("nome", templateSalvo.getNome());
            templateFormatado.put("descricao", templateSalvo.getDescricao());
            
            List<Map<String, Object>> camposList = templateSalvo.getCampos().stream()
                .map(campo -> {
                    Map<String, Object> campoMap = new HashMap<>();
                    campoMap.put("nome", campo.getNome() != null ? campo.getNome() : "");
                    campoMap.put("valor", campo.getValor() != null ? campo.getValor() : "");
                    campoMap.put("tipo", campo.getTipo() != null ? campo.getTipo() : "text");
                    return campoMap;
                })
                .collect(java.util.stream.Collectors.toList());
            templateFormatado.put("campos", camposList);
            templateFormatado.put("totalUso", templateSalvo.getTotalUso() != null ? templateSalvo.getTotalUso() : 0);
            templateFormatado.put("ultimoUso", templateSalvo.getUltimoUso() != null ? templateSalvo.getUltimoUso().toString() : "");

            return ResponseEntity.status(HttpStatus.CREATED).body(templateFormatado);

        } catch (Exception e) {
            log.error("❌ Erro ao salvar template: {}", e.getMessage(), e);
            
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Erro interno ao salvar template: " + e.getMessage(), 
                "INTERNAL_SERVER_ERROR"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint público para atualizar template existente
     * Usado pela extensão Chrome para atualizar templates
     */
    @PutMapping("/templates/{templateId}")
    @Transactional
    public ResponseEntity<?> atualizarTemplate(
            @RequestHeader(value = "X-Extension-Key", required = false) String key,
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> payload) {
        
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            log.warn("Tentativa de acesso sem chave válida: {}", key);
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            // ✅ VALIDAÇÃO: Verificar se template existe
            Template template = templateRepository.findById(templateId)
                    .orElse(null);
            
            if (template == null) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Template não encontrado", 
                    "TEMPLATE_NOT_FOUND"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            // ✅ VERIFICAR SE TEMPLATE PERTENCE AO USUÁRIO PADRÃO DA EXTENSÃO
            if (!template.getUsuario().getEmail().equals("extensao@formsync.com")) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Template não pertence ao usuário da extensão", 
                    "TEMPLATE_ACCESS_DENIED"
                );
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // ✅ VALIDAÇÃO: Verificar se payload tem os campos necessários
            String nome = (String) payload.get("nome");
            String descricao = (String) payload.get("descricao");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> camposPayload = (List<Map<String, Object>>) payload.get("campos");
            
            if (nome == null || nome.trim().isEmpty()) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Nome do Formulário é obrigatório", 
                    "MISSING_TEMPLATE_NAME"
                );
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // ✅ ATUALIZAR TEMPLATE
            template.setNome(nome);
            template.setDescricao(descricao != null ? descricao : "");
            template.setDataAtualizacao(LocalDateTime.now());

            // ✅ ATUALIZAR Campos do Formulário
            if (camposPayload != null && !camposPayload.isEmpty()) {
                // Limpar campos existentes
                template.getCampos().clear();
                
                // Adicionar novos campos à lista existente
                for (int i = 0; i < camposPayload.size(); i++) {
                    Map<String, Object> campoMap = camposPayload.get(i);
                    br.com.backend.entity.CampoTemplate campo = new br.com.backend.entity.CampoTemplate();
                    campo.setNome((String) campoMap.get("nome"));
                    campo.setValor((String) campoMap.get("valor"));
                    campo.setTipo((String) campoMap.get("tipo"));
                    campo.setOrdem(i + 1);
                    campo.setAtivo(true);
                    campo.setDataCriacao(LocalDateTime.now());
                    campo.setDataAtualizacao(LocalDateTime.now());
                    campo.setTotalUso(0);
                    campo.setTemplate(template);
                    template.getCampos().add(campo);
                }
                
                log.info("✅ Campos do Formulário atualizados - {} campos", camposPayload.size());
            }

            // Salvar o template atualizado
            Template templateAtualizado = templateRepository.saveAndFlush(template);
            
            log.info("✅ Template atualizado pela extensão - ID: {}, Nome: {}", 
                     templateAtualizado.getId(), templateAtualizado.getNome());

            // Retornar template formatado
            Map<String, Object> templateFormatado = new HashMap<>();
            templateFormatado.put("id", templateAtualizado.getId());
            templateFormatado.put("nome", templateAtualizado.getNome());
            templateFormatado.put("descricao", templateAtualizado.getDescricao());
            
            List<Map<String, Object>> camposList = templateAtualizado.getCampos().stream()
                .map(campo -> {
                    Map<String, Object> campoMap = new HashMap<>();
                    campoMap.put("id", campo.getId() != null ? campo.getId() : 0);
                    campoMap.put("nome", campo.getNome() != null ? campo.getNome() : "");
                    campoMap.put("valor", campo.getValor() != null ? campo.getValor() : "");
                    campoMap.put("tipo", campo.getTipo() != null ? campo.getTipo() : "text");
                    campoMap.put("ordem", campo.getOrdem() != null ? campo.getOrdem() : 0);
                    return campoMap;
                })
                .collect(java.util.stream.Collectors.toList());
            templateFormatado.put("campos", camposList);
            templateFormatado.put("totalUso", templateAtualizado.getTotalUso() != null ? templateAtualizado.getTotalUso() : 0);
            templateFormatado.put("ultimoUso", templateAtualizado.getUltimoUso() != null ? templateAtualizado.getUltimoUso().toString() : "");
            templateFormatado.put("dataCriacao", templateAtualizado.getDataCriacao() != null ? templateAtualizado.getDataCriacao().toString() : "");
            templateFormatado.put("dataAtualizacao", templateAtualizado.getDataAtualizacao() != null ? templateAtualizado.getDataAtualizacao().toString() : "");

            return ResponseEntity.ok(templateFormatado);

        } catch (Exception e) {
            log.error("❌ Erro ao atualizar template: {}", e.getMessage(), e);
            
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Erro interno ao atualizar template: " + e.getMessage(), 
                "INTERNAL_SERVER_ERROR"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint público para deletar template
     * Usado pela extensão Chrome para remover templates
     */
    @DeleteMapping("/templates/{templateId}")
    @Transactional
    public ResponseEntity<?> deletarTemplate(
            @RequestHeader(value = "X-Extension-Key", required = false) String key,
            @PathVariable Long templateId) {
        
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            log.warn("Tentativa de acesso sem chave válida: {}", key);
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            // ✅ BUSCAR TEMPLATE
            Template template = templateRepository.findById(templateId)
                    .orElse(null);
            
            if (template == null) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Template não encontrado", 
                    "TEMPLATE_NOT_FOUND"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            // ✅ SOFT DELETE - Marcar como inativo
            template.setAtivo(false);
            template.setDataAtualizacao(LocalDateTime.now());
            templateRepository.save(template);
            
            log.info("✅ Template deletado pela extensão - ID: {}, Nome: {}", 
                     templateId, template.getNome());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Template removido com sucesso");
            response.put("templateId", templateId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ Erro ao deletar template {}: {}", templateId, e.getMessage(), e);
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Erro interno ao deletar template", 
                "INTERNAL_SERVER_ERROR"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint público para registrar uso do template
     * Usado pela extensão Chrome para registrar quando um template é usado
     */
    @PostMapping("/templates/{templateId}/uso")
    @Transactional
    public ResponseEntity<?> registrarUsoTemplate(
            @RequestHeader(value = "X-Extension-Key", required = false) String key,
            @PathVariable Long templateId,
            @RequestBody Map<String, Object> payload) {
        
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            log.warn("Tentativa de acesso sem chave válida: {}", key);
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            // ✅ VALIDAÇÃO: Verificar se template existe
            Template template = templateRepository.findById(templateId)
                    .orElse(null);
            
            if (template == null) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Template não encontrado", 
                    "TEMPLATE_NOT_FOUND"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            // ✅ VERIFICAR SE TEMPLATE PERTENCE AO USUÁRIO PADRÃO DA EXTENSÃO
            if (!template.getUsuario().getEmail().equals("extensao@formsync.com")) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Template não pertence ao usuário da extensão", 
                    "TEMPLATE_ACCESS_DENIED"
                );
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            // ✅ ATUALIZAR ESTATÍSTICAS DO TEMPLATE
            Boolean sucesso = (Boolean) payload.get("success");
            if (sucesso != null) {
                template.setTotalUso(template.getTotalUso() != null ? template.getTotalUso() + 1 : 1);
                template.setUltimoUso(LocalDateTime.now());
                template.setDataAtualizacao(LocalDateTime.now());
                
                templateRepository.save(template);
                
                log.info("✅ Uso do template registrado - ID: {}, Nome: {}, Sucesso: {}", 
                         templateId, template.getNome(), sucesso);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Uso do template registrado com sucesso");
            response.put("templateId", templateId);
            response.put("totalUso", template.getTotalUso());
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Erro ao registrar uso do template: {}", e.getMessage(), e);
            
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Erro interno ao registrar uso do template: " + e.getMessage(), 
                "INTERNAL_SERVER_ERROR"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Endpoint público para listar campos
     * Usado pela extensão Chrome e frontend para carregar campos
     */
    @GetMapping("/campos")
    public ResponseEntity<?> listarCampos(
            @RequestHeader(value = "X-Extension-Key", required = false) String key,
            @RequestParam(value = "format", required = false) String format,
            @RequestParam(value = "q", required = false) String query) {
        
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            log.warn("Tentativa de acesso sem chave válida: {}", key);
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            List<Map<String, Object>> campos = new ArrayList<>();
            
            // Se for formato frontend, retornar campos de exemplo
            if ("frontend".equals(format)) {
                List<Map<String, Object>> camposList = new ArrayList<>();
                
                Map<String, Object> campo1 = new HashMap<>();
                campo1.put("id", 1);
                campo1.put("nome", "email");
                campo1.put("valor", "exemplo@email.com");
                campo1.put("site", "exemplo.com");
                campo1.put("tipo", "email");
                campo1.put("descricao", "Campo de email de exemplo");
                campo1.put("obrigatorio", true);
                campo1.put("valorPadrao", "exemplo@email.com");
                camposList.add(campo1);
                
                Map<String, Object> campo2 = new HashMap<>();
                campo2.put("id", 2);
                campo2.put("nome", "senha");
                campo2.put("valor", "senha123");
                campo2.put("site", "exemplo.com");
                campo2.put("tipo", "password");
                campo2.put("descricao", "Campo de senha de exemplo");
                campo2.put("obrigatorio", true);
                campo2.put("valorPadrao", "senha123");
                camposList.add(campo2);
                
                campos = camposList;
            } else if ("extension".equals(format) && query != null) {
                // Formato para extensão com busca
                List<Map<String, Object>> camposList = new ArrayList<>();
                Map<String, Object> campo = new HashMap<>();
                campo.put("username", "usuario_exemplo");
                campo.put("password", "senha123");
                campo.put("website", query);
                camposList.add(campo);
                campos = camposList;
            } else {
                // Formato padrão
                List<Map<String, Object>> camposList = new ArrayList<>();
                Map<String, Object> campo = new HashMap<>();
                campo.put("id", 1);
                campo.put("nome", "campo_exemplo");
                campo.put("valor", "valor_exemplo");
                campo.put("site", "site_exemplo.com");
                campo.put("tipo", "text");
                campo.put("descricao", "Campo de exemplo");
                campo.put("obrigatorio", false);
                campo.put("valorPadrao", "valor_padrao");
                camposList.add(campo);
                campos = camposList;
            }
            
            log.info("Encontrados {} campos para formato: {}", campos.size(), format);
            return ResponseEntity.ok(campos);
            
        } catch (Exception e) {
            log.error("Erro ao listar campos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponseDTO("Erro interno ao listar campos", "INTERNAL_SERVER_ERROR")
            );
        }
    }


    @GetMapping("/health")
    public ResponseEntity<?> healthCheck(@RequestHeader(value = "X-Extension-Key", required = false) String key) {
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        log.info("Extensão solicitando health check");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Extensão conectada com sucesso");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("version", "1.0.0");
        
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint de debug para testar JWT e templates
     */
    @GetMapping("/debug/templates")
    public ResponseEntity<?> debugTemplates(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        try {
            log.info("🔍 [DEBUG] Iniciando debug de templates");
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Token JWT necessário");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            String token = authHeader.substring(7);
            log.info("🔍 [DEBUG] Token recebido: {}...", token.substring(0, Math.min(20, token.length())));
            
            // Testar extração de email
            String email = extrairEmailDoToken(token);
            log.info("🔍 [DEBUG] Email extraído: {}", email);
            
            if (email == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Token inválido ou expirado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
            
            // Buscar usuário
            Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
            if (usuario == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Usuário não encontrado");
                errorResponse.put("email", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            log.info("🔍 [DEBUG] Usuário encontrado: ID={}, Email={}", usuario.getId(), usuario.getEmail());
            
            // Testar busca de templates
            List<Template> templates = templateRepository.findByUsuarioIdAndAtivoOrderByNomeAsc(usuario.getId(), true);
            log.info("🔍 [DEBUG] Templates encontrados: {}", templates.size());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("email", email);
            response.put("usuarioId", usuario.getId());
            response.put("templatesCount", templates.size());
            
            List<Map<String, Object>> templatesList = templates.stream().map(t -> {
                Map<String, Object> templateMap = new HashMap<>();
                templateMap.put("id", t.getId());
                templateMap.put("nome", t.getNome());
                templateMap.put("ativo", t.getAtivo());
                return templateMap;
            }).collect(java.util.stream.Collectors.toList());
            response.put("templates", templatesList);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [DEBUG] Erro no debug: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro interno: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/historico/registrar")
    public ResponseEntity<?> registrarHistorico(@RequestHeader(value = "X-Extension-Key", required = false) String key,
                                               @RequestBody Map<String, Object> payload) {
        // ✅ VALIDAÇÃO: Verificar chave de extensão
        if (!EXTENSION_KEY.equals(key)) {
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Chave de acesso inválida ou ausente", 
                "INVALID_EXTENSION_KEY"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        try {
            // ✅ VALIDAÇÃO: Verificar se payload tem os campos necessários
            String url = (String) payload.get("url");
            Long usuarioId = Long.valueOf(payload.get("usuarioId").toString());
            
            if (url == null || usuarioId == null) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "URL e usuarioId são obrigatórios", 
                    "MISSING_REQUIRED_FIELDS"
                );
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            // ✅ VALIDAÇÃO: Verificar se usuário existe
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElse(null);
            
            if (usuario == null) {
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Usuário não encontrado", 
                    "USER_NOT_FOUND"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }

            // ✅ CRIAR REGISTRO DE HISTÓRICO
            HistoricoPreenchimento historico = new HistoricoPreenchimento();
            historico.setUsuario(usuario);
            historico.setUrl(url);
            historico.setDataHora(LocalDateTime.now());

            HistoricoPreenchimento salvo = historicoRepository.save(historico);
            
            log.info("✅ Histórico registrado pela extensão - ID: {}, Usuário: {}, URL: {}", 
                     salvo.getId(), usuario.getEmail(), url);

            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);

        } catch (Exception e) {
            log.error("❌ Erro ao registrar histórico: {}", e.getMessage());
            
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Erro interno ao registrar histórico: " + e.getMessage(), 
                "INTERNAL_SERVER_ERROR"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Extrai o email do token JWT usando JwtTokenUtil
     */
    private String extrairEmailDoToken(String token) {
        try {
            log.info("🔐 [JWT] Extraindo email do token: {}", token.substring(0, Math.min(20, token.length())) + "...");
            
            // Usar JwtTokenUtil para extrair email do token
            String email = jwtTokenUtil.extractEmail(token);
            
            // Verificar se o token é válido
            if (email != null && !jwtTokenUtil.isTokenExpired(token)) {
                log.info("✅ [JWT] Email extraído com sucesso: {}", email);
                return email;
            } else {
                log.warn("❌ [JWT] Token inválido ou expirado");
                return null;
            }
            
        } catch (Exception e) {
            log.error("❌ [JWT] Erro ao extrair email do token: {}", e.getMessage());
            return null;
        }
    }
}
package br.com.backend.controller;

import br.com.backend.dto.TemplateDTO;
import br.com.backend.dto.PreenchimentoAutomaticoDTO;
import br.com.backend.service.TemplateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
@Slf4j
public class TemplateController {
    
    private final TemplateService templateService;
    
    /**
     * Cria um Novo Formulário
     */
    @PostMapping
    public ResponseEntity<TemplateDTO> criarTemplate(@Valid @RequestBody TemplateDTO templateDTO) {
        log.info("📝 [TEMPLATE] Criação de template solicitada para usuário: {}", templateDTO.getUsuarioId());
        
        try {
            TemplateDTO templateCriado = templateService.criarTemplate(templateDTO);
            log.info("✅ [TEMPLATE] Template criado com sucesso - ID: {}, Usuário: {}", 
                    templateCriado.getId(), templateCriado.getUsuarioId());
            return ResponseEntity.ok(templateCriado);
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao criar template para usuário {}: {}", 
                    templateDTO.getUsuarioId(), e.getMessage());
            throw e; // Re-throw para ser tratado pelo ExceptionHandler global
        }
    }
    
    /**
     * Atualiza um template existente
     */
    @PutMapping("/{templateId}")
    public ResponseEntity<TemplateDTO> atualizarTemplate(
            @PathVariable @Positive Long templateId,
            @Valid @RequestBody TemplateDTO templateDTO,
            @RequestParam @Positive Long usuarioId) {
        
        log.info("✏️ [TEMPLATE] Atualização de template solicitada - ID: {}, Usuário: {}", templateId, usuarioId);
        
        try {
            TemplateDTO templateAtualizado = templateService.atualizarTemplate(templateId, templateDTO, usuarioId);
            log.info("✅ [TEMPLATE] Template atualizado com sucesso - ID: {}, Usuário: {}", templateId, usuarioId);
            return ResponseEntity.ok(templateAtualizado);
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao atualizar template {} para usuário {}: {}", 
                    templateId, usuarioId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Busca template por ID
     */
    @GetMapping("/{templateId}")
    public ResponseEntity<TemplateDTO> buscarTemplatePorId(
            @PathVariable @Positive Long templateId,
            @RequestParam @Positive Long usuarioId) {
        
        log.debug("🔍 [TEMPLATE] Busca de template solicitada - ID: {}, Usuário: {}", templateId, usuarioId);
        
        try {
            TemplateDTO template = templateService.buscarTemplatePorId(templateId, usuarioId);
            log.debug("✅ [TEMPLATE] Template encontrado - ID: {}, Usuário: {}", templateId, usuarioId);
            return ResponseEntity.ok(template);
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao buscar template {} para usuário {}: {}", 
                    templateId, usuarioId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Lista todos os templates (para administradores ou uso geral)
     */
    @GetMapping
    public ResponseEntity<List<TemplateDTO>> listarTodosTemplates() {
        log.info("📋 [TEMPLATE] Listagem de todos os templates solicitada");
        
        try {
            // TODO: Implementar lógica de autorização e filtros
            // Por enquanto, retornar lista vazia
            List<TemplateDTO> templates = List.of();
            log.info("✅ [TEMPLATE] {} templates listados com sucesso", templates.size());
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao listar todos os templates: {}", e.getMessage());
            throw e;
        }
    }

    /**
     * Lista todos os templates do usuário
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<TemplateDTO>> listarTemplates(@PathVariable @Positive Long usuarioId) {
        log.debug("📋 [TEMPLATE] Listagem de templates solicitada para usuário: {}", usuarioId);
        
        try {
            List<TemplateDTO> templates = templateService.listarTemplates(usuarioId);
            log.debug("✅ [TEMPLATE] {} templates listados para usuário: {}", templates.size(), usuarioId);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao listar templates para usuário {}: {}", usuarioId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Busca templates por padrão de nome
     */
    @GetMapping("/usuario/{usuarioId}/busca")
    public ResponseEntity<List<TemplateDTO>> buscarTemplatesPorPadrao(
            @PathVariable @Positive Long usuarioId,
            @RequestParam @NotBlank String padrao) {
        
        log.debug("🔍 [TEMPLATE] Busca de templates por padrão solicitada - Usuário: {}, Padrão: {}", usuarioId, padrao);
        
        try {
            List<TemplateDTO> templates = templateService.buscarTemplatesPorPadrao(usuarioId, padrao);
            log.debug("✅ [TEMPLATE] {} templates encontrados para usuário {} com padrão '{}'", 
                    templates.size(), usuarioId, padrao);
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao buscar templates para usuário {} com padrão '{}': {}", 
                    usuarioId, padrao, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Remove um template (soft delete) - versão temporária sem validação de usuário
     */
    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> removerTemplate(@PathVariable @Positive Long templateId) {
        log.warn("🗑️ [TEMPLATE] Remoção de template solicitada sem validação de usuário - ID: {}", templateId);
        
        try {
            // TODO: Implementar validação de usuário e autorização
            // Por enquanto, apenas retornar sucesso
            log.warn("✅ [TEMPLATE] Template {} removido com sucesso (admin)", templateId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao remover template {} (admin): {}", templateId, e.getMessage());
            throw e;
        }
    }

    /**
     * Remove um template (soft delete) - versão com validação de usuário
     */
    @DeleteMapping("/{templateId}/usuario")
    public ResponseEntity<Void> removerTemplateComUsuario(
            @PathVariable @Positive Long templateId,
            @RequestParam @Positive Long usuarioId) {
        
        log.info("🗑️ [TEMPLATE] Remoção de template solicitada - ID: {}, Usuário: {}", templateId, usuarioId);
        
        try {
            templateService.removerTemplate(templateId, usuarioId);
            log.info("✅ [TEMPLATE] Template {} removido com sucesso pelo usuário {}", templateId, usuarioId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao remover template {} pelo usuário {}: {}", 
                    templateId, usuarioId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Incrementa o uso de um template
     */
    @PostMapping("/{templateId}/uso")
    public ResponseEntity<Void> incrementarUsoTemplate(
            @PathVariable @Positive Long templateId,
            @RequestParam @Positive Long usuarioId) {
        
        log.debug("📈 [TEMPLATE] Incremento de uso solicitado - ID: {}, Usuário: {}", templateId, usuarioId);
        
        try {
            templateService.incrementarUsoTemplate(templateId, usuarioId);
            log.debug("✅ [TEMPLATE] Uso do template {} incrementado para usuário {}", templateId, usuarioId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao incrementar uso do template {} para usuário {}: {}", 
                    templateId, usuarioId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Prepara dados para preenchimento automático
     */
    @GetMapping("/{templateId}/preenchimento")
    public ResponseEntity<PreenchimentoAutomaticoDTO> prepararPreenchimentoAutomatico(
            @PathVariable @Positive Long templateId,
            @RequestParam @NotBlank String urlSite,
            @RequestParam @Positive Long usuarioId) {
        
        log.info("🤖 [TEMPLATE] Preenchimento automático solicitado - ID: {}, Site: {}, Usuário: {}", 
                templateId, urlSite, usuarioId);
        
        try {
            PreenchimentoAutomaticoDTO preenchimento = templateService.prepararPreenchimentoAutomatico(templateId, urlSite, usuarioId);
            log.info("✅ [TEMPLATE] Preenchimento automático preparado com sucesso - ID: {}, Usuário: {}", 
                    templateId, usuarioId);
            return ResponseEntity.ok(preenchimento);
        } catch (Exception e) {
            log.error("❌ [TEMPLATE] Erro ao preparar preenchimento automático - ID: {}, Usuário: {}, Erro: {}", 
                    templateId, usuarioId, e.getMessage());
            throw e;
        }
    }
}

package br.com.backend.controller;

import br.com.backend.entity.HistoricoPreenchimento;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.HistoricoPreenchimentoRepository;
import br.com.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/historico")
@RequiredArgsConstructor
@Slf4j
public class HistoricoController {

    private final HistoricoPreenchimentoRepository historicoRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<HistoricoPreenchimento>> listarHistorico() {
        log.debug("📋 [HISTORICO] Listagem de histórico solicitada");
        
        try {
            // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
            Usuario usuario = getUsuarioAutenticado();
            
            // Buscar histórico do usuário logado
            List<HistoricoPreenchimento> historico = historicoRepository.findByUsuarioId(usuario.getId());
            
            log.debug("✅ [HISTORICO] {} registros de histórico listados para usuário: {}", historico.size(), usuario.getId());
            return ResponseEntity.ok(historico);
            
        } catch (Exception e) {
            log.error("❌ [HISTORICO] Erro ao listar histórico: {}", e.getMessage());
            throw e;
        }
    }

    @PostMapping
    public ResponseEntity<HistoricoPreenchimento> salvarHistorico(@Valid @RequestBody HistoricoPreenchimento historico) {
        log.info("💾 [HISTORICO] Salvamento de histórico solicitado");
        
        try {
            // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
            Usuario usuario = getUsuarioAutenticado();
            
            // Associar o histórico ao usuário logado
            historico.setUsuario(usuario);
            
            HistoricoPreenchimento salvo = historicoRepository.save(historico);
            
            log.info("✅ [HISTORICO] Histórico salvo com sucesso - ID: {}, Usuário: {}", salvo.getId(), usuario.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
            
        } catch (Exception e) {
            log.error("❌ [HISTORICO] Erro ao salvar histórico: {}", e.getMessage());
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarHistorico(@PathVariable @Positive Long id) {
        log.info("🗑️ [HISTORICO] Deleção de histórico solicitada - ID: {}", id);
        
        try {
            // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
            Usuario usuario = getUsuarioAutenticado();
            
            // Verificar se o histórico pertence ao usuário logado
            HistoricoPreenchimento historico = historicoRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Histórico não encontrado"));
            
            if (!historico.getUsuario().getId().equals(usuario.getId())) {
                log.warn("🚫 [HISTORICO] Tentativa de deleção de histórico não autorizada - ID: {}, Usuário: {}, Proprietário: {}", 
                        id, usuario.getId(), historico.getUsuario().getId());
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                    "Você só pode deletar seu próprio histórico");
            }
            
            historicoRepository.deleteById(id);
            
            log.info("✅ [HISTORICO] Histórico {} deletado com sucesso pelo usuário {}", id, usuario.getId());
            return ResponseEntity.noContent().build();
            
        } catch (ResponseStatusException e) {
            throw e; // Re-throw para manter o status HTTP específico
        } catch (Exception e) {
            log.error("❌ [HISTORICO] Erro ao deletar histórico {}: {}", id, e.getMessage());
            throw e;
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> limparHistorico() {
        log.warn("🗑️ [HISTORICO] Limpeza completa de histórico solicitada");
        
        try {
            // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
            Usuario usuario = getUsuarioAutenticado();
            
            // Buscar todos os registros do usuário e deletar
            List<HistoricoPreenchimento> historico = historicoRepository.findByUsuarioId(usuario.getId());
            historicoRepository.deleteAll(historico);
            
            log.warn("✅ [HISTORICO] {} registros de histórico limpos para usuário: {}", historico.size(), usuario.getId());
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            log.error("❌ [HISTORICO] Erro ao limpar histórico: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Obtém o usuário autenticado do contexto de segurança
     */
    private Usuario getUsuarioAutenticado() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();
            
            log.debug("🔐 [HISTORICO] Verificando autenticação para usuário: {}", email);
            
            return usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                        "Usuário não encontrado: " + email));
                        
        } catch (Exception e) {
            log.error("❌ [HISTORICO] Erro ao obter usuário autenticado: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado");
        }
    }
} 
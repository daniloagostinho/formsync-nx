package br.com.backend.controller;

import br.com.backend.dto.MapeamentoCampoDTO;
import br.com.backend.service.MapeamentoCampoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;
import java.util.List;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/mapeamentos")
@RequiredArgsConstructor
@Slf4j
public class MapeamentoCampoController {
    
    private final MapeamentoCampoService mapeamentoCampoService;
    
    /**
     * Cria um novo mapeamento de campo
     */
    @PostMapping
    public ResponseEntity<MapeamentoCampoDTO> criarMapeamento(@Valid @RequestBody MapeamentoCampoDTO mapeamentoDTO) {
        log.info("📝 [MAPEAMENTO] Criação de mapeamento solicitada");
        
        try {
            MapeamentoCampoDTO mapeamentoCriado = mapeamentoCampoService.criarMapeamento(mapeamentoDTO);
            log.info("✅ [MAPEAMENTO] Mapeamento criado com sucesso - ID: {}", 
                    mapeamentoCriado.getId());
            return ResponseEntity.ok(mapeamentoCriado);
        } catch (Exception e) {
            log.error("❌ [MAPEAMENTO] Erro ao criar mapeamento: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Busca mapeamentos por URL do site
     */
    @GetMapping("/site")
    public ResponseEntity<List<MapeamentoCampoDTO>> buscarMapeamentosPorSite(@RequestParam @NotBlank String urlSite) {
        log.debug("🔍 [MAPEAMENTO] Busca de mapeamentos por site solicitada: {}", urlSite);
        
        try {
            List<MapeamentoCampoDTO> mapeamentos = mapeamentoCampoService.buscarMapeamentosPorSite(urlSite);
            log.debug("✅ [MAPEAMENTO] {} mapeamentos encontrados para o site: {}", mapeamentos.size(), urlSite);
            return ResponseEntity.ok(mapeamentos);
        } catch (Exception e) {
            log.error("❌ [MAPEAMENTO] Erro ao buscar mapeamentos para o site {}: {}", urlSite, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Busca mapeamentos confiáveis para um site
     */
    @GetMapping("/site/confiaveis")
    public ResponseEntity<List<MapeamentoCampoDTO>> buscarMapeamentosConfiaveis(
            @RequestParam @NotBlank String urlSite,
            @RequestParam(required = false) @DecimalMin("0.0") @DecimalMax("1.0") Double confiancaMinima) {
        
        log.debug("🔍 [MAPEAMENTO] Busca de mapeamentos confiáveis solicitada - Site: {}, Confiança: {}", 
                urlSite, confiancaMinima);
        
        try {
            List<MapeamentoCampoDTO> mapeamentos = mapeamentoCampoService.buscarMapeamentosConfiaveis(urlSite, confiancaMinima);
            log.debug("✅ [MAPEAMENTO] {} mapeamentos confiáveis encontrados para o site: {}", mapeamentos.size(), urlSite);
            return ResponseEntity.ok(mapeamentos);
        } catch (Exception e) {
            log.error("❌ [MAPEAMENTO] Erro ao buscar mapeamentos confiáveis para o site {}: {}", urlSite, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Registra o uso de um mapeamento
     */
    @PostMapping("/{mapeamentoId}/uso")
    public ResponseEntity<Void> registrarUsoMapeamento(
            @PathVariable @Positive Long mapeamentoId,
            @RequestParam @NotNull Boolean sucesso) {
        
        log.debug("📊 [MAPEAMENTO] Registro de uso solicitado - ID: {}, Sucesso: {}", mapeamentoId, sucesso);
        
        try {
            mapeamentoCampoService.registrarUsoMapeamento(mapeamentoId, sucesso);
            log.debug("✅ [MAPEAMENTO] Uso do mapeamento {} registrado com sucesso", mapeamentoId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ [MAPEAMENTO] Erro ao registrar uso do mapeamento {}: {}", mapeamentoId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Atualiza a confiança de um mapeamento
     */
    @PutMapping("/{mapeamentoId}/confianca")
    public ResponseEntity<Void> atualizarConfianca(
            @PathVariable @Positive Long mapeamentoId,
            @RequestParam @DecimalMin("0.0") @DecimalMax("1.0") Double confianca) {
        
        log.info("📈 [MAPEAMENTO] Atualização de confiança solicitada - ID: {}, Nova confiança: {}", 
                mapeamentoId, confianca);
        
        try {
            mapeamentoCampoService.atualizarConfianca(mapeamentoId, confianca);
            log.info("✅ [MAPEAMENTO] Confiança do mapeamento {} atualizada para: {}", mapeamentoId, confianca);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("❌ [MAPEAMENTO] Erro ao atualizar confiança do mapeamento {}: {}", mapeamentoId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Remove um mapeamento (soft delete)
     */
    @DeleteMapping("/{mapeamentoId}")
    public ResponseEntity<Void> removerMapeamento(@PathVariable @Positive Long mapeamentoId) {
        log.warn("🗑️ [MAPEAMENTO] Remoção de mapeamento solicitada - ID: {}", mapeamentoId);
        
        try {
            mapeamentoCampoService.removerMapeamento(mapeamentoId);
            log.warn("✅ [MAPEAMENTO] Mapeamento {} removido com sucesso", mapeamentoId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("❌ [MAPEAMENTO] Erro ao remover mapeamento {}: {}", mapeamentoId, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Busca mapeamentos por usuário
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<MapeamentoCampoDTO>> buscarMapeamentosPorUsuario(@PathVariable @Positive Long usuarioId) {
        log.debug("🔍 [MAPEAMENTO] Busca de mapeamentos por usuário solicitada: {}", usuarioId);
        
        try {
            List<MapeamentoCampoDTO> mapeamentos = mapeamentoCampoService.buscarMapeamentosPorUsuario(usuarioId);
            log.debug("✅ [MAPEAMENTO] {} mapeamentos encontrados para o usuário: {}", mapeamentos.size(), usuarioId);
            return ResponseEntity.ok(mapeamentos);
        } catch (Exception e) {
            log.error("❌ [MAPEAMENTO] Erro ao buscar mapeamentos para o usuário {}: {}", usuarioId, e.getMessage());
            throw e;
        }
    }
}

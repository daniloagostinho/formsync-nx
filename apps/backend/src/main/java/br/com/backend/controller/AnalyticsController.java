package br.com.backend.controller;

import br.com.backend.dto.AnalyticsResponseDTO;
import br.com.backend.dto.PreenchimentoAnalyticsDTO;
import br.com.backend.dto.CampoAnalyticsDTO;
import br.com.backend.dto.SiteAnalyticsDTO;
import br.com.backend.service.AdvancedAnalyticsService;
import br.com.backend.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AdvancedAnalyticsService analyticsService;
    private final JwtTokenUtil jwtTokenUtil;

    /**
     * Obtém dados gerais de analytics do usuário
     */
    @GetMapping("/dados")
    public ResponseEntity<AnalyticsResponseDTO> getAnalyticsData(
            @RequestParam(defaultValue = "30") @NotBlank String periodo,
            @RequestHeader("Authorization") @NotBlank String token) {
        
        log.info("📊 [ANALYTICS] Dados de analytics solicitados - Período: {}", periodo);
        
        try {
            Long userId = extractUserIdFromToken(token);
            AnalyticsResponseDTO dados = analyticsService.getAnalyticsData(userId, periodo);
            
            log.info("✅ [ANALYTICS] Dados de analytics obtidos com sucesso para usuário: {}", userId);
            return ResponseEntity.ok(dados);
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao obter dados de analytics: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtém dados de preenchimentos por período
     */
    @GetMapping("/preenchimentos")
    public ResponseEntity<List<PreenchimentoAnalyticsDTO>> getPreenchimentosPorPeriodo(
            @RequestParam(defaultValue = "30") @NotBlank String periodo,
            @RequestHeader("Authorization") @NotBlank String token) {
        
        log.debug("📊 [ANALYTICS] Preenchimentos por período solicitados - Período: {}", periodo);
        
        try {
            Long userId = extractUserIdFromToken(token);
            List<PreenchimentoAnalyticsDTO> dados = analyticsService.getPreenchimentosPorPeriodo(userId, periodo);
            
            log.debug("✅ [ANALYTICS] Preenchimentos obtidos com sucesso para usuário: {} - {} registros", userId, dados.size());
            return ResponseEntity.ok(dados);
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao obter preenchimentos: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtém campos mais utilizados
     */
    @GetMapping("/campos")
    public ResponseEntity<List<CampoAnalyticsDTO>> getCamposMaisUtilizados(
            @RequestHeader("Authorization") @NotBlank String token) {
        
        log.debug("📊 [ANALYTICS] Campos mais utilizados solicitados");
        
        try {
            Long userId = extractUserIdFromToken(token);
            List<CampoAnalyticsDTO> dados = analyticsService.getCamposMaisUtilizados(userId);
            
            log.debug("✅ [ANALYTICS] Campos mais utilizados obtidos com sucesso para usuário: {} - {} campos", userId, dados.size());
            return ResponseEntity.ok(dados);
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao obter campos: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtém sites mais acessados
     */
    @GetMapping("/sites")
    public ResponseEntity<List<SiteAnalyticsDTO>> getSitesMaisAcessados(
            @RequestHeader("Authorization") @NotBlank String token) {
        
        log.debug("📊 [ANALYTICS] Sites mais acessados solicitados");
        
        try {
            Long userId = extractUserIdFromToken(token);
            List<SiteAnalyticsDTO> dados = analyticsService.getSitesMaisAcessados(userId);
            
            log.debug("✅ [ANALYTICS] Sites mais acessados obtidos com sucesso para usuário: {} - {} sites", userId, dados.size());
            return ResponseEntity.ok(dados);
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao obter sites: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtém insights e recomendações
     */
    @GetMapping("/insights")
    public ResponseEntity<List<Map<String, Object>>> getInsights(
            @RequestHeader("Authorization") @NotBlank String token) {
        
        log.debug("💡 [ANALYTICS] Insights solicitados");
        
        try {
            Long userId = extractUserIdFromToken(token);
            List<Map<String, Object>> insights = analyticsService.getInsights(userId);
            
            log.debug("✅ [ANALYTICS] Insights obtidos com sucesso para usuário: {} - {} insights", userId, insights.size());
            return ResponseEntity.ok(insights);
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao obter insights: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Rastreia um novo preenchimento
     */
    @PostMapping("/track")
    public ResponseEntity<Void> trackPreenchimento(
            @RequestParam @NotBlank String site,
            @RequestParam(required = false) Long campoId,
            @RequestHeader("Authorization") @NotBlank String token) {
        
        log.info("📊 [ANALYTICS] Rastreamento de preenchimento solicitado - Site: {}, Campo: {}", site, campoId);
        
        try {
            Long userId = extractUserIdFromToken(token);
            analyticsService.trackPreenchimento(userId, site, campoId);
            
            log.info("✅ [ANALYTICS] Preenchimento rastreado com sucesso - Usuário: {}, Site: {}, Campo: {}", userId, site, campoId);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao rastrear preenchimento: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Rastreia tempo economizado
     */
    @PostMapping("/track-tempo")
    public ResponseEntity<Void> trackTempoEconomizado(
            @RequestParam @Positive Integer tempoSegundos,
            @RequestHeader("Authorization") @NotBlank String token) {
        
        log.info("⏱️ [ANALYTICS] Rastreamento de tempo economizado solicitado - Tempo: {}s", tempoSegundos);
        
        try {
            Long userId = extractUserIdFromToken(token);
            analyticsService.trackTempoEconomizado(userId, tempoSegundos);
            
            log.info("✅ [ANALYTICS] Tempo economizado rastreado com sucesso - Usuário: {}, Tempo: {}s", userId, tempoSegundos);
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao rastrear tempo: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Extrai userId do token JWT
     */
    private Long extractUserIdFromToken(String token) {
        try {
            log.debug("🔐 [ANALYTICS] Extraindo userId do token JWT");
            
            // Remove "Bearer " do início do token
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            // Extrai o email do token
            String email = jwtTokenUtil.getUsernameFromToken(token);
            
            // TODO: Em produção, buscar o userId no banco de dados baseado no email
            // Por enquanto, vamos usar um userId fixo baseado no email
            Long userId = (long) (Math.abs(email.hashCode()) % 1000 + 1);
            
            log.debug("✅ [ANALYTICS] UserId extraído com sucesso: {} para email: {}", userId, email);
            return userId;
            
        } catch (Exception e) {
            log.error("❌ [ANALYTICS] Erro ao extrair userId do token: {}", e.getMessage());
            // Fallback para desenvolvimento - não usar em produção
            log.warn("⚠️ [ANALYTICS] Usando userId fallback para desenvolvimento");
            return 1L;
        }
    }
}
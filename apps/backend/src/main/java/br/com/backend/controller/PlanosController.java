package br.com.backend.controller;

import br.com.backend.service.PlanoLimiteService;
import br.com.backend.service.PlanoLimiteService.PlanoEstatisticasDTO;
import br.com.backend.entity.Usuario;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import java.util.List;
import java.util.HashMap;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1/planos")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class PlanosController {

    private final PlanoLimiteService planoLimiteService;

    @GetMapping
    public ResponseEntity<?> listarPlanos() {
        log.info("📋 [PLANOS] Listagem de planos solicitada");
        
        try {
            // TODO: Mover configuração dos planos para um serviço ou arquivo de configuração
            // Configuração dos planos atualizada para FormSync - VIÁVEIS FINANCEIRAMENTE
            Map<String, Object> planos = new HashMap<>();
            
            // PESSOAL
            Map<String, Object> pessoal = new HashMap<>();
            pessoal.put("nome", "Pessoal");
            pessoal.put("preco", 14.90);
            pessoal.put("precoFormatado", "R$ 14,90/mês");
            pessoal.put("limiteTemplates", 5);
            pessoal.put("limiteTotalCampos", 150);
            pessoal.put("limiteCamposPorTemplate", 30);
            pessoal.put("limite", 150);
            pessoal.put("descricao", "Ideal para uso pessoal e teste do sistema");
            pessoal.put("descricaoSimples", "Perfeito para quem está começando e quer testar o sistema");
            pessoal.put("recursos", Arrays.asList(
                "App desktop completo",
                "Extensão Chrome/Firefox",
                "5 formulários diferentes",
                "Até 150 campos no total",
                "Suporte por email"
            ));
            pessoal.put("recursosSimples", Arrays.asList(
                "📁 5 formulários diferentes",
                "📄 150 campos no total",
                "📧 Suporte por email",
                "✨ Todos os recursos básicos"
            ));
            pessoal.put("caracteristicas", Arrays.asList(
                "App desktop completo",
                "Extensão Chrome/Firefox",
                "5 formulários diferentes",
                "Até 150 campos no total",
                "Preenchimento básico"
            ));
            pessoal.put("exemploUso", "5 formulários completos (vagas, cadastros, login) com até 30 campos cada");
            pessoal.put("corCard", "gray");
            pessoal.put("custoMensal", 2.50);
            pessoal.put("margemLucro", 83.2);
            pessoal.put("explicacaoLimites", "5 formulários diferentes com até 150 campos no total");
            pessoal.put("exemplosSites", Arrays.asList("Candidatos de vagas", "Usuários pessoais", "Estudantes"));
            pessoal.put("casoUso", "Para quem preenche poucos formulários na internet e quer automatizar login e cadastros básicos");
            
            planos.put("PESSOAL", pessoal);
            
            // PROFISSIONAL
            Map<String, Object> profissional = new HashMap<>();
            profissional.put("id", "PROFISSIONAL");
            profissional.put("nome", "Profissional");
            profissional.put("nomeCompleto", "Plano Profissional");
            profissional.put("preco", 39.90);
            profissional.put("precoFormatado", "R$ 39,90/mês");
            profissional.put("limiteTemplates", 50);
            profissional.put("limiteTotalCampos", 1000);
            profissional.put("limiteCamposPorTemplate", 50);
            profissional.put("limite", 1000);
            profissional.put("recursos", Arrays.asList(
                "App desktop completo",
                "Até 1000 campos salvos",
                "Histórico de preenchimentos",
                "Suporte prioritário",
                "Atualizações automáticas",
                "Templates avançados",
                "Upload CSV"
            ));
            profissional.put("recursosSimples", Arrays.asList(
                "📁 50 formulários diferentes",
                "📄 1000 campos no total",
                "📊 Relatórios de uso",
                "📤 Importar de planilhas",
                "🎧 Suporte prioritário",
                "⚡ Atualizações automáticas"
            ));
            profissional.put("caracteristicas", Arrays.asList(
                "App desktop completo",
                "Até 1000 campos salvos",
                "Histórico de preenchimentos",
                "Suporte prioritário",
                "Atualizações automáticas",
                "Templates avançados",
                "Upload CSV"
            ));
            profissional.put("exemploUso", "Formulários de trabalho + clientes + uso pessoal. Perfeito para freelancers e profissionais ativos.");
            profissional.put("corCard", "blue");
            profissional.put("custoMensal", 2.50);
            profissional.put("margemLucro", 93.7);
            profissional.put("explicacaoLimites", "50 formulários diferentes com até 1000 campos no total");
            profissional.put("exemplosSites", Arrays.asList("Freelancers", "Profissionais ativos", "Consultores"));
            profissional.put("casoUso", "Para profissionais que preenchem muitos formulários no trabalho e precisam automatizar processos complexos");

            // EMPRESARIAL
            Map<String, Object> empresarial = new HashMap<>();
            empresarial.put("nome", "Empresarial");
            empresarial.put("preco", 149.90);
            empresarial.put("precoFormatado", "R$ 149,90/mês");
            empresarial.put("limiteTemplates", 200);
            empresarial.put("limiteTotalCampos", 5000);
            empresarial.put("limiteCamposPorTemplate", 200);
            empresarial.put("limite", 5000);
            empresarial.put("descricao", "Para empresas e equipes");
            empresarial.put("descricaoSimples", "Solução completa para empresas com múltiplas equipes e necessidades avançadas");
            empresarial.put("recursos", Arrays.asList(
                "App desktop completo",
                "Extensão Chrome/Firefox",
                "200 formulários diferentes",
                "Até 5000 campos no total",
                "Gestão para equipes",
                "Relatórios empresariais",
                "Importação em lote",
                "Suporte prioritário",
                "Recursos de segurança",
                "Suporte por telefone"
            ));
            empresarial.put("recursosSimples", Arrays.asList(
                "📁 200 formulários diferentes",
                "📄 5000 campos no total",
                "🏢 Gestão para equipes",
                "📊 Relatórios empresariais",
                "📤 Importação em lote",
                "🎧 Suporte prioritário",
                "🔒 Recursos de segurança",
                "📞 Suporte por telefone"
            ));
            empresarial.put("caracteristicas", Arrays.asList(
                "App desktop completo",
                "Extensão Chrome/Firefox",
                "200 formulários diferentes",
                "Até 5000 campos no total",
                "Gestão para equipes",
                "Relatórios empresariais",
                "Importação em lote",
                "Suporte prioritário",
                "Recursos de segurança",
                "Suporte por telefone"
            ));
            empresarial.put("exemploUso", "200 formulários completos para equipes empresariais");
            empresarial.put("corCard", "purple");
            empresarial.put("custoMensal", 2.50);
            empresarial.put("margemLucro", 98.3);
            empresarial.put("explicacaoLimites", "200 formulários diferentes com até 5000 campos no total");
            empresarial.put("exemplosSites", Arrays.asList("Equipes de RH", "Departamento de vendas", "Marketing digital"));
            empresarial.put("casoUso", "Para empresas com múltiplas equipes que precisam automatizar centenas de formulários");
            
            planos.put("EMPRESARIAL", empresarial);
            
            log.info("✅ [PLANOS] {} planos listados com sucesso", planos.size());
            return ResponseEntity.ok(planos);
            
        } catch (Exception e) {
            log.error("❌ [PLANOS] Erro ao listar planos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao listar planos");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Endpoint para obter estatísticas de uso do usuário atual
     */
    @GetMapping("/estatisticas")
    public ResponseEntity<?> getEstatisticasUso() {
        log.info("📊 [PLANOS] Estatísticas de uso solicitadas");
        
        try {
            // Obter usuário autenticado
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("🚫 [PLANOS] Tentativa de acesso sem autenticação");
                return ResponseEntity.status(401).body(Map.of(
                    "error", "Usuário não autenticado"
                ));
            }

            // TODO: Implementar autenticação real e buscar usuário do banco
            // Por enquanto, retornar dados mockados
            Map<String, Object> estatisticas = new HashMap<>();
            estatisticas.put("plano", "PESSOAL");
            estatisticas.put("nomePlano", "Pessoal (Gratuito)");
            estatisticas.put("templatesAtuais", 1);
            estatisticas.put("totalCampos", 8);
            estatisticas.put("limiteTemplates", 3);
            estatisticas.put("limiteTotalCampos", 30);
            estatisticas.put("limiteCamposPorTemplate", 15);
            estatisticas.put("percentualTemplates", 33.33);
            estatisticas.put("percentualCampos", 26.67);
            estatisticas.put("estaProximoLimite", false);

            log.info("✅ [PLANOS] Estatísticas de uso obtidas com sucesso para usuário: {}", authentication.getName());
            return ResponseEntity.ok(estatisticas);
            
        } catch (Exception e) {
            log.error("❌ [PLANOS] Erro ao obter estatísticas de uso: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao obter estatísticas");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Endpoint para obter informações sobre limites e recursos dos planos
     */
    @GetMapping("/limites")
    public ResponseEntity<?> getLimitesPlanos() {
        log.debug("📋 [PLANOS] Limites dos planos solicitados");
        
        try {
            Map<String, Object> limites = new HashMap<>();
            
            Map<String, Object> pessoalLimites = new HashMap<>();
            pessoalLimites.put("limiteTemplates", 3);
            pessoalLimites.put("limiteTotalCampos", 30);
            pessoalLimites.put("limiteCamposPorTemplate", 15);
            pessoalLimites.put("permiteUploadCsv", false);
            pessoalLimites.put("permiteScheduler", false);
            pessoalLimites.put("recursos", List.of(
                "App desktop completo",
                "Até 30 campos salvos",
                "Suporte por email",
                "Preenchimento básico"
            ));
            limites.put("PESSOAL", pessoalLimites);
            
            Map<String, Object> profissionalLimites = new HashMap<>();
            profissionalLimites.put("limiteTemplates", 25);
            profissionalLimites.put("limiteTotalCampos", 500);
            profissionalLimites.put("limiteCamposPorTemplate", 50);
            profissionalLimites.put("permiteUploadCsv", true);
            profissionalLimites.put("permiteScheduler", false);
            profissionalLimites.put("recursos", List.of(
                "App desktop completo",
                "Até 500 campos salvos",
                "Histórico de preenchimentos",
                "Suporte prioritário",
                "Atualizações automáticas",
                "Templates avançados",
                "Upload CSV"
            ));
            limites.put("PROFISSIONAL", profissionalLimites);
            
            Map<String, Object> empresarialLimites = new HashMap<>();
            empresarialLimites.put("limiteTemplates", 100);
            empresarialLimites.put("limiteTotalCampos", 2000);
            empresarialLimites.put("limiteCamposPorTemplate", 200);
            empresarialLimites.put("permiteUploadCsv", true);
            empresarialLimites.put("permiteScheduler", true);
            empresarialLimites.put("recursos", List.of(
                "App desktop completo",
                "Até 2000 campos salvos",
                "Histórico de preenchimentos",
                "Suporte prioritário",
                "Atualizações automáticas",
                "Templates avançados",
                "Importação CSV",
                "Relatórios avançados",
                "Suporte empresarial",
                "Agendamento automático"
            ));
            limites.put("EMPRESARIAL", empresarialLimites);
            
            log.debug("✅ [PLANOS] Limites dos planos obtidos com sucesso");
            return ResponseEntity.ok(limites);
            
        } catch (Exception e) {
            log.error("❌ [PLANOS] Erro ao obter limites dos planos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao obter limites dos planos");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    /**
     * Endpoint para validar se o usuário pode realizar uma ação específica
     */
    @GetMapping("/validar")
    public ResponseEntity<?> validarAcao(
            @RequestParam @NotBlank String acao,
            @RequestParam(required = false) Long templateId,
            @RequestParam(required = false) Integer quantidadeCampos) {
        
        log.info("✅ [PLANOS] Validação de ação solicitada - Ação: {}, Template: {}, Campos: {}", acao, templateId, quantidadeCampos);
        
        try {
            // TODO: Implementar autenticação real e validação real
            // Por enquanto, retornar dados mockados
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("podeRealizar", true);
            resultado.put("mensagem", "Ação permitida");
            
            Map<String, Object> limitesRestantes = new HashMap<>();
            limitesRestantes.put("templates", 2);
            limitesRestantes.put("camposTotal", 22);
            limitesRestantes.put("camposPorTemplate", 12);
            resultado.put("limitesRestantes", limitesRestantes);

            log.info("✅ [PLANOS] Ação '{}' validada com sucesso", acao);
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            log.error("❌ [PLANOS] Erro ao validar ação '{}': {}", acao, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erro ao validar ação");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}







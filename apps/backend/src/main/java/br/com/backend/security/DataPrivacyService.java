package br.com.backend.security;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import br.com.backend.entity.Usuario;
import br.com.backend.entity.Template;
import br.com.backend.entity.CampoTemplate;
import br.com.backend.entity.HistoricoPreenchimento;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.repository.TemplateRepository;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.repository.MapeamentoCampoRepository;
import br.com.backend.repository.HistoricoPreenchimentoRepository;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;

@Service
@Slf4j
public class DataPrivacyService {

    @Autowired
    private EncryptionService encryptionService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private TemplateRepository templateRepository;
    
    @Autowired
    private CampoTemplateRepository campoTemplateRepository;
    
    @Autowired
    private MapeamentoCampoRepository mapeamentoCampoRepository;
    
    @Autowired
    private HistoricoPreenchimentoRepository historicoPreenchimentoRepository;

    /**
     * Registra o consentimento do usuário para coleta de dados
     */
    public void registrarConsentimento(Long usuarioId, String tipoDado, boolean consentimento, 
                                      String ipAddress, String userAgent) {
        try {
            // Buscar usuário
            Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            
            // Registrar consentimento baseado no tipo
            switch (tipoDado.toUpperCase()) {
                case "LGPD":
                case "GERAL":
                    usuario.setConsentimentoLGPD(consentimento);
                    if (consentimento) {
                        usuario.setDataConsentimento(LocalDateTime.now());
                        usuario.setIpConsentimento(ipAddress);
                        usuario.setUserAgentConsentimento(userAgent);
                    }
                    break;
                case "MARKETING":
                    usuario.setConsentimentoMarketing(consentimento);
                    break;
                case "ANALYTICS":
                    usuario.setConsentimentoAnalytics(consentimento);
                    break;
                default:
                    throw new RuntimeException("Tipo de consentimento inválido: " + tipoDado);
            }
            
            usuario.setUpdatedAt(LocalDateTime.now());
            usuarioRepository.save(usuario);
            
            log.info("Consentimento registrado - Usuário: {}, Tipo: {}, Consentimento: {}", 
                    usuarioId, tipoDado, consentimento);
                    
        } catch (Exception e) {
            log.error("Erro ao registrar consentimento: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao registrar consentimento", e);
        }
    }

    /**
     * Anonimiza dados pessoais para analytics
     */
    public String anonimizarDados(String dadosOriginais) {
        if (dadosOriginais == null || dadosOriginais.trim().isEmpty()) {
            return dadosOriginais;
        }

        // Remove informações identificáveis
        String anonimizado = dadosOriginais
            .replaceAll("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b", "[EMAIL]")
            .replaceAll("\\b\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}\\b", "[CPF]")
            .replaceAll("\\b\\d{11}\\b", "[CPF]")
            .replaceAll("\\b\\d{2}\\.\\d{4,5}-\\d{4}\\b", "[CNPJ]")
            .replaceAll("\\b\\d{14}\\b", "[CNPJ]");

        return anonimizado;
    }

    /**
     * Criptografa dados sensíveis antes de salvar
     */
    public Map<String, String> criptografarDadosSensiveis(Map<String, String> dados) {
        Map<String, String> dadosCriptografados = new HashMap<>();
        
        for (Map.Entry<String, String> entry : dados.entrySet()) {
            String chave = entry.getKey();
            String valor = entry.getValue();
            
            // Lista de campos sensíveis que devem ser criptografados
            if (isCampoSensivel(chave)) {
                dadosCriptografados.put(chave, encryptionService.encrypt(valor));
            } else {
                dadosCriptografados.put(chave, valor);
            }
        }
        
        return dadosCriptografados;
    }

    /**
     * Descriptografa dados sensíveis para uso
     */
    public Map<String, String> descriptografarDadosSensiveis(Map<String, String> dados) {
        Map<String, String> dadosDescriptografados = new HashMap<>();
        
        for (Map.Entry<String, String> entry : dados.entrySet()) {
            String chave = entry.getKey();
            String valor = entry.getValue();
            
            if (isCampoSensivel(chave) && encryptionService.isEncrypted(valor)) {
                dadosDescriptografados.put(chave, encryptionService.decrypt(valor));
            } else {
                dadosDescriptografados.put(chave, valor);
            }
        }
        
        return dadosDescriptografados;
    }

    /**
     * Verifica se um campo é considerado sensível
     */
    private boolean isCampoSensivel(String nomeCampo) {
        String campoLower = nomeCampo.toLowerCase();
        
        return campoLower.contains("senha") ||
               campoLower.contains("password") ||
               campoLower.contains("email") ||
               campoLower.contains("cpf") ||
               campoLower.contains("cnpj") ||
               campoLower.contains("telefone") ||
               campoLower.contains("phone") ||
               campoLower.contains("endereco") ||
               campoLower.contains("address") ||
               campoLower.contains("url") ||
               campoLower.contains("seletor") ||
               campoLower.contains("valor") ||
               campoLower.contains("descricao") ||
               campoLower.contains("placeholder");
    }

    /**
     * Gera relatório de dados pessoais para o usuário (Direito de Acesso - LGPD)
     */
    public Map<String, Object> gerarRelatorioDadosPessoais(Long usuarioId) {
        Map<String, Object> relatorio = new HashMap<>();
        relatorio.put("usuarioId", usuarioId);
        relatorio.put("dataGeracao", LocalDateTime.now());
        relatorio.put("tipoDados", List.of(
            "Dados de perfil",
            "Templates criados",
            "Mapeamentos de campos",
            "Histórico de uso"
        ));
        relatorio.put("observacoes", "Este relatório foi gerado conforme Art. 18 da LGPD");
        
        return relatorio;
    }

    /**
     * Executa exclusão segura de dados (Direito ao Esquecimento - LGPD)
     */
    public void excluirDadosUsuario(Long usuarioId) {
        try {
            log.info("Iniciando exclusão segura de dados para usuário: {}", usuarioId);
            
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            if (!usuarioOpt.isPresent()) {
                log.warn("Usuário não encontrado para exclusão: {}", usuarioId);
                return;
            }
            
            Usuario usuario = usuarioOpt.get();
            
            // 1. Marcar como pendente de exclusão
            usuario.setStatusExclusao("PENDENTE_EXCLUSAO");
            usuario.setDataExclusao(LocalDateTime.now());
            usuarioRepository.save(usuario);
            
            // 2. Anonimizar dados pessoais
            usuario.setNome("USUARIO_EXCLUIDO_" + usuarioId);
            usuario.setEmail("excluido_" + usuarioId + "@anonimo.com");
            usuario.setFotoBase64(null);
            usuario.setIpConsentimento(null);
            usuario.setUserAgentConsentimento(null);
            
            // 3. Desativar templates e campos
            templateRepository.findByUsuarioId(usuarioId).forEach(template -> {
                template.setAtivo(false);
                template.setNome("TEMPLATE_EXCLUIDO_" + template.getId());
                templateRepository.save(template);
            });
            
            // Buscar campos através dos templates do usuário
            List<Template> templates = templateRepository.findByUsuarioId(usuarioId);
            for (Template template : templates) {
                List<CampoTemplate> campos = campoTemplateRepository.findByTemplateId(template.getId());
                for (CampoTemplate campo : campos) {
                    campo.setAtivo(false);
                    campo.setNome("CAMPO_EXCLUIDO_" + campo.getId());
                    campoTemplateRepository.save(campo);
                }
            }
            
            // 4. Anonimizar histórico
            historicoPreenchimentoRepository.findByUsuarioId(usuarioId).forEach(historico -> {
                // A entidade HistoricoPreenchimento não tem campo dadosPreenchidos
                // Vamos apenas marcar como anonimizado no campo URL
                historico.setUrl(anonimizarDados(historico.getUrl()));
                historicoPreenchimentoRepository.save(historico);
            });
            
            // 5. Marcar como excluído
            usuario.setStatusExclusao("EXCLUIDO");
            usuarioRepository.save(usuario);
            
            log.info("Exclusão segura concluída para usuário: {}", usuarioId);
            
        } catch (Exception e) {
            log.error("Erro ao excluir dados do usuário {}: {}", usuarioId, e.getMessage(), e);
            throw new RuntimeException("Erro ao excluir dados do usuário", e);
        }
    }

    /**
     * Exporta dados do usuário em formato legível (Portabilidade - LGPD)
     */
    public Map<String, Object> exportarDadosUsuario(Long usuarioId) {
        try {
            log.info("Iniciando exportação de dados para usuário: {}", usuarioId);
            
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            if (!usuarioOpt.isPresent()) {
                throw new RuntimeException("Usuário não encontrado: " + usuarioId);
            }
            
            Usuario usuario = usuarioOpt.get();
            Map<String, Object> dadosExportados = new HashMap<>();
            
            // Dados pessoais
            Map<String, Object> dadosPessoais = new HashMap<>();
            dadosPessoais.put("id", usuario.getId());
            dadosPessoais.put("nome", usuario.getNome());
            dadosPessoais.put("email", usuario.getEmail());
            dadosPessoais.put("plano", usuario.getPlano());
            dadosPessoais.put("dataCriacao", usuario.getCreatedAt());
            dadosPessoais.put("dataAtualizacao", usuario.getUpdatedAt());
            dadosPessoais.put("consentimentoLGPD", usuario.getConsentimentoLGPD());
            dadosPessoais.put("consentimentoMarketing", usuario.getConsentimentoMarketing());
            dadosPessoais.put("consentimentoAnalytics", usuario.getConsentimentoAnalytics());
            dadosPessoais.put("dataConsentimento", usuario.getDataConsentimento());
            
            dadosExportados.put("dadosPessoais", dadosPessoais);
            
            // Templates
            List<Map<String, Object>> templates = templateRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(template -> {
                    Map<String, Object> templateData = new HashMap<>();
                    templateData.put("id", template.getId());
                    templateData.put("nome", template.getNome());
                    templateData.put("descricao", template.getDescricao());
                    templateData.put("ativo", template.getAtivo());
                    templateData.put("dataCriacao", template.getDataCriacao());
                    templateData.put("dataAtualizacao", template.getDataAtualizacao());
                    return templateData;
                })
                .collect(java.util.stream.Collectors.toList());
            
            dadosExportados.put("templates", templates);
            
            // Campos dos templates
            List<Map<String, Object>> campos = new ArrayList<>();
            for (Template template : templateRepository.findByUsuarioId(usuarioId)) {
                List<CampoTemplate> templateCampos = campoTemplateRepository.findByTemplateId(template.getId());
                for (CampoTemplate campo : templateCampos) {
                    Map<String, Object> campoData = new HashMap<>();
                    campoData.put("id", campo.getId());
                    campoData.put("nome", campo.getNome());
                    campoData.put("tipo", campo.getTipo());
                    campoData.put("placeholder", campo.getPlaceholder());
                    campoData.put("valorPadrao", campo.getValorPadrao());
                    campoData.put("ativo", campo.getAtivo());
                    campoData.put("dataCriacao", campo.getDataCriacao());
                    campos.add(campoData);
                }
            }
            
            dadosExportados.put("campos", campos);
            
            // Histórico de preenchimentos (anonimizado)
            List<Map<String, Object>> historico = historicoPreenchimentoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(hist -> {
                    Map<String, Object> histData = new HashMap<>();
                    histData.put("id", hist.getId());
                    histData.put("url", anonimizarDados(hist.getUrl()));
                    histData.put("dataHora", hist.getDataHora());
                    return histData;
                })
                .collect(java.util.stream.Collectors.toList());
            
            dadosExportados.put("historicoPreenchimentos", historico);
            
            // Metadados da exportação
            Map<String, Object> metadados = new HashMap<>();
            metadados.put("dataExportacao", LocalDateTime.now());
            metadados.put("versaoLGPD", "1.0");
            metadados.put("totalTemplates", templates.size());
            metadados.put("totalCampos", campos.size());
            metadados.put("totalPreenchimentos", historico.size());
            
            dadosExportados.put("metadados", metadados);
            
            log.info("Exportação concluída para usuário: {} - {} templates, {} campos, {} preenchimentos", 
                    usuarioId, templates.size(), campos.size(), historico.size());
            
            return dadosExportados;
            
        } catch (Exception e) {
            log.error("Erro ao exportar dados do usuário {}: {}", usuarioId, e.getMessage(), e);
            throw new RuntimeException("Erro ao exportar dados do usuário", e);
        }
    }
}

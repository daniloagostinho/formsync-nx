package br.com.backend.service;

import br.com.backend.entity.Usuario;
import br.com.backend.entity.Template;
import br.com.backend.entity.CampoTemplate;
import br.com.backend.repository.TemplateRepository;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanoLimiteService {

    private final TemplateRepository templateRepository;
    private final CampoTemplateRepository campoTemplateRepository;

    // Configuração dos limites dos planos (ATUALIZADO para valores realistas)
    private static final int LIMITE_TEMPLATES_PESSOAL = 5;
    private static final int LIMITE_TOTAL_CAMPOS_PESSOAL = 150;
    private static final int LIMITE_CAMPOS_POR_TEMPLATE_PESSOAL = 30;

    private static final int LIMITE_TEMPLATES_PROFISSIONAL = 50;
    private static final int LIMITE_TOTAL_CAMPOS_PROFISSIONAL = 1000;
    private static final int LIMITE_CAMPOS_POR_TEMPLATE_PROFISSIONAL = 50;

    private static final int LIMITE_TEMPLATES_EMPRESARIAL = 200;
    private static final int LIMITE_TOTAL_CAMPOS_EMPRESARIAL = 5000;
    private static final int LIMITE_CAMPOS_POR_TEMPLATE_EMPRESARIAL = 200;

    /**
     * Valida se o usuário pode criar um Novo Formulário
     */
    public void validarCriacaoTemplate(Usuario usuario) {
        String plano = usuario.getPlano();
        int templatesAtuais = (int) templateRepository.countByUsuarioIdAndAtivo(usuario.getId(), true);
        
        int limiteTemplates = getLimiteTemplates(plano);
        
        if (templatesAtuais >= limiteTemplates) {
            log.warn("Usuário {} (plano: {}) tentou Criar Formulário. Limite: {}, Atual: {}", 
                    usuario.getEmail(), plano, limiteTemplates, templatesAtuais);
            throw new BusinessException(
                String.format("Limite de %d templates atingido para o plano %s. Faça upgrade para continuar.", 
                    limiteTemplates, getNomePlano(plano))
            );
        }
        
        log.debug("Usuário {} pode Criar Formulário. Limite: {}, Atual: {}", 
                usuario.getEmail(), limiteTemplates, templatesAtuais);
    }

    /**
     * Valida se o usuário pode adicionar campos ao template
     */
    public void validarAdicaoCampos(Usuario usuario, Long templateId, int quantidadeCamposNovos) {
        String plano = usuario.getPlano();
        
        // Verificar limite por template
        int camposNoTemplate = (int) campoTemplateRepository.countByTemplateIdAndAtivo(templateId, true);
        int limitePorTemplate = getLimiteCamposPorTemplate(plano);
        
        if (camposNoTemplate + quantidadeCamposNovos > limitePorTemplate) {
            log.warn("Usuário {} (plano: {}) tentou adicionar {} campos. Limite por template: {}, Atual: {}", 
                    usuario.getEmail(), plano, quantidadeCamposNovos, limitePorTemplate, camposNoTemplate);
            throw new BusinessException(
                String.format("Limite de %d campos por template atingido para o plano %s. Faça upgrade para continuar.", 
                    limitePorTemplate, getNomePlano(plano))
            );
        }
        
        // Verificar limite total de campos
        int totalCamposUsuario = (int) campoTemplateRepository.countByUsuarioIdAndAtivo(usuario.getId(), true);
        int limiteTotal = getLimiteTotalCampos(plano);
        
        if (totalCamposUsuario + quantidadeCamposNovos > limiteTotal) {
            log.warn("Usuário {} (plano: {}) tentou adicionar {} campos. Limite total: {}, Atual: {}", 
                    usuario.getEmail(), plano, quantidadeCamposNovos, limiteTotal, totalCamposUsuario);
            throw new BusinessException(
                String.format("Limite de %d campos no total atingido para o plano %s. Faça upgrade para continuar.", 
                    limiteTotal, getNomePlano(plano))
            );
        }
        
        log.debug("Usuário {} pode adicionar {} campos. Limite por template: {}, Limite total: {}", 
                usuario.getEmail(), quantidadeCamposNovos, limitePorTemplate, limiteTotal);
    }

    /**
     * Valida se o usuário pode adicionar um campo individual
     */
    public void validarAdicaoCampoIndividual(Usuario usuario, Long templateId) {
        validarAdicaoCampos(usuario, templateId, 1);
    }

    /**
     * Valida se o usuário pode remover um campo (sempre permitido)
     */
    public void validarRemocaoCampo(Usuario usuario, Long templateId) {
        // Remoção de campos é sempre permitida
        log.debug("Usuário {} pode remover campo do template {}", usuario.getEmail(), templateId);
    }

    /**
     * Valida se o usuário pode fazer upload de CSV
     */
    public void validarUploadCsv(Usuario usuario) {
        String plano = usuario.getPlano();
        
        if (!permiteUploadCsv(plano)) {
            log.warn("Usuário {} (plano: {}) tentou fazer upload CSV sem permissão", usuario.getEmail(), plano);
            throw new BusinessException(
                String.format("Upload CSV disponível apenas nos planos Profissional e Empresarial. " +
                    "Seu plano atual: %s. Faça upgrade para continuar.", getNomePlano(plano))
            );
        }
        
        log.debug("Usuário {} pode fazer upload CSV. Plano: {}", usuario.getEmail(), plano);
    }

    /**
     * Valida se o usuário pode Criar Formulários via CSV (incluindo validação de limites)
     */
    public void validarCriacaoTemplatesCsv(Usuario usuario, int quantidadeTemplates, int totalCamposNovos) {
        // Primeiro validar se pode fazer upload CSV
        validarUploadCsv(usuario);
        
        // Validar limite de templates
        int templatesAtuais = (int) templateRepository.countByUsuarioIdAndAtivo(usuario.getId(), true);
        int limiteTemplates = getLimiteTemplates(usuario.getPlano());
        
        if (templatesAtuais + quantidadeTemplates > limiteTemplates) {
            log.warn("Usuário {} (plano: {}) tentou criar {} templates via CSV. Limite: {}, Atual: {}", 
                    usuario.getEmail(), usuario.getPlano(), quantidadeTemplates, limiteTemplates, templatesAtuais);
            throw new BusinessException(
                String.format("Limite de %d templates atingido para o plano %s. Faça upgrade para continuar.", 
                    limiteTemplates, getNomePlano(usuario.getPlano()))
            );
        }
        
        // Validar limite total de campos
        int totalCamposUsuario = (int) campoTemplateRepository.countByUsuarioIdAndAtivo(usuario.getId(), true);
        int limiteTotal = getLimiteTotalCampos(usuario.getPlano());
        
        if (totalCamposUsuario + totalCamposNovos > limiteTotal) {
            log.warn("Usuário {} (plano: {}) tentou adicionar {} campos via CSV. Limite total: {}, Atual: {}", 
                    usuario.getEmail(), usuario.getPlano(), totalCamposNovos, limiteTotal, totalCamposUsuario);
            throw new BusinessException(
                String.format("Limite de %d campos no total atingido para o plano %s. Faça upgrade para continuar.", 
                    limiteTotal, getNomePlano(usuario.getPlano()))
            );
        }
        
        log.debug("Usuário {} pode criar {} templates com {} campos via CSV. Limite templates: {}, Limite campos: {}", 
                usuario.getEmail(), quantidadeTemplates, totalCamposNovos, limiteTemplates, limiteTotal);
    }

    /**
     * Obtém estatísticas de uso do usuário
     */
    public PlanoEstatisticasDTO getEstatisticasUso(Usuario usuario) {
        int templatesAtuais = (int) templateRepository.countByUsuarioIdAndAtivo(usuario.getId(), true);
        int totalCampos = (int) campoTemplateRepository.countByUsuarioIdAndAtivo(usuario.getId(), true);
        String plano = usuario.getPlano();
        
        return PlanoEstatisticasDTO.builder()
                .plano(plano)
                .nomePlano(getNomePlano(plano))
                .templatesAtuais(templatesAtuais)
                .totalCampos(totalCampos)
                .limiteTemplates(getLimiteTemplates(plano))
                .limiteTotalCampos(getLimiteTotalCampos(plano))
                .limiteCamposPorTemplate(getLimiteCamposPorTemplate(plano))
                .percentualTemplates((double) templatesAtuais / getLimiteTemplates(plano) * 100)
                .percentualCampos((double) totalCampos / getLimiteTotalCampos(plano) * 100)
                .build();
    }

    /**
     * Verifica se o usuário está próximo dos limites
     */
    public boolean estaProximoLimite(Usuario usuario) {
        PlanoEstatisticasDTO stats = getEstatisticasUso(usuario);
        return stats.getPercentualTemplates() >= 80 || stats.getPercentualCampos() >= 80;
    }

    // Métodos auxiliares para obter limites por plano
    public int getLimiteTemplates(String plano) {
        return switch (plano.toUpperCase()) {
            case "PESSOAL" -> LIMITE_TEMPLATES_PESSOAL;
            case "PROFISSIONAL" -> LIMITE_TEMPLATES_PROFISSIONAL;
            case "EMPRESARIAL" -> LIMITE_TEMPLATES_EMPRESARIAL;
            default -> LIMITE_TEMPLATES_PESSOAL; // Plano padrão
        };
    }

    public int getLimiteTotalCampos(String plano) {
        return switch (plano.toUpperCase()) {
            case "PESSOAL" -> LIMITE_TOTAL_CAMPOS_PESSOAL;
            case "PROFISSIONAL" -> LIMITE_TOTAL_CAMPOS_PROFISSIONAL;
            case "EMPRESARIAL" -> LIMITE_TOTAL_CAMPOS_EMPRESARIAL;
            default -> LIMITE_TOTAL_CAMPOS_PESSOAL; // Plano padrão
        };
    }

    public int getLimiteCamposPorTemplate(String plano) {
        return switch (plano.toUpperCase()) {
            case "PESSOAL" -> LIMITE_CAMPOS_POR_TEMPLATE_PESSOAL;
            case "PROFISSIONAL" -> LIMITE_CAMPOS_POR_TEMPLATE_PROFISSIONAL;
            case "EMPRESARIAL" -> LIMITE_CAMPOS_POR_TEMPLATE_EMPRESARIAL;
            default -> LIMITE_CAMPOS_POR_TEMPLATE_PESSOAL; // Plano padrão
        };
    }

    private boolean permiteUploadCsv(String plano) {
        return switch (plano.toUpperCase()) {
            case "PROFISSIONAL", "EMPRESARIAL" -> true;
            default -> false;
        };
    }

    private String getNomePlano(String plano) {
        return switch (plano.toUpperCase()) {
            case "PESSOAL" -> "Pessoal (Gratuito)";
            case "PROFISSIONAL" -> "Profissional";
            case "EMPRESARIAL" -> "Empresarial";
            default -> "Pessoal (Gratuito)";
        };
    }

    // DTO para estatísticas
    public static class PlanoEstatisticasDTO {
        private String plano;
        private String nomePlano;
        private int templatesAtuais;
        private int totalCampos;
        private int limiteTemplates;
        private int limiteTotalCampos;
        private int limiteCamposPorTemplate;
        private double percentualTemplates;
        private double percentualCampos;

        // Builder pattern
        public static Builder builder() {
            return new Builder();
        }

        public static class Builder {
            private PlanoEstatisticasDTO dto = new PlanoEstatisticasDTO();

            public Builder plano(String plano) {
                dto.plano = plano;
                return this;
            }

            public Builder nomePlano(String nomePlano) {
                dto.nomePlano = nomePlano;
                return this;
            }

            public Builder templatesAtuais(int templatesAtuais) {
                dto.templatesAtuais = templatesAtuais;
                return this;
            }

            public Builder totalCampos(int totalCampos) {
                dto.totalCampos = totalCampos;
                return this;
            }

            public Builder limiteTemplates(int limiteTemplates) {
                dto.limiteTemplates = limiteTemplates;
                return this;
            }

            public Builder limiteTotalCampos(int limiteTotalCampos) {
                dto.limiteTotalCampos = limiteTotalCampos;
                return this;
            }

            public Builder limiteCamposPorTemplate(int limiteCamposPorTemplate) {
                dto.limiteCamposPorTemplate = limiteCamposPorTemplate;
                return this;
            }

            public Builder percentualTemplates(double percentualTemplates) {
                dto.percentualTemplates = percentualTemplates;
                return this;
            }

            public Builder percentualCampos(double percentualCampos) {
                dto.percentualCampos = percentualCampos;
                return this;
            }

            public PlanoEstatisticasDTO build() {
                return dto;
            }
        }

        // Getters
        public String getPlano() { return plano; }
        public String getNomePlano() { return nomePlano; }
        public int getTemplatesAtuais() { return templatesAtuais; }
        public int getTotalCampos() { return totalCampos; }
        public int getLimiteTemplates() { return limiteTemplates; }
        public int getLimiteTotalCampos() { return limiteTotalCampos; }
        public int getLimiteCamposPorTemplate() { return limiteCamposPorTemplate; }
        public double getPercentualTemplates() { return percentualTemplates; }
        public double getPercentualCampos() { return percentualCampos; }
    }
}

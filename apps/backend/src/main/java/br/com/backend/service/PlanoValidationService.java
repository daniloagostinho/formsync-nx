package br.com.backend.service;

import br.com.backend.repository.TemplateRepository;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PlanoValidationService {

    @Autowired
    private TemplateRepository templateRepository;

    @Autowired
    private CampoTemplateRepository campoTemplateRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Limites dos planos
    private static final int LIMITE_PESSOAL_TEMPLATES = 5;
    private static final int LIMITE_PESSOAL_CAMPOS = 150;
    
    private static final int LIMITE_PROFISSIONAL_TEMPLATES = 50;
    private static final int LIMITE_PROFISSIONAL_CAMPOS = 1000;
    
    private static final int LIMITE_EMPRESARIAL_TEMPLATES = 200;
    private static final int LIMITE_EMPRESARIAL_CAMPOS = 5000;

    /**
     * Valida se o usuário pode criar mais templates
     */
    public boolean podeCriarTemplate(Long usuarioId) {
        String plano = usuarioRepository.findById(usuarioId)
                .map(usuario -> usuario.getPlano())
                .orElse("PESSOAL");

        long totalTemplates = templateRepository.countByUsuarioId(usuarioId);
        
        switch (plano) {
            case "PESSOAL":
                return totalTemplates < LIMITE_PESSOAL_TEMPLATES;
            case "PROFISSIONAL":
                return totalTemplates < LIMITE_PROFISSIONAL_TEMPLATES;
            case "EMPRESARIAL":
                return totalTemplates < LIMITE_EMPRESARIAL_TEMPLATES;
            default:
                return totalTemplates < LIMITE_PESSOAL_TEMPLATES;
        }
    }

    /**
     * Valida se o usuário pode adicionar mais campos
     */
    public boolean podeAdicionarCampo(Long usuarioId) {
        String plano = usuarioRepository.findById(usuarioId)
                .map(usuario -> usuario.getPlano())
                .orElse("PESSOAL");

        long totalCampos = campoTemplateRepository.countByUsuarioId(usuarioId);
        
        switch (plano) {
            case "PESSOAL":
                return totalCampos < LIMITE_PESSOAL_CAMPOS;
            case "PROFISSIONAL":
                return totalCampos < LIMITE_PROFISSIONAL_CAMPOS;
            case "EMPRESARIAL":
                return totalCampos < LIMITE_EMPRESARIAL_CAMPOS;
            default:
                return totalCampos < LIMITE_PESSOAL_CAMPOS;
        }
    }

    /**
     * Obtém o limite de templates para o plano do usuário
     */
    public int getLimiteTemplates(String plano) {
        switch (plano) {
            case "PESSOAL":
                return LIMITE_PESSOAL_TEMPLATES;
            case "PROFISSIONAL":
                return LIMITE_PROFISSIONAL_TEMPLATES;
            case "EMPRESARIAL":
                return LIMITE_EMPRESARIAL_TEMPLATES;
            default:
                return LIMITE_PESSOAL_TEMPLATES;
        }
    }

    /**
     * Obtém o limite de campos para o plano do usuário
     */
    public int getLimiteCampos(String plano) {
        switch (plano) {
            case "PESSOAL":
                return LIMITE_PESSOAL_CAMPOS;
            case "PROFISSIONAL":
                return LIMITE_PROFISSIONAL_CAMPOS;
            case "EMPRESARIAL":
                return LIMITE_EMPRESARIAL_CAMPOS;
            default:
                return LIMITE_PESSOAL_CAMPOS;
        }
    }

    /**
     * Obtém informações de uso do usuário
     */
    public String getInfoUso(Long usuarioId) {
        String plano = usuarioRepository.findById(usuarioId)
                .map(usuario -> usuario.getPlano())
                .orElse("PESSOAL");

        long totalTemplates = templateRepository.countByUsuarioId(usuarioId);
        long totalCampos = campoTemplateRepository.countByUsuarioId(usuarioId);
        
        int limiteTemplates = getLimiteTemplates(plano);
        int limiteCampos = getLimiteCampos(plano);

        return String.format(
            "Plano: %s | Templates: %d/%d | Campos: %d/%d",
            plano, totalTemplates, limiteTemplates, totalCampos, limiteCampos
        );
    }
}

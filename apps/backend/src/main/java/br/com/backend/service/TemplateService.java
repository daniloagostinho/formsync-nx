package br.com.backend.service;

import br.com.backend.dto.TemplateDTO;
import br.com.backend.dto.CampoTemplateDTO;
import br.com.backend.dto.PreenchimentoAutomaticoDTO;
import br.com.backend.entity.Template;
import br.com.backend.entity.CampoTemplate;
import br.com.backend.entity.MapeamentoCampo;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.TemplateRepository;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.repository.MapeamentoCampoRepository;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.exception.ResourceNotFoundException;
import br.com.backend.exception.BusinessException;
import br.com.backend.service.PlanoLimiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TemplateService {
    
    @Autowired
    private TemplateRepository templateRepository;
    
    @Autowired
    private CampoTemplateRepository campoTemplateRepository;
    
    @Autowired
    private MapeamentoCampoRepository mapeamentoCampoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PlanoLimiteService planoLimiteService;
    
    /**
     * Cria um Novo Formulário
     */
    @Transactional
    public TemplateDTO criarTemplate(TemplateDTO templateDTO) {
        // Validações
        if (templateDTO.getNome() == null || templateDTO.getNome().trim().isEmpty()) {
            throw new BusinessException("Nome do Formulário é obrigatório");
        }
        
        if (templateDTO.getUsuarioId() == null) {
            throw new BusinessException("ID do usuário é obrigatório");
        }
        
        // Verifica se usuário existe
        Usuario usuario = usuarioRepository.findById(templateDTO.getUsuarioId())
            .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        
        // ✅ VALIDAÇÃO DE LIMITES: Verificar se pode Criar Formulário
        planoLimiteService.validarCriacaoTemplate(usuario);
        
        // Verifica se já existe template com o mesmo nome
        if (templateRepository.existsByNomeAndUsuarioIdAndAtivo(templateDTO.getNome(), templateDTO.getUsuarioId(), true)) {
            throw new BusinessException("Já existe um template com este nome");
        }
        
        // Cria o template
        Template template = new Template(templateDTO.getNome(), usuario);
        template.setDescricao(templateDTO.getDescricao());
        
        // Salva o template
        template = templateRepository.save(template);
        
        // Adiciona os campos se fornecidos
        if (templateDTO.getCampos() != null && !templateDTO.getCampos().isEmpty()) {
            for (CampoTemplateDTO campoDTO : templateDTO.getCampos()) {
                CampoTemplate campo = new CampoTemplate(campoDTO.getNome(), campoDTO.getValor(), template);
                campo.setTipo(campoDTO.getTipo());
                campo.setOrdem(campoDTO.getOrdem());
                template.adicionarCampo(campo);
            }
        }
        
        // Salva novamente com os campos
        template = templateRepository.save(template);
        
        return converterParaDTO(template);
    }
    
    /**
     * Atualiza um template existente
     */
    @Transactional
    public TemplateDTO atualizarTemplate(Long templateId, TemplateDTO templateDTO, Long usuarioId) {
        Template template = templateRepository.findTemplateComCampos(templateId, usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado"));
        
        // Atualiza dados básicos
        if (templateDTO.getNome() != null && !templateDTO.getNome().trim().isEmpty()) {
            // Verifica se o novo nome já existe
            if (!templateDTO.getNome().equals(template.getNome()) && 
                templateRepository.existsByNomeAndUsuarioIdAndAtivo(templateDTO.getNome(), usuarioId, true)) {
                throw new BusinessException("Já existe um template com este nome");
            }
            template.setNome(templateDTO.getNome());
        }
        
        if (templateDTO.getDescricao() != null) {
            template.setDescricao(templateDTO.getDescricao());
        }
        
        // Atualiza campos se fornecidos
        if (templateDTO.getCampos() != null) {
            // ✅ VALIDAÇÃO DE LIMITES: Verificar se pode adicionar campos
            int quantidadeCamposNovos = templateDTO.getCampos().size();
            // Buscar usuário para validação de limites
            Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
            planoLimiteService.validarAdicaoCampos(usuario, templateId, quantidadeCamposNovos);
            
            // Remove campos existentes
            template.getCampos().clear();
            
            // Adiciona novos campos
            for (CampoTemplateDTO campoDTO : templateDTO.getCampos()) {
                CampoTemplate campo = new CampoTemplate(campoDTO.getNome(), campoDTO.getValor(), template);
                campo.setTipo(campoDTO.getTipo());
                campo.setOrdem(campoDTO.getOrdem());
                template.adicionarCampo(campo);
            }
        }
        
        template.setDataAtualizacao(LocalDateTime.now());
        template = templateRepository.save(template);
        
        return converterParaDTO(template);
    }
    
    /**
     * Busca template por ID
     */
    public TemplateDTO buscarTemplatePorId(Long templateId, Long usuarioId) {
        Template template = templateRepository.findTemplateComCampos(templateId, usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado"));
        
        return converterParaDTO(template);
    }
    
    /**
     * Lista todos os templates do usuário
     */
    public List<TemplateDTO> listarTemplates(Long usuarioId) {
        List<Template> templates = templateRepository.findByUsuarioIdAndAtivoOrderByNomeAsc(usuarioId, true);
        return templates.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Busca templates por padrão de nome
     */
    public List<TemplateDTO> buscarTemplatesPorPadrao(Long usuarioId, String padrao) {
        List<Template> templates = templateRepository.findTemplatesPorPadrao(usuarioId, padrao);
        return templates.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Remove um template (soft delete)
     */
    @Transactional
    public void removerTemplate(Long templateId, Long usuarioId) {
        Template template = templateRepository.findTemplateComCampos(templateId, usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado"));
        
        template.setAtivo(false);
        template.setDataAtualizacao(LocalDateTime.now());
        templateRepository.save(template);
    }
    
    /**
     * Incrementa o uso de um template
     */
    @Transactional
    public void incrementarUsoTemplate(Long templateId, Long usuarioId) {
        Template template = templateRepository.findTemplateComCampos(templateId, usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado"));
        
        template.incrementarUso();
        templateRepository.save(template);
    }
    
    /**
     * Prepara dados para preenchimento automático
     */
    public PreenchimentoAutomaticoDTO prepararPreenchimentoAutomatico(Long templateId, String urlSite, Long usuarioId) {
        Template template = templateRepository.findTemplateComCampos(templateId, usuarioId)
            .orElseThrow(() -> new ResourceNotFoundException("Template não encontrado"));
        
        PreenchimentoAutomaticoDTO preenchimentoDTO = new PreenchimentoAutomaticoDTO(templateId, urlSite);
        
        // Busca mapeamentos existentes para o site
        List<MapeamentoCampo> mapeamentos = mapeamentoCampoRepository.findByUrlSiteAndAtivoOrderByConfiancaDesc(urlSite, true);
        
        // Mapeia Campos do Formulário para campos do site
        List<PreenchimentoAutomaticoDTO.CampoPreenchimentoDTO> camposPreenchimento = template.getCampos().stream()
            .map(campo -> {
                PreenchimentoAutomaticoDTO.CampoPreenchimentoDTO campoPreenchimento = 
                    new PreenchimentoAutomaticoDTO.CampoPreenchimentoDTO(campo.getNome(), campo.getValor(), null);
                
                // Busca mapeamento mais confiável para este campo
                Optional<MapeamentoCampo> mapeamento = mapeamentos.stream()
                    .filter(m -> m.getCampoTemplate().getId().equals(campo.getId()))
                    .findFirst();
                
                if (mapeamento.isPresent()) {
                    MapeamentoCampo m = mapeamento.get();
                    campoPreenchimento.setSeletorCss(m.getSeletorCss());
                    campoPreenchimento.setTipoCampo(m.getTipoCampo());
                    campoPreenchimento.setConfianca(m.getConfianca());
                }
                
                return campoPreenchimento;
            })
            .collect(Collectors.toList());
        
        preenchimentoDTO.setCampos(camposPreenchimento);
        return preenchimentoDTO;
    }
    
    /**
     * Converte Template para DTO
     */
    private TemplateDTO converterParaDTO(Template template) {
        TemplateDTO dto = new TemplateDTO();
        dto.setId(template.getId());
        dto.setNome(template.getNome());
        dto.setDescricao(template.getDescricao());
        dto.setUsuarioId(template.getUsuario().getId());
        dto.setAtivo(template.getAtivo());
        dto.setDataCriacao(template.getDataCriacao());
        dto.setDataAtualizacao(template.getDataAtualizacao());
        dto.setTotalUso(template.getTotalUso());
        dto.setUltimoUso(template.getUltimoUso());
        
        // Converte campos
        if (template.getCampos() != null) {
            List<CampoTemplateDTO> camposDTO = template.getCampos().stream()
                .map(this::converterCampoParaDTO)
                .collect(Collectors.toList());
            dto.setCampos(camposDTO);
        }
        
        return dto;
    }
    
    /**
     * Converte CampoTemplate para DTO
     */
    private CampoTemplateDTO converterCampoParaDTO(CampoTemplate campo) {
        CampoTemplateDTO dto = new CampoTemplateDTO();
        dto.setId(campo.getId());
        dto.setNome(campo.getNome());
        dto.setValor(campo.getValor());
        dto.setTipo(campo.getTipo());
        dto.setOrdem(campo.getOrdem());
        dto.setTemplateId(campo.getTemplate().getId());
        dto.setAtivo(campo.getAtivo());
        dto.setDataCriacao(campo.getDataCriacao());
        dto.setDataAtualizacao(campo.getDataAtualizacao());
        dto.setTotalUso(campo.getTotalUso());
        dto.setUltimoUso(campo.getUltimoUso());
        
        // Campos adicionais
        dto.setValorPadrao(campo.getValorPadrao());
        dto.setPlaceholder(campo.getPlaceholder());
        dto.setDescricao(campo.getDescricao());
        
        return dto;
    }
}



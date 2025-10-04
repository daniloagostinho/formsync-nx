package br.com.backend.service;

import br.com.backend.dto.MapeamentoCampoDTO;
import br.com.backend.entity.MapeamentoCampo;
import br.com.backend.entity.CampoTemplate;
import br.com.backend.repository.MapeamentoCampoRepository;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.exception.ResourceNotFoundException;
import br.com.backend.exception.BusinessException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MapeamentoCampoService {
    
    @Autowired
    private MapeamentoCampoRepository mapeamentoCampoRepository;
    
    @Autowired
    private CampoTemplateRepository campoTemplateRepository;
    
    /**
     * Cria um novo mapeamento de campo
     */
    @Transactional
    public MapeamentoCampoDTO criarMapeamento(MapeamentoCampoDTO mapeamentoDTO) {
        // Validações
        if (mapeamentoDTO.getCampoTemplateId() == null) {
            throw new BusinessException("ID do campo template é obrigatório");
        }
        
        if (mapeamentoDTO.getUrlSite() == null || mapeamentoDTO.getUrlSite().trim().isEmpty()) {
            throw new BusinessException("URL do site é obrigatória");
        }
        
        if (mapeamentoDTO.getSeletorCss() == null || mapeamentoDTO.getSeletorCss().trim().isEmpty()) {
            throw new BusinessException("Seletor CSS é obrigatório");
        }
        
        // Verifica se o campo template existe
        CampoTemplate campoTemplate = campoTemplateRepository.findById(mapeamentoDTO.getCampoTemplateId())
            .orElseThrow(() -> new ResourceNotFoundException("Campo template não encontrado"));
        
        // Verifica se já existe mapeamento para este campo e site
        Optional<MapeamentoCampo> mapeamentoExistente = mapeamentoCampoRepository
            .findByCampoTemplateIdAndUrlSiteAndAtivo(mapeamentoDTO.getCampoTemplateId(), mapeamentoDTO.getUrlSite(), true);
        
        if (mapeamentoExistente.isPresent()) {
            // Atualiza mapeamento existente
            MapeamentoCampo mapeamento = mapeamentoExistente.get();
            mapeamento.setSeletorCss(mapeamentoDTO.getSeletorCss());
            mapeamento.setTipoCampo(mapeamentoDTO.getTipoCampo());
            mapeamento.setAtributoCampo(mapeamentoDTO.getAtributoCampo());
            mapeamento.setValorAtributo(mapeamentoDTO.getValorAtributo());
            mapeamento.setDataAtualizacao(LocalDateTime.now());
            
            mapeamento = mapeamentoCampoRepository.save(mapeamento);
            return converterParaDTO(mapeamento);
        }
        
        // Cria novo mapeamento
        MapeamentoCampo mapeamento = new MapeamentoCampo(campoTemplate, mapeamentoDTO.getUrlSite(), mapeamentoDTO.getSeletorCss());
        mapeamento.setTipoCampo(mapeamentoDTO.getTipoCampo());
        mapeamento.setAtributoCampo(mapeamentoDTO.getAtributoCampo());
        mapeamento.setValorAtributo(mapeamentoDTO.getValorAtributo());
        mapeamento.setConfianca(mapeamentoDTO.getConfianca() != null ? mapeamentoDTO.getConfianca() : 0.5);
        
        mapeamento = mapeamentoCampoRepository.save(mapeamento);
        return converterParaDTO(mapeamento);
    }
    
    /**
     * Busca mapeamentos por URL do site
     */
    public List<MapeamentoCampoDTO> buscarMapeamentosPorSite(String urlSite) {
        List<MapeamentoCampo> mapeamentos = mapeamentoCampoRepository.findByUrlSiteAndAtivoOrderByConfiancaDesc(urlSite, true);
        return mapeamentos.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Busca mapeamentos confiáveis para um site
     */
    public List<MapeamentoCampoDTO> buscarMapeamentosConfiaveis(String urlSite, Double confiancaMinima) {
        if (confiancaMinima == null) {
            confiancaMinima = 0.7; // Confiança padrão
        }
        
        List<MapeamentoCampo> mapeamentos = mapeamentoCampoRepository.findMapeamentosConfiaveis(urlSite, confiancaMinima);
        return mapeamentos.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Registra o uso de um mapeamento
     */
    @Transactional
    public void registrarUsoMapeamento(Long mapeamentoId, Boolean sucesso) {
        MapeamentoCampo mapeamento = mapeamentoCampoRepository.findById(mapeamentoId)
            .orElseThrow(() -> new ResourceNotFoundException("Mapeamento não encontrado"));
        
        mapeamento.registrarUso(sucesso);
        mapeamentoCampoRepository.save(mapeamento);
    }
    
    /**
     * Atualiza a confiança de um mapeamento
     */
    @Transactional
    public void atualizarConfianca(Long mapeamentoId, Double confianca) {
        if (confianca < 0.0 || confianca > 1.0) {
            throw new BusinessException("Confiança deve estar entre 0.0 e 1.0");
        }
        
        mapeamentoCampoRepository.updateConfianca(mapeamentoId, confianca);
    }
    
    /**
     * Remove um mapeamento (soft delete)
     */
    @Transactional
    public void removerMapeamento(Long mapeamentoId) {
        MapeamentoCampo mapeamento = mapeamentoCampoRepository.findById(mapeamentoId)
            .orElseThrow(() -> new ResourceNotFoundException("Mapeamento não encontrado"));
        
        mapeamento.setAtivo(false);
        mapeamento.setDataAtualizacao(LocalDateTime.now());
        mapeamentoCampoRepository.save(mapeamento);
    }
    
    /**
     * Busca mapeamentos por usuário
     */
    public List<MapeamentoCampoDTO> buscarMapeamentosPorUsuario(Long usuarioId) {
        List<MapeamentoCampo> mapeamentos = mapeamentoCampoRepository.findMapeamentosMaisUtilizados(usuarioId);
        return mapeamentos.stream()
            .map(this::converterParaDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Converte MapeamentoCampo para DTO
     */
    private MapeamentoCampoDTO converterParaDTO(MapeamentoCampo mapeamento) {
        MapeamentoCampoDTO dto = new MapeamentoCampoDTO();
        dto.setId(mapeamento.getId());
        dto.setCampoTemplateId(mapeamento.getCampoTemplate().getId());
        dto.setUrlSite(mapeamento.getUrlSite());
        dto.setSeletorCss(mapeamento.getSeletorCss());
        dto.setTipoCampo(mapeamento.getTipoCampo());
        dto.setAtributoCampo(mapeamento.getAtributoCampo());
        dto.setValorAtributo(mapeamento.getValorAtributo());
        dto.setConfianca(mapeamento.getConfianca());
        dto.setAtivo(mapeamento.getAtivo());
        dto.setDataCriacao(mapeamento.getDataCriacao());
        dto.setDataAtualizacao(mapeamento.getDataAtualizacao());
        dto.setTotalUso(mapeamento.getTotalUso());
        dto.setUltimoUso(mapeamento.getUltimoUso());
        dto.setSucessoUltimoUso(mapeamento.getSucessoUltimoUso());
        
        return dto;
    }
}

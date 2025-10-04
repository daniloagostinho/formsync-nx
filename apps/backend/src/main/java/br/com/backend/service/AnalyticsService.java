package br.com.backend.service;

import br.com.backend.dto.AnalyticsResponseDTO;
import br.com.backend.dto.PreenchimentoAnalyticsDTO;
import br.com.backend.dto.CampoAnalyticsDTO;
import br.com.backend.dto.SiteAnalyticsDTO;
import br.com.backend.entity.PreenchimentoAnalytics;
import br.com.backend.entity.CampoAnalytics;
import br.com.backend.entity.CampoTemplate;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.repository.PreenchimentoAnalyticsRepository;
import br.com.backend.repository.CampoAnalyticsRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final PreenchimentoAnalyticsRepository preenchimentoRepository;
    private final CampoAnalyticsRepository campoAnalyticsRepository;
    private final CampoTemplateRepository campoTemplateRepository;

    /**
     * Obtém dados gerais de analytics do usuário
     */
    public AnalyticsResponseDTO getAnalyticsData(Long userId, String periodo) {
        int dias = Integer.parseInt(periodo);
        LocalDateTime dataInicio = LocalDateTime.now().minusDays(dias);
        
        // Total de preenchimentos
        Integer totalPreenchimentos = preenchimentoRepository.countByUsuarioIdAndDataPreenchimentoAfter(userId, dataInicio);
        
        // Tempo economizado (em segundos)
        Integer tempoTotalSegundos = preenchimentoRepository.sumTempoEconomizadoByUsuarioIdAndDataPreenchimentoAfter(userId, dataInicio);
        String tempoEconomizado = formatarTempo(tempoTotalSegundos != null ? tempoTotalSegundos : 0);
        
        // Sites únicos
        Integer sitesUnicos = preenchimentoRepository.countDistinctSiteByUsuarioIdAndDataPreenchimentoAfter(userId, dataInicio);
        
        // Taxa de sucesso
        Integer totalSucessos = preenchimentoRepository.countByUsuarioIdAndDataPreenchimentoAfterAndSucessoTrue(userId, dataInicio);
        Integer taxaSucesso = totalPreenchimentos > 0 ? (totalSucessos * 100) / totalPreenchimentos : 0;
        
        return new AnalyticsResponseDTO(
            totalPreenchimentos,
            tempoEconomizado,
            sitesUnicos,
            taxaSucesso,
            periodo
        );
    }

    /**
     * Obtém dados de preenchimentos por período
     */
    public List<PreenchimentoAnalyticsDTO> getPreenchimentosPorPeriodo(Long userId, String periodo) {
        int dias = Integer.parseInt(periodo);
        LocalDateTime dataInicio = LocalDateTime.now().minusDays(dias);
        
        return preenchimentoRepository.findByUsuarioIdAndDataPreenchimentoAfterOrderByDataPreenchimento(userId, dataInicio)
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtém campos de template mais utilizados
     */
    public List<CampoAnalyticsDTO> getCamposMaisUtilizados(Long userId) {
        return campoAnalyticsRepository.findByUsuarioIdOrderByQuantidadeUsosDesc(userId)
            .stream()
            .limit(10) // Top 10 campos
            .map(this::convertToCampoDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtém sites mais acessados
     */
    public List<SiteAnalyticsDTO> getSitesMaisAcessados(Long userId) {
        return preenchimentoRepository.findSitesMaisAcessadosByUsuarioId(userId)
            .stream()
            .limit(10) // Top 10 sites
            .map(this::convertToSiteDTO)
            .collect(Collectors.toList());
    }

    /**
     * Rastreia um novo preenchimento
     */
    public void trackPreenchimento(Long userId, String site, Long campoTemplateId) {
        PreenchimentoAnalytics preenchimento = new PreenchimentoAnalytics();
        preenchimento.setUsuarioId(userId);
        preenchimento.setSite(site);
        preenchimento.setCampoId(campoTemplateId); // Mantém compatibilidade com campo_id
        preenchimento.setDataPreenchimento(LocalDateTime.now());
        preenchimento.setTempoEconomizado(30); // Estimativa de 30 segundos por preenchimento
        preenchimento.setSucesso(true);
        
        preenchimentoRepository.save(preenchimento);
        
        // Atualizar analytics do campo de template
        if (campoTemplateId != null) {
            atualizarAnalyticsCampoTemplate(userId, campoTemplateId);
        }
    }

    /**
     * Rastreia tempo economizado
     */
    public void trackTempoEconomizado(Long userId, Integer tempoSegundos) {
        // Pode ser usado para atualizar estatísticas mais precisas
        System.out.println("Tempo economizado para usuário " + userId + ": " + tempoSegundos + " segundos");
    }

    /**
     * Atualiza analytics de um campo de template específico
     */
    private void atualizarAnalyticsCampoTemplate(Long userId, Long campoTemplateId) {
        CampoAnalytics analytics = campoAnalyticsRepository.findByUsuarioIdAndCampoTemplateId(userId, campoTemplateId);
        
        if (analytics == null) {
            analytics = new CampoAnalytics();
            analytics.setUsuarioId(userId);
            analytics.setCampoTemplateId(campoTemplateId);
            analytics.setQuantidadeUsos(1);
        } else {
            analytics.setQuantidadeUsos(analytics.getQuantidadeUsos() + 1);
        }
        
        analytics.setUltimoUso(LocalDateTime.now());
        campoAnalyticsRepository.save(analytics);
    }

    /**
     * Converte entidade para DTO
     */
    private PreenchimentoAnalyticsDTO convertToDTO(PreenchimentoAnalytics preenchimento) {
        PreenchimentoAnalyticsDTO dto = new PreenchimentoAnalyticsDTO();
        dto.setData(preenchimento.getDataPreenchimento());
        dto.setQuantidade(1); // Cada registro representa 1 preenchimento
        dto.setSite(preenchimento.getSite());
        dto.setCampoId(preenchimento.getCampoId()); // Mantém compatibilidade
        return dto;
    }

    /**
     * Converte entidade de campo de template para DTO
     */
    private CampoAnalyticsDTO convertToCampoDTO(CampoAnalytics analytics) {
        CampoAnalyticsDTO dto = new CampoAnalyticsDTO();
        dto.setCampoTemplateId(analytics.getCampoTemplateId());
        
        // Buscar nome do campo de template e Nome do Formulário
        campoTemplateRepository.findById(analytics.getCampoTemplateId()).ifPresent(campoTemplate -> {
            dto.setNomeCampo(campoTemplate.getNome());
            if (campoTemplate.getTemplate() != null) {
                dto.setNomeTemplate(campoTemplate.getTemplate().getNome());
            }
        });
        
        dto.setQuantidadeUsos(analytics.getQuantidadeUsos());
        dto.setUltimoUso(analytics.getUltimoUso());
        return dto;
    }

    /**
     * Converte resultado de site para DTO
     */
    private SiteAnalyticsDTO convertToSiteDTO(Object[] result) {
        SiteAnalyticsDTO dto = new SiteAnalyticsDTO();
        dto.setDominio((String) result[0]);
        dto.setQuantidadePreenchimentos(((Number) result[1]).intValue());
        dto.setTempoMedio(((Number) result[2]).doubleValue());
        return dto;
    }

    /**
     * Formata tempo em segundos para formato legível
     */
    private String formatarTempo(Integer segundos) {
        if (segundos == null || segundos == 0) {
            return "0h";
        }
        
        int horas = segundos / 3600;
        int minutos = (segundos % 3600) / 60;
        
        if (horas > 0) {
            return String.format("%dh %dm", horas, minutos);
        } else {
            return String.format("%dm", minutos);
        }
    }
}
package br.com.backend.repository;

import br.com.backend.entity.CampoAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CampoAnalyticsRepository extends JpaRepository<CampoAnalytics, Long> {

    /**
     * Busca analytics de campos de template por usuário ordenados por quantidade de usos
     */
    List<CampoAnalytics> findByUsuarioIdOrderByQuantidadeUsosDesc(Long usuarioId);

    /**
     * Busca analytics de um campo de template específico por usuário
     */
    CampoAnalytics findByUsuarioIdAndCampoTemplateId(Long usuarioId, Long campoTemplateId);
}
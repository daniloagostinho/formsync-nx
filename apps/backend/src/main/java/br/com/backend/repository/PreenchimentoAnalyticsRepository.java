package br.com.backend.repository;

import br.com.backend.entity.PreenchimentoAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PreenchimentoAnalyticsRepository extends JpaRepository<PreenchimentoAnalytics, Long> {

    /**
     * Conta preenchimentos por usuário e período
     */
    Integer countByUsuarioIdAndDataPreenchimentoAfter(Long usuarioId, LocalDateTime dataInicio);

    /**
     * Soma tempo economizado por usuário e período
     */
    @Query("SELECT SUM(p.tempoEconomizado) FROM PreenchimentoAnalytics p WHERE p.usuarioId = :usuarioId AND p.dataPreenchimento > :dataInicio")
    Integer sumTempoEconomizadoByUsuarioIdAndDataPreenchimentoAfter(@Param("usuarioId") Long usuarioId, @Param("dataInicio") LocalDateTime dataInicio);

    /**
     * Conta sites únicos por usuário e período
     */
    @Query("SELECT COUNT(DISTINCT p.site) FROM PreenchimentoAnalytics p WHERE p.usuarioId = :usuarioId AND p.dataPreenchimento > :dataInicio")
    Integer countDistinctSiteByUsuarioIdAndDataPreenchimentoAfter(@Param("usuarioId") Long usuarioId, @Param("dataInicio") LocalDateTime dataInicio);

    /**
     * Conta preenchimentos bem-sucedidos por usuário e período
     */
    Integer countByUsuarioIdAndDataPreenchimentoAfterAndSucessoTrue(Long usuarioId, LocalDateTime dataInicio);

    /**
     * Busca preenchimentos por usuário e período ordenados por data
     */
    List<PreenchimentoAnalytics> findByUsuarioIdAndDataPreenchimentoAfterOrderByDataPreenchimento(Long usuarioId, LocalDateTime dataInicio);

    /**
     * Busca sites mais acessados por usuário com estatísticas
     */
    @Query("SELECT p.site as dominio, COUNT(p) as quantidade, AVG(p.tempoEconomizado) as tempoMedio " +
           "FROM PreenchimentoAnalytics p " +
           "WHERE p.usuarioId = :usuarioId " +
           "GROUP BY p.site " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> findSitesMaisAcessadosByUsuarioId(@Param("usuarioId") Long usuarioId);

    /**
     * Conta preenchimentos por usuário
     */
    Integer countByUsuarioId(Long usuarioId);
}
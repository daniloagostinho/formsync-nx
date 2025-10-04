package br.com.backend.repository;

import br.com.backend.entity.MapeamentoCampo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MapeamentoCampoRepository extends JpaRepository<MapeamentoCampo, Long> {
    
    /**
     * Busca mapeamentos por campo template
     */
    List<MapeamentoCampo> findByCampoTemplateIdAndAtivoOrderByConfiancaDesc(Long campoTemplateId, Boolean ativo);
    
    /**
     * Busca mapeamentos por URL do site
     */
    List<MapeamentoCampo> findByUrlSiteAndAtivoOrderByConfiancaDesc(String urlSite, Boolean ativo);
    
    /**
     * Busca mapeamento por campo template e URL do site
     */
    Optional<MapeamentoCampo> findByCampoTemplateIdAndUrlSiteAndAtivo(Long campoTemplateId, String urlSite, Boolean ativo);
    
    /**
     * Busca mapeamentos com alta confiança para um site
     */
    @Query("SELECT m FROM MapeamentoCampo m WHERE m.urlSite = :urlSite AND m.ativo = true AND m.confianca >= :confiancaMinima ORDER BY m.confianca DESC")
    List<MapeamentoCampo> findMapeamentosConfiaveis(@Param("urlSite") String urlSite, @Param("confiancaMinima") Double confiancaMinima);
    
    /**
     * Busca mapeamentos por padrão de URL
     */
    @Query("SELECT m FROM MapeamentoCampo m WHERE m.campoTemplate.template.usuario.id = :usuarioId AND m.ativo = true AND m.urlSite LIKE CONCAT('%', :padrao, '%') ORDER BY m.confianca DESC")
    List<MapeamentoCampo> findMapeamentosPorPadraoUrl(@Param("usuarioId") Long usuarioId, @Param("padrao") String padrao);
    
    /**
     * Busca mapeamentos mais utilizados por usuário
     */
    @Query("SELECT m FROM MapeamentoCampo m WHERE m.campoTemplate.template.usuario.id = :usuarioId AND m.ativo = true ORDER BY m.totalUso DESC")
    List<MapeamentoCampo> findMapeamentosMaisUtilizados(@Param("usuarioId") Long usuarioId);
    
    /**
     * Busca mapeamentos por tipo de campo
     */
    List<MapeamentoCampo> findByCampoTemplateIdAndTipoCampoAndAtivoOrderByConfiancaDesc(Long campoTemplateId, String tipoCampo, Boolean ativo);
    
    /**
     * Atualiza confiança de um mapeamento
     */
    @Query("UPDATE MapeamentoCampo m SET m.confianca = :confianca, m.dataAtualizacao = CURRENT_TIMESTAMP WHERE m.id = :id")
    void updateConfianca(@Param("id") Long id, @Param("confianca") Double confianca);
}

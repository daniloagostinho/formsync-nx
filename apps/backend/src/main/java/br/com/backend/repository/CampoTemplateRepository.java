package br.com.backend.repository;

import br.com.backend.entity.CampoTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampoTemplateRepository extends JpaRepository<CampoTemplate, Long> {
    
    /**
     * Busca campos por template.
     * @param templateId ID do template.
     * @param ativo Status ativo do campo.
     * @return Lista de campos ordenados por ordem e nome.
     */
    List<CampoTemplate> findByTemplateIdAndAtivoOrderByOrdemAscNomeAsc(
            Long templateId, Boolean ativo);
    
    /**
     * Busca campo por nome e template.
     * @param nome Nome do campo.
     * @param templateId ID do template.
     * @param ativo Status ativo do campo.
     * @return Campo encontrado ou vazio.
     */
    Optional<CampoTemplate> findByNomeAndTemplateIdAndAtivo(
            String nome, Long templateId, Boolean ativo);
    
    /**
     * Verifica se existe campo com o mesmo nome no template.
     * @param nome Nome do campo.
     * @param templateId ID do template.
     * @param ativo Status ativo do campo.
     * @return True se existe, false caso contrário.
     */
    boolean existsByNomeAndTemplateIdAndAtivo(
            String nome, Long templateId, Boolean ativo);
    
    /**
     * Conta campos ativos por template.
     * @param templateId ID do template.
     * @param ativo Status ativo do campo.
     * @return Quantidade de campos ativos.
     */
    long countByTemplateIdAndAtivo(Long templateId, Boolean ativo);
    
    /**
     * Busca campos mais utilizados por template.
     * @param templateId ID do template.
     * @return Lista de campos ordenados por uso.
     */
    @Query("SELECT c FROM CampoTemplate c WHERE c.template.id = :templateId "
            + "AND c.ativo = true ORDER BY c.totalUso DESC")
    List<CampoTemplate> findCamposMaisUtilizados(
            @Param("templateId") Long templateId);
    
    /**
     * Busca próximo número de ordem para o template.
     * @param templateId ID do template.
     * @return Próximo número de ordem.
     */
    @Query("SELECT COALESCE(MAX(c.ordem), 0) + 1 FROM CampoTemplate c "
            + "WHERE c.template.id = :templateId")
    Integer findProximaOrdem(@Param("templateId") Long templateId);
    
    /**
     * Busca campos por tipo.
     * @param templateId ID do template.
     * @param tipo Tipo do campo.
     * @param ativo Status ativo do campo.
     * @return Lista de campos ordenados por ordem.
     */
    List<CampoTemplate> findByTemplateIdAndTipoAndAtivoOrderByOrdemAsc(
            Long templateId, String tipo, Boolean ativo);
    
    /**
     * Conta campos ativos por usuário através da relação com template.
     * @param usuarioId ID do usuário.
     * @param ativo Status ativo do campo.
     * @return Quantidade de campos ativos do usuário.
     */
    @Query("SELECT COUNT(c) FROM CampoTemplate c WHERE c.template.usuario.id = :usuarioId "
            + "AND c.ativo = :ativo")
    long countByUsuarioIdAndAtivo(@Param("usuarioId") Long usuarioId,
            @Param("ativo") Boolean ativo);

    /**
     * Busca campos por template ID.
     * @param templateId ID do template.
     * @return Lista de campos do template.
     */
    List<CampoTemplate> findByTemplateId(Long templateId);
    
    /**
     * Busca campos ativos por template ID.
     * @param templateId ID do template.
     * @return Lista de campos ativos do template.
     */
    List<CampoTemplate> findByTemplateIdAndAtivoTrue(Long templateId);
    
    /**
     * Conta campos por usuário ID.
     * @param usuarioId ID do usuário.
     * @return Quantidade de campos do usuário.
     */
    @Query("SELECT COUNT(ct) FROM CampoTemplate ct JOIN ct.template t "
            + "WHERE t.usuario.id = :usuarioId")
    long countByUsuarioId(@Param("usuarioId") Long usuarioId);
}

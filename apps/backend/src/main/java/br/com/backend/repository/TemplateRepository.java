package br.com.backend.repository;

import br.com.backend.entity.Template;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateRepository extends JpaRepository<Template, Long> {
    
    /**
     * Busca templates por usuário.
     * @param usuarioId ID do usuário.
     * @param ativo Status ativo do template.
     * @return Lista de templates ordenados por nome.
     */
    List<Template> findByUsuarioIdAndAtivoOrderByNomeAsc(Long usuarioId, Boolean ativo);
    
    /**
     * Busca template por nome e usuário.
     * @param nome Nome do template.
     * @param usuarioId ID do usuário.
     * @param ativo Status ativo do template.
     * @return Template encontrado ou vazio.
     */
    Optional<Template> findByNomeAndUsuarioIdAndAtivo(String nome, Long usuarioId, Boolean ativo);
    
    /**
     * Verifica se existe template com o mesmo nome para o usuário.
     * @param nome Nome do template.
     * @param usuarioId ID do usuário.
     * @param ativo Status ativo do template.
     * @return True se existe, false caso contrário.
     */
    boolean existsByNomeAndUsuarioIdAndAtivo(String nome, Long usuarioId, Boolean ativo);
    
    /**
     * Conta templates ativos por usuário.
     * @param usuarioId ID do usuário.
     * @param ativo Status ativo do template.
     * @return Quantidade de templates ativos.
     */
    long countByUsuarioIdAndAtivo(Long usuarioId, Boolean ativo);
    
    /**
     * Busca templates mais utilizados por usuário.
     * @param usuarioId ID do usuário.
     * @return Lista de templates ordenados por uso.
     */
    @Query("SELECT t FROM Template t WHERE t.usuario.id = :usuarioId "
            + "AND t.ativo = true ORDER BY t.totalUso DESC")
    List<Template> findTemplatesMaisUtilizados(@Param("usuarioId") Long usuarioId);
    
    /**
     * Busca templates por padrão de nome.
     * @param usuarioId ID do usuário.
     * @param padrao Padrão de busca no nome.
     * @return Lista de templates que correspondem ao padrão.
     */
    @Query("SELECT t FROM Template t WHERE t.usuario.id = :usuarioId "
            + "AND t.ativo = true AND LOWER(t.nome) LIKE LOWER(CONCAT('%', :padrao, '%')) "
            + "ORDER BY t.nome ASC")
    List<Template> findTemplatesPorPadrao(@Param("usuarioId") Long usuarioId,
            @Param("padrao") String padrao);
    
    /**
     * Busca template com campos carregados.
     * @param templateId ID do template.
     * @param usuarioId ID do usuário.
     * @return Template com campos carregados ou vazio.
     */
    @Query("SELECT DISTINCT t FROM Template t LEFT JOIN FETCH t.campos c "
            + "WHERE t.id = :templateId AND t.usuario.id = :usuarioId AND t.ativo = true")
    Optional<Template> findTemplateComCampos(@Param("templateId") Long templateId,
            @Param("usuarioId") Long usuarioId);
    
    /**
     * Busca templates ativos por usuário.
     * @param usuarioId ID do usuário.
     * @return Lista de templates ativos do usuário.
     */
    List<Template> findByUsuarioIdAndAtivoTrue(Long usuarioId);
    
    /**
     * Busca todos os templates ativos.
     * @return Lista de todos os templates ativos.
     */
    List<Template> findByAtivoTrue();

    /**
     * Busca templates por usuário ID.
     * @param usuarioId ID do usuário.
     * @return Lista de templates do usuário.
     */
    List<Template> findByUsuarioId(Long usuarioId);
    
    /**
     * Conta templates por usuário ID.
     * @param usuarioId ID do usuário.
     * @return Quantidade de templates do usuário.
     */
    @Query("SELECT COUNT(t) FROM Template t WHERE t.usuario.id = :usuarioId")
    long countByUsuarioId(@Param("usuarioId") Long usuarioId);
}

package br.com.backend.repository;

import br.com.backend.entity.NotificacaoVencimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoVencimentoRepository extends JpaRepository<NotificacaoVencimento, Long> {
    List<NotificacaoVencimento> findByUsuarioIdOrderByDataEnvioDesc(Long usuarioId);
    
    @Query("SELECT COUNT(n) FROM NotificacaoVencimento n WHERE n.usuarioId = :usuarioId")
    Long countByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(n) FROM NotificacaoVencimento n WHERE n.usuarioId = :usuarioId AND n.lida = true")
    Long countByUsuarioIdAndLidaTrue(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(n) FROM NotificacaoVencimento n WHERE n.usuarioId = :usuarioId AND n.lida = false")
    Long countByUsuarioIdAndLidaFalse(@Param("usuarioId") Long usuarioId);
}

package br.com.backend.repository;

import br.com.backend.entity.Assinatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AssinaturaRepository extends JpaRepository<Assinatura, Long> {

    @Query("SELECT a FROM Assinatura a WHERE a.usuarioId = :usuarioId AND a.status = 'ATIVA' ORDER BY a.dataInicio DESC")
    List<Assinatura> findAtivasByUsuarioId(Long usuarioId);

    List<Assinatura> findByStatusAndDataProximaCobrancaBefore(String ativa, LocalDateTime now);
    
    List<Assinatura> findByUsuarioId(Long usuarioId);
    
    List<Assinatura> findByUsuarioIdAndStatus(Long usuarioId, String status);
    
    List<Assinatura> findByUsuarioIdOrderByDataInicioDesc(Long usuarioId);

    // ✅ MÉTODOS PARA INTEGRAÇÃO COM STRIPE
    Optional<Assinatura> findByPaymentIntentId(String paymentIntentId);
    
    Optional<Assinatura> findByCustomerId(String customerId);
    
    List<Assinatura> findByRefundStatus(String refundStatus);
    
    @Query("SELECT a FROM Assinatura a WHERE a.refundId IS NOT NULL AND a.refundStatus = :status")
    List<Assinatura> findAssinaturasComReembolso(String status);
}
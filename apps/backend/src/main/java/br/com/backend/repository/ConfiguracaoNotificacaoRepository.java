package br.com.backend.repository;

import br.com.backend.entity.ConfiguracaoNotificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfiguracaoNotificacaoRepository extends JpaRepository<ConfiguracaoNotificacao, Long> {
    Optional<ConfiguracaoNotificacao> findByUsuarioId(Long usuarioId);
    boolean existsByUsuarioId(Long usuarioId);
}

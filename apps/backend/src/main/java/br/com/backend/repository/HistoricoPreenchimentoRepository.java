package br.com.backend.repository;

import br.com.backend.entity.HistoricoPreenchimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoricoPreenchimentoRepository extends JpaRepository<HistoricoPreenchimento, Long> {
    List<HistoricoPreenchimento> findByUsuarioId(Long usuarioId);
}

package br.com.backend.repository;

import br.com.backend.entity.CodigoLogin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CodigoLoginRepository extends JpaRepository<CodigoLogin, Long> {
    Optional<CodigoLogin> findByEmail(String email);
    List<CodigoLogin> findAllByEmail(String email);
    void deleteByEmail(String email);
    
    // Método alternativo para buscar todos os códigos válidos
    @Query(value = "SELECT * FROM codigos_login WHERE email = :email AND expira_em > :now ORDER BY created_at DESC", nativeQuery = true)
    List<CodigoLogin> findAllValidCodesByEmail(@Param("email") String email, @Param("now") LocalDateTime now);
}

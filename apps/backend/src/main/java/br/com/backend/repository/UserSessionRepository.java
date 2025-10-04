package br.com.backend.repository;

import br.com.backend.entity.UserSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    
    @Query("SELECT COUNT(u) FROM UserSession u WHERE u.email = :email AND u.isActive = true")
    int countActiveSessionsByEmail(@Param("email") String email);
    
    @Query("SELECT COUNT(u) FROM UserSession u WHERE u.token = :token AND u.isActive = true AND u.expiresAt > :now")
    int countActiveSessionsByToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE UserSession u SET u.isActive = false, u.revokedAt = :revokedAt WHERE u.email = :email AND u.isActive = true")
    int revokeAllUserSessions(@Param("email") String email, @Param("revokedAt") LocalDateTime revokedAt);
    
    @Modifying
    @Transactional
    @Query("UPDATE UserSession u SET u.isActive = false WHERE u.expiresAt <= :now AND u.isActive = true")
    int revokeExpiredSessions(@Param("now") LocalDateTime now);
    
    @Query("SELECT u FROM UserSession u WHERE u.email = :email AND u.isActive = true ORDER BY u.createdAt DESC")
    List<UserSession> findActiveSessionsByEmail(@Param("email") String email);
    
    @Query("SELECT u FROM UserSession u WHERE u.token = :token AND u.isActive = true AND u.expiresAt > :now")
    Optional<UserSession> findActiveSessionByToken(@Param("token") String token, @Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM UserSession u WHERE u.email = :email")
    void deleteByEmail(@Param("email") String email);
}

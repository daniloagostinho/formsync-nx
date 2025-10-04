package br.com.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
@Slf4j
public class HealthController {

    private final DataSource dataSource;

    /**
     * Health check básico
     * Este endpoint é chamado para verificar se a aplicação está saudável
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "FormSync Backend");
        response.put("port", System.getProperty("server.port", "8080"));
        response.put("profiles", System.getProperty("spring.profiles.active", "default"));
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint simples para teste de conectividade
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    /**
     * Health check detalhado com métricas do sistema
     */
    @GetMapping("/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verificar conexão com banco
            try (Connection connection = dataSource.getConnection()) {
                response.put("database", "UP");
                response.put("databaseUrl", connection.getMetaData().getURL());
                response.put("databaseVersion", connection.getMetaData().getDatabaseProductVersion());
            }
        } catch (SQLException e) {
            response.put("database", "DOWN");
            response.put("databaseError", e.getMessage());
        }
        
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "FormSync Backend");
        
        return ResponseEntity.ok(response);
    }


    /**
     * Endpoint para verificar e executar migrações do Flyway
     */
    @PostMapping("/migrate")
    public ResponseEntity<Map<String, Object>> executeMigrations() {
        log.info("🔧 [MIGRATE] Executando migrações do Flyway manualmente");
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Verificar se as tabelas existem
            try (Connection connection = dataSource.getConnection()) {
                
                // Verificar tabela usuarios
                boolean usuariosExists = tableExists(connection, "usuarios");
                response.put("usuarios_table", usuariosExists ? "EXISTS" : "MISSING");
                
                // Verificar tabela assinaturas
                boolean assinaturasExists = tableExists(connection, "assinaturas");
                response.put("assinaturas_table", assinaturasExists ? "EXISTS" : "MISSING");
                
                // Verificar tabela codigo_login
                boolean codigoLoginExists = tableExists(connection, "codigo_login");
                response.put("codigo_login_table", codigoLoginExists ? "EXISTS" : "MISSING");
                
                // Verificar tabela logs
                boolean logsExists = tableExists(connection, "logs");
                response.put("logs_table", logsExists ? "EXISTS" : "MISSING");
                
                if (!usuariosExists || !assinaturasExists || !codigoLoginExists || !logsExists) {
                    response.put("status", "MIGRATION_NEEDED");
                    response.put("message", "Algumas tabelas estão faltando. Execute as migrações do Flyway.");
                    response.put("recommendation", "Verifique se o Flyway está habilitado e se as migrações estão sendo executadas.");
                } else {
                    response.put("status", "HEALTHY");
                    response.put("message", "Todas as tabelas necessárias existem.");
                }
                
            }
            
        } catch (Exception e) {
            log.error("❌ [MIGRATE] Erro ao verificar migrações: {}", e.getMessage());
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
    
    private boolean tableExists(Connection connection, String tableName) throws SQLException {
        try (var rs = connection.getMetaData().getTables(null, null, tableName, null)) {
            return rs.next();
        }
    }
}

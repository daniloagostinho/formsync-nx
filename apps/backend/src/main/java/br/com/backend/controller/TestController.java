package br.com.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    @Value("${spring.datasource.url:NOT_SET}")
    private String databaseUrl;

    @Value("${spring.profiles.active:NOT_SET}")
    private String activeProfile;

    @GetMapping("/env")
    public ResponseEntity<Map<String, String>> getEnvironmentInfo() {
        log.info("🔍 [TEST] Verificando informações do ambiente");
        
        Map<String, String> envInfo = new HashMap<>();
        envInfo.put("databaseConfigured", databaseUrl != null && !databaseUrl.equals("NOT_SET") ? "YES" : "NO");
        envInfo.put("activeProfile", activeProfile);
        envInfo.put("message", "Environment variables loaded successfully");
        envInfo.put("timestamp", java.time.LocalDateTime.now().toString());
        
        log.info("✅ [TEST] Informações do ambiente carregadas com sucesso");
        return ResponseEntity.ok(envInfo);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.debug("🔍 [TEST] Health check solicitado");
        
        Map<String, String> health = new HashMap<>();
        health.put("status", "OK");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        health.put("service", "Test Controller");
        
        return ResponseEntity.ok(health);
    }
}

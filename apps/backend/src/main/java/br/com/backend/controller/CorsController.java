package br.com.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class CorsController {

    @GetMapping("/cors-test")
    public ResponseEntity<Map<String, Object>> corsTest() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "CORS OK");
        response.put("message", "CORS está funcionando corretamente");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/**", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleOptions() {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/cors-debug")
    public ResponseEntity<Map<String, Object>> corsDebug() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "CORS Debug OK");
        response.put("message", "CORS está funcionando corretamente");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        response.put("allowedOrigins", new String[]{
            "https://formsync.com.br",
            "https://www.formsync.com.br",
            "https://d2e8aebnrgifge.cloudfront.net",
            "https://formsync.com.br"
        });
        return ResponseEntity.ok(response);
    }
}

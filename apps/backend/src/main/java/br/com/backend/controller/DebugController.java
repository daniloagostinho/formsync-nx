package br.com.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = {"*"})
@RequestMapping("/api/v1/debug")
@RequiredArgsConstructor
@Slf4j
public class DebugController {

    private final ApplicationContext applicationContext;
    private final RequestMappingHandlerMapping requestMappingHandlerMapping;

    @GetMapping("/controllers")
    public ResponseEntity<Map<String, Object>> listControllers() {
        log.info("🔍 [DEBUG] Listando controllers registrados");
        
        try {
            Map<String, Object> response = new HashMap<>();
            
            // Listar todos os beans do tipo Controller
            String[] controllerNames = applicationContext.getBeanNamesForAnnotation(RestController.class);
            response.put("controllers", controllerNames);
            response.put("total_controllers", controllerNames.length);
            
            // Listar todas as rotas mapeadas
            Map<String, Object> routes = new HashMap<>();
            requestMappingHandlerMapping.getHandlerMethods().forEach((key, value) -> {
                String pattern = key.toString();
                String method = value.getMethod().getName();
                String className = value.getBeanType().getSimpleName();
                routes.put(pattern, Map.of(
                    "method", method,
                    "controller", className
                ));
            });
            
            response.put("routes", routes);
            response.put("total_routes", routes.size());
            
            // Informações do contexto
            response.put("active_profiles", applicationContext.getEnvironment().getActiveProfiles());
            response.put("default_profiles", applicationContext.getEnvironment().getDefaultProfiles());
            
            log.info("✅ [DEBUG] Controllers listados com sucesso: {}", controllerNames.length);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [DEBUG] Erro ao listar controllers: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erro ao listar controllers", "message", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("🔍 [DEBUG] Health check solicitado");
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "FormSync Backend Debug");
        response.put("timestamp", java.time.LocalDateTime.now());
        response.put("active_profiles", applicationContext.getEnvironment().getActiveProfiles());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/beans")
    public ResponseEntity<Map<String, Object>> listBeans() {
        log.info("🔍 [DEBUG] Listando beans registrados");
        
        try {
            String[] beanNames = applicationContext.getBeanDefinitionNames();
            List<String> controllerBeans = List.of(beanNames).stream()
                .filter(name -> name.toLowerCase().contains("controller"))
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("total_beans", beanNames.length);
            response.put("controller_beans", controllerBeans);
            response.put("total_controller_beans", controllerBeans.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [DEBUG] Erro ao listar beans: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Erro ao listar beans", "message", e.getMessage()));
        }
    }
}

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
@RequestMapping("/api/v1/docs")
@RequiredArgsConstructor
@Slf4j
public class DocumentacaoController {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDocumentacao() {
        log.info("📚 [DOCS] Documentação da API solicitada");
        
        try {
            Map<String, Object> docs = new HashMap<>();
            docs.put("titulo", "Preenche Rápido API");
            docs.put("versao", "1.0");
            docs.put("descricao", "API para o sistema Preenche Rápido");
            
            Map<String, Object> rotas = new HashMap<>();
            
            // Rotas de Autenticação
            Map<String, String> auth = new HashMap<>();
            auth.put("POST /api/v1/login", "Login de usuário");
            auth.put("POST /api/v1/registrar", "Registro de usuário");
            auth.put("GET /api/v1/login/verificar", "Verificar código de login");
            rotas.put("Autenticação", auth);
            
            // Rotas de Usuários
            Map<String, String> usuarios = new HashMap<>();
            usuarios.put("GET /api/v1/usuarios", "Listar usuários");
            usuarios.put("POST /api/v1/usuarios", "Criar usuário");
            usuarios.put("PUT /api/v1/usuarios/{id}", "Atualizar usuário");
            usuarios.put("DELETE /api/v1/usuarios/{id}", "Deletar usuário");
            rotas.put("Usuários", usuarios);
            
            // Rotas de Campos
            Map<String, String> campos = new HashMap<>();
            campos.put("GET /api/v1/campos", "Listar campos");
            campos.put("POST /api/v1/campos", "Criar campo");
            campos.put("PUT /api/v1/campos/{id}", "Atualizar campo");
            campos.put("DELETE /api/v1/campos/{id}", "Deletar campo");
            rotas.put("Campos", campos);
            
            // Rotas de CSV
            Map<String, String> csv = new HashMap<>();
            csv.put("POST /api/v1/campos/csv/upload", "Upload de arquivo CSV");
            csv.put("GET /api/v1/campos/csv", "Listar campos CSV");
            rotas.put("CSV", csv);
            
            // Rotas de Assinaturas
            Map<String, String> assinaturas = new HashMap<>();
            assinaturas.put("GET /api/v1/assinaturas", "Listar assinaturas");
            assinaturas.put("POST /api/v1/assinaturas", "Criar assinatura");
            rotas.put("Assinaturas", assinaturas);
            
            // Rotas de Histórico
            Map<String, String> historico = new HashMap<>();
            historico.put("GET /api/v1/historico", "Listar histórico de preenchimentos");
            historico.put("POST /api/v1/historico", "Salvar registro de preenchimento");
            historico.put("DELETE /api/v1/historico/{id}", "Deletar registro específico");
            historico.put("DELETE /api/v1/historico", "Limpar todo o histórico");
            rotas.put("Histórico", historico);
            
            // Rotas de Checkout
            Map<String, String> checkout = new HashMap<>();
            checkout.put("POST /api/v1/checkout", "Criar sessão de checkout");
            rotas.put("Checkout", checkout);
            
            // Rotas Públicas
            Map<String, String> publicas = new HashMap<>();
            publicas.put("GET /api/v1/public/**", "Endpoints públicos");
            rotas.put("Públicas", publicas);
            
            docs.put("rotas", rotas);
            
            Map<String, String> info = new HashMap<>();
            info.put("base_url", "http://localhost:" + serverPort + contextPath);
            info.put("formato", "JSON");
            info.put("autenticacao", "JWT Bearer Token");
            docs.put("informacoes", info);
            
            // Códigos de Status HTTP
            Map<String, String> statusCodes = new HashMap<>();
            statusCodes.put("200", "OK - Sucesso");
            statusCodes.put("201", "Created - Recurso criado");
            statusCodes.put("204", "No Content - Sucesso sem conteúdo");
            statusCodes.put("400", "Bad Request - Erro de validação");
            statusCodes.put("401", "Unauthorized - Não autenticado");
            statusCodes.put("403", "Forbidden - Não autorizado");
            statusCodes.put("404", "Not Found - Recurso não encontrado");
            statusCodes.put("409", "Conflict - Conflito (ex: email já cadastrado)");
            statusCodes.put("410", "Gone - Recurso expirado");
            statusCodes.put("500", "Internal Server Error - Erro interno");
            docs.put("statusCodes", statusCodes);
            
            // Códigos de Erro
            Map<String, String> errorCodes = new HashMap<>();
            errorCodes.put("EMAIL_CONFLICT", "E-mail já cadastrado");
            errorCodes.put("USER_NOT_FOUND", "Usuário não encontrado");
            errorCodes.put("UNAUTHORIZED", "Não autenticado");
            errorCodes.put("INVALID_CODE", "Código inválido");
            errorCodes.put("TOO_MANY_ATTEMPTS", "Muitas tentativas");
            errorCodes.put("CODE_EXPIRED", "Código expirado");
            errorCodes.put("INCORRECT_CODE", "Código incorreto");
            errorCodes.put("VALIDATION_ERROR", "Erro de validação");
            errorCodes.put("INVALID_ARGUMENT", "Argumento inválido");
            errorCodes.put("INTERNAL_SERVER_ERROR", "Erro interno do servidor");
            docs.put("errorCodes", errorCodes);
            
            log.info("✅ [DOCS] Documentação da API gerada com sucesso");
            return ResponseEntity.ok(docs);
            
        } catch (Exception e) {
            log.error("❌ [DOCS] Erro ao gerar documentação: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Erro interno ao gerar documentação");
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
} 
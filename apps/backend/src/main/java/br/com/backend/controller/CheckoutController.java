package br.com.backend.controller;

import br.com.backend.dto.CriarCheckoutDTO;
import br.com.backend.dto.ErrorResponseDTO;
import br.com.backend.dto.LoginResponseDTO;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import br.com.backend.entity.Usuario;
import br.com.backend.entity.Assinatura;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.service.AssinaturaService;
import br.com.backend.entity.CodigoLogin;
import br.com.backend.repository.CodigoLoginRepository;
import br.com.backend.security.JwtTokenUtil;
import br.com.backend.service.SessionControlService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequiredArgsConstructor
public class CheckoutController {

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaService assinaturaService;
    private final CodigoLoginRepository codigoLoginRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final SessionControlService sessionControlService;

    @Value("${stripe.webhook.secret:whsec_test}")
    private String stripeWebhookSecret;
    
    @Value("${stripe.enabled:true}")
    private boolean stripeEnabled;
    
    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;
    
    @Value("${stripe.publishable.key:}")
    private String publishableKey;

    @PostMapping("/checkout")
    public Map<String, String> createCheckoutSession(@Valid @RequestBody CriarCheckoutDTO dto) throws Exception {
        System.out.println("🔔 [CHECKOUT_START] Iniciando criação de checkout...");
        System.out.println("   - Email: " + dto.getEmail());
        System.out.println("   - Plano: " + dto.getPlano());
        System.out.println("   - Timestamp: " + java.time.LocalDateTime.now());
        
        // URLs configuráveis para diferentes ambientes
        String baseSuccessUrl = System.getenv().getOrDefault("STRIPE_SUCCESS_URL", "http://localhost:4200/sucesso");
        String cancelUrl = System.getenv().getOrDefault("STRIPE_CANCEL_URL", "http://localhost:4200/login");

        // Adicionar email como parâmetro na URL de sucesso
        String successUrl = baseSuccessUrl;
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            successUrl = baseSuccessUrl + "?email=" + dto.getEmail();
        }
        
        System.out.println("🔗 [CHECKOUT_URLS] URLs configuradas:");
        System.out.println("   - Success URL: " + successUrl);
        System.out.println("   - Cancel URL: " + cancelUrl);
        System.out.println("   - Environment STRIPE_SUCCESS_URL: " + System.getenv("STRIPE_SUCCESS_URL"));
        System.out.println("   - Environment STRIPE_CANCEL_URL: " + System.getenv("STRIPE_CANCEL_URL"));
        
        // ✅ FORÇAR URLs corretas para produção
        if (System.getenv("SPRING_PROFILES_ACTIVE") != null && 
            System.getenv("SPRING_PROFILES_ACTIVE").equals("prod")) {
            
            // Em produção, sempre usar o domínio correto
            successUrl = "https://formsync.com.br/sucesso";
            if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
                successUrl += "?email=" + dto.getEmail();
            }
            cancelUrl = "https://formsync.com.br/login";
            
            System.out.println("🚀 [PRODUCTION] Forçando URLs de produção:");
            System.out.println("   - Success URL (forçada): " + successUrl);
            System.out.println("   - Cancel URL (forçada): " + cancelUrl);
        }
        
        System.out.println("🏷️ [CHECKOUT_PRODUCT] Iniciando configuração do produto:");
        System.out.println("   - Plano solicitado: " + dto.getPlano());

        SessionCreateParams.LineItem.PriceData.ProductData productData;
        long amount;

        switch (dto.getPlano().toUpperCase()) {
            // Planos do my-password
            case "FREE":
            case "GRATIS":
            case "PESSOAL_GRATIS":
                // Não deve criar checkout para plano gratuito
                throw new IllegalArgumentException("Plano FREE não requer checkout");

            case "PESSOAL":
                productData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("FormSync Pessoal - R$ 0,50/mês")
                        .build();
                amount = 50L; // R$ 0,50 (valor mínimo para teste em produção)
                // amount = 1490L; // R$ 14,90 (valor original)
                break;

            case "PROFISSIONAL":
            case "PROFISSIONAL_MENSAL":
                productData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("FormSync Profissional - R$ 0,50/mês")
                        .build();
                amount = 50L; // R$ 0,50 (valor mínimo para teste em produção)
                // amount = 3990L; // R$ 39,90 (valor original)
                break;

            case "EMPRESARIAL":
            case "ENTERPRISE":
                productData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("FormSync Empresarial - R$ 0,50/mês")
                        .build();
                amount = 50L; // R$ 0,50 (valor mínimo para teste em produção)
                // amount = 9990L; // R$ 99,90 (valor original)
                break;

            // Compatibilidade com planos antigos
            case "PROFISSIONAL_VITALICIO":
                productData = SessionCreateParams.LineItem.PriceData.ProductData.builder()
                        .setName("FormSync Profissional Vitalício - R$ 0,50")
                        .build();
                amount = 50L; // R$ 0,50 (valor mínimo para teste em produção)
                // amount = 29990L; // R$ 299,90 (valor original)
                break;

            default:
                throw new IllegalArgumentException("Plano inválido: " + dto.getPlano());
        }

        System.out.println("✅ [CHECKOUT_PRODUCT] Produto configurado:");
        System.out.println("   - Nome do produto: " + productData.getName());
        System.out.println("   - Valor (centavos): " + amount);
        System.out.println("   - Valor (reais): R$ " + (amount / 100.0));

        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("brl")
                                                .setUnitAmount(amount)
                                                .setProductData(productData)
                                                .build()
                                )
                                .setQuantity(1L)
                                .build()
                );

        // Adicionar metadata com o plano normalizado
        paramsBuilder.putMetadata("plano", dto.getPlano().toUpperCase());

        // Se email foi fornecido, pré-preencher
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            paramsBuilder.setCustomerEmail(dto.getEmail());
        }

        SessionCreateParams params = paramsBuilder.build();
        
        System.out.println("🔐 [CHECKOUT_API_KEY] Verificando API Key antes da criação da sessão...");
        
        // Verificar se Stripe está habilitado
        if (!stripeEnabled) {
            System.out.println("⚠️ [STRIPE_DISABLED] Stripe está desabilitado - retornando erro 500");
            throw new RuntimeException("Stripe está desabilitado. Verifique as configurações do ambiente.");
        }
        
        // Verificar se a API Key está configurada
        if (Stripe.apiKey == null || Stripe.apiKey.trim().isEmpty()) {
            System.out.println("⚠️ [STRIPE_NO_KEY] Stripe API Key não configurada - retornando erro 500");
            throw new RuntimeException("Stripe API Key não está configurada. Verifique as configurações do ambiente.");
        }
        
        System.out.println("   - Stripe.apiKey (primeiros 10 chars): " + Stripe.apiKey.substring(0, Math.min(10, Stripe.apiKey.length())) + "...");
        System.out.println("   - Tipo da chave: " + (Stripe.apiKey.startsWith("sk_") ? "SECRET KEY ✅" : "PUBLIC KEY ❌"));
        System.out.println("   - publishableKey (primeiros 10 chars): " + publishableKey.substring(0, Math.min(10, publishableKey.length())) + "...");
        System.out.println("   - Tipo da publishable: " + (publishableKey.startsWith("pk_") ? "PUBLIC KEY ✅" : "SECRET KEY ❌"));
        
        System.out.println("📋 [CHECKOUT_PARAMS] Parâmetros da sessão:");
        System.out.println("   - Success URL: " + params.getSuccessUrl());
        System.out.println("   - Cancel URL: " + params.getCancelUrl());
        System.out.println("   - Mode: " + params.getMode());
        System.out.println("   - Currency: " + params.getLineItems().get(0).getPriceData().getCurrency());
        System.out.println("   - Amount: " + params.getLineItems().get(0).getPriceData().getUnitAmount());
        
        System.out.println("📡 [CHECKOUT_SESSION] Criando sessão no Stripe...");
        Session session = Session.create(params);
        
        System.out.println("✅ [CHECKOUT_SUCCESS] Checkout criado com sucesso!");
        System.out.println("   - Session ID: " + session.getId());
        System.out.println("   - Email: " + dto.getEmail());
        System.out.println("   - Plano: " + dto.getPlano());
        System.out.println("   - Session URL: " + session.getUrl());
        System.out.println("   - Payment Status: " + session.getPaymentStatus());
        System.out.println("   - Status: " + session.getStatus());

        Map<String, String> response = new HashMap<>();
        response.put("id", session.getId());
        
        System.out.println("🚀 [CHECKOUT_RESPONSE] Retornando resposta para frontend:");
        System.out.println("   - Response ID: " + response.get("id"));
        System.out.println("🔚 [CHECKOUT_END] Processo de checkout concluído!");
        
        return response;
    }

    @GetMapping("/checkout/test")
    public Map<String, Object> testStripeConnection() {
        Map<String, Object> response = new HashMap<>();
        try {
            System.out.println("🔐 Testando conexão com Stripe...");
            
            // Verificar se Stripe está habilitado
            if (!stripeEnabled) {
                response.put("status", "disabled");
                response.put("message", "Stripe está desabilitado");
                return response;
            }
            
            // Verificar se a API Key está configurada
            if (Stripe.apiKey == null || Stripe.apiKey.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Stripe API Key não está configurada");
                return response;
            }
            
            System.out.println("   - API Key (primeiros 10 chars): " + Stripe.apiKey.substring(0, Math.min(10, Stripe.apiKey.length())) + "...");
            System.out.println("   - Tipo da chave: " + (Stripe.apiKey.startsWith("sk_") ? "SECRET KEY ✅" : "PUBLIC KEY ❌"));
            
            com.stripe.model.Account account = com.stripe.model.Account.retrieve();
            response.put("status", "success");
            response.put("message", "Conexão com Stripe OK");
            response.put("account_id", account.getId());
            response.put("api_key_type", Stripe.apiKey.startsWith("sk_") ? "secret" : "public");
            response.put("api_key_prefix", Stripe.apiKey.substring(0, Math.min(10, Stripe.apiKey.length())) + "...");
        } catch (Exception e) {
            System.out.println("❌ Erro na conexão com Stripe: " + e.getMessage());
            response.put("status", "error");
            response.put("message", "Erro na conexão com Stripe: " + e.getMessage());
            
            if (Stripe.apiKey != null && !Stripe.apiKey.trim().isEmpty()) {
                response.put("api_key_type", Stripe.apiKey.startsWith("sk_") ? "secret" : "public");
                response.put("api_key_prefix", Stripe.apiKey.substring(0, Math.min(10, Stripe.apiKey.length())) + "...");
            } else {
                response.put("api_key_type", "not_configured");
                response.put("api_key_prefix", "N/A");
            }
        }
        return response;
    }

    @GetMapping("/checkout/debug/users")
    public Map<String, Object> debugUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Usuario> usuarios = usuarioRepository.findAll();
            response.put("status", "success");
            response.put("total_users", usuarios.size());
            response.put("users", usuarios.stream()
                .map(u -> Map.of(
                    "id", u.getId(),
                    "email", u.getEmail(),
                    "nome", u.getNome(),
                    "plano", u.getPlano()
                ))
                .collect(java.util.stream.Collectors.toList()));
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao buscar usuários: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/checkout/debug/simulate-webhook")
    public Map<String, Object> simulateWebhook(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = (String) request.get("email");
            String plano = (String) request.get("plano");
            
            if (email == null || plano == null) {
                response.put("status", "error");
                response.put("message", "Email e plano são obrigatórios");
                return response;
            }
            
            System.out.println("🔔 Simulando webhook - Email: " + email + ", Plano: " + plano);
            
            // Simular criação de usuário como no webhook
            Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(email);
            
            Usuario usuario;
            if (usuarioExistente.isPresent()) {
                usuario = usuarioExistente.get();
                System.out.println("🔔 Usuário encontrado - ID: " + usuario.getId() + ", Nome: " + usuario.getNome());
            } else {
                // ✅ VERIFICAÇÃO DE SEGURANÇA: Verificar se não há duplicata antes de criar
                if (usuarioRepository.existsByEmail(email)) {
                    System.out.println("❌ ERRO: Usuário com email " + email + " já existe no banco!");
                    response.put("status", "error");
                    response.put("message", "Usuário com email " + email + " já existe no banco de dados");
                    return response;
                }
                
                System.out.println("🔔 Criando novo usuário para email: " + email);
                usuario = new Usuario();
                usuario.setEmail(email);
                usuario.setNome(email.split("@")[0]);
                usuario.setSenha("stripe");
            }
            
            usuario.setPlano(plano);
            usuario = usuarioRepository.save(usuario);
            System.out.println("🔔 Usuário salvo - ID: " + usuario.getId() + ", Email: " + usuario.getEmail() + ", Plano: " + usuario.getPlano());
            
            // Criar assinatura
            Assinatura assinatura = assinaturaService.criarAssinatura(usuario.getId(), plano);
            System.out.println("🔔 Assinatura criada - ID: " + assinatura.getId() + ", Plano: " + assinatura.getPlano());
            
            response.put("status", "success");
            response.put("message", "Webhook simulado com sucesso");
            response.put("user_id", usuario.getId());
            response.put("assinatura_id", assinatura.getId());
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao simular webhook: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<?> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        System.out.println("🔔 Webhook recebido - Payload: " + payload.substring(0, Math.min(200, payload.length())) + "...");
        
        try {
            // 1. Validar assinatura do Stripe
            Event event = Webhook.constructEvent(payload, sigHeader, stripeWebhookSecret);
            System.out.println("🔔 Evento validado - Tipo: " + event.getType());

            // 2. Processar evento de pagamento aprovado
            if ("checkout.session.completed".equals(event.getType())) {
                System.out.println("🔔 Processando checkout.session.completed");
                
                // CORREÇÃO: Extrair a sessão corretamente do evento
                Session session = null;
                try {
                    session = (Session) event.getData().getObject();
                    System.out.println("🔔 Sessão extraída com sucesso - ID: " + session.getId());
                } catch (Exception e) {
                    System.out.println("❌ ERRO ao extrair sessão: " + e.getMessage());
                    // Tentar extrair dados do payload JSON diretamente
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        JsonNode jsonNode = mapper.readTree(payload);
                        JsonNode dataNode = jsonNode.get("data");
                        JsonNode objectNode = dataNode.get("object");
                        
                        String sessionId = objectNode.get("id").asText();
                        String email = objectNode.has("customer_email") ? objectNode.get("customer_email").asText() : null;
                        
                        System.out.println("🔔 Dados extraídos do JSON:");
                        System.out.println("   - Session ID: " + sessionId);
                        System.out.println("   - Email: " + email);
                        
                        // Se não tem email no customer_email, tentar customer_details
                        if (email == null && objectNode.has("customer_details")) {
                            JsonNode customerDetails = objectNode.get("customer_details");
                            if (customerDetails.has("email")) {
                                email = customerDetails.get("email").asText();
                                System.out.println("   - Email (customer_details): " + email);
                            }
                        }
                        
                        // Extrair plano do metadata
                        String plano = null;
                        if (objectNode.has("metadata") && objectNode.get("metadata").has("plano")) {
                            plano = objectNode.get("metadata").get("plano").asText();
                            System.out.println("   - Plano: " + plano);
                        }
                        
                        // Validar dados extraídos
                        if (email == null || email.trim().isEmpty()) {
                            System.out.println("❌ ERRO: Email não encontrado no webhook");
                            return ResponseEntity.badRequest().body("Email não encontrado no webhook");
                        }
                        
                        if (plano == null || plano.trim().isEmpty()) {
                            System.out.println("⚠️ AVISO: Plano não encontrado, usando fallback");
                            plano = "PESSOAL"; // Mudança: usar PESSOAL como padrão
                        }
                        
                        // Processar usuário com dados extraídos
                        processarUsuarioAposPagamento(email, plano);
                        
                    } catch (Exception jsonError) {
                        System.out.println("❌ ERRO ao processar JSON: " + jsonError.getMessage());
                        return ResponseEntity.badRequest().body("Erro ao processar dados do webhook");
                    }
                    return ResponseEntity.ok("Webhook processado com sucesso");
                }
                
                // Se chegou aqui, a sessão foi extraída corretamente
                String sessionId = session.getId();
                String email = session.getCustomerEmail();
                String plano = null;
                
                // Extrair plano do metadata
                if (session.getMetadata() != null && session.getMetadata().containsKey("plano")) {
                    plano = session.getMetadata().get("plano");
                }
                
                System.out.println("🔔 Dados extraídos da sessão:");
                System.out.println("   - Session ID: " + sessionId);
                System.out.println("   - Email: " + email);
                System.out.println("   - Plano: " + plano);
                
                // Validar dados extraídos
                if (email == null || email.trim().isEmpty()) {
                    System.out.println("❌ ERRO: Email não encontrado no webhook");
                    System.out.println("   - Session: " + session);
                    System.out.println("   - Customer Details: " + session.getCustomerDetails());
                    return ResponseEntity.badRequest().body("Email não encontrado no webhook");
                }
                
                if (plano == null || plano.trim().isEmpty()) {
                    System.out.println("⚠️ AVISO: Plano não encontrado, usando fallback");
                    plano = "PESSOAL"; // Mudança: usar PESSOAL como padrão
                }
                
                System.out.println("🔔 Dados finais:");
                System.out.println("   - Session ID: " + sessionId);
                System.out.println("   - Email: " + email);
                System.out.println("   - Plano: " + plano);
                System.out.println("   - Payment Status: " + session.getPaymentStatus());
                System.out.println("   - Session Status: " + session.getStatus());
                
                // Processar usuário
                processarUsuarioAposPagamento(email, plano);
            }
            
            System.out.println("🔔 Webhook processado com sucesso");
            return ResponseEntity.ok("Webhook processado com sucesso");
        } catch (Exception e) {
            System.out.println("❌ ERRO no webhook: " + e.getMessage());
            e.printStackTrace();
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Erro ao processar webhook: " + e.getMessage(), 
                "WEBHOOK_PROCESSING_ERROR"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    private void processarUsuarioAposPagamento(String email, String plano) {
        System.out.println("🔔 Processando usuário após pagamento - Email: " + email + ", Plano: " + plano);
        
        // 3. Criar ou atualizar usuário
        System.out.println("🔔 Verificando se usuário existe para email: " + email);
        Optional<Usuario> usuarioExistente = usuarioRepository.findByEmail(email);
        
        Usuario usuario;
        if (usuarioExistente.isPresent()) {
            usuario = usuarioExistente.get();
            System.out.println("🔔 Usuário encontrado - ID: " + usuario.getId() + ", Nome: " + usuario.getNome());
            // Atualizar plano se necessário
            if (!usuario.getPlano().equals(plano)) {
                usuario.setPlano(plano);
                System.out.println("🔔 Atualizando plano do usuário para: " + plano);
            }
        } else {
            // ✅ VERIFICAÇÃO DE SEGURANÇA: Verificar se não há duplicata antes de criar
            if (usuarioRepository.existsByEmail(email)) {
                System.out.println("❌ ERRO: Usuário com email " + email + " já existe no banco!");
                throw new RuntimeException("Usuário com email " + email + " já existe no banco de dados");
            }
            
            System.out.println("🔔 Criando novo usuário para email: " + email);
            usuario = new Usuario();
            usuario.setEmail(email);
            usuario.setNome(email.split("@")[0]);
            usuario.setSenha("stripe"); // senha dummy, usuário pode redefinir depois
            usuario.setPlano(plano);
        }
        
        try {
            usuario = usuarioRepository.save(usuario);
            System.out.println("🔔 Usuário salvo - ID: " + usuario.getId() + ", Email: " + usuario.getEmail() + ", Plano: " + usuario.getPlano());
            
            // 4. Criar assinatura
            Assinatura assinatura = assinaturaService.criarAssinatura(usuario.getId(), plano);
            System.out.println("🔔 Assinatura criada - ID: " + assinatura.getId() + ", Plano: " + assinatura.getPlano());
            
            // Verificar se a assinatura foi criada corretamente
            List<Assinatura> assinaturasVerificadas = assinaturaService.buscarAssinaturasAtivas(usuario.getId());
            System.out.println("🔔 Verificação - Assinaturas ativas encontradas: " + assinaturasVerificadas.size());
            
            System.out.println("✅ Webhook processado com sucesso - Usuário criado/atualizado");
            // 5. Gerar token JWT automaticamente
            String jwtToken = jwtTokenUtil.generateToken(usuario.getEmail());
            System.out.println("🔔 Token JWT gerado automaticamente para: " + usuario.getEmail());
            
            // 🔥 CORREÇÃO: Registrar token na sessão para webhook
            sessionControlService.registerActiveToken(usuario.getEmail(), jwtToken);
            System.out.println("🔔 Token registrado na sessão via webhook para: " + usuario.getEmail());
            
            System.out.println("✅ RESUMO FINAL:");
            System.out.println("   - Usuário ID: " + usuario.getId());
            System.out.println("   - Email: " + usuario.getEmail());
            System.out.println("   - Plano: " + usuario.getPlano());
            System.out.println("   - Assinatura ID: " + assinatura.getId());
            System.out.println("   - Assinatura Status: " + assinatura.getStatus());
            System.out.println("   - JWT Token: " + jwtToken.substring(0, 20) + "...");
            
        } catch (Exception e) {
            System.out.println("❌ ERRO ao criar usuário: " + e.getMessage());
            System.out.println("❌ Stack trace completo:");
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/checkout/debug/get-code")
    public Map<String, Object> getCode(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<CodigoLogin> codigoLogin = codigoLoginRepository.findByEmail(email);
            
            if (codigoLogin.isPresent()) {
                response.put("status", "success");
                response.put("codigo", codigoLogin.get().getCodigo());
                response.put("email", email);
            } else {
                response.put("status", "error");
                response.put("message", "Código não encontrado para o email: " + email);
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao buscar código: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/checkout/auto-login")
    public ResponseEntity<?> autoLoginAfterPayment(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        
        System.out.println("🔍 [AUTO_LOGIN_START] Auto-login solicitado para email: " + email);
        System.out.println("   - Request body: " + request);
        System.out.println("   - Timestamp: " + java.time.LocalDateTime.now());
        
        if (email == null || email.trim().isEmpty()) {
            System.out.println("❌ [AUTO_LOGIN_ERROR] Email não fornecido no auto-login");
            return ResponseEntity.badRequest().body(new ErrorResponseDTO("Email é obrigatório", "EMAIL_REQUIRED"));
        }
        
        try {
            // Verificar se o usuário existe
            System.out.println("🔍 [AUTO_LOGIN_USER_SEARCH] Buscando usuário por email: " + email);
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            
            if (usuarioOpt.isEmpty()) {
                System.out.println("❌ [AUTO_LOGIN_ERROR] Usuário não encontrado para email: " + email);
                
                // Log de todos os usuários para debug
                try {
                    List<Usuario> todosUsuarios = usuarioRepository.findAll();
                    System.out.println("📋 [AUTO_LOGIN_DEBUG] Usuários existentes no banco: " + todosUsuarios.size());
                    for (Usuario u : todosUsuarios) {
                        System.out.println("   - ID: " + u.getId() + ", Email: " + u.getEmail() + ", Nome: " + u.getNome());
                    }
                } catch (Exception e) {
                    System.out.println("❌ [AUTO_LOGIN_DEBUG_ERROR] Erro ao listar usuários: " + e.getMessage());
                    e.printStackTrace();
                }
                
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND"));
            }
            
            Usuario usuario = usuarioOpt.get();
            System.out.println("✅ [AUTO_LOGIN_USER_FOUND] Usuário encontrado:");
            System.out.println("   - ID: " + usuario.getId());
            System.out.println("   - Nome: " + usuario.getNome());
            System.out.println("   - Email: " + usuario.getEmail());
            System.out.println("   - Plano: " + usuario.getPlano());
            
            // Verificar se tem assinatura ativa - com retry logic
            System.out.println("🔍 [AUTO_LOGIN_SUBSCRIPTION] Verificando assinaturas ativas...");
            List<Assinatura> assinaturas = assinaturaService.buscarAssinaturasAtivas(usuario.getId());
            System.out.println("   - Assinaturas encontradas: " + assinaturas.size());
            
            // Se não tem assinatura ativa, aguardar um pouco e tentar novamente
            if (assinaturas.isEmpty()) {
                System.out.println("⚠️ [AUTO_LOGIN_RETRY] Usuário sem assinatura ativa, aguardando processamento do webhook...");
                
                // Aguardar 2 segundos e tentar novamente
                try {
                    Thread.sleep(2000);
                    assinaturas = assinaturaService.buscarAssinaturasAtivas(usuario.getId());
                    System.out.println("   - Assinaturas após retry: " + assinaturas.size());
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    System.out.println("❌ [AUTO_LOGIN_RETRY_ERROR] Thread interrompida durante retry");
                }
                
                // Se ainda não tem assinatura, retornar erro mas permitir login
                if (assinaturas.isEmpty()) {
                    System.out.println("⚠️ [AUTO_LOGIN_WARNING] Usuário ainda sem assinatura ativa após retry");
                    
                    // Mesmo sem assinatura ativa, permitir login se o usuário existe
                    // (o webhook pode estar sendo processado)
                    System.out.println("🔐 [AUTO_LOGIN_TOKEN_GEN] Gerando token JWT...");
                    String token = jwtTokenUtil.generateToken(usuario.getEmail());
                    System.out.println("   - Token gerado: " + token.substring(0, 20) + "...");
                    
                    // 🔥 CORREÇÃO: Registrar token na sessão
                    System.out.println("🔐 [AUTO_LOGIN_SESSION] Registrando token na sessão...");
                    try {
                        sessionControlService.registerActiveToken(usuario.getEmail(), token);
                        System.out.println("   - Token registrado na sessão: SIM");
                    } catch (Exception e) {
                        System.out.println("⚠️ [AUTO_LOGIN_SESSION_WARNING] Erro ao registrar token na sessão: " + e.getMessage());
                        e.printStackTrace();
                    }
                    
                    Map<String, Object> loginResponse = new HashMap<>();
                    loginResponse.put("token", token);
                    loginResponse.put("nome", usuario.getNome());
                    loginResponse.put("email", usuario.getEmail());
                    loginResponse.put("plano", usuario.getPlano());
                    loginResponse.put("id", usuario.getId());
                    loginResponse.put("warning", "Assinatura ainda sendo processada");
                    
                    System.out.println("🔔 [AUTO_LOGIN_SUCCESS_WARNING] Auto-login realizado (com warning) para: " + email);
                    System.out.println("   - Token: " + token.substring(0, 20) + "...");
                    System.out.println("   - Plano: " + usuario.getPlano());
                    System.out.println("   - ID: " + usuario.getId());
                    
                    return ResponseEntity.ok(loginResponse);
                }
            }
            
            // Gerar token JWT
            System.out.println("🔐 [AUTO_LOGIN_TOKEN_GEN] Gerando token JWT para usuário com assinatura...");
            String token = jwtTokenUtil.generateToken(usuario.getEmail());
            System.out.println("   - Token gerado: " + token.substring(0, 20) + "...");
            
            // 🔥 CORREÇÃO: Registrar token na sessão
            System.out.println("🔐 [AUTO_LOGIN_SESSION] Registrando token na sessão...");
            try {
                sessionControlService.registerActiveToken(usuario.getEmail(), token);
                System.out.println("   - Token registrado na sessão: SIM");
            } catch (Exception e) {
                System.out.println("⚠️ [AUTO_LOGIN_SESSION_WARNING] Erro ao registrar token na sessão: " + e.getMessage());
                e.printStackTrace();
            }
            
            // Retornar resposta de login como Map
            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("token", token);
            loginResponse.put("nome", usuario.getNome());
            loginResponse.put("email", usuario.getEmail());
            loginResponse.put("plano", usuario.getPlano());
            loginResponse.put("id", usuario.getId());
            
            System.out.println("🔔 [AUTO_LOGIN_SUCCESS] Auto-login realizado para: " + email);
            System.out.println("   - Token: " + token.substring(0, 20) + "...");
            System.out.println("   - Plano: " + usuario.getPlano());
            System.out.println("   - ID: " + usuario.getId());
            System.out.println("   - LoginResponse ID: " + loginResponse.get("id"));
            
            return ResponseEntity.ok(loginResponse);
            
        } catch (Exception e) {
            System.out.println("❌ [AUTO_LOGIN_ERROR] Erro no auto-login: " + e.getMessage());
            System.out.println("   - Exception type: " + e.getClass().getSimpleName());
            System.out.println("   - Stack trace:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro interno do servidor", "INTERNAL_ERROR"));
        }
    }

    @DeleteMapping("/checkout/debug/cleanup-test-users")
    public Map<String, Object> cleanupTestUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Usuario> usuariosTeste = usuarioRepository.findByEmailContaining("@exemplo.com");
            
            for (Usuario usuario : usuariosTeste) {
                assinaturaService.deletarAssinaturasPorUsuario(usuario.getId());
                codigoLoginRepository.deleteByEmail(usuario.getEmail());
                usuarioRepository.delete(usuario);
            }
            
            response.put("status", "success");
            response.put("message", "Usuários de teste removidos: " + usuariosTeste.size());
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao limpar usuários de teste: " + e.getMessage());
        }
        return response;
    }



    @GetMapping("/checkout/debug/user-status")
    public Map<String, Object> debugUserStatus(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                List<Assinatura> assinaturas = assinaturaService.buscarAssinaturasAtivas(usuario.getId());
                
                response.put("status", "success");
                response.put("usuario", Map.of(
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "email", usuario.getEmail(),
                    "plano", usuario.getPlano()
                ));
                response.put("assinaturasAtivas", assinaturas.size());
                response.put("assinaturas", assinaturas.stream().map(a -> Map.of(
                    "id", a.getId(),
                    "plano", a.getPlano(),
                    "status", a.getStatus(),
                    "dataInicio", a.getDataInicio(),
                    "dataProximaCobranca", a.getDataProximaCobranca()
                )).collect(java.util.stream.Collectors.toList()));
            } else {
                response.put("status", "error");
                response.put("message", "Usuário não encontrado");
            }
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao buscar usuário: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/checkout/debug/process-user")
    public Map<String, Object> debugProcessUser(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String plano = request.get("plano");
            
            if (email == null || email.trim().isEmpty()) {
                response.put("status", "error");
                response.put("message", "Email é obrigatório");
                return response;
            }
            
            if (plano == null || plano.trim().isEmpty()) {
                plano = "PROFISSIONAL_MENSAL";
            }
            
            System.out.println("🔔 Testando processamento de usuário - Email: " + email + ", Plano: " + plano);
            
            // Processar usuário
            processarUsuarioAposPagamento(email, plano);
            
            // Verificar se foi criado
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
            if (usuarioOpt.isPresent()) {
                Usuario usuario = usuarioOpt.get();
                List<Assinatura> assinaturas = assinaturaService.buscarAssinaturasAtivas(usuario.getId());
                
                response.put("status", "success");
                response.put("message", "Usuário processado com sucesso");
                response.put("usuario", Map.of(
                    "id", usuario.getId(),
                    "nome", usuario.getNome(),
                    "email", usuario.getEmail(),
                    "plano", usuario.getPlano()
                ));
                response.put("assinaturasAtivas", assinaturas.size());
            } else {
                response.put("status", "error");
                response.put("message", "Usuário não foi criado");
            }
            
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Erro ao processar usuário: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }

    @GetMapping("/debug/stripe-keys")
    public ResponseEntity<Map<String, String>> debugStripeKeys() {
        Map<String, String> response = new HashMap<>();
        response.put("secret_key_prefix", stripeSecretKey != null ? stripeSecretKey.substring(0, 12) + "..." : "null");
        response.put("publishable_key", publishableKey);
        response.put("keys_match", stripeSecretKey != null && publishableKey != null && 
                    stripeSecretKey.contains("Qglm7G46AbyttUyCQQv5EWBWrqfqS5x") && 
                    publishableKey.contains("Qglm7G46AbyttUyCQQv5EWBWrqfqS5x") ? "true" : "false");
        return ResponseEntity.ok(response);
    }
}
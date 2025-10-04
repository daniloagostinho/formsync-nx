package br.com.backend.configuration;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class StripeConfig {
    
    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;

    @Value("${stripe.publishable.key:}")
    private String stripePublishableKey;
    
    @Value("${stripe.enabled:true}")
    private boolean stripeEnabled;
    
    @PostConstruct
    public void init() {
        log.info("🔐 [STRIPE_CONFIG] Iniciando configuração Stripe...");
        
        // Verificar se Stripe está habilitado
        if (!stripeEnabled) {
            log.info("ℹ️ [STRIPE_CONFIG] Stripe desabilitado via configuração - pulando inicialização");
            Stripe.apiKey = "";
            return;
        }
        
        // Verificar se a chave está configurada e é válida
        if (stripeSecretKey == null || stripeSecretKey.trim().isEmpty() || 
            !stripeSecretKey.startsWith("sk_") || stripeSecretKey.length() < 20) {
            log.warn("⚠️ [STRIPE_CONFIG] Chave Stripe não configurada ou inválida - Stripe será desabilitado");
            log.warn("   - Chave recebida: '{}'", stripeSecretKey);
            // Definir uma chave vazia para evitar NullPointerException
            Stripe.apiKey = "";
            return;
        }
        
        log.info("   - Secret Key (primeiros 10 chars): {}...", stripeSecretKey.substring(0, Math.min(10, stripeSecretKey.length())));
        log.info("   - Secret Key válida: {}", (stripeSecretKey.startsWith("sk_") ? "✅ SIM" : "❌ NÃO"));
        
        // Log da chave pública também
        log.info("   - Publishable Key (primeiros 10 chars): {}...", stripePublishableKey.substring(0, Math.min(10, stripePublishableKey.length())));
        log.info("   - Publishable Key válida: {}", (stripePublishableKey.startsWith("pk_") ? "✅ SIM" : "❌ NÃO"));
        
        Stripe.apiKey = stripeSecretKey;
        
        log.info("✅ [STRIPE_CONFIG] Stripe configurado com sucesso!");
        log.info("   - API Key definida globalmente: {}...", Stripe.apiKey.substring(0, Math.min(10, Stripe.apiKey.length())));
        log.info("   - Tipo da chave global: {}", (Stripe.apiKey.startsWith("sk_") ? "SECRET ✅" : "PUBLIC ❌"));
        log.info("📡 [STRIPE_CONFIG] Configuração concluída!");
    }
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                package br.com.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                // Endpoints públicos da API
                                "/api/v1/login",
                                "/api/v1/registrar",
                                "/api/v1/usuarios",
                                "/api/v1/checkout",
                                "/api/v1/checkout/test",
                                "/api/v1/checkout/debug/**",
                                "/api/v1/checkout/auto-login",
                                "/checkout",
                                "/checkout/**",
                                "/api/v1/stripe/webhook",
                                "/api/v1/public/**",
                                "/api/v1/login/verificar",
                                "/api/v1/docs",
                                "/api/v1/docs/**",
                                
                                // Endpoints de debug (temporários)
                                "/api/v1/debug/**",
                                
                                // Kafka minimal
                                "/api/v1/kafka/**",
                                
                                // Endpoints de autenticação (protegidos mas acessíveis para logout)
                                "/api/v1/auth/check-session-status",
                                "/api/v1/auth/session-status",
                                "/api/v1/auth/logout",
                                "/api/v1/auth/force-logout-current",
                                "/api/v1/auth/debug/**",
                                
                                // Sites especializados
                                "/api/v1/sites-especializados/area/**",
                                // Extensão Chrome - endpoint público consolidado
                                "/api/v1/public/health",
                                // Endpoints de segurança de arquivos (públicos para validação)
                                "/api/v1/security/files/validate",
                                "/api/v1/security/files/status",

                                // ✅ UPGRADE/DOWNGRADE - Endpoints liberados para funcionalidade completa
                                "/api/v1/assinaturas",
                                "/api/v1/assinaturas/**",
                                // Endpoints de Privacidade LGPD (protegidos por autenticação)
                                "/api/v1/privacy/**",
                                
                                // Actuator (health check)
                                "/actuator/**",
                                "/api/v1/actuator/**",
                                // Health checks
                                "/api/v1/health/**",
                                // Swagger/OpenAPI Documentation
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                // Debug endpoints (temporário)
                                "/api/v1/usuarios/debug-table",
                                "/api/v1/usuarios/recreate-user",
                                
                                // Recursos estáticos
                                "/",
                                "/error",
                                "/*.html",
                                "/*.js",
                                "/*.css",
                                "/*.ico"
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.addAllowedOriginPattern("*");
        configuration.addAllowedMethod("*");
        configuration.addAllowedHeader("*");
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
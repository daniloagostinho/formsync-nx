package br.com.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import br.com.backend.service.SessionControlService;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final SessionControlService sessionControlService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwtToken = null;

        log.debug("🔍 Processando requisição para: {} - Authorization header: {}", 
                 request.getRequestURI(), authHeader != null ? "presente" : "ausente");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
            try {
                email = jwtTokenUtil.extractEmail(jwtToken);
                log.info("🔐 [DEBUG_JWT] JWT Token extraído para usuário: {} - URI: {}", email, request.getRequestURI());
                log.info("🔐 [DEBUG_JWT] Token completo (primeiros 50 chars): {}", jwtToken.substring(0, Math.min(50, jwtToken.length())));
            } catch (ExpiredJwtException e) {
                log.warn("⚠️ JWT Token expirado");
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            } catch (Exception e) {
                log.error("❌ Erro ao obter email do token: {}", e.getMessage());
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }
        } else {
            log.debug("🚫 Authorization header ausente ou inválido para: {}", request.getRequestURI());
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.info("🔐 [DEBUG_JWT] Processando autenticação para usuário: {} - URI: {}", email, request.getRequestURI());
            
            // Verificar se o token JWT é válido (sem validação circular)
            try {
                // Verificar se o token não expirou
                if (jwtTokenUtil.isTokenExpired(jwtToken)) {
                    log.warn("🚫 JWT Token expirado para usuário: {}", email);
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }
                
                log.debug("✅ Token JWT válido para usuário: {}", email);
            } catch (Exception e) {
                log.error("❌ Erro ao validar token JWT para usuário: {} - {}", email, e.getMessage());
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
            }
            
            // VERIFICAÇÃO CRÍTICA: Se o token está ativo na sessão
            // ⚠️ TEMPORARIAMENTE DESABILITADO PARA DEBUG
            /*
            boolean isSessionActive = sessionControlService.isTokenActive(jwtToken);
            if (!isSessionActive) {
                log.warn("🚫 Token não está ativo na sessão para usuário: {} - Sessão foi revogada", email);
                
                // Token revogado - limpar contexto e informar frontend
                SecurityContextHolder.clearContext();
                response.setHeader("X-Session-Revoked", "true");
                response.setHeader("X-Session-Revoked-Reason", "Nova sessão criada em outro dispositivo");
                
                filterChain.doFilter(request, response);
                return;
            }
            */
            
            log.info("✅ [DEBUG_JWT] Token válido para usuário: {} (verificação de sessão temporariamente desabilitada) - URI: {}", email, request.getRequestURI());
            
            UserDetails userDetails = User.withUsername(email)
                                          .password("")
                                          .authorities("USER")
                                          .build();

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            log.info("🔐 [DEBUG_JWT] Usuário autenticado com sucesso: {} - Contexto: {} - URI: {}", 
                     email, SecurityContextHolder.getContext().getAuthentication() != null ? "definido" : "não definido", request.getRequestURI());
        } else {
            if (email == null) {
                log.debug("🚫 Email não extraído do token para: {}", request.getRequestURI());
            } else {
                log.debug("🚫 Usuário já autenticado para: {} - Email: {}", request.getRequestURI(), email);
            }
        }

        // Log do contexto de segurança antes de continuar
        log.debug("🔍 Contexto de segurança antes de continuar: {} - URI: {}", 
                 SecurityContextHolder.getContext().getAuthentication() != null ? "autenticado" : "não autenticado", 
                 request.getRequestURI());

        filterChain.doFilter(request, response);
    }
}

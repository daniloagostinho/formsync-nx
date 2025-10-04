package br.com.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    // Chave secreta segura (gerada aleatoriamente)
    private final Key SECRET_KEY = Keys.hmacShaKeyFor("1A79cF82fC26cE0a8478EAA18d56B22F9Ee9F25bE36D40f2F8A50a7fEe90208B".getBytes());

    private final long EXPIRATION_TIME = 1000 * 60 * 60 * 10; // 10 horas

    /**
     * Gera token JWT com informações de segurança adicionais
     */
    public String generateToken(String email, String userAgent, String ipAddress) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userAgent", userAgent != null ? userAgent.hashCode() : 0);
        claims.put("ipAddress", ipAddress != null ? ipAddress.hashCode() : 0);
        claims.put("issuedAt", System.currentTimeMillis());
        claims.put("deviceFingerprint", generateDeviceFingerprint(userAgent, ipAddress));
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Gera token JWT básico (mantém compatibilidade)
     */
    public String generateToken(String email) {
        return generateToken(email, null, null);
    }

    /**
     * Gera fingerprint único do dispositivo
     */
    private String generateDeviceFingerprint(String userAgent, String ipAddress) {
        String fingerprint = (userAgent != null ? userAgent : "") + "|" + (ipAddress != null ? ipAddress : "");
        return String.valueOf(fingerprint.hashCode());
    }

    /**
     * Extrai email do token
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrai data de expiração do token
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrai claims específicos do token
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extrai todos os claims do token
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Verifica se o token é válido
     */
    public boolean isTokenValid(String token, String userEmail) {
        final String email = extractEmail(token);
        return email.equals(userEmail) && !isTokenExpired(token);
    }

    /**
     * Verifica se o token é válido com validação de dispositivo
     */
    public boolean isTokenValidWithDevice(String token, String userEmail, String userAgent, String ipAddress) {
        if (!isTokenValid(token, userEmail)) {
            return false;
        }
        
        try {
            Claims claims = extractAllClaims(token);
            String storedFingerprint = claims.get("deviceFingerprint", String.class);
            String currentFingerprint = generateDeviceFingerprint(userAgent, ipAddress);
            
            return storedFingerprint != null && storedFingerprint.equals(currentFingerprint);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Verifica se o token expirou
     */
    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Obtém username/email do token
     */
    public String getUsernameFromToken(String token) {
        return extractEmail(token);
    }

    /**
     * Obtém informações do dispositivo do token
     */
    public Map<String, Object> getDeviceInfo(String token) {
        try {
            Claims claims = extractAllClaims(token);
            Map<String, Object> deviceInfo = new HashMap<>();
            deviceInfo.put("userAgent", claims.get("userAgent"));
            deviceInfo.put("ipAddress", claims.get("ipAddress"));
            deviceInfo.put("issuedAt", claims.get("issuedAt"));
            deviceInfo.put("deviceFingerprint", claims.get("deviceFingerprint"));
            return deviceInfo;
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
}
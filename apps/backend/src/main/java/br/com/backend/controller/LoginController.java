package br.com.backend.controller;

import br.com.backend.service.EmailService;
import br.com.backend.service.LogService;
import br.com.backend.service.SessionControlService;
import br.com.backend.dto.*;
import br.com.backend.entity.CodigoLogin;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.CodigoLoginRepository;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.security.JwtTokenUtil;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDateTime;
import java.util.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/login")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
public class LoginController {

    private static final Logger log = LoggerFactory.getLogger(LoginController.class);

    private final UsuarioRepository usuarioRepository;
    private final CodigoLoginRepository codigoLoginRepo;
    private final EmailService emailService;
    private final JwtTokenUtil jwtTokenUtil;
    private final LogService logService;
    private final SessionControlService sessionControlService;

    public LoginController(UsuarioRepository usuarioRepository,
                           CodigoLoginRepository codigoLoginRepo,
                           EmailService emailService,
                           JwtTokenUtil jwtTokenUtil,
                           LogService logService,
                           SessionControlService sessionControlService
                           ) {
        this.usuarioRepository = usuarioRepository;
        this.codigoLoginRepo = codigoLoginRepo;
        this.emailService = emailService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.logService = logService;
        this.sessionControlService = sessionControlService;
    }
    
    @PostMapping
    @Transactional
    public ResponseEntity<MensagemResponseDTO> enviarCodigo(@Valid @RequestBody LoginDTO login) {
        String codigo = null;
        try {
            log.info("🔐 [LOGIN_CONTROLLER] === INÍCIO DO PROCESSO DE LOGIN ===");
            log.info("🔐 [LOGIN_CONTROLLER] Email recebido: {}", login.getEmail());
            log.info("🔐 [LOGIN_CONTROLLER] Tentativa de login para email: {}", login.getEmail());
            
            // Log 1: Verificar se o usuário existe
            log.info("🔐 [LOGIN_CONTROLLER] Buscando usuário no banco...");
            Optional<Usuario> usuario = usuarioRepository.findByEmail(login.getEmail());
            if (usuario.isEmpty()) {
                log.warn("⚠️ [LOGIN_CONTROLLER] Usuário não encontrado para email: {}", login.getEmail());
                logService.logLoginAttempt(login.getEmail(), false, "Usuário não encontrado");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MensagemResponseDTO("Usuário não encontrado"));
            }
            log.info("✅ [LOGIN_CONTROLLER] Usuário encontrado: ID={}, Nome={}", usuario.get().getId(), usuario.get().getNome());

            // Log 2: Gerar código
            log.info("🔐 [LOGIN_CONTROLLER] Gerando código de verificação...");
            codigo = String.format("%06d", new Random().nextInt(1000000));
            LocalDateTime expiracao = LocalDateTime.now().plusMinutes(5);
            log.info("✅ [LOGIN_CONTROLLER] Código gerado: {} - Expira em: {}", codigo, expiracao);

            // Log 3: Limpar código anterior
            log.info("🔐 [LOGIN_CONTROLLER] Limpando código anterior...");
            try {
                // Buscar códigos existentes primeiro
                List<CodigoLogin> codigosExistentes = codigoLoginRepo.findAllByEmail(login.getEmail());
                if (!codigosExistentes.isEmpty()) {
                    log.info("🔐 [LOGIN_CONTROLLER] Encontrados {} códigos anteriores para {}", codigosExistentes.size(), login.getEmail());
                    codigoLoginRepo.deleteByEmail(login.getEmail());
                    log.info("✅ [LOGIN_CONTROLLER] Código anterior removido para: {}", login.getEmail());
                } else {
                    log.info("🔐 [LOGIN_CONTROLLER] Nenhum código anterior encontrado para: {}", login.getEmail());
                }
            } catch (Exception deleteError) {
                log.warn("⚠️ [LOGIN_CONTROLLER] Erro ao remover código anterior para {}: {}", login.getEmail(), deleteError.getMessage());
                log.warn("⚠️ [LOGIN_CONTROLLER] Stack trace do erro de remoção:", deleteError);
                // Continua mesmo se falhar ao remover código anterior
            }
            
            // Log 4: Salvar novo código
            log.info("🔐 [LOGIN_CONTROLLER] Salvando novo código no banco...");
            try {
                CodigoLogin codigoLogin = new CodigoLogin(null, login.getEmail(), codigo, false, expiracao, LocalDateTime.now());
                
                codigoLoginRepo.save(codigoLogin);
                log.info("✅ [LOGIN_CONTROLLER] Código salvo no banco para: {} - Código: {}", login.getEmail(), codigo);
            } catch (Exception saveError) {
                log.error("❌ [LOGIN_CONTROLLER] Erro ao salvar código no banco para {}: {}", login.getEmail(), saveError.getMessage());
                log.error("❌ [LOGIN_CONTROLLER] Stack trace completo do erro de salvamento:", saveError);
                throw new RuntimeException("Falha ao salvar código de verificação", saveError);
            }
            
        } catch (Exception e) {
            log.error("❌ [LOGIN_CONTROLLER] === ERRO CRÍTICO NO PROCESSO DE LOGIN ===");
            log.error("❌ [LOGIN_CONTROLLER] Email: {}", login.getEmail());
            log.error("❌ [LOGIN_CONTROLLER] Tipo do erro: {}", e.getClass().getSimpleName());
            log.error("❌ [LOGIN_CONTROLLER] Mensagem do erro: {}", e.getMessage());
            log.error("❌ [LOGIN_CONTROLLER] Stack trace completo:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MensagemResponseDTO("Erro interno do servidor. Tente novamente."));
        }
        
        // Log 5: Enviar email
        log.info("🔐 [LOGIN_CONTROLLER] Enviando código por email...");
        try {
            log.info("🔐 [LOGIN_CONTROLLER] Chamando emailService.enviarCodigo...");
            emailService.enviarCodigo(login.getEmail(), codigo);
            log.info("✅ [LOGIN_CONTROLLER] Email enviado com sucesso!");
            
            log.info("🔐 [LOGIN_CONTROLLER] Chamando logService.logCodeSent...");
            logService.logCodeSent(login.getEmail(), codigo);
            log.info("✅ [LOGIN_CONTROLLER] Log de código enviado registrado!");
            
            log.info("🔐 [LOGIN_CONTROLLER] Chamando logService.logLoginAttempt...");
            logService.logLoginAttempt(login.getEmail(), true, null);
            log.info("✅ [LOGIN_CONTROLLER] Log de tentativa de login registrado!");
            
            log.info("✅ [LOGIN_CONTROLLER] === PROCESSO DE LOGIN CONCLUÍDO COM SUCESSO ===");
            log.info("✅ [LOGIN_CONTROLLER] Código enviado com sucesso para: {}", login.getEmail());
            return ResponseEntity.ok(new MensagemResponseDTO("Código enviado para o e-mail."));
            
        } catch (Exception emailError) {
            log.error("❌ [LOGIN_CONTROLLER] === ERRO AO ENVIAR EMAIL ===");
            log.error("❌ [LOGIN_CONTROLLER] Email: {}", login.getEmail());
            log.error("❌ [LOGIN_CONTROLLER] Tipo do erro: {}", emailError.getClass().getSimpleName());
            log.error("❌ [LOGIN_CONTROLLER] Mensagem do erro: {}", emailError.getMessage());
            log.error("❌ [LOGIN_CONTROLLER] Stack trace completo do erro de email:", emailError);
            
            // Tenta remover o código salvo se o email falhou (em uma nova transação)
            log.info("🔐 [LOGIN_CONTROLLER] Tentando limpar código após falha no email...");
            try {
                limparCodigoFalha(login.getEmail());
                log.info("✅ [LOGIN_CONTROLLER] Código limpo com sucesso após falha no email");
            } catch (Exception cleanupError) {
                log.error("❌ [LOGIN_CONTROLLER] Erro ao limpar código após falha no email para {}: {}", login.getEmail(), cleanupError.getMessage());
                log.error("❌ [LOGIN_CONTROLLER] Stack trace do erro de limpeza:", cleanupError);
                // Não falha a operação se não conseguir limpar
            }
            
            // Retorna erro específico para problemas de email
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MensagemResponseDTO("Erro ao enviar código por email. Tente novamente ou entre em contato com o suporte."));
        }
    }

    /**
     * Remove código de login em uma transação separada
     * Usado para limpeza após falhas no envio de email
     */
    @Transactional
    public void limparCodigoFalha(String email) {
        try {
            log.info("🔐 [LOGIN_CONTROLLER] === INICIANDO LIMPEZA DE CÓDIGO ===");
            log.info("🔐 [LOGIN_CONTROLLER] Email: {}", email);
            log.info("🔐 [LOGIN_CONTROLLER] Chamando codigoLoginRepo.deleteByEmail...");
            
            codigoLoginRepo.deleteByEmail(email);
            log.info("✅ [LOGIN_CONTROLLER] Código removido do banco para: {}", email);
            log.info("✅ [LOGIN_CONTROLLER] === LIMPEZA DE CÓDIGO CONCLUÍDA COM SUCESSO ===");
        } catch (Exception e) {
            log.error("❌ [LOGIN_CONTROLLER] === ERRO NA LIMPEZA DE CÓDIGO ===");
            log.error("❌ [LOGIN_CONTROLLER] Email: {}", email);
            log.error("❌ [LOGIN_CONTROLLER] Tipo do erro: {}", e.getClass().getSimpleName());
            log.error("❌ [LOGIN_CONTROLLER] Mensagem do erro: {}", e.getMessage());
            log.error("❌ [LOGIN_CONTROLLER] Stack trace completo do erro de limpeza:", e);
            // Re-throw para que a transação seja revertida
            throw e;
        }
    }
    
    @Transactional
    @PostMapping("/verificar")
    public ResponseEntity<?> verificarCodigo(@Valid @RequestBody CodigoDTO dto, 
                                           HttpServletRequest request) {
        logService.logCodeVerified(dto.getEmail(), false, "Iniciando verificação do código: " + dto.getCodigo());
        
        // 🚀 FEATURE FLAG: Verificar se é código de bypass para pular verificação de email
        if ("123456".equals(dto.getCodigo())) {
            log.info("🚀 [FEATURE_FLAG] Código de bypass detectado - pulando verificação de email para: {}", dto.getEmail());
            logService.logCodeVerified(dto.getEmail(), false, "Código de bypass usado - pulando verificação de email");
            
            // Busca o usuário no banco de dados
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(dto.getEmail());
            if (usuarioOpt.isEmpty()) {
                logService.logCodeVerified(dto.getEmail(), false, "Usuário não encontrado (bypass)");
                ErrorResponseDTO errorResponse = new ErrorResponseDTO("Usuário não encontrado.", "USER_NOT_FOUND");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            Usuario usuario = usuarioOpt.get();

            // Capturar informações de segurança do dispositivo
            String userAgent = request.getHeader("User-Agent");
            String ipAddress = getClientIpAddress(request);
            
            log.info("🔐 [FEATURE_FLAG] Login direto realizado para usuário: {} - IP: {} - User-Agent: {}", 
                    dto.getEmail(), ipAddress, userAgent != null ? userAgent.substring(0, Math.min(50, userAgent.length())) + "..." : "N/A");

            // Gera o token JWT com informações de dispositivo
            String token = jwtTokenUtil.generateToken(dto.getEmail(), userAgent, ipAddress);

            // Registra o novo token e revoga tokens anteriores (sessão única)
            sessionControlService.registerActiveToken(dto.getEmail(), token);
            
            log.info("✅ [FEATURE_FLAG] Login direto realizado para usuário: {} - Sessão anterior revogada", dto.getEmail());

            // Retorna token + informações do usuário
            LoginResponseDTO resposta = new LoginResponseDTO(token, usuario.getNome(), usuario.getEmail(), usuario.getPlano());

            logService.logCodeVerified(dto.getEmail(), true, "Login direto via feature flag");
            logService.logLoginAttempt(dto.getEmail(), true, "Login direto via feature flag");

            return ResponseEntity.ok(resposta);
        }
        
        // Fluxo normal de verificação de código
        // Buscar apenas o código mais recente e válido
        List<CodigoLogin> codigos = codigoLoginRepo.findAllValidCodesByEmail(dto.getEmail(), LocalDateTime.now());
        if (codigos.isEmpty()) {
            logService.logCodeVerified(dto.getEmail(), false, "Código não encontrado ou expirado");
            ErrorResponseDTO errorResponse = new ErrorResponseDTO("Código inválido ou expirado.", "INVALID_CODE");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        // Pegar o código mais recente (primeiro da lista ordenada)
        CodigoLogin registro = codigos.get(0);
        logService.logCodeVerified(dto.getEmail(), false, "Código válido encontrado - ID: " + registro.getId() + ", Expiração: " + registro.getExpiracao());

        if (registro.getExpiracao().isBefore(LocalDateTime.now())) {
            logService.logCodeVerified(dto.getEmail(), false, "Código expirado");
            ErrorResponseDTO errorResponse = new ErrorResponseDTO("Código expirado.", "CODE_EXPIRED");
            return ResponseEntity.status(HttpStatus.GONE).body(errorResponse);
        }

        if (!registro.getCodigo().equals(dto.getCodigo())) {
            logService.logCodeVerified(dto.getEmail(), false, "Código incorreto");
            ErrorResponseDTO errorResponse = new ErrorResponseDTO("Código incorreto.", "INCORRECT_CODE");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }

        // Busca o usuário no banco de dados
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(dto.getEmail());
        if (usuarioOpt.isEmpty()) {
            logService.logCodeVerified(dto.getEmail(), false, "Usuário não encontrado");
            ErrorResponseDTO errorResponse = new ErrorResponseDTO("Usuário não encontrado.", "USER_NOT_FOUND");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
        Usuario usuario = usuarioOpt.get();

        // Capturar informações de segurança do dispositivo
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = getClientIpAddress(request);
        
        log.info("🔐 Login realizado para usuário: {} - IP: {} - User-Agent: {}", 
                dto.getEmail(), ipAddress, userAgent != null ? userAgent.substring(0, Math.min(50, userAgent.length())) + "..." : "N/A");

        // Gera o token JWT com informações de dispositivo
        String token = jwtTokenUtil.generateToken(dto.getEmail(), userAgent, ipAddress);

        // Registra o novo token e revoga tokens anteriores (sessão única)
        sessionControlService.registerActiveToken(dto.getEmail(), token);
        
        log.info("✅ Login realizado para usuário: {} - Sessão anterior revogada", dto.getEmail());

        // Marca o código como expirado em vez de deletar (mais seguro)
        try {
            logService.logCodeVerified(dto.getEmail(), false, "Marcando código como expirado após verificação bem-sucedida");
            registro.setExpiracao(LocalDateTime.now().minusMinutes(1)); // Marca como expirado
            codigoLoginRepo.save(registro);
            logService.logCodeVerified(dto.getEmail(), false, "Código marcado como expirado com sucesso");
        } catch (Exception e) {
            logService.logCodeVerified(dto.getEmail(), false, "Erro ao marcar código como expirado: " + e.getMessage());
            // Não falha a operação se não conseguir marcar o código
        }

        // Retorna token + informações do usuário
        LoginResponseDTO resposta = new LoginResponseDTO(token, usuario.getNome(), usuario.getEmail(), usuario.getPlano());

        logService.logCodeVerified(dto.getEmail(), true, null);
        logService.logLoginAttempt(dto.getEmail(), true, null);

        return ResponseEntity.ok(resposta);
    }
    
    /**
     * Obtém o IP real do cliente (considerando proxies)
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}

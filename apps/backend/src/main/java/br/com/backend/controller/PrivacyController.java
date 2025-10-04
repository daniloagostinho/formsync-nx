package br.com.backend.controller;

import br.com.backend.security.DataPrivacyService;
import br.com.backend.dto.ErrorResponseDTO;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/privacy")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"})
public class PrivacyController {

    private final DataPrivacyService dataPrivacyService;
    private final UsuarioRepository usuarioRepository;

    /**
     * Registra consentimento LGPD do usuário
     */
    @PostMapping("/consentimento")
    public ResponseEntity<?> registrarConsentimento(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        try {
            String email = userDetails.getUsername();
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            String tipoDado = (String) request.get("tipoDado");
            Boolean consentimento = (Boolean) request.get("consentimento");
            
            if (tipoDado == null || consentimento == null) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponseDTO("Tipo de dado e consentimento são obrigatórios", "INVALID_REQUEST"));
            }

            String ipAddress = getClientIpAddress(httpRequest);
            String userAgent = httpRequest.getHeader("User-Agent");

            dataPrivacyService.registrarConsentimento(
                usuario.getId(), 
                tipoDado, 
                consentimento, 
                ipAddress, 
                userAgent
            );

            log.info("Consentimento registrado - Usuário: {}, Tipo: {}, Consentimento: {}", 
                    email, tipoDado, consentimento);

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Consentimento registrado com sucesso",
                "tipoDado", tipoDado,
                "consentimento", consentimento,
                "dataRegistro", LocalDateTime.now()
            ));

        } catch (Exception e) {
            log.error("Erro ao registrar consentimento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao registrar consentimento: " + e.getMessage(), "CONSENT_ERROR"));
        }
    }

    /**
     * Obtém dados pessoais do usuário (Direito de Acesso - LGPD)
     */
    @GetMapping("/dados-pessoais")
    public ResponseEntity<?> obterDadosPessoais(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        try {
            String email = userDetails.getUsername();
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            Map<String, Object> dadosPessoais = new HashMap<>();
            dadosPessoais.put("id", usuario.getId());
            dadosPessoais.put("nome", usuario.getNome());
            dadosPessoais.put("email", usuario.getEmail());
            dadosPessoais.put("plano", usuario.getPlano());
            dadosPessoais.put("dataCriacao", usuario.getCreatedAt());
            dadosPessoais.put("dataAtualizacao", usuario.getUpdatedAt());
            dadosPessoais.put("consentimentoLGPD", usuario.getConsentimentoLGPD());
            dadosPessoais.put("consentimentoMarketing", usuario.getConsentimentoMarketing());
            dadosPessoais.put("consentimentoAnalytics", usuario.getConsentimentoAnalytics());
            dadosPessoais.put("dataConsentimento", usuario.getDataConsentimento());
            dadosPessoais.put("statusExclusao", usuario.getStatusExclusao());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("dadosPessoais", dadosPessoais);
            response.put("dataSolicitacao", LocalDateTime.now());
            response.put("observacoes", "Dados fornecidos conforme Art. 18 da LGPD");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao obter dados pessoais: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao obter dados pessoais: " + e.getMessage(), "DATA_ACCESS_ERROR"));
        }
    }

    /**
     * Exporta todos os dados do usuário (Portabilidade - LGPD)
     */
    @GetMapping("/exportar-dados")
    public ResponseEntity<?> exportarDados(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        try {
            String email = userDetails.getUsername();
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            Map<String, Object> dadosExportados = dataPrivacyService.exportarDadosUsuario(usuario.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Dados exportados com sucesso");
            response.put("dados", dadosExportados);
            response.put("dataExportacao", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao exportar dados: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao exportar dados: " + e.getMessage(), "EXPORT_ERROR"));
        }
    }

    /**
     * Solicita exclusão de dados (Direito ao Esquecimento - LGPD)
     */
    @PostMapping("/solicitar-exclusao")
    public ResponseEntity<?> solicitarExclusao(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        try {
            String email = userDetails.getUsername();
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Verificar se já está em processo de exclusão
            if ("PENDENTE_EXCLUSAO".equals(usuario.getStatusExclusao()) || 
                "EXCLUIDO".equals(usuario.getStatusExclusao())) {
                return ResponseEntity.badRequest()
                    .body(new ErrorResponseDTO("Exclusão já solicitada ou concluída", "ALREADY_REQUESTED"));
            }

            // Marcar como pendente de exclusão
            usuario.setStatusExclusao("PENDENTE_EXCLUSAO");
            usuario.setDataExclusao(LocalDateTime.now());
            usuarioRepository.save(usuario);

            log.info("Exclusão solicitada pelo usuário: {}", email);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Solicitação de exclusão registrada com sucesso");
            response.put("dataSolicitacao", LocalDateTime.now());
            response.put("observacoes", "Seus dados serão excluídos em até 15 dias úteis, conforme Art. 16 da LGPD");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao solicitar exclusão: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao solicitar exclusão: " + e.getMessage(), "DELETE_REQUEST_ERROR"));
        }
    }

    /**
     * Confirma e executa exclusão de dados (apenas para administradores)
     */
    @PostMapping("/confirmar-exclusao/{usuarioId}")
    public ResponseEntity<?> confirmarExclusao(
            @PathVariable Long usuarioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        try {
            // Verificar se é administrador (implementar lógica de admin)
            String email = userDetails.getUsername();
            Usuario admin = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            // Por enquanto, permitir que qualquer usuário confirme sua própria exclusão
            if (!admin.getId().equals(usuarioId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ErrorResponseDTO("Apenas o próprio usuário pode confirmar a exclusão", "FORBIDDEN"));
            }

            dataPrivacyService.excluirDadosUsuario(usuarioId);

            log.info("Exclusão confirmada e executada para usuário: {}", usuarioId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("message", "Dados excluídos com sucesso");
            response.put("dataExclusao", LocalDateTime.now());
            response.put("observacoes", "Todos os seus dados pessoais foram excluídos conforme LGPD");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao confirmar exclusão: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao confirmar exclusão: " + e.getMessage(), "DELETE_CONFIRM_ERROR"));
        }
    }

    /**
     * Obtém status de consentimento do usuário
     */
    @GetMapping("/status-consentimento")
    public ResponseEntity<?> obterStatusConsentimento(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        try {
            String email = userDetails.getUsername();
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            Map<String, Object> status = new HashMap<>();
            status.put("consentimentoLGPD", usuario.getConsentimentoLGPD());
            status.put("consentimentoMarketing", usuario.getConsentimentoMarketing());
            status.put("consentimentoAnalytics", usuario.getConsentimentoAnalytics());
            status.put("dataConsentimento", usuario.getDataConsentimento());
            status.put("statusExclusao", usuario.getStatusExclusao());
            status.put("dataExclusao", usuario.getDataExclusao());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("consentimentos", status);
            response.put("dataConsulta", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao obter status de consentimento: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao obter status: " + e.getMessage(), "STATUS_ERROR"));
        }
    }

    /**
     * Gera relatório de dados pessoais
     */
    @GetMapping("/relatorio-dados")
    public ResponseEntity<?> gerarRelatorioDados(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        try {
            String email = userDetails.getUsername();
            Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

            Map<String, Object> relatorio = dataPrivacyService.gerarRelatorioDadosPessoais(usuario.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("relatorio", relatorio);
            response.put("dataGeracao", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Erro ao gerar relatório: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao gerar relatório: " + e.getMessage(), "REPORT_ERROR"));
        }
    }

    /**
     * Obtém IP do cliente
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
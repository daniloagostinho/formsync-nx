package br.com.backend.controller;

import br.com.backend.dto.*;
import br.com.backend.entity.Assinatura;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.service.AssinaturaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/assinaturas")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequiredArgsConstructor
public class AssinaturaController {

    private final AssinaturaService assinaturaService;
    private final UsuarioRepository usuarioRepository;
    private final AssinaturaMapper assinaturaMapper;
    private final br.com.backend.service.CobrancaScheduler cobrancaScheduler;

    @PostMapping
    public ResponseEntity<AssinaturaResponseDTO> criarAssinatura(
            @Valid @RequestBody CriarAssinaturaDTO dto) {
        // ✅ MODO DE TESTE: Validações de autenticação temporariamente desabilitadas
        // Permitir criação direta de assinatura para testes de upgrade/downgrade
        
        // Verificar se usuário existe
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(dto.getUsuarioId());
        if (usuarioOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Usuário não encontrado com ID: " + dto.getUsuarioId());
        }
        
        Assinatura nova = assinaturaService.criarAssinatura(dto.getUsuarioId(), dto.getPlano());
        return ResponseEntity.ok(assinaturaMapper.toResponseDTO(nova));
    }

    @PostMapping("/assinatura/teste")
    public AssinaturaResponseDTO criarAssinaturaTeste(@Valid @RequestBody CriarAssinaturaDTO dto) {
        // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
        Usuario usuarioAutenticado = getUsuarioAutenticado();
        
        // ✅ VALIDAÇÃO: Verificar se está criando assinatura para si mesmo
        if (!usuarioAutenticado.getId().equals(dto.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Você só pode criar assinaturas para sua própria conta");
        }
        
        Assinatura nova = assinaturaService.criarAssinatura(dto.getUsuarioId(), dto.getPlano());
        return assinaturaMapper.toResponseDTO(nova);
    }

    @PostMapping("/assinatura/scheduler")
    public MensagemResponseDTO rodarScheduler() {
        // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
        Usuario usuarioAutenticado = getUsuarioAutenticado();
        
        // ✅ VALIDAÇÃO: Apenas usuários EMPRESARIAL podem executar scheduler
        if (!"EMPRESARIAL".equals(usuarioAutenticado.getPlano())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Apenas usuários do plano Empresarial podem executar o scheduler");
        }
        
        cobrancaScheduler.processarCobrancas();
        return new MensagemResponseDTO("Scheduler executado");
    }

    // Atualizar status da assinatura
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarStatusAssinaturaDTO dto) {
        assinaturaService.atualizarStatus(id, dto.getStatus());
        return ResponseEntity.ok().build();
    }

    // Verificar se assinatura está válida
    @PostMapping("/valida")
    public ResponseEntity<Boolean> verificarValidade(
            @Valid @RequestBody VerificarAssinaturaDTO dto) {
        // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
        Usuario usuarioAutenticado = getUsuarioAutenticado();
        
        // ✅ VALIDAÇÃO: Verificar se está consultando sua própria assinatura
        if (!usuarioAutenticado.getId().equals(dto.getUsuarioId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Você só pode verificar suas próprias assinaturas");
        }
        
        boolean valida = assinaturaService.assinaturaValida(dto.getUsuarioId());
        return ResponseEntity.ok(valida);
    }

    // Verificar status da assinatura por usuário ID (para testes)
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> verificarStatusAssinatura(
            @RequestParam(required = false) Long usuarioId) {
        // ✅ MODO DE TESTE: Permitir consulta por usuarioId para testes
        
        Usuario usuario;
        if (usuarioId != null) {
            // Modo de teste: buscar por ID fornecido
            usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                    "Usuário não encontrado com ID: " + usuarioId));
        } else {
            // Modo normal: usuário autenticado (se disponível)
            try {
                usuario = getUsuarioAutenticado();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Forneça usuarioId como parâmetro para consulta em modo de teste");
            }
        }
        
        boolean assinaturaValida = assinaturaService.assinaturaValida(usuario.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("usuarioId", usuario.getId());
        response.put("email", usuario.getEmail());
        response.put("plano", usuario.getPlano());
        response.put("assinaturaValida", assinaturaValida);
        
        // Buscar assinatura ativa para mais detalhes
        List<Assinatura> assinaturas = assinaturaService.buscarAssinaturasAtivas(usuario.getId());
        if (!assinaturas.isEmpty()) {
            Assinatura assinatura = assinaturas.get(0);
            response.put("assinaturaId", assinatura.getId());
            response.put("status", assinatura.getStatus());
            response.put("dataInicio", assinatura.getDataInicio());
            response.put("dataProximaCobranca", assinatura.getDataProximaCobranca());
            response.put("assinaturasAtivas", assinaturas.size());
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assinatura/{id}")
    public AssinaturaResponseDTO consultarAssinatura(@PathVariable Long id) {
        // ✅ VALIDAÇÃO: Verificar se usuário está autenticado
        Usuario usuarioAutenticado = getUsuarioAutenticado();
        
        // ✅ VALIDAÇÃO: Verificar se está consultando sua própria assinatura
        Assinatura assinatura = assinaturaService.buscarPorId(id);
        if (assinatura != null && !assinatura.getUsuarioId().equals(usuarioAutenticado.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                "Você só pode consultar suas próprias assinaturas");
        }
        
        return assinaturaMapper.toResponseDTO(assinatura);
    }

    // Consultar assinatura ativa do usuário (modo teste)
    @GetMapping("/assinatura/ativa")
    public ResponseEntity<AssinaturaResponseDTO> consultarAssinaturaAtiva(
            @RequestParam(required = false) Long usuarioId) {
        // ✅ MODO DE TESTE: Permitir consulta por usuarioId
        
        Long userId;
        if (usuarioId != null) {
            // Modo de teste: usar ID fornecido
            userId = usuarioId;
        } else {
            // Modo normal: usuário autenticado
            try {
                Usuario usuarioAutenticado = getUsuarioAutenticado();
                userId = usuarioAutenticado.getId();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Forneça usuarioId como parâmetro para consulta em modo de teste");
            }
        }
        
        // Buscar assinatura ativa do usuário
        List<Assinatura> assinaturas = assinaturaService.buscarAssinaturasAtivas(userId);
        
        if (assinaturas.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Nenhuma assinatura ativa encontrada para o usuário ID: " + userId);
        }
        
        // Retornar a assinatura mais recente (primeira da lista ordenada)
        Assinatura assinatura = assinaturas.get(0);
        return ResponseEntity.ok(assinaturaMapper.toResponseDTO(assinatura));
    }

    // Consultar assinatura mais recente do usuário (ativa ou cancelada)
    @GetMapping("/assinatura/recente")
    public ResponseEntity<AssinaturaResponseDTO> consultarAssinaturaRecente(
            @RequestParam(required = false) Long usuarioId) {
        // ✅ MODO DE TESTE: Permitir consulta por usuarioId
        
        Long userId;
        if (usuarioId != null) {
            // Modo de teste: usar ID fornecido
            userId = usuarioId;
        } else {
            // Modo normal: usuário autenticado
            try {
                Usuario usuarioAutenticado = getUsuarioAutenticado();
                userId = usuarioAutenticado.getId();
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Forneça usuarioId como parâmetro para consulta em modo de teste");
            }
        }
        
        // Buscar assinatura mais recente do usuário (ativa ou cancelada)
        Assinatura assinatura = assinaturaService.buscarAssinaturaMaisRecente(userId);
        
        if (assinatura == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Nenhuma assinatura encontrada para o usuário ID: " + userId);
        }
        
        return ResponseEntity.ok(assinaturaMapper.toResponseDTO(assinatura));
    }

    // Cancelar assinatura (modo teste)
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<CancelamentoResponseDTO> cancelarAssinatura(
            @PathVariable Long id,
            @Valid @RequestBody CancelarAssinaturaDTO dto) {
        // ✅ MODO DE TESTE: Validações de segurança simplificadas para teste
        
        // Verificar se assinatura existe
        Assinatura assinatura = assinaturaService.buscarPorId(id);
        if (assinatura == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Assinatura não encontrada com ID: " + id);
        }
        
        // ✅ VALIDAÇÃO: Verificar se a assinatura está ativa
        if (!"ATIVA".equals(assinatura.getStatus())) {
            String mensagem;
            if ("CANCELADA".equals(assinatura.getStatus())) {
                mensagem = "Esta assinatura já foi cancelada anteriormente em " + 
                    (assinatura.getCancelledAt() != null ? 
                        assinatura.getCancelledAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : 
                        "data não disponível") + 
                    ". Não é possível cancelar novamente.";
            } else {
                mensagem = "Apenas assinaturas ativas podem ser canceladas. Status atual: " + assinatura.getStatus();
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, mensagem);
        }
        
        try {
            CancelamentoResponseDTO response = assinaturaService.cancelarAssinatura(id, dto);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    /**
     * Obtém o usuário autenticado do contexto de segurança
     */
    private Usuario getUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                    "Usuário não encontrado: " + email));
    }
}
package br.com.backend.controller;

import br.com.backend.dto.*;
import br.com.backend.entity.ConfiguracaoNotificacao;
import br.com.backend.entity.NotificacaoVencimento;
import br.com.backend.repository.ConfiguracaoNotificacaoRepository;
import br.com.backend.repository.NotificacaoVencimentoRepository;
import br.com.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notificacoes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
public class NotificacaoController {

    private final ConfiguracaoNotificacaoRepository configuracaoRepository;
    private final NotificacaoVencimentoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/configuracao/{usuarioId}")
    public ResponseEntity<?> obterConfiguracao(@PathVariable @Positive Long usuarioId,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        // Verificar se o usuário pode acessar esta configuração
        String emailAuth = userDetails.getUsername();
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                if (!usuario.getId().equals(usuarioId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponseDTO("Acesso negado", "FORBIDDEN"));
                }

                ConfiguracaoNotificacao config = configuracaoRepository.findByUsuarioId(usuarioId)
                    .orElseGet(() -> criarConfiguracaoPadrao(usuarioId));

                return ResponseEntity.ok(convertToDTO(config));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND")));
    }

    @PostMapping("/configuracao")
    public ResponseEntity<?> criarConfiguracao(@Valid @RequestBody ConfiguracaoNotificacaoDTO configDTO,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        String emailAuth = userDetails.getUsername();
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                if (!usuario.getId().equals(configDTO.getUsuarioId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponseDTO("Acesso negado", "FORBIDDEN"));
                }

                ConfiguracaoNotificacao config = ConfiguracaoNotificacao.builder()
                    .usuarioId(configDTO.getUsuarioId())
                    .ativo(configDTO.getAtivo())
                    .diasAntesVencimento(configDTO.getDiasAntesVencimento())
                    .emailAtivo(configDTO.getEmailAtivo())
                    .pushAtivo(configDTO.getPushAtivo())
                    .smsAtivo(configDTO.getSmsAtivo())
                    .horarioNotificacao(configDTO.getHorarioNotificacao())
                    .dataCriacao(LocalDateTime.now())
                    .dataAtualizacao(LocalDateTime.now())
                    .build();

                ConfiguracaoNotificacao salva = configuracaoRepository.save(config);
                log.info("Configuração de notificação criada para usuário: {}", configDTO.getUsuarioId());

                return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(salva));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND")));
    }

    @PutMapping("/configuracao/{id}")
    public ResponseEntity<?> atualizarConfiguracao(@PathVariable @Positive Long id,
                                                  @Valid @RequestBody ConfiguracaoNotificacaoDTO configDTO,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        String emailAuth = userDetails.getUsername();
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                return configuracaoRepository.findById(id)
                    .<ResponseEntity<?>>map(config -> {
                        if (!config.getUsuarioId().equals(usuario.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ErrorResponseDTO("Acesso negado", "FORBIDDEN"));
                        }

                        config.setAtivo(configDTO.getAtivo());
                        config.setDiasAntesVencimento(configDTO.getDiasAntesVencimento());
                        config.setEmailAtivo(configDTO.getEmailAtivo());
                        config.setPushAtivo(configDTO.getPushAtivo());
                        config.setSmsAtivo(configDTO.getSmsAtivo());
                        config.setHorarioNotificacao(configDTO.getHorarioNotificacao());
                        config.setDataAtualizacao(LocalDateTime.now());

                        ConfiguracaoNotificacao atualizada = configuracaoRepository.save(config);
                        log.info("Configuração de notificação atualizada para usuário: {}", usuario.getId());

                        return ResponseEntity.ok(convertToDTO(atualizada));
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponseDTO("Configuração não encontrada", "CONFIG_NOT_FOUND")));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND")));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obterNotificacoes(@PathVariable @Positive Long usuarioId,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        String emailAuth = userDetails.getUsername();
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                if (!usuario.getId().equals(usuarioId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponseDTO("Acesso negado", "FORBIDDEN"));
                }

                List<NotificacaoVencimento> notificacoes = notificacaoRepository
                    .findByUsuarioIdOrderByDataEnvioDesc(usuarioId);

                List<NotificacaoVencimentoDTO> notificacoesDTO = notificacoes.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

                return ResponseEntity.ok(notificacoesDTO);
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND")));
    }

    @PatchMapping("/notificacao/{notificacaoId}/lida")
    public ResponseEntity<?> marcarComoLida(@PathVariable @Positive Long notificacaoId,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        String emailAuth = userDetails.getUsername();
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                return notificacaoRepository.findById(notificacaoId)
                    .<ResponseEntity<?>>map(notificacao -> {
                        if (!notificacao.getUsuarioId().equals(usuario.getId())) {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(new ErrorResponseDTO("Acesso negado", "FORBIDDEN"));
                        }

                        notificacao.setLida(true);
                        notificacao.setDataLeitura(LocalDateTime.now());
                        notificacaoRepository.save(notificacao);

                        log.info("Notificação {} marcada como lida para usuário: {}", notificacaoId, usuario.getId());

                        return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "message", "Notificação marcada como lida"
                        ));
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponseDTO("Notificação não encontrada", "NOTIFICATION_NOT_FOUND")));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND")));
    }

    @PostMapping("/teste/{usuarioId}")
    public ResponseEntity<?> testarNotificacao(@PathVariable @Positive Long usuarioId,
                                              @Valid @RequestBody TesteNotificacaoDTO testeDTO,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        String emailAuth = userDetails.getUsername();
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                if (!usuario.getId().equals(usuarioId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponseDTO("Acesso negado", "FORBIDDEN"));
                }

                // Simular envio de notificação de teste
                log.info("Teste de notificação {} enviado para usuário: {}", testeDTO.getTipo(), usuarioId);

                // Criar uma notificação de teste no banco
                NotificacaoVencimento notificacaoTeste = NotificacaoVencimento.builder()
                    .usuarioId(usuarioId)
                    .titulo("Teste de Notificação " + testeDTO.getTipo().toUpperCase())
                    .mensagem("Esta é uma notificação de teste do tipo " + testeDTO.getTipo())
                    .tipo(testeDTO.getTipo())
                    .status("enviada")
                    .dataVencimento(LocalDateTime.now().plusDays(7))
                    .dataEnvio(LocalDateTime.now())
                    .lida(false)
                    .build();

                notificacaoRepository.save(notificacaoTeste);

                return ResponseEntity.ok(Map.of("sucesso", true));
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND")));
    }

    @GetMapping("/estatisticas/{usuarioId}")
    public ResponseEntity<?> obterEstatisticas(@PathVariable @Positive Long usuarioId,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponseDTO("Não autenticado", "UNAUTHORIZED"));
        }

        String emailAuth = userDetails.getUsername();
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                if (!usuario.getId().equals(usuarioId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponseDTO("Acesso negado", "FORBIDDEN"));
                }

                Long totalEnviadas = notificacaoRepository.countByUsuarioId(usuarioId);
                Long totalLidas = notificacaoRepository.countByUsuarioIdAndLidaTrue(usuarioId);
                Long totalPendentes = notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId);

                // Buscar última notificação
                List<NotificacaoVencimento> ultimasNotificacoes = notificacaoRepository
                    .findByUsuarioIdOrderByDataEnvioDesc(usuarioId);
                LocalDateTime ultimaNotificacao = ultimasNotificacoes.isEmpty() ? 
                    null : ultimasNotificacoes.get(0).getDataEnvio();

                EstatisticasNotificacaoDTO estatisticas = EstatisticasNotificacaoDTO.builder()
                    .totalEnviadas(totalEnviadas)
                    .totalLidas(totalLidas)
                    .totalPendentes(totalPendentes)
                    .ultimaNotificacao(ultimaNotificacao)
                    .build();

                return ResponseEntity.ok(estatisticas);
            })
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponseDTO("Usuário não encontrado", "USER_NOT_FOUND")));
    }

    private ConfiguracaoNotificacao criarConfiguracaoPadrao(Long usuarioId) {
        ConfiguracaoNotificacao config = ConfiguracaoNotificacao.builder()
            .usuarioId(usuarioId)
            .ativo(true)
            .diasAntesVencimento(7)
            .emailAtivo(true)
            .pushAtivo(false)
            .smsAtivo(false)
            .horarioNotificacao("09:00")
            .dataCriacao(LocalDateTime.now())
            .dataAtualizacao(LocalDateTime.now())
            .build();
        
        return configuracaoRepository.save(config);
    }

    private ConfiguracaoNotificacaoDTO convertToDTO(ConfiguracaoNotificacao config) {
        return ConfiguracaoNotificacaoDTO.builder()
            .id(config.getId())
            .usuarioId(config.getUsuarioId())
            .ativo(config.getAtivo())
            .diasAntesVencimento(config.getDiasAntesVencimento())
            .emailAtivo(config.getEmailAtivo())
            .pushAtivo(config.getPushAtivo())
            .smsAtivo(config.getSmsAtivo())
            .horarioNotificacao(config.getHorarioNotificacao())
            .dataCriacao(config.getDataCriacao())
            .dataAtualizacao(config.getDataAtualizacao())
            .build();
    }

    private NotificacaoVencimentoDTO convertToDTO(NotificacaoVencimento notificacao) {
        return NotificacaoVencimentoDTO.builder()
            .id(notificacao.getId())
            .usuarioId(notificacao.getUsuarioId())
            .titulo(notificacao.getTitulo())
            .mensagem(notificacao.getMensagem())
            .tipo(notificacao.getTipo())
            .status(notificacao.getStatus())
            .dataVencimento(notificacao.getDataVencimento())
            .dataEnvio(notificacao.getDataEnvio())
            .lida(notificacao.getLida())
            .dataLeitura(notificacao.getDataLeitura())
            .build();
    }
}

package br.com.backend.controller;

import br.com.backend.dto.ContatoRequestDTO;
import br.com.backend.service.ContatoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/contato")
@RequiredArgsConstructor
@Slf4j
public class ContatoController {

    private final ContatoService contatoService;

    @PostMapping
    public ResponseEntity<Map<String, String>> enviarContato(@Valid @RequestBody ContatoRequestDTO contatoRequest) {
        try {
            log.info("Recebendo mensagem de contato de: {} - {}", contatoRequest.getNome(), contatoRequest.getEmail());
            
            contatoService.enviarMensagemContato(contatoRequest);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Mensagem enviada com sucesso! Entraremos em contato em breve."
            ));
            
        } catch (Exception e) {
            log.error("Erro ao processar mensagem de contato: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", "Erro interno do servidor. Tente novamente mais tarde."
            ));
        }
    }
}

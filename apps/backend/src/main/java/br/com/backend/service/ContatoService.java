package br.com.backend.service;

import br.com.backend.dto.ContatoRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContatoService {
    
    private final EmailService emailService;
    
    public void enviarMensagemContato(ContatoRequestDTO contatoRequest) {
        try {
            // Email destinatário (seu email profissional)
            String emailDestino = "contato@formsync.com.br";
            
            // Enviar email de contato
            emailService.enviarMensagemContato(
                emailDestino,
                contatoRequest.getNome(),
                contatoRequest.getEmail(),
                contatoRequest.getAssunto(),
                contatoRequest.getMensagem()
            );
            
            log.info("Mensagem de contato enviada com sucesso para: {}", emailDestino);
            
        } catch (Exception e) {
            log.error("Erro ao enviar mensagem de contato: {}", e.getMessage());
            throw new RuntimeException("Erro ao processar mensagem de contato", e);
        }
    }
}


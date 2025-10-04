package br.com.backend.service;

import br.com.backend.entity.Assinatura;
import br.com.backend.entity.Usuario;
import br.com.backend.repository.UsuarioRepository;
// SendGrid removido - usando apenas Gmail SMTP
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final UsuarioRepository usuarioRepository;
    private final Optional<TemplateEngine> templateEngine;
    
    // Dependências opcionais - injetadas apenas se disponíveis
    private final Optional<JavaMailSender> mailSender;

    @Value("${spring.mail.from:noreply@formsync.com}")
    private String fromEmail;

    @Value("${app.base-url:http://localhost:4200}")
    private String baseUrl;

    @Value("${spring.mail.enabled:true}")
    private boolean emailEnabled;

    @Value("${spring.mail.provider:javamail}")
    private String mailProvider;

    /**
     * Envia email de confirmação de cancelamento
     */
    public void enviarEmailCancelamento(Assinatura assinatura, String motivo, double valorReembolso, boolean dentroDoArrependimento) {
        if (!emailEnabled) {
            log.info("📧 [EMAIL_SERVICE] Email desabilitado em desenvolvimento. Email de cancelamento seria enviado para assinatura ID: {}", assinatura.getId());
            return;
        }

        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(assinatura.getUsuarioId());
            if (usuarioOpt.isEmpty()) {
                log.error("❌ [EMAIL_SERVICE] Usuário não encontrado para assinatura ID: {}", assinatura.getId());
                return;
            }

            Usuario usuario = usuarioOpt.get();
            log.info("📧 [EMAIL_SERVICE] Enviando email de cancelamento para: {}", usuario.getEmail());

            // Usar o template Thymeleaf (se disponível)
            String htmlContent;
            if (templateEngine.isPresent()) {
                Context context = new Context();
                context.setVariable("nome", usuario.getNome());
                context.setVariable("plano", getNomePlano(assinatura.getPlano()));
                context.setVariable("motivo", motivo);
                context.setVariable("valorReembolso", String.format("%.2f", valorReembolso));
                context.setVariable("dentroDoArrependimento", dentroDoArrependimento);
                context.setVariable("dataCancelamento", LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy 'às' HH:mm")));
                context.setVariable("baseUrl", baseUrl);
                
                htmlContent = templateEngine.get().process("cancelamento-email-template", context);
            } else {
                // Fallback para HTML simples se Thymeleaf não estiver disponível
                htmlContent = "<html><body><h2>Confirmação de Cancelamento</h2>" +
                    "<p>Olá " + usuario.getNome() + ",</p>" +
                    "<p>Sua assinatura " + getNomePlano(assinatura.getPlano()) + " foi cancelada com sucesso.</p>" +
                    "<p><strong>Motivo:</strong> " + motivo + "</p>" +
                    "<p><strong>Valor do reembolso:</strong> R$ " + String.format("%.2f", valorReembolso) + "</p>" +
                    "</body></html>";
            }

            if (mailSender.isPresent()) {
                enviarEmailViaJavaMail(usuario.getEmail(), "Confirmação de Cancelamento - FormSync", htmlContent);
            } else {
                throw new RuntimeException("Nenhum provedor de email configurado");
            }
            
            log.info("✅ [EMAIL_SERVICE] Email de cancelamento enviado com sucesso para: {}", usuario.getEmail());
            
        } catch (Exception e) {
            log.error("❌ [EMAIL_SERVICE] Erro ao enviar email de cancelamento: {}", e.getMessage());
        }
    }

    /**
     * Envia email de confirmação de assinatura
     */
    public void enviarEmailConfirmacaoAssinatura(Assinatura assinatura) {
        if (!emailEnabled) {
            log.info("📧 [EMAIL_SERVICE] Email desabilitado em desenvolvimento. Email de confirmação seria enviado para assinatura ID: {}", assinatura.getId());
            return;
        }

        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(assinatura.getUsuarioId());
            if (usuarioOpt.isEmpty()) {
                log.error("❌ [EMAIL_SERVICE] Usuário não encontrado para assinatura ID: {}", assinatura.getId());
                return;
            }

            Usuario usuario = usuarioOpt.get();
            log.info("📧 [EMAIL_SERVICE] Enviando email de confirmação de assinatura para: {}", usuario.getEmail());

            // Usar o template Thymeleaf (se disponível)
            String htmlContent;
            if (templateEngine.isPresent()) {
                Context context = new Context();
                context.setVariable("nome", usuario.getNome());
                context.setVariable("plano", getNomePlano(assinatura.getPlano()));
                context.setVariable("valor", String.format("%.2f", assinatura.getValor()));
                context.setVariable("dataInicio", assinatura.getDataInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                context.setVariable("dataFim", assinatura.getDataFim().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                context.setVariable("baseUrl", baseUrl);
                
                htmlContent = templateEngine.get().process("confirmacao-assinatura-email-template", context);
            } else {
                // Fallback para HTML simples se Thymeleaf não estiver disponível
                htmlContent = "<html><body><h2>Confirmação de Assinatura</h2>" +
                    "<p>Olá " + usuario.getNome() + ",</p>" +
                    "<p>Sua assinatura " + getNomePlano(assinatura.getPlano()) + " foi ativada com sucesso!</p>" +
                    "<p><strong>Valor:</strong> R$ " + String.format("%.2f", assinatura.getValor()) + "</p>" +
                    "<p><strong>Período:</strong> " + assinatura.getDataInicio().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + 
                    " até " + assinatura.getDataFim().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + "</p>" +
                    "</body></html>";
            }

            if (mailSender.isPresent()) {
                enviarEmailViaJavaMail(usuario.getEmail(), "Confirmação de Assinatura - FormSync", htmlContent);
            } else {
                throw new RuntimeException("Nenhum provedor de email configurado");
            }
            
            log.info("✅ [EMAIL_SERVICE] Email de confirmação de assinatura enviado com sucesso para: {}", usuario.getEmail());
            
        } catch (Exception e) {
            log.error("❌ [EMAIL_SERVICE] Erro ao enviar email de confirmação de assinatura: {}", e.getMessage());
        }
    }

    /**
     * Envia email de lembrete de vencimento
     */
    public void enviarEmailLembreteVencimento(Assinatura assinatura) {
        if (!emailEnabled) {
            log.info("📧 [EMAIL_SERVICE] Email desabilitado em desenvolvimento. Email de lembrete seria enviado para assinatura ID: {}", assinatura.getId());
            return;
        }

        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findById(assinatura.getUsuarioId());
            if (usuarioOpt.isEmpty()) {
                log.error("❌ [EMAIL_SERVICE] Usuário não encontrado para assinatura ID: {}", assinatura.getId());
                return;
            }

            Usuario usuario = usuarioOpt.get();
            log.info("📧 [EMAIL_SERVICE] Enviando email de lembrete de vencimento para: {}", usuario.getEmail());

            // Usar o template Thymeleaf (se disponível)
            String htmlContent;
            if (templateEngine.isPresent()) {
                Context context = new Context();
                context.setVariable("nome", usuario.getNome());
                context.setVariable("plano", getNomePlano(assinatura.getPlano()));
                context.setVariable("dataVencimento", assinatura.getDataFim().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                context.setVariable("valor", String.format("%.2f", assinatura.getValor()));
                context.setVariable("baseUrl", baseUrl);
                
                htmlContent = templateEngine.get().process("lembrete-vencimento-email-template", context);
            } else {
                // Fallback para HTML simples se Thymeleaf não estiver disponível
                htmlContent = "<html><body><h2>Lembrete de Vencimento</h2>" +
                    "<p>Olá " + usuario.getNome() + ",</p>" +
                    "<p>Sua assinatura " + getNomePlano(assinatura.getPlano()) + " vence em " + 
                    assinatura.getDataFim().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")) + ".</p>" +
                    "<p><strong>Valor:</strong> R$ " + String.format("%.2f", assinatura.getValor()) + "</p>" +
                    "</body></html>";
            }

            if (mailSender.isPresent()) {
                enviarEmailViaJavaMail(usuario.getEmail(), "Lembrete de Vencimento - FormSync", htmlContent);
            } else {
                throw new RuntimeException("Nenhum provedor de email configurado");
            }
            
            log.info("✅ [EMAIL_SERVICE] Email de lembrete de vencimento enviado com sucesso para: {}", usuario.getEmail());
            
        } catch (Exception e) {
            log.error("❌ [EMAIL_SERVICE] Erro ao enviar email de lembrete de vencimento: {}", e.getMessage());
        }
    }

    /**
     * Envia código de verificação por email (para login)
     */
    public void enviarCodigo(String email, String codigo) {
        if (!emailEnabled) {
            log.info("📧 [EMAIL_SERVICE] Email desabilitado em desenvolvimento. Código seria: {} para: {}", codigo, email);
            return; // Não falha, apenas loga o código
        }

        try {
            log.info("📧 [EMAIL_SERVICE] Tentando enviar código para: {} usando provider: {}", email, mailProvider);
            log.info("📧 [EMAIL_SERVICE] JavaMail disponível: {}", mailSender.isPresent());
            
            // Usar o template Thymeleaf para gerar o HTML (se disponível)
            String htmlContent;
            if (templateEngine.isPresent()) {
                Context context = new Context();
                context.setVariable("codigo", codigo);
                htmlContent = templateEngine.get().process("codigo-email-template", context);
            } else {
                // Fallback para HTML simples se Thymeleaf não estiver disponível
                htmlContent = "<html><body><h2>Código de Verificação</h2><p>Seu código é: <strong>" + codigo + "</strong></p></body></html>";
            }
            
            // Usar JavaMail (Gmail SMTP) se disponível
            if (mailSender.isPresent()) {
                log.info("📧 [EMAIL_SERVICE] Usando Gmail SMTP para envio");
                enviarCodigoViaJavaMail(email, codigo, htmlContent);
            } 
            // Se nenhum provedor estiver disponível, logar o código e não falhar
            else {
                log.warn("⚠️ [EMAIL_SERVICE] Nenhum provedor de email configurado. Logando código para debug: {} para {}", codigo, email);
                // Em produção, isso deve falhar, mas em desenvolvimento pode continuar
                if ("prod".equals(System.getProperty("spring.profiles.active"))) {
                    throw new RuntimeException("Nenhum provedor de email configurado em produção");
                }
            }
            
            log.info("✅ [EMAIL_SERVICE] Código de verificação enviado com sucesso para: {}", email);
            
        } catch (Exception e) {
            log.error("❌ [EMAIL_SERVICE] Erro ao enviar código de verificação para {}: {}", email, e.getMessage());
            log.error("❌ [EMAIL_SERVICE] Stack trace completo:", e);
            throw new RuntimeException("Erro ao enviar email: " + e.getMessage(), e);
        }
    }

    // Método SendGrid removido - usando apenas Gmail SMTP

    /**
     * Envia código via JavaMail (fallback)
     */
    private void enviarCodigoViaJavaMail(String email, String codigo, String htmlContent) throws MessagingException {
        log.info("📧 [JAVAMAIL] Enviando código via JavaMail para: {}", email);
        
        MimeMessage message = mailSender.get().createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(email);
        helper.setSubject("Código de Verificação - FormSync");
        helper.setText(htmlContent, true);
        
        mailSender.get().send(message);
        log.info("✅ [JAVAMAIL] Email enviado com sucesso");
    }

    // Método SendGrid removido - usando apenas Gmail SMTP

    /**
     * Envia email genérico via JavaMail
     */
    private void enviarEmailViaJavaMail(String email, String subject, String htmlContent) throws MessagingException {
        log.info("📧 [JAVAMAIL] Enviando email via JavaMail para: {}", email);
        
        MimeMessage message = mailSender.get().createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(email);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.get().send(message);
        log.info("✅ [JAVAMAIL] Email enviado com sucesso");
    }

    /**
     * Envia mensagem de contato (formulário do site)
     */
    public void enviarMensagemContato(String emailDestino, String nome, String emailRemetente, String telefone, String mensagem) {
        try {
            // Usar o template Thymeleaf em vez de HTML hardcoded (se disponível)
            String htmlContent;
            if (templateEngine.isPresent()) {
                Context context = new Context();
                context.setVariable("nomeRemetente", nome);
                context.setVariable("emailRemetente", emailRemetente);
                context.setVariable("telefone", telefone);
                context.setVariable("assunto", "Mensagem do formulário de contato");
                context.setVariable("mensagem", mensagem);
                
                htmlContent = templateEngine.get().process("contato-email-template", context);
            } else {
                // Fallback para HTML simples se Thymeleaf não estiver disponível
                htmlContent = "<html><body><h2>Nova Mensagem de Contato</h2>" +
                    "<p><strong>Nome:</strong> " + nome + "</p>" +
                    "<p><strong>Email:</strong> " + emailRemetente + "</p>" +
                    "<p><strong>Telefone:</strong> " + telefone + "</p>" +
                    "<p><strong>Mensagem:</strong> " + mensagem + "</p>" +
                    "</body></html>";
            }

            if (mailSender.isPresent()) {
                enviarEmailViaJavaMail(emailDestino, "📬 Nova Mensagem de Contato - FormSync", htmlContent);
            } else {
                throw new RuntimeException("Nenhum provedor de email configurado");
            }
            
            log.info("✅ Mensagem de contato enviada de {} para {}", emailRemetente, emailDestino);
            
        } catch (Exception e) {
            log.error("❌ Erro ao enviar mensagem de contato de {} para {}: {}", emailRemetente, emailDestino, e.getMessage());
        }
    }

    /**
     * Converte código do plano para nome amigável
     */
    private String getNomePlano(String plano) {
        return switch (plano) {
            case "BASICO" -> "Básico";
            case "PROFISSIONAL" -> "Profissional";
            case "EMPRESARIAL" -> "Empresarial";
            default -> plano;
        };
    }
}
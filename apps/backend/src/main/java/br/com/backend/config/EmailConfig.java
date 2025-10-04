package br.com.backend.config;

import com.sendgrid.SendGrid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
@Slf4j
public class EmailConfig {

    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;

    /**
     * Bean para SendGrid - desabilitado (usando apenas Gmail SMTP)
     */
    // @Bean
    // @ConditionalOnProperty(name = "spring.mail.provider", havingValue = "sendgrid", matchIfMissing = false)
    public SendGrid sendGrid() {
        log.info("📧 [EMAIL_CONFIG] SendGrid desabilitado - usando apenas Gmail SMTP");
        return null;
    }

    /**
     * Bean mock para JavaMailSender em desenvolvimento local
     * Este bean só será criado quando spring.mail.enabled=false
     */
    @Bean
    @ConditionalOnProperty(name = "spring.mail.enabled", havingValue = "false", matchIfMissing = false)
    public JavaMailSender javaMailSender() {
        log.info("📧 [EMAIL_CONFIG] Configurando JavaMailSender para desenvolvimento local");
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("localhost");
        mailSender.setPort(1025); // Porta padrão do MailHog para desenvolvimento
        mailSender.setUsername("dev");
        mailSender.setPassword("dev");
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "false");
        props.put("mail.smtp.starttls.enable", "false");
        props.put("mail.debug", "false");
        
        return mailSender;
    }

    /**
     * Bean JavaMailSender para produção (Gmail SMTP)
     */
    @Bean
    @ConditionalOnProperty(name = "spring.mail.enabled", havingValue = "true", matchIfMissing = false)
    public JavaMailSender javaMailSenderProd() {
        log.info("📧 [EMAIL_CONFIG] Configurando JavaMailSender para produção (Gmail SMTP)");
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        
        // Configurações serão definidas via application.properties
        // Usando Gmail SMTP para produção
        
        return mailSender;
    }
}

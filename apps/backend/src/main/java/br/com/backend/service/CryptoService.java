package br.com.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@Slf4j
public class CryptoService {

    private static final String PREFIX = "enc:";
    private static final int GCM_TAG_BITS = 128;
    private static final int GCM_IV_LENGTH = 12;

    @Value("${app.crypto.enabled:true}")
    private boolean cryptoEnabled;

    @Value("${app.crypto.secret:}")
    private String cryptoSecret;

    private SecretKeySpec keySpec;
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void init() {
        try {
            if (!cryptoEnabled) {
                log.info("Criptografia desabilitada");
                return;
            }

            if (cryptoSecret == null || cryptoSecret.isBlank()) {
                // Desabilita criptografia se não houver segredo configurado
                cryptoEnabled = false;
                log.warn("Criptografia desabilitada: segredo não configurado");
                return;
            }

            // Deriva chave a partir do segredo usando SHA-256 (32 bytes)
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(cryptoSecret.getBytes(StandardCharsets.UTF_8));
            keySpec = new SecretKeySpec(keyBytes, "AES");
            log.info("Criptografia inicializada com sucesso");
        } catch (Exception e) {
            cryptoEnabled = false;
            log.error("Erro ao inicializar criptografia: {}", e.getMessage());
        }
    }

    public String encryptIfEnabled(String plaintext) {
        if (!cryptoEnabled || plaintext == null || plaintext.isBlank()) {
            return plaintext;
        }
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_BITS, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, spec);
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            ByteBuffer buffer = ByteBuffer.allocate(iv.length + ciphertext.length);
            buffer.put(iv);
            buffer.put(ciphertext);
            String encoded = Base64.getEncoder().encodeToString(buffer.array());
            return PREFIX + encoded;
        } catch (Exception e) {
            // Em caso de falha, retorna o texto puro para não quebrar fluxo
            return plaintext;
        }
    }

    public String decryptIfEncrypted(String maybeEncrypted) {
        if (maybeEncrypted == null || !maybeEncrypted.startsWith(PREFIX) || !cryptoEnabled) {
            return maybeEncrypted;
        }
        try {
            String data = maybeEncrypted.substring(PREFIX.length());
            byte[] all = Base64.getDecoder().decode(data);
            ByteBuffer buffer = ByteBuffer.wrap(all);

            byte[] iv = new byte[GCM_IV_LENGTH];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(GCM_TAG_BITS, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, spec);
            byte[] plaintext = cipher.doFinal(ciphertext);
            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Em caso de falha de descriptografia, retorna valor original
            return maybeEncrypted;
        }
    }
}



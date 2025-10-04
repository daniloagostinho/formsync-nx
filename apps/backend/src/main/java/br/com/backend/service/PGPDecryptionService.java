package br.com.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Slf4j
public class PGPDecryptionService {

    @Value("${spring.datasource.url:}")
    private String databaseUrl;

    @Value("${spring.datasource.username:}")
    private String databaseUsername;

    @Value("${spring.datasource.password:}")
    private String databasePassword;

    @Value("${app.encryption.key:defaultSecretKey123}")
    private String encryptionKey;

    /**
     * Descriptografa um valor PGP usando PostgreSQL
     */
    public String decryptPGPValue(String encryptedValue) {
        if (encryptedValue == null || encryptedValue.trim().isEmpty()) {
            return encryptedValue;
        }

        // Se não começa com \x, provavelmente não está criptografado
        if (!encryptedValue.startsWith("\\x")) {
            return encryptedValue;
        }

        // Verifica se a configuração do banco está disponível
        if (databaseUrl == null || databaseUrl.trim().isEmpty() || 
            databaseUsername == null || databaseUsername.trim().isEmpty() || 
            databasePassword == null || databasePassword.trim().isEmpty()) {
            log.warn("Configuração do banco de dados não disponível para descriptografia PGP. Retornando valor original.");
            return encryptedValue;
        }

        try (Connection connection = DriverManager.getConnection(databaseUrl, databaseUsername, databasePassword)) {
            String sql = "SELECT pgp_sym_decrypt(?, ?) as decrypted_value";
            
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                // Converte o valor hexadecimal para bytes
                byte[] encryptedBytes = hexStringToByteArray(encryptedValue.substring(2)); // Remove \x
                statement.setBytes(1, encryptedBytes);
                statement.setString(2, encryptionKey);
                
                try (ResultSet resultSet = statement.executeQuery()) {
                    if (resultSet.next()) {
                        String decrypted = resultSet.getString("decrypted_value");
                        log.debug("Valor PGP descriptografado com sucesso");
                        return decrypted;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Erro ao descriptografar valor PGP: {}", e.getMessage());
            // Em caso de erro, retorna o valor original
            return encryptedValue;
        }

        return encryptedValue;
    }

    /**
     * Descriptografa um objeto com campos que podem estar criptografados
     */
    public Map<String, Object> decryptObject(Map<String, Object> obj) {
        if (obj == null) {
            return obj;
        }

        Map<String, Object> decryptedObj = new HashMap<>(obj);

        // Descriptografa campos específicos que podem estar criptografados
        String[] fieldsToDecrypt = {"valor", "value", "descricao", "description", "placeholder", "valorPadrao"};
        
        for (String field : fieldsToDecrypt) {
            Object value = decryptedObj.get(field);
            if (value instanceof String) {
                decryptedObj.put(field, decryptPGPValue((String) value));
            }
        }

        // Se for um array de campos, descriptografa cada campo
        Object campos = decryptedObj.get("campos");
        if (campos instanceof List) {
            List<Map<String, Object>> decryptedCampos = new ArrayList<>();
            for (Object campo : (List<?>) campos) {
                if (campo instanceof Map) {
                    decryptedCampos.add(decryptObject((Map<String, Object>) campo));
                } else {
                    decryptedCampos.add((Map<String, Object>) campo);
                }
            }
            decryptedObj.put("campos", decryptedCampos);
        }

        return decryptedObj;
    }

    /**
     * Converte string hexadecimal para array de bytes
     */
    private byte[] hexStringToByteArray(String hexString) {
        int len = hexString.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hexString.charAt(i), 16) << 4)
                                 + Character.digit(hexString.charAt(i+1), 16));
        }
        return data;
    }
}


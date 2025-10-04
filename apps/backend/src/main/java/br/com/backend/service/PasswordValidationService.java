package br.com.backend.service;

import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
@Slf4j
public class PasswordValidationService {

    private static final int MIN_PASSWORD_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\d");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");

    // Padrões de senhas sequenciais e fracas
    private static final String[] SEQUENTIAL_PATTERNS = {
        "123456", "12345", "1234", "123", "12",
        "000000", "00000", "0000", "000", "00",
        "111111", "11111", "1111", "111", "11",
        "abcdef", "abcde", "abcd", "abc", "ab",
        "qwerty", "qwert", "qwer", "qwe", "qw",
        "987654", "98765", "9876", "987", "98",
        "654321", "65432", "6543", "654", "65"
    };

    /**
     * Valida se uma senha atende aos requisitos de segurança
     */
    public PasswordValidationResult validatePassword(String password) {
        List<String> errors = new ArrayList<>();
        
        if (password == null || password.trim().isEmpty()) {
            errors.add("Senha não pode estar vazia");
            return new PasswordValidationResult(false, errors);
        }

        // Validar comprimento mínimo
        if (password.length() < MIN_PASSWORD_LENGTH) {
            errors.add("Senha deve ter pelo menos " + MIN_PASSWORD_LENGTH + " caracteres");
        }

        // Validar letra maiúscula
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            errors.add("Senha deve conter pelo menos uma letra maiúscula");
        }

        // Validar número
        if (!NUMBER_PATTERN.matcher(password).find()) {
            errors.add("Senha deve conter pelo menos um número");
        }

        // Validar caractere especial
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            errors.add("Senha deve conter pelo menos um caractere especial");
        }

        // Validar senhas sequenciais
        if (isSequentialPassword(password)) {
            errors.add("Senha sequencial não permitida (ex: 123456, abcdef)");
        }

        // Validar senhas repetitivas
        if (isRepetitivePassword(password)) {
            errors.add("Senha com padrões repetitivos não permitida");
        }

        // Validar senhas muito comuns
        if (isCommonPassword(password)) {
            errors.add("Senha muito comum, escolha uma mais segura");
        }

        boolean isValid = errors.isEmpty();
        
        if (isValid) {
            log.debug("Senha válida: atende a todos os requisitos de segurança");
        } else {
            log.warn("Senha inválida: {}", String.join(", ", errors));
        }

        return new PasswordValidationResult(isValid, errors);
    }

    /**
     * Verifica se é uma senha sequencial
     */
    private boolean isSequentialPassword(String password) {
        String lowerPassword = password.toLowerCase();
        
        for (String pattern : SEQUENTIAL_PATTERNS) {
            if (lowerPassword.contains(pattern.toLowerCase())) {
                log.debug("Senha sequencial detectada: {}", pattern);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Verifica se é uma senha repetitiva
     */
    private boolean isRepetitivePassword(String password) {
        if (password.length() < 3) return false;
        
        // Verificar repetição de caracteres
        for (int i = 0; i < password.length() - 2; i++) {
            if (password.charAt(i) == password.charAt(i + 1) && 
                password.charAt(i) == password.charAt(i + 2)) {
                log.debug("Senha repetitiva detectada: caracteres repetidos");
                return true;
            }
        }
        
        // Verificar padrões repetitivos
        String[] repetitivePatterns = {"aa", "bb", "cc", "11", "22", "33", "00"};
        String lowerPassword = password.toLowerCase();
        
        for (String pattern : repetitivePatterns) {
            if (lowerPassword.contains(pattern)) {
                log.debug("Senha repetitiva detectada: padrão {}", pattern);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Verifica se é uma senha muito comum
     */
    private boolean isCommonPassword(String password) {
        String[] commonPasswords = {
            "password", "123456", "123456789", "qwerty", "abc123",
            "password123", "admin", "letmein", "welcome", "monkey",
            "dragon", "master", "hello", "freedom", "whatever",
            "qwerty123", "admin123", "login", "passw0rd", "abc123"
        };
        
        String lowerPassword = password.toLowerCase();
        
        for (String common : commonPasswords) {
            if (lowerPassword.equals(common)) {
                log.debug("Senha comum detectada: {}", common);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Classe interna para resultado da validação
     */
    public static class PasswordValidationResult {
        private final boolean valid;
        private final List<String> errors;

        public PasswordValidationResult(boolean valid, List<String> errors) {
            this.valid = valid;
            this.errors = errors;
        }

        public boolean isValid() {
            return valid;
        }

        public List<String> getErrors() {
            return errors;
        }

        public String getErrorMessage() {
            return String.join("; ", errors);
        }
    }
}

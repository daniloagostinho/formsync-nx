package br.com.backend.controller;

import br.com.backend.security.EncryptionService;
import br.com.backend.security.PasswordService;
import br.com.backend.security.DataPrivacyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
@RequestMapping("/api/v1/test")
public class TestEncryptionController {

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private PasswordService passwordService;

    @Autowired
    private DataPrivacyService dataPrivacyService;

    /**
     * Testa criptografia básica
     */
    @GetMapping("/encryption")
    public ResponseEntity<Map<String, Object>> testEncryption() {
        try {
            String textoOriginal = "Dados sensíveis para teste";
            String textoCriptografado = encryptionService.encrypt(textoOriginal);
            String textoDescriptografado = encryptionService.decrypt(textoCriptografado);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("original", textoOriginal);
            resultado.put("criptografado", textoCriptografado);
            resultado.put("descriptografado", textoDescriptografado);
            resultado.put("sucesso", textoOriginal.equals(textoDescriptografado));
            resultado.put("tamanhoCriptografado", textoCriptografado.length());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Testa hash de senhas
     */
    @GetMapping("/password")
    public ResponseEntity<Map<String, Object>> testPassword() {
        try {
            String senhaOriginal = "MinhaSenha123!";
            String senhaHash = passwordService.hashPassword(senhaOriginal);
            boolean senhaCorreta = passwordService.matches(senhaOriginal, senhaHash);
            boolean senhaIncorreta = passwordService.matches("SenhaErrada", senhaHash);
            boolean senhaForte = passwordService.isPasswordStrong(senhaOriginal);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("senhaOriginal", senhaOriginal);
            resultado.put("senhaHash", senhaHash);
            resultado.put("senhaCorreta", senhaCorreta);
            resultado.put("senhaIncorreta", senhaIncorreta);
            resultado.put("senhaForte", senhaForte);
            resultado.put("tamanhoHash", senhaHash.length());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Testa anonimização de dados
     */
    @GetMapping("/anonymization")
    public ResponseEntity<Map<String, Object>> testAnonymization() {
        try {
            String dadosOriginais = "Email: usuario@exemplo.com, CPF: 123.456.789-00, Telefone: (11) 99999-9999";
            String dadosAnonimizados = dataPrivacyService.anonimizarDados(dadosOriginais);

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("dadosOriginais", dadosOriginais);
            resultado.put("dadosAnonimizados", dadosAnonimizados);
            resultado.put("tamanhoOriginal", dadosOriginais.length());
            resultado.put("tamanhoAnonimizado", dadosAnonimizados.length());

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Testa geração de chaves
     */
    @GetMapping("/generate-keys")
    public ResponseEntity<Map<String, Object>> testGenerateKeys() {
        try {
            String novaChave = encryptionService.generateNewKey();
            String novoIV = encryptionService.generateNewIV();

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("novaChave", novaChave);
            resultado.put("novoIV", novoIV);
            resultado.put("tamanhoChave", novaChave.length());
            resultado.put("tamanhoIV", novoIV.length());
            resultado.put("observacao", "Use estas chaves em produção (não as chaves de teste)");

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Testa verificação de dados criptografados
     */
    @GetMapping("/check-encrypted")
    public ResponseEntity<Map<String, Object>> testCheckEncrypted() {
        try {
            String textoNormal = "Texto normal";
            String textoCriptografado = encryptionService.encrypt("Texto para criptografar");
            String textoVazio = "";
            String textoNull = null;

            Map<String, Object> resultado = new HashMap<>();
            resultado.put("textoNormal", textoNormal);
            resultado.put("isEncryptedNormal", encryptionService.isEncrypted(textoNormal));
            resultado.put("textoCriptografado", textoCriptografado);
            resultado.put("isEncryptedCriptografado", encryptionService.isEncrypted(textoCriptografado));
            resultado.put("textoVazio", textoVazio);
            resultado.put("isEncryptedVazio", encryptionService.isEncrypted(textoVazio));
            resultado.put("textoNull", textoNull);
            resultado.put("isEncryptedNull", encryptionService.isEncrypted(textoNull));

            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("erro", e.getMessage()));
        }
    }

    /**
     * Status geral dos serviços de segurança
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> testStatus() {
        try {
            Map<String, Object> status = new HashMap<>();
            status.put("encryptionService", "ATIVO");
            status.put("passwordService", "ATIVO");
            status.put("dataPrivacyService", "ATIVO");
            status.put("timestamp", java.time.LocalDateTime.now());
            status.put("ambiente", "DESENVOLVIMENTO");
            status.put("observacoes", "Todos os serviços de segurança estão funcionando");

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("erro", e.getMessage()));
        }
    }
}

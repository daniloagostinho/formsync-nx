package br.com.backend.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileSecurityResult {
    
    /**
     * Nome do arquivo
     */
    private String fileName;
    
    /**
     * Tamanho do arquivo em bytes
     */
    private Long fileSize;
    
    /**
     * Timestamp da validação
     */
    private LocalDateTime timestamp;
    
        /**
     * Se o arquivo é seguro
     */
    private boolean secure;

    /**
     * Mensagem de resultado
     */
    private String message;

    /**
     * Códigos de problemas de segurança encontrados
     */
    private String securityIssues;

    /**
     * Se o arquivo foi colocado em quarentena
     */
    private boolean quarantined;
    
    /**
     * Caminho do arquivo em quarentena
     */
    private String quarantinePath;
    
    /**
     * Erro durante a validação (se houver)
     */
    private String error;
    
    /**
     * Detalhes adicionais da validação
     */
    private String details;
    
    /**
     * Tempo de processamento em milissegundos
     */
    private Long processingTimeMs;
    
    /**
     * Hash SHA-256 do arquivo para identificação única
     */
    private String fileHash;
    
    /**
     * Versão do scanner de malware usado
     */
    private String scannerVersion;
    
    /**
     * Data da última atualização das definições de vírus
     */
    private LocalDateTime lastVirusDefinitionsUpdate;
}

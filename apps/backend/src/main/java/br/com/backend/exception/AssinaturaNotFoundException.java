package br.com.backend.exception;

public class AssinaturaNotFoundException extends RuntimeException {
    
    public AssinaturaNotFoundException(String message) {
        super(message);
    }
    
    public AssinaturaNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}


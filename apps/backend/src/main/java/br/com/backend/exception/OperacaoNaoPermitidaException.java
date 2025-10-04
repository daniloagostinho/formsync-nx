package br.com.backend.exception;

public class OperacaoNaoPermitidaException extends RuntimeException {
    
    public OperacaoNaoPermitidaException(String message) {
        super(message);
    }
    
    public OperacaoNaoPermitidaException(String message, Throwable cause) {
        super(message, cause);
    }
}


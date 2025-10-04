package br.com.backend.exception;

import lombok.Getter;

@Getter
public class CampoInvalidoException extends RuntimeException {

    public CampoInvalidoException(String nomeCampo, String motivo) {
        super("Campo '" + nomeCampo + "' inválido: " + motivo);
    }

    public CampoInvalidoException(String mensagem) {
        super(mensagem);
    }
}
package br.com.backend.exception;

import lombok.Getter;

@Getter
public class UsuarioNaoEncontradoException extends RuntimeException {
    public UsuarioNaoEncontradoException(Long id) {
        super("Usuario com ID " + id + " nao foi encontrado.");
    }

    public UsuarioNaoEncontradoException(String email) {
        super("Usuario com e-mail " + email + " nao foi encontrado.");
    }
}

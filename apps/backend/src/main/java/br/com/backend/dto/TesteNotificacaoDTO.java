package br.com.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TesteNotificacaoDTO {
    private String tipo; // email, push, sms
}

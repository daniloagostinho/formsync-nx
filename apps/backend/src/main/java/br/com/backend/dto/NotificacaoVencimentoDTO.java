package br.com.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificacaoVencimentoDTO {
    private Long id;
    private Long usuarioId;
    private String titulo;
    private String mensagem;
    private String tipo;
    private String status;
    private LocalDateTime dataVencimento;
    private LocalDateTime dataEnvio;
    private Boolean lida;
    private LocalDateTime dataLeitura;
}

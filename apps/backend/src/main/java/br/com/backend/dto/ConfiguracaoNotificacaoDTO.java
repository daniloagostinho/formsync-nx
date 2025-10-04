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
public class ConfiguracaoNotificacaoDTO {
    private Long id;
    private Long usuarioId;
    private Boolean ativo;
    private Integer diasAntesVencimento;
    private Boolean emailAtivo;
    private Boolean pushAtivo;
    private Boolean smsAtivo;
    private String horarioNotificacao;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
}

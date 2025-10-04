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
public class EstatisticasNotificacaoDTO {
    private Long totalEnviadas;
    private Long totalLidas;
    private Long totalPendentes;
    private LocalDateTime ultimaNotificacao;
}

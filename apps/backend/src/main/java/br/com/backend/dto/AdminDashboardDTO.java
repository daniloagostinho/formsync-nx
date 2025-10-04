package br.com.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardDTO {
    private long totalAssinaturas;
    private long assinaturasAtivas;
    private long assinaturasCanceladas;
    private long reembolsosPendentes;
    private long reembolsosProcessados;
    private double valorTotalReembolsos;
    private long cancelamentosUltimos30Dias;
}

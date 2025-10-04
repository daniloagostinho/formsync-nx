package br.com.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class PagamentoService {
    public boolean cobrarUsuario(Long usuarioId, String plano) {
        // Simulação de cobrança. No futuro, integre com Stripe, Mercado Pago etc.
        log.info("💰 Cobrando usuário {} pelo plano {}", usuarioId, plano);
        return true; // ou false para simular falha
    }
}
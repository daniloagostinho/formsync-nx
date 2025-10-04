package br.com.backend;

import br.com.backend.entity.Assinatura;
import br.com.backend.repository.AssinaturaRepository;
import br.com.backend.service.AssinaturaService;
import br.com.backend.service.CobrancaScheduler;
import br.com.backend.service.PagamentoService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.test.annotation.DirtiesContext;

import java.time.LocalDateTime;

@SpringBootTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AssinaturaRetryIntegrationTest {

    @Autowired
    private AssinaturaService assinaturaService;
    @Autowired
    private AssinaturaRepository assinaturaRepository;
    @Autowired
    private CobrancaScheduler cobrancaScheduler;
    @SpyBean
    private PagamentoService pagamentoService;

    private Assinatura assinatura;

    @BeforeEach
    void setup() {
        assinatura = assinaturaService.criarAssinatura(999L, "PROFISSIONAL");
        assinatura.setDataProximaCobranca(LocalDateTime.now().minusDays(1));
        assinatura.setTentativas(0);
        assinatura.setStatus("ATIVA");
        assinaturaRepository.save(assinatura);
    }

    @Test
    void testRetryAutomaticoFalhaDepoisSucesso() {
        // Simula 2 falhas
        Mockito.doReturn(false).when(pagamentoService).cobrarUsuario(Mockito.anyLong(), Mockito.anyString());
        cobrancaScheduler.processarCobrancas();
        Assinatura a1 = assinaturaRepository.findById(assinatura.getId()).orElseThrow();
        Assertions.assertEquals(1, a1.getTentativas());
        Assertions.assertEquals("ATIVA", a1.getStatus());

        cobrancaScheduler.processarCobrancas();
        Assinatura a2 = assinaturaRepository.findById(assinatura.getId()).orElseThrow();
        Assertions.assertEquals(2, a2.getTentativas());
        Assertions.assertEquals("ATIVA", a2.getStatus());

        // Na terceira, simula sucesso
        Mockito.doReturn(true).when(pagamentoService).cobrarUsuario(Mockito.anyLong(), Mockito.anyString());
        cobrancaScheduler.processarCobrancas();
        Assinatura a3 = assinaturaRepository.findById(assinatura.getId()).orElseThrow();
        Assertions.assertEquals(0, a3.getTentativas());
        Assertions.assertEquals("ATIVA", a3.getStatus());
        Assertions.assertTrue(a3.getDataProximaCobranca().isAfter(LocalDateTime.now()));
    }

    @Test
    void testRetryAutomaticoLimiteInadimplente() {
        // Simula sempre falha
        Mockito.doReturn(false).when(pagamentoService).cobrarUsuario(Mockito.anyLong(), Mockito.anyString());
        cobrancaScheduler.processarCobrancas();
        cobrancaScheduler.processarCobrancas();
        cobrancaScheduler.processarCobrancas();
        Assinatura a = assinaturaRepository.findById(assinatura.getId()).orElseThrow();
        Assertions.assertEquals(3, a.getTentativas());
        Assertions.assertEquals("INADIMPLENTE", a.getStatus());
    }
} 
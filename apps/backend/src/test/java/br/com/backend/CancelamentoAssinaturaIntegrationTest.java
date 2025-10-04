package br.com.backend;

import br.com.backend.dto.CancelarAssinaturaDTO;
import br.com.backend.dto.CancelamentoResponseDTO;
import br.com.backend.entity.Assinatura;
import br.com.backend.repository.AssinaturaRepository;
import br.com.backend.service.AssinaturaService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;

import java.time.LocalDateTime;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class CancelamentoAssinaturaIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private AssinaturaService assinaturaService;

    @Autowired
    private AssinaturaRepository assinaturaRepository;

    private Assinatura assinatura;
    private String baseUrl;

    @BeforeEach
    void setup() {
        baseUrl = "http://localhost:" + port + "/api/v1/assinaturas";
        
        // Criar assinatura de teste
        assinatura = assinaturaService.criarAssinatura(999L, "PROFISSIONAL");
        assinatura.setStatus("ATIVA");
        assinatura.setDataProximaCobranca(LocalDateTime.now().plusMonths(1));
        assinaturaRepository.save(assinatura);
    }

    @Test
    void testCancelarAssinaturaComSucesso() {
        // Preparar dados do cancelamento
        CancelarAssinaturaDTO dto = new CancelarAssinaturaDTO();
        dto.setMotivo("Teste de cancelamento - motivo válido com mais de 10 caracteres");
        dto.setSolicitarReembolso(false);

        // Fazer requisição
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<CancelarAssinaturaDTO> request = new HttpEntity<>(dto, headers);

        ResponseEntity<CancelamentoResponseDTO> response = restTemplate.exchange(
            baseUrl + "/" + assinatura.getId() + "/cancelar",
            HttpMethod.POST,
            request,
            CancelamentoResponseDTO.class
        );

        // Verificar resposta
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
        
        CancelamentoResponseDTO cancelamento = response.getBody();
        Assertions.assertEquals(assinatura.getId(), cancelamento.getAssinaturaId());
        Assertions.assertEquals("CANCELADA", cancelamento.getStatus());
        Assertions.assertEquals(dto.getMotivo(), cancelamento.getMotivo());
        Assertions.assertFalse(cancelamento.getReembolsoSolicitado());
        Assertions.assertNotNull(cancelamento.getDataCancelamento());
        Assertions.assertNotNull(cancelamento.getDataFim());

        // Verificar se assinatura foi atualizada no banco
        Assinatura assinaturaAtualizada = assinaturaRepository.findById(assinatura.getId()).orElse(null);
        Assertions.assertNotNull(assinaturaAtualizada);
        Assertions.assertEquals("CANCELADA", assinaturaAtualizada.getStatus());
        Assertions.assertNotNull(assinaturaAtualizada.getDataFim());
    }

    @Test
    void testCancelarAssinaturaComReembolso() {
        // Preparar dados do cancelamento com reembolso
        CancelarAssinaturaDTO dto = new CancelarAssinaturaDTO();
        dto.setMotivo("Teste de cancelamento com reembolso - motivo válido com mais de 10 caracteres");
        dto.setSolicitarReembolso(true);

        // Fazer requisição
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<CancelarAssinaturaDTO> request = new HttpEntity<>(dto, headers);

        ResponseEntity<CancelamentoResponseDTO> response = restTemplate.exchange(
            baseUrl + "/" + assinatura.getId() + "/cancelar",
            HttpMethod.POST,
            request,
            CancelamentoResponseDTO.class
        );

        // Verificar resposta
        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
        
        CancelamentoResponseDTO cancelamento = response.getBody();
        Assertions.assertTrue(cancelamento.getReembolsoSolicitado());
    }

    @Test
    void testCancelarAssinaturaComMotivoInvalido() {
        // Preparar dados com motivo muito curto
        CancelarAssinaturaDTO dto = new CancelarAssinaturaDTO();
        dto.setMotivo("Curto"); // Menos de 10 caracteres
        dto.setSolicitarReembolso(false);

        // Fazer requisição
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<CancelarAssinaturaDTO> request = new HttpEntity<>(dto, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/" + assinatura.getId() + "/cancelar",
            HttpMethod.POST,
            request,
            String.class
        );

        // Verificar que retornou erro de validação
        Assertions.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testCancelarAssinaturaJaCancelada() {
        // Primeiro cancelamento
        CancelarAssinaturaDTO dto1 = new CancelarAssinaturaDTO();
        dto1.setMotivo("Primeiro cancelamento - motivo válido com mais de 10 caracteres");
        
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<CancelarAssinaturaDTO> request1 = new HttpEntity<>(dto1, headers);

        restTemplate.exchange(
            baseUrl + "/" + assinatura.getId() + "/cancelar",
            HttpMethod.POST,
            request1,
            CancelamentoResponseDTO.class
        );

        // Tentar cancelar novamente
        CancelarAssinaturaDTO dto2 = new CancelarAssinaturaDTO();
        dto2.setMotivo("Segundo cancelamento - motivo válido com mais de 10 caracteres");
        
        HttpEntity<CancelarAssinaturaDTO> request2 = new HttpEntity<>(dto2, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/" + assinatura.getId() + "/cancelar",
            HttpMethod.POST,
            request2,
            String.class
        );

        // Verificar que retornou erro
        Assertions.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testCancelarAssinaturaInexistente() {
        // Preparar dados
        CancelarAssinaturaDTO dto = new CancelarAssinaturaDTO();
        dto.setMotivo("Teste de cancelamento - motivo válido com mais de 10 caracteres");

        // Fazer requisição para ID inexistente
        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");
        HttpEntity<CancelarAssinaturaDTO> request = new HttpEntity<>(dto, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/99999/cancelar",
            HttpMethod.POST,
            request,
            String.class
        );

        // Verificar que retornou erro 404
        Assertions.assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }
} 
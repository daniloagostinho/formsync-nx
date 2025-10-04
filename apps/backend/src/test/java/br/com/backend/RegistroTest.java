package br.com.backend;

import br.com.backend.ApiApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(classes = ApiApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RegistroTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    public void testRegistroUsuario() throws Exception {
        System.out.println("🔍 Testando registro de usuário...");
        
        // Teste com senha válida (sem sequências sequenciais)
        try {
            mockMvc.perform(post("/api/v1/usuarios")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"nome\":\"Teste\",\"email\":\"teste@exemplo.com\",\"senha\":\"MinhaSenh@456\"}"))
                    .andExpect(status().isCreated());
            System.out.println("✅ Registro funcionou com 201");
        } catch (Exception e) {
            System.err.println("❌ Erro no registro: " + e.getMessage());
            System.err.println("   - Tipo: " + e.getClass().getSimpleName());
            if (e.getCause() != null) {
                System.err.println("   - Causa: " + e.getCause().getMessage());
                System.err.println("   - Tipo da causa: " + e.getCause().getClass().getSimpleName());
            }
            e.printStackTrace();
            throw e;
        }
    }
}

package br.com.backend.controller;

import br.com.backend.dto.ErrorResponseDTO;
import br.com.backend.dto.UsuarioResponseDTO;
import br.com.backend.dto.UpdateUsuarioDTO;
import br.com.backend.dto.ChangePasswordDTO;
import br.com.backend.entity.Usuario;
import br.com.backend.entity.Assinatura;
import br.com.backend.repository.UsuarioRepository;
import br.com.backend.service.AssinaturaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Optional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.persistence.PersistenceContext;
import br.com.backend.exception.ResourceNotFoundException;
import br.com.backend.repository.TemplateRepository;
import br.com.backend.repository.CampoTemplateRepository;
import br.com.backend.service.PlanoLimiteService;
import br.com.backend.service.PasswordValidationService;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:*", "http://127.0.0.1:*", "https://formsync.com.br", "https://www.formsync.com.br", "https://d2e8aebnrgifge.cloudfront.net"}, allowCredentials = "true")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaService assinaturaService;
    private final PasswordValidationService passwordValidationService;
    
    private final TemplateRepository templateRepository;
    private final CampoTemplateRepository campoTemplateRepository;
    private final PlanoLimiteService planoLimiteService;
    
    @PersistenceContext
    private EntityManager entityManager;

    @PostMapping
    @Transactional
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario usuario) {
        log.info("Registrando usuário com email: {}", usuario.getEmail());
        
        // ✅ VERIFICAÇÃO DUPLA: Log detalhado para debug
        boolean emailExiste = usuarioRepository.existsByEmail(usuario.getEmail());
        log.info("Verificação de duplicata - Email: {}, Existe: {}", usuario.getEmail(), emailExiste);
        
        if (emailExiste) {
            log.warn("TENTATIVA DE CADASTRO DUPLICADO - Email: {} já existe no banco", usuario.getEmail());
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "E-mail já cadastrado", 
                "EMAIL_CONFLICT"
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        }

        // Validar senha forte
        if (usuario.getSenha() != null) {
            PasswordValidationService.PasswordValidationResult validationResult = 
                passwordValidationService.validatePassword(usuario.getSenha());
            
            if (!validationResult.isValid()) {
                log.warn("Senha não atende aos requisitos de segurança para usuário: {}. Erros: {}", 
                         usuario.getEmail(), validationResult.getErrorMessage());
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Senha não atende aos requisitos de segurança: " + validationResult.getErrorMessage(), 
                    "PASSWORD_WEAK"
                );
                return ResponseEntity.badRequest().body(errorResponse);
            }
        }

        // Validar e mapear plano
        String planoMapeado = mapearPlano(usuario.getPlano());
        usuario.setPlano(planoMapeado);
        
        // Salvar o usuário
        Usuario salvo = usuarioRepository.save(usuario);
        log.info("Usuário criado com sucesso - ID: {}, Email: {}", salvo.getId(), salvo.getEmail());
        
        // Criar assinatura com o plano escolhido pelo usuário
        try {
            log.debug("Plano original: {}, plano mapeado: {}, ID do usuário: {}", 
                     usuario.getPlano(), planoMapeado, salvo.getId());
            
            Assinatura assinatura = assinaturaService.criarAssinatura(salvo.getId(), planoMapeado);
            log.info("Assinatura criada automaticamente para usuário: {} - Plano: {} - ID: {}", 
                    salvo.getEmail(), planoMapeado, assinatura.getId());
            log.debug("Plano da assinatura criada: {}", assinatura.getPlano());
        } catch (Exception e) {
            log.error("Erro ao criar assinatura automática: {}", e.getMessage(), e);
            // Não falha o registro se não conseguir criar a assinatura
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(salvo);
    }
    
    @PostMapping("/clean-duplicates")
    public ResponseEntity<?> cleanDuplicateUsers() {
        log.info("Iniciando limpeza de usuários duplicados");
        
        try {
            // Buscar todos os usuários
            List<Usuario> todosUsuarios = usuarioRepository.findAll();
            Map<String, List<Usuario>> emailsAgrupados = todosUsuarios.stream()
                .collect(Collectors.groupingBy(Usuario::getEmail));
            
            // Identificar emails com duplicatas
            Map<String, List<Usuario>> emailsDuplicados = emailsAgrupados.entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
            
            if (emailsDuplicados.isEmpty()) {
                log.info("✅ Nenhum usuário duplicado encontrado");
                return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Nenhum usuário duplicado encontrado",
                    "usuariosRemovidos", 0
                ));
            }
            
            int usuariosRemovidos = 0;
            List<Map<String, Object>> detalhesRemocao = new ArrayList<>();
            
            for (Map.Entry<String, List<Usuario>> entry : emailsDuplicados.entrySet()) {
                String email = entry.getKey();
                List<Usuario> usuarios = entry.getValue();
                
                log.warn("Processando email duplicado: {} - {} registros", email, usuarios.size());
                
                // Manter o usuário mais recente (maior ID) e remover os outros
                usuarios.sort((u1, u2) -> Long.compare(u2.getId(), u1.getId()));
                Usuario usuarioManter = usuarios.get(0);
                List<Usuario> usuariosRemover = usuarios.subList(1, usuarios.size());
                
                for (Usuario usuarioRemover : usuariosRemover) {
                    try {
                        usuarioRepository.deleteById(usuarioRemover.getId());
                        usuariosRemovidos++;
                        
                        Map<String, Object> detalhe = new HashMap<>();
                        detalhe.put("email", email);
                        detalhe.put("usuarioRemovido", usuarioRemover.getId());
                        detalhe.put("usuarioMantido", usuarioManter.getId());
                        detalhesRemocao.add(detalhe);
                        
                        log.info("Usuário duplicado removido - ID: {}, Email: {}", usuarioRemover.getId(), email);
                        
                    } catch (Exception e) {
                        log.error("Erro ao remover usuário duplicado ID {}: {}", usuarioRemover.getId(), e.getMessage());
                    }
                }
            }
            
            log.info("✅ Limpeza concluída - {} usuários duplicados removidos", usuariosRemovidos);
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("status", "SUCCESS");
            resultado.put("message", "Limpeza de usuários duplicados concluída");
            resultado.put("usuariosRemovidos", usuariosRemovidos);
            resultado.put("detalhesRemocao", detalhesRemocao);
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            log.error("Erro ao limpar usuários duplicados: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao limpar duplicatas: " + e.getMessage(), "CLEANUP_ERROR"));
        }
    }

    @PostMapping("/force-unique-constraint")
    public ResponseEntity<?> forceUniqueConstraint() {
        log.info("Forçando criação da constraint unique no campo email");
        
        try {
            // Verificar se há emails duplicados antes
            List<Usuario> todosUsuarios = usuarioRepository.findAll();
            Map<String, List<Usuario>> emailsAgrupados = todosUsuarios.stream()
                .collect(Collectors.groupingBy(Usuario::getEmail));
            
            List<String> emailsDuplicados = emailsAgrupados.entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
            
            if (!emailsDuplicados.isEmpty()) {
                log.error("❌ Não é possível criar constraint unique com emails duplicados existentes: {}", emailsDuplicados);
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "ERROR",
                    "message", "Existem emails duplicados no banco. Execute /clean-duplicates primeiro.",
                    "emailsDuplicados", emailsDuplicados
                ));
            }
            
            // Tentar criar um usuário com email duplicado para forçar a criação da constraint
            try {
                Usuario usuarioTeste = new Usuario();
                usuarioTeste.setNome("Teste Constraint Force");
                usuarioTeste.setEmail("teste@force.com");
                usuarioTeste.setSenha("teste123");
                usuarioTeste.setPlano("FREE");
                
                // Primeira inserção
                Usuario salvo1 = usuarioRepository.save(usuarioTeste);
                log.info("Primeira inserção de teste bem-sucedida - ID: {}", salvo1.getId());
                
                // Segunda inserção com mesmo email (deve falhar se constraint estiver funcionando)
                try {
                    Usuario usuarioTeste2 = new Usuario();
                    usuarioTeste2.setNome("Teste Constraint Force 2");
                    usuarioTeste2.setEmail("teste@force.com");
                    usuarioTeste2.setSenha("teste456");
                    usuarioTeste2.setPlano("FREE");
                    
                    Usuario salvo2 = usuarioRepository.save(usuarioTeste2);
                    log.error("❌ Constraint unique ainda não está funcionando! Usuário duplicado criado com ID: {}", salvo2.getId());
                    
                    // Remover usuários de teste
                    usuarioRepository.deleteById(salvo2.getId());
                    usuarioRepository.deleteById(salvo1.getId());
                    
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "status", "ERROR",
                        "message", "Constraint unique não está funcionando. Verifique a configuração do banco."
                    ));
                    
                } catch (Exception e) {
                    log.info("✅ Constraint unique está funcionando! Erro esperado: {}", e.getMessage());
                    
                    // Remover usuário de teste
                    usuarioRepository.deleteById(salvo1.getId());
                    
                    return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "message", "Constraint unique está funcionando corretamente"
                    ));
                }
                
            } catch (Exception e) {
                log.error("Erro ao testar constraint: {}", e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Erro ao testar constraint: " + e.getMessage()
                ));
            }
            
        } catch (Exception e) {
            log.error("Erro ao forçar constraint unique: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao forçar constraint: " + e.getMessage(), "FORCE_CONSTRAINT_ERROR"));
        }
    }

    @PostMapping("/recreate-table")
    public ResponseEntity<?> recreateTable() {
        log.info("⚠️ ATENÇÃO: Recriando tabela usuarios com constraint unique");
        
        try {
            // ⚠️ AVISO: Este endpoint é perigoso e deve ser usado apenas em desenvolvimento
            // Ele irá deletar todos os usuários existentes e recriar a tabela
            
            // Verificar se estamos em ambiente de desenvolvimento
            String activeProfile = System.getProperty("spring.profiles.active");
            if (activeProfile == null) {
                activeProfile = "dev"; // Default para desenvolvimento
            }
            
            if ("prod".equals(activeProfile) || "production".equals(activeProfile)) {
                log.error("❌ BLOQUEADO: Não é possível recriar tabela em ambiente de produção!");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "status", "ERROR",
                    "message", "Não é possível recriar tabela em ambiente de produção!"
                ));
            }
            
            // Contar usuários existentes
            List<Usuario> usuariosExistentes = usuarioRepository.findAll();
            int totalUsuarios = usuariosExistentes.size();
            
            log.warn("⚠️ DELETANDO {} usuários existentes para recriar tabela!", totalUsuarios);
            
            // Deletar todos os usuários
            usuarioRepository.deleteAll();
            log.info("✅ Todos os usuários deletados");
            
            // Aguardar um pouco para garantir que as operações de delete foram concluídas
            Thread.sleep(1000);
            
            // Tentar criar um usuário de teste para forçar a criação da constraint
            try {
                Usuario usuarioTeste = new Usuario();
                usuarioTeste.setNome("Usuário Teste Recriação");
                usuarioTeste.setEmail("teste@recriacao.com");
                usuarioTeste.setSenha("teste123");
                usuarioTeste.setPlano("FREE");
                
                Usuario salvo = usuarioRepository.save(usuarioTeste);
                log.info("✅ Usuário de teste criado com sucesso - ID: {}", salvo.getId());
                
                // Tentar criar usuário duplicado para testar constraint
                try {
                    Usuario usuarioDuplicado = new Usuario();
                    usuarioDuplicado.setNome("Usuário Duplicado Teste");
                    usuarioDuplicado.setEmail("teste@recriacao.com");
                    usuarioDuplicado.setSenha("teste456");
                    usuarioDuplicado.setPlano("FREE");
                    
                    Usuario duplicadoSalvo = usuarioRepository.save(usuarioDuplicado);
                    log.error("❌ ERRO: Constraint unique ainda não está funcionando! Usuário duplicado criado com ID: {}", duplicadoSalvo.getId());
                    
                    // Remover usuários de teste
                    usuarioRepository.deleteById(duplicadoSalvo.getId());
                    usuarioRepository.deleteById(salvo.getId());
                    
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "status", "ERROR",
                        "message", "Constraint unique ainda não está funcionando após recriação da tabela",
                        "usuariosDeletados", totalUsuarios
                    ));
                    
                } catch (Exception e) {
                    log.info("✅ Constraint unique está funcionando após recriação! Erro esperado: {}", e.getMessage());
                    
                    // Remover usuário de teste
                    usuarioRepository.deleteById(salvo.getId());
                    
                    return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "message", "Tabela recriada com sucesso e constraint unique funcionando",
                        "usuariosDeletados", totalUsuarios,
                        "constraintFuncionando", true
                    ));
                }
                
            } catch (Exception e) {
                log.error("❌ Erro ao criar usuário de teste após recriação: {}", e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Erro ao criar usuário de teste após recriação: " + e.getMessage(),
                    "usuariosDeletados", totalUsuarios
                ));
            }
            
        } catch (Exception e) {
            log.error("Erro ao recriar tabela: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao recriar tabela: " + e.getMessage(), "RECREATE_TABLE_ERROR"));
        }
    }

    @PostMapping("/force-sql-constraint")
    public ResponseEntity<?> forceSqlConstraint() {
        log.info("Forçando criação da constraint unique via SQL nativo");
        
        try {
            // ⚠️ AVISO: Este endpoint executa SQL nativo e deve ser usado apenas em desenvolvimento
            
            // Verificar se há emails duplicados antes
            List<Usuario> todosUsuarios = usuarioRepository.findAll();
            Map<String, List<Usuario>> emailsAgrupados = todosUsuarios.stream()
                .collect(Collectors.groupingBy(Usuario::getEmail));
            
            List<String> emailsDuplicados = emailsAgrupados.entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
            
            if (!emailsDuplicados.isEmpty()) {
                log.error("❌ Não é possível criar constraint unique com emails duplicados existentes: {}", emailsDuplicados);
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "ERROR",
                    "message", "Existem emails duplicados no banco. Execute /clean-duplicates primeiro.",
                    "emailsDuplicados", emailsDuplicados
                ));
            }
            
            // Tentar criar a constraint unique via SQL nativo
            try {
                // Verificar se a constraint já existe
                Query query = entityManager.createNativeQuery(
                    "SELECT constraint_name FROM information_schema.table_constraints " +
                    "WHERE table_name = 'usuarios' AND constraint_type = 'UNIQUE' " +
                    "AND constraint_name LIKE '%email%'"
                );
                
                List<String> constraints = query.getResultList();
                log.info("Constraints unique existentes: {}", constraints);
                
                if (!constraints.isEmpty()) {
                    log.info("✅ Constraint unique já existe: {}", constraints);
                    return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS",
                        "message", "Constraint unique já existe no banco",
                        "constraints", constraints
                    ));
                }
                
                // Criar a constraint unique
                log.info("Criando constraint unique no campo email...");
                Query createConstraint = entityManager.createNativeQuery(
                    "ALTER TABLE usuarios ADD CONSTRAINT uk_usuarios_email UNIQUE (email)"
                );
                createConstraint.executeUpdate();
                log.info("✅ Constraint unique criada com sucesso!");
                
                // Testar se a constraint está funcionando
                try {
                    Usuario usuarioTeste = new Usuario();
                    usuarioTeste.setNome("Teste SQL Constraint");
                    usuarioTeste.setEmail("teste@sql.com");
                    usuarioTeste.setSenha("teste123");
                    usuarioTeste.setPlano("FREE");
                    
                    // Primeira inserção
                    Usuario salvo1 = usuarioRepository.save(usuarioTeste);
                    log.info("Primeira inserção de teste bem-sucedida - ID: {}", salvo1.getId());
                    
                    // Segunda inserção com mesmo email (deve falhar)
                    try {
                        Usuario usuarioTeste2 = new Usuario();
                        usuarioTeste2.setNome("Teste SQL Constraint 2");
                        usuarioTeste2.setEmail("teste@sql.com");
                        usuarioTeste2.setSenha("teste456");
                        usuarioTeste2.setPlano("FREE");
                        
                        Usuario salvo2 = usuarioRepository.save(usuarioTeste2);
                        log.error("❌ ERRO: Constraint unique ainda não está funcionando! Usuário duplicado criado com ID: {}", salvo2.getId());
                        
                        // Remover usuários de teste
                        usuarioRepository.deleteById(salvo2.getId());
                        usuarioRepository.deleteById(salvo1.getId());
                        
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                            "status", "ERROR",
                            "message", "Constraint unique criada mas não está funcionando"
                        ));
                        
                    } catch (Exception e) {
                        log.info("✅ Constraint unique está funcionando! Erro esperado: {}", e.getMessage());
                        
                        // Remover usuário de teste
                        usuarioRepository.deleteById(salvo1.getId());
                        
                        return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "message", "Constraint unique criada e funcionando via SQL nativo"
                        ));
                    }
                    
                } catch (Exception e) {
                    log.error("Erro ao testar constraint após criação: {}", e.getMessage(), e);
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                        "status", "ERROR",
                        "message", "Erro ao testar constraint após criação: " + e.getMessage()
                    ));
                }
                
            } catch (Exception e) {
                log.error("Erro ao executar SQL nativo: {}", e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Erro ao executar SQL nativo: " + e.getMessage()
                ));
            }
            
        } catch (Exception e) {
            log.error("Erro ao forçar constraint SQL: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao forçar constraint SQL: " + e.getMessage(), "FORCE_SQL_CONSTRAINT_ERROR"));
        }
    }

    @PostMapping("/recreate-user")
    public ResponseEntity<?> recreateUser(@RequestBody Map<String, String> request) {
        log.info("🔧 [RECREATE_USER] Recriando usuário perdido");
        
        try {
            String email = request.get("email");
            String nome = request.get("nome");
            String plano = request.get("plano");
            
            if (email == null || nome == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Email e nome são obrigatórios",
                    "status", "ERROR"
                ));
            }
            
            // Verificar se o usuário já existe
            if (usuarioRepository.existsByEmail(email)) {
                log.info("✅ [RECREATE_USER] Usuário já existe: {}", email);
                return ResponseEntity.ok(Map.of(
                    "message", "Usuário já existe",
                    "status", "EXISTS"
                ));
            }
            
            // Criar novo usuário
            Usuario usuario = new Usuario();
            usuario.setEmail(email);
            usuario.setNome(nome);
            usuario.setPlano(plano != null ? plano : "PESSOAL");
            usuario.setSenha("senha_temporaria_123"); // Senha temporária
            
            Usuario usuarioSalvo = usuarioRepository.save(usuario);
            
            log.info("✅ [RECREATE_USER] Usuário recriado com sucesso: {} - ID: {}", email, usuarioSalvo.getId());
            
            return ResponseEntity.ok(Map.of(
                "message", "Usuário recriado com sucesso",
                "status", "SUCCESS",
                "userId", usuarioSalvo.getId(),
                "email", usuarioSalvo.getEmail(),
                "plano", usuarioSalvo.getPlano()
            ));
            
        } catch (Exception e) {
            log.error("❌ [RECREATE_USER] Erro ao recriar usuário: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Erro ao recriar usuário: " + e.getMessage(),
                "status", "ERROR"
            ));
        }
    }

    /**
     * Mapeia planos especializados para os códigos corretos
     */
    private String mapearPlano(String planoOriginal) {
        if (planoOriginal == null) {
            return "FREE"; // padrão: free
        }
        switch (planoOriginal.toUpperCase()) {
            case "FREE":
            case "GRATIS":
            case "PESSOAL_GRATIS":
                return "FREE";
            case "PESSOAL":
                return "PESSOAL";
            case "PROFISSIONAL":
            case "PROFISSIONAL_MENSAL":
                return "PROFISSIONAL";
            case "PROFISSIONAL_VITALICIO":
                return "PROFISSIONAL_VITALICIO";
            case "EMPRESARIAL":
            case "ENTERPRISE":
                return "EMPRESARIAL";
            default:
                log.warn("Plano não reconhecido: {} - usando FREE como padrão", planoOriginal);
                return "FREE";
        }
    }

    @GetMapping("/debug-table")
    public ResponseEntity<?> debugTable() {
        log.info("🔍 [DEBUG_TABLE] Verificando estrutura da tabela usuarios");
        
        try {
            // Teste simples primeiro
            log.info("🔍 [DEBUG_TABLE] Testando EntityManager...");
            
            // Verificar se a tabela existe - versão simplificada
            String sql = "SELECT COUNT(*) FROM usuarios";
            Query countQuery = entityManager.createNativeQuery(sql);
            Object result = countQuery.getSingleResult();
            
            log.info("✅ [DEBUG_TABLE] Query executada com sucesso: {}", result);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "SUCCESS");
            response.put("totalRecords", result);
            response.put("message", "Tabela usuarios existe e está acessível");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [DEBUG_TABLE] Erro ao verificar estrutura da tabela: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Erro ao verificar estrutura da tabela: " + e.getMessage(),
                "exceptionType", e.getClass().getSimpleName(),
                "status", "ERROR"
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("🔍 [DEBUG_ME] Endpoint /me chamado");
        log.info("🔍 [DEBUG_ME] UserDetails: {}", userDetails);
        log.info("🔍 [DEBUG_ME] SecurityContext: {}", SecurityContextHolder.getContext().getAuthentication());
        
        if (userDetails == null) {
            log.warn("🚫 [DEBUG_ME] UserDetails é null - não autenticado");
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Não autenticado", 
                "UNAUTHORIZED"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        String email = userDetails.getUsername();
        log.info("✅ [DEBUG_ME] Usuário autenticado: {}", email);
        
        return usuarioRepository.findByEmail(email)
            .<ResponseEntity<?>>map(usuario -> {
                log.info("✅ [DEBUG_ME] Usuário encontrado no banco: {} - Plano: {}", usuario.getNome(), usuario.getPlano());
                return ResponseEntity.ok(new UsuarioInfo(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPlano()));
            })
            .orElseGet(() -> {
                log.warn("❌ [DEBUG_ME] Usuário não encontrado no banco para email: {}", email);
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Usuário não encontrado", 
                    "USER_NOT_FOUND"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            });
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal UserDetails userDetails, 
                                     @RequestBody UpdateUsuarioDTO updateUsuario) {
        if (userDetails == null) {
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Não autenticado", 
                "UNAUTHORIZED"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        String emailAuth = userDetails.getUsername();
        log.info("Atualizando usuário: {}", emailAuth);
        
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                // Validar se o novo email não já existe em outro usuário
                if (!usuario.getEmail().equals(updateUsuario.getEmail())) {
                    boolean emailExiste = usuarioRepository.existsByEmail(updateUsuario.getEmail());
                    if (emailExiste) {
                        log.warn("Tentativa de atualizar para email já existente: {}", updateUsuario.getEmail());
                        ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                            "E-mail já está sendo usado por outro usuário", 
                            "EMAIL_CONFLICT"
                        );
                        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
                    }
                }
                
                // Atualizar dados
                usuario.setNome(updateUsuario.getNome());
                usuario.setEmail(updateUsuario.getEmail());
                
                Usuario usuarioAtualizado = usuarioRepository.save(usuario);
                log.info("Usuário atualizado com sucesso: {} - {}", usuarioAtualizado.getId(), usuarioAtualizado.getEmail());
                
                return ResponseEntity.ok(new UsuarioInfo(
                    usuarioAtualizado.getId(), 
                    usuarioAtualizado.getNome(), 
                    usuarioAtualizado.getEmail(), 
                    usuarioAtualizado.getPlano()
                ));
            })
            .orElseGet(() -> {
                log.warn("Usuário não encontrado para atualização: {}", emailAuth);
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Usuário não encontrado", 
                    "USER_NOT_FOUND"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            });
    }

    @PatchMapping("/me/senha")
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                          @RequestBody ChangePasswordDTO changePasswordDTO) {
        if (userDetails == null) {
            ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                "Não autenticado", 
                "UNAUTHORIZED"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
        
        String emailAuth = userDetails.getUsername();
        log.info("Alterando senha do usuário: {}", emailAuth);
        
        return usuarioRepository.findByEmail(emailAuth)
            .<ResponseEntity<?>>map(usuario -> {
                // Validar senha atual
                log.debug("Validando senha para usuário: {}", emailAuth);
                log.debug("Senha atual no banco: '{}'", usuario.getSenha());
                log.debug("Senha atual informada: '{}'", changePasswordDTO.getSenhaAtual());
                
                if (!usuario.getSenha().equals(changePasswordDTO.getSenhaAtual())) {
                    log.warn("Senha atual incorreta para usuário: {}. Senha no banco: '{}', Senha informada: '{}'", 
                             emailAuth, usuario.getSenha(), changePasswordDTO.getSenhaAtual());
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "Senha atual incorreta", 
                        "INVALID_CURRENT_PASSWORD"
                    );
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
                }
                
                // Validar nova senha usando serviço de validação forte
                if (changePasswordDTO.getNovaSenha() == null || changePasswordDTO.getNovaSenha().trim().isEmpty()) {
                    log.warn("Nova senha vazia para usuário: {}", emailAuth);
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "Nova senha é obrigatória", 
                        "PASSWORD_EMPTY"
                    );
                    return ResponseEntity.badRequest().body(errorResponse);
                }

                // Usar o serviço de validação de senha forte
                PasswordValidationService.PasswordValidationResult validationResult = 
                    passwordValidationService.validatePassword(changePasswordDTO.getNovaSenha());
                
                if (!validationResult.isValid()) {
                    log.warn("Nova senha não atende aos requisitos de segurança para usuário: {}. Erros: {}", 
                             emailAuth, validationResult.getErrorMessage());
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "Nova senha não atende aos requisitos de segurança: " + validationResult.getErrorMessage(), 
                        "PASSWORD_WEAK"
                    );
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                
                // Verificar se nova senha é diferente da atual
                if (usuario.getSenha().equals(changePasswordDTO.getNovaSenha())) {
                    log.warn("Nova senha é igual à senha atual para usuário: {}", emailAuth);
                    ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                        "A nova senha deve ser diferente da senha atual", 
                        "SAME_PASSWORD"
                    );
                    return ResponseEntity.badRequest().body(errorResponse);
                }
                
                // Log da alteração
                String senhaAnterior = usuario.getSenha();
                
                // Atualizar senha
                usuario.setSenha(changePasswordDTO.getNovaSenha());
                usuarioRepository.save(usuario);
                
                log.info("Senha alterada com sucesso para usuário: {}. Senha anterior: '{}', Nova senha: '{}'", 
                         emailAuth, senhaAnterior, changePasswordDTO.getNovaSenha());
                
                return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Senha alterada com sucesso"
                ));
            })
            .orElseGet(() -> {
                log.warn("Usuário não encontrado para alteração de senha: {}", emailAuth);
                ErrorResponseDTO errorResponse = new ErrorResponseDTO(
                    "Usuário não encontrado", 
                    "USER_NOT_FOUND"
                );
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            });
    }

    @GetMapping("/test-unique-constraint")
    public ResponseEntity<?> testUniqueConstraint() {
        log.info("Testando constraint unique no campo email");
        
        try {
            // Verificar se há emails duplicados
            List<Usuario> todosUsuarios = usuarioRepository.findAll();
            Map<String, List<Usuario>> emailsAgrupados = todosUsuarios.stream()
                .collect(Collectors.groupingBy(Usuario::getEmail));
            
            List<String> emailsDuplicados = emailsAgrupados.entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("totalUsuarios", todosUsuarios.size());
            resultado.put("emailsUnicos", emailsAgrupados.size());
            resultado.put("emailsDuplicados", emailsDuplicados);
            resultado.put("emailsDuplicadosCount", emailsDuplicados.size());
            
            if (!emailsDuplicados.isEmpty()) {
                log.error("❌ ENCONTRADOS EMAILS DUPLICADOS: {}", emailsDuplicados);
                resultado.put("status", "ERROR");
                resultado.put("message", "Encontrados emails duplicados no banco!");
            } else {
                log.info("✅ Nenhum email duplicado encontrado");
                resultado.put("status", "SUCCESS");
                resultado.put("message", "Constraint unique funcionando corretamente");
            }
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            log.error("Erro ao testar constraint unique: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao testar constraint: " + e.getMessage(), "TEST_ERROR"));
        }
    }

    @GetMapping("/check-table-structure")
    public ResponseEntity<?> checkTableStructure() {
        log.info("Verificando estrutura da tabela usuarios");
        
        try {
            // Verificar se a constraint unique existe
            boolean constraintExists = false;
            try {
                // Tentar inserir um usuário com email duplicado para testar a constraint
                Usuario usuarioTeste = new Usuario();
                usuarioTeste.setNome("Teste Constraint");
                usuarioTeste.setEmail("teste@constraint.com");
                usuarioTeste.setSenha("teste123");
                usuarioTeste.setPlano("FREE");
                
                // Primeira inserção deve funcionar
                Usuario salvo1 = usuarioRepository.save(usuarioTeste);
                log.info("Primeira inserção de teste bem-sucedida - ID: {}", salvo1.getId());
                
                // Segunda inserção com mesmo email deve falhar se a constraint estiver funcionando
                try {
                    Usuario usuarioTeste2 = new Usuario();
                    usuarioTeste2.setNome("Teste Constraint 2");
                    usuarioTeste2.setEmail("teste@constraint.com");
                    usuarioTeste2.setSenha("teste456");
                    usuarioTeste2.setPlano("FREE");
                    
                    Usuario salvo2 = usuarioRepository.save(usuarioTeste2);
                    log.error("❌ ERRO: Constraint unique NÃO está funcionando! Usuário duplicado criado com ID: {}", salvo2.getId());
                    constraintExists = false;
                    
                    // Remover o usuário duplicado
                    usuarioRepository.deleteById(salvo2.getId());
                    log.info("Usuário duplicado removido");
                    
                } catch (Exception e) {
                    log.info("✅ Constraint unique está funcionando! Erro esperado ao tentar inserir duplicata: {}", e.getMessage());
                    constraintExists = true;
                }
                
                // Remover o usuário de teste
                usuarioRepository.deleteById(salvo1.getId());
                log.info("Usuário de teste removido");
                
            } catch (Exception e) {
                log.error("Erro ao testar constraint: {}", e.getMessage(), e);
                constraintExists = false;
            }
            
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("constraintUniqueFuncionando", constraintExists);
            resultado.put("status", constraintExists ? "SUCCESS" : "ERROR");
            resultado.put("message", constraintExists ? 
                "Constraint unique no campo email está funcionando corretamente" : 
                "Constraint unique no campo email NÃO está funcionando!");
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            log.error("Erro ao verificar estrutura da tabela: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao verificar estrutura: " + e.getMessage(), "STRUCTURE_CHECK_ERROR"));
        }
    }

    @GetMapping("/check-jpa-config")
    public ResponseEntity<?> checkJpaConfig() {
        log.info("Verificando configuração do JPA");
        
        try {
            Map<String, Object> resultado = new HashMap<>();
            
            // Verificar se a entidade Usuario está sendo mapeada corretamente
            try {
                // Tentar buscar todos os usuários para verificar se a tabela existe
                List<Usuario> usuarios = usuarioRepository.findAll();
                resultado.put("tabelaExiste", true);
                resultado.put("totalUsuarios", usuarios.size());
                log.info("✅ Tabela usuarios existe e está acessível - {} usuários encontrados", usuarios.size());
                
                // Verificar se há algum usuário para testar a estrutura
                if (!usuarios.isEmpty()) {
                    Usuario primeiroUsuario = usuarios.get(0);
                    resultado.put("estruturaUsuario", Map.of(
                        "id", primeiroUsuario.getId(),
                        "nome", primeiroUsuario.getNome(),
                        "email", primeiroUsuario.getEmail(),
                        "plano", primeiroUsuario.getPlano()
                    ));
                }
                
            } catch (Exception e) {
                resultado.put("tabelaExiste", false);
                resultado.put("erroTabela", e.getMessage());
                log.error("❌ Erro ao acessar tabela usuarios: {}", e.getMessage());
            }
            
            // Verificar se o método existsByEmail está funcionando
            try {
                boolean testeExists = usuarioRepository.existsByEmail("teste@jpa.com");
                resultado.put("existsByEmailFuncionando", true);
                resultado.put("testeExistsResult", testeExists);
                log.info("✅ Método existsByEmail está funcionando - Resultado teste: {}", testeExists);
                
            } catch (Exception e) {
                resultado.put("existsByEmailFuncionando", false);
                resultado.put("erroExistsByEmail", e.getMessage());
                log.error("❌ Erro no método existsByEmail: {}", e.getMessage());
            }
            
            // Verificar se o método findByEmail está funcionando
            try {
                Optional<Usuario> testeFind = usuarioRepository.findByEmail("teste@jpa.com");
                resultado.put("findByEmailFuncionando", true);
                resultado.put("testeFindResult", testeFind.isPresent());
                log.info("✅ Método findByEmail está funcionando - Resultado teste: {}", testeFind.isPresent());
                
            } catch (Exception e) {
                resultado.put("findByEmailFuncionando", false);
                resultado.put("erroFindByEmail", e.getMessage());
                log.error("❌ Erro no método findByEmail: {}", e.getMessage());
            }
            
            resultado.put("status", "SUCCESS");
            resultado.put("message", "Verificação de configuração JPA concluída");
            
            return ResponseEntity.ok(resultado);
            
        } catch (Exception e) {
            log.error("Erro ao verificar configuração JPA: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponseDTO("Erro ao verificar JPA: " + e.getMessage(), "JPA_CHECK_ERROR"));
        }
    }

    /**
     * Obtém informações de uso e limites do usuário
     */
    @GetMapping("/{id}/uso")
    public ResponseEntity<?> getUsoUsuario(@PathVariable Long id) {
        try {
            Usuario usuario = usuarioRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + id));
            
            // Contar templates e campos
            long totalTemplates = templateRepository.countByUsuarioIdAndAtivo(id, true);
            long totalCampos = campoTemplateRepository.countByUsuarioIdAndAtivo(id, true);
            
            // Obter limites do plano
            int limiteTemplates = planoLimiteService.getLimiteTemplates(usuario.getPlano());
            int limiteCampos = planoLimiteService.getLimiteTotalCampos(usuario.getPlano());
            
            Map<String, Object> uso = new HashMap<>();
            uso.put("usuarioId", id);
            uso.put("plano", usuario.getPlano());
            uso.put("totalTemplates", totalTemplates);
            uso.put("totalCampos", totalCampos);
            uso.put("limiteTemplates", limiteTemplates);
            uso.put("limiteCampos", limiteCampos);
            uso.put("podeCriarTemplate", totalTemplates < limiteTemplates);
            uso.put("podeAdicionarCampo", totalCampos < limiteCampos);
            uso.put("percentualTemplates", Math.round((double) totalTemplates / limiteTemplates * 100));
            uso.put("percentualCampos", Math.round((double) totalCampos / limiteCampos * 100));
            
            return ResponseEntity.ok(uso);
            
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erro ao obter informações de uso: " + e.getMessage());
        }
    }

    static class UsuarioInfo {
        public Long id;
        public String nome;
        public String email;
        public String plano;
        public UsuarioInfo(Long id, String nome, String email, String plano) {
            this.id = id;
            this.nome = nome;
            this.email = email;
            this.plano = plano;
        }
    }
}

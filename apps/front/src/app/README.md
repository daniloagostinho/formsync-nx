# Estrutura do Projeto FormSync

## Organização de Pastas

### `/components/`
Contém todos os componentes da aplicação, organizados em subpastas por funcionalidade:

- `home/` - Componente da página inicial
- `login/` - Componente de autenticação
- `registrar/` - Componente de cadastro
- `verificar-codigo/` - Componente de verificação de código
- `demo/` - Componente de demonstração

### `/services/`
Contém todos os serviços da aplicação:

- `auth.service.ts` - Serviço de autenticação
- `checkout.service.ts` - Serviço de checkout/pagamento
- `usuario.service.ts` - Serviço de gerenciamento de usuários

### `/models/`
Contém as interfaces e tipos TypeScript:

- `usuario.model.ts` - Interface do usuário
- `index.ts` - Exportações centralizadas dos modelos

### `/shared/`
Componentes e utilitários compartilhados entre diferentes partes da aplicação.

### `/guards/`
Guards de rota para proteção de rotas.

### `/interceptors/`
Interceptors HTTP para interceptar requisições.

## Convenções

1. **Componentes**: Cada componente deve estar em sua própria pasta com os arquivos `.ts`, `.html`, `.css`
2. **Serviços**: Todos os serviços devem estar na pasta `/services/`
3. **Modelos**: Interfaces e tipos devem estar na pasta `/models/`
4. **Imports**: Usar imports relativos corretos baseados na nova estrutura
5. **Exports**: Usar arquivos `index.ts` para centralizar exportações

## Benefícios da Organização

- **Manutenibilidade**: Estrutura clara e organizada
- **Escalabilidade**: Fácil adição de novos componentes e funcionalidades
- **Reutilização**: Componentes e serviços bem organizados para reutilização
- **Clareza**: Separação clara de responsabilidades 
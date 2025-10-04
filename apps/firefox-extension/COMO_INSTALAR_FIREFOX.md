# Como Instalar a Extensão MyPassword no Firefox

## Passos para Instalação:

### 1. Abrir o Firefox
- Inicie o navegador Firefox

### 2. Acessar o Gerenciador de Extensões
- Digite `about:debugging` na barra de endereços
- Ou vá em Menu → Mais ferramentas → Extensões → Gerenciar extensões

### 3. Instalar Extensão Temporária
- Clique em "Este Firefox" na barra lateral esquerda
- Clique em "Carregar extensão temporária..."
- Navegue até a pasta `firefox-extension` e selecione o arquivo `manifest.json`
- Clique em "Selecionar arquivo"

### 4. Verificar Instalação
- A extensão deve aparecer na lista de extensões
- O ícone da extensão deve aparecer na barra de ferramentas

### 5. Configurar o Servidor
- Certifique-se de que o servidor MyPassword está rodando em `http://localhost:5000`
- A extensão se conectará automaticamente ao servidor

## Notas Importantes:

⚠️ **Extensões temporárias são removidas quando o Firefox é fechado**
- Para instalação permanente, você precisará assinar a extensão ou usar o Firefox Developer Edition

🔧 **Para Desenvolvedores:**
- Use o Firefox Developer Edition para instalação permanente
- Ou assine a extensão com uma chave de desenvolvedor

## Solução de Problemas:

- Se a extensão não carregar, verifique se todos os arquivos estão na pasta
- Certifique-se de que o servidor está rodando
- Verifique o console do navegador para mensagens de erro

## Estrutura da Extensão:

```
firefox-extension/
├── manifest.json      # Configuração da extensão
├── background.js      # Script em background
├── popup.html        # Interface do popup
├── popup.js          # Lógica do popup
├── content.js        # Script injetado nas páginas
├── icon16.png        # Ícone 16x16
├── icon48.png        # Ícone 48x48
└── icon128.png       # Ícone 128x128
```

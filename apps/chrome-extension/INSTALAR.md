# 📦 Como Instalar a Extensão FormSync

## 🚀 Instalação Manual no Chrome

### Passo 1: Preparar os Arquivos
1. Certifique-se de que todos os arquivos estão na pasta `chrome-extension/`
2. Verifique se o backend está rodando em `http://localhost:8080`

### Passo 2: Abrir o Chrome
1. Abra o Google Chrome
2. Digite `chrome://extensions/` na barra de endereços
3. Pressione Enter

### Passo 3: Ativar o Modo Desenvolvedor
1. No canto superior direito, ative o switch "Modo do desenvolvedor"
2. Isso revelará opções adicionais

### Passo 4: Carregar a Extensão
1. Clique no botão "Carregar sem compactação"
2. Navegue até a pasta `chrome-extension/`
3. Selecione a pasta e clique em "Selecionar pasta"

### Passo 5: Verificar Instalação
1. A extensão FormSync deve aparecer na lista
2. Verifique se não há erros (ícone vermelho)
3. A extensão deve estar ativa (switch azul)

### Passo 6: Testar
1. Clique no ícone da extensão na barra de ferramentas
2. Verifique se o popup abre
3. Teste com o arquivo `test-form.html`

## 🔧 Solução de Problemas de Instalação

### Erro: "Manifest inválido"
- Verifique se o `manifest.json` está correto
- Certifique-se de que não há erros de sintaxe JSON

### Erro: "Permissões inválidas"
- Verifique se as permissões no manifest estão corretas
- Algumas permissões podem requerer aprovação manual

### Erro: "Arquivo não encontrado"
- Verifique se todos os arquivos estão presentes
- Certifique-se de que os caminhos estão corretos

### Extensão não aparece
- Recarregue a página `chrome://extensions/`
- Verifique se o modo desenvolvedor está ativo
- Tente carregar novamente

## 📋 Verificação Pós-Instalação

### ✅ Checklist
- [ ] Extensão aparece na lista
- [ ] Status "Ativo" (switch azul)
- [ ] Ícone aparece na barra de ferramentas
- [ ] Popup abre ao clicar no ícone
- [ ] Templates carregam
- [ ] Botão de preenchimento funciona

### 🧪 Teste Básico
1. Abra `test-form.html`
2. Clique na extensão
3. Selecione um template
4. Clique em "Preencher Agora"
5. Verifique se os campos são preenchidos

## 🔄 Atualizações

### Para Atualizar a Extensão
1. Faça as alterações nos arquivos
2. Vá para `chrome://extensions/`
3. Clique no botão de atualizar (🔄) na extensão FormSync
4. Recarregue a página de teste

### Para Reinstalar
1. Remova a extensão (botão "Remover")
2. Carregue novamente seguindo os passos acima

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Google Chrome (recomendado)
- ✅ Microsoft Edge (baseado em Chromium)
- ❌ Firefox (não suportado - usa sistema diferente)

### Versões Mínimas
- Chrome: 88+
- Edge: 88+
- Manifest V3

## 🚨 Notas Importantes

- **Sempre use o modo desenvolvedor** para extensões locais
- **Recarregue a extensão** após alterações nos arquivos
- **Verifique o console** para mensagens de erro
- **Teste em páginas HTTP/HTTPS** válidas
- **Backend deve estar rodando** para funcionar

## 📞 Suporte

Se a instalação falhar:
1. Verifique todos os logs de erro
2. Confirme se todos os arquivos estão presentes
3. Teste com uma extensão simples primeiro
4. Verifique a compatibilidade do Chrome

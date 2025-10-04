# FormSync - Guia de Teste e Solução de Problemas

## 🚀 Como Testar a Extensão

### 1. Preparação
- Certifique-se de que o backend está rodando em `http://localhost:8080`
- Verifique se há templates criados para o usuário ID 6
- A extensão deve estar instalada no Chrome

### 2. Teste Básico
1. Abra o arquivo `test-form.html` em uma nova aba
2. Clique no ícone da extensão FormSync na barra de ferramentas
3. Aguarde o carregamento dos templates
4. Selecione um template da lista
5. Clique em "Preencher Agora"
6. Verifique se os campos foram preenchidos automaticamente

### 3. Verificação de Funcionamento
- ✅ Templates carregam automaticamente
- ✅ Botão "Preencher Agora" aparece após selecionar template
- ✅ Campos são preenchidos corretamente
- ✅ Feedback visual nos campos preenchidos
- ✅ Logs no console do navegador

## 🔧 Solução de Problemas

### Problema: Templates não carregam
**Sintomas:**
- Mensagem "Carregando templates..." não muda
- Lista de templates vazia
- Erro de conexão

**Soluções:**
1. Verifique se o backend está rodando: `http://localhost:8080`
2. Teste a conexão clicando no botão "Testar conexão"
3. Verifique se há templates para o usuário ID 6
4. Recarregue a extensão (clique no ícone de atualizar)

### Problema: Botão "Preencher Agora" não aparece
**Sintomas:**
- Template selecionado mas botão não aparece
- Mensagem "Selecione um template" permanece visível

**Soluções:**
1. Verifique se o template foi selecionado corretamente
2. Recarregue o popup da extensão
3. Verifique os logs no console do popup
4. Tente selecionar outro template

### Problema: Campos não são preenchidos
**Sintomas:**
- Botão funciona mas formulário não é preenchido
- Mensagem de erro ao preencher

**Soluções:**
1. Verifique se a página tem campos com nomes compatíveis
2. Recarregue a página antes de testar
3. Verifique os logs no console da página
4. Teste com o formulário de teste fornecido

### Problema: Erros de permissão
**Sintomas:**
- Mensagens de erro sobre permissões
- Extensão não funciona em certos sites

**Soluções:**
1. Verifique as permissões da extensão no Chrome
2. Recarregue a extensão
3. Verifique se o manifest.json está correto

## 📋 Checklist de Verificação

### Backend
- [ ] Servidor rodando em localhost:8080
- [ ] API `/api/v1/public/templates?usuarioId=6` retorna templates
- [ ] API `/api/v1/public/health` responde
- [ ] Chave de extensão válida

### Extensão
- [ ] Manifest.json correto
- [ ] Todos os arquivos presentes
- [ ] Permissões configuradas
- [ ] Content script injetado

### Funcionalidade
- [ ] Popup abre corretamente
- [ ] Templates carregam
- [ ] Seleção de template funciona
- [ ] Botão de preenchimento aparece
- [ ] Preenchimento funciona
- [ ] Feedback visual correto

## 🐛 Debug e Logs

### Console do Popup
Abra o popup da extensão e pressione F12 para ver os logs:
```
FormSync: Inicializando popup...
FormSync: Carregando templates...
FormSync: Templates carregados com sucesso: [array]
FormSync: Template selecionado: [ID]
```

### Console da Página
Na página onde está o formulário, verifique os logs:
```
FormSync: Content script carregado e funcionando!
FormSync: Mensagem recebida: {action: "fillForm", template: {...}}
FormSync: Preenchendo formulário com template: {...}
FormSync: Campos detectados na página: [número]
```

## 🔄 Recarregar a Extensão

Se algo não estiver funcionando:

1. Vá para `chrome://extensions/`
2. Encontre a extensão FormSync
3. Clique no botão de atualizar (🔄)
4. Recarregue a página de teste
5. Teste novamente

## 📞 Suporte

Se os problemas persistirem:
1. Verifique todos os logs no console
2. Teste com o formulário de teste fornecido
3. Verifique se o backend está funcionando
4. Recarregue a extensão

## 📝 Notas Importantes

- A extensão funciona apenas em páginas HTTP/HTTPS
- Alguns sites podem bloquear o preenchimento automático
- O content script deve estar ativo na página
- Templates devem ter campos com nomes compatíveis aos do formulário

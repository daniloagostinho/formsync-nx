// FormSync - Template Builder Extension
class FormSyncPopup {
  constructor() {
    this.templates = [];
    this.selectedTemplate = null;
    this.currentUrl = '';
    this.init();
  }

  async init() {
    await this.loadTemplates();
    await this.getCurrentTab();
    this.setupEventListeners();
    this.updateUI();
  }

  async loadTemplates() {
    try {
      // Carrega templates do usuário específico (usuarioId=6) da API
      // Usa IP local para funcionar em qualquer contexto
      const baseUrl = 'https://backend-production-0914.up.railway.app';
      
      const response = await fetch(`${baseUrl}/api/v1/public/templates?usuarioId=6`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.templates = data || [];
        console.log('FormSync: Templates do usuário carregados:', this.templates);
        this.showStatus(`${this.templates.length} templates carregados`, 'success');
      } else {
        console.error('FormSync: Erro ao carregar templates do usuário:', response.status);
        this.templates = [];
        this.showStatus(`Erro ${response.status}: ${response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('FormSync: Erro ao carregar templates do usuário:', error);
      this.templates = [];
      
      if (error.message.includes('Failed to fetch')) {
        this.showStatus('Servidor backend não está rodando. Verifique se está em https://backend-production-0914.up.railway.app', 'error');
      } else {
        this.showStatus(`Erro de conexão: ${error.message}`, 'error');
      }
    }
  }

  async getCurrentTab() {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      this.currentUrl = tab.url;
    } catch (error) {
      console.error('Erro ao obter URL atual:', error);
    }
  }

  setupEventListeners() {
    // Template selector
    document.getElementById('templateSelect').addEventListener('change', (e) => {
      this.onTemplateSelect(e.target.value);
    });

    // Fill form button
    document.getElementById('fillFormBtn').addEventListener('click', () => {
      this.fillForm();
    });

    // Create template button
    document.getElementById('createTemplateBtn').addEventListener('click', () => {
      this.openTemplateManager();
    });

    // Manage templates button
    document.getElementById('manageTemplatesBtn').addEventListener('click', () => {
      this.openTemplateManager();
    });

    // Adiciona listener para recarregar templates quando o popup abrir
    window.addEventListener('focus', () => {
      this.loadTemplates();
    });

    // Refresh templates button
    document.getElementById('refreshTemplatesBtn').addEventListener('click', () => {
      this.loadTemplates();
      this.showStatus('Atualizando templates...', 'info');
    });

    // Test connection button
    document.getElementById('testConnectionBtn').addEventListener('click', () => {
      this.testConnection();
    });
  }

  updateUI() {
    this.updateTemplateSelect();
    this.updateMainAction();
  }

  updateTemplateSelect() {
    const select = document.getElementById('templateSelect');
    select.innerHTML = '';
    
    // Opção padrão
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = this.templates.length > 0 ? 'Selecione um template...' : 'Nenhum template disponível';
    select.appendChild(defaultOption);
    
    // Opções dos templates
    this.templates.forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = template.nome || template.name || 'Template sem nome';
      select.appendChild(option);
    });
  }

  updateMainAction() {
    const mainAction = document.getElementById('mainAction');
    const templateMessage = document.getElementById('templateMessage');
    const fillBtn = document.getElementById('fillFormBtn');
    
    if (this.selectedTemplate) {
      // Mostra a seção principal e oculta a mensagem
      mainAction.classList.remove('hidden');
      if (templateMessage) templateMessage.classList.add('hidden');
      fillBtn.disabled = false;
      fillBtn.innerHTML = '<span class="material-icons">play_arrow</span>Preencher Agora';
    } else {
      // Oculta a seção principal e mostra a mensagem
      mainAction.classList.add('hidden');
      if (templateMessage) templateMessage.classList.remove('hidden');
      fillBtn.disabled = true;
    }
  }

  onTemplateSelect(templateId) {
    if (!templateId) {
      this.selectedTemplate = null;
      this.hideTemplateInfo();
      this.updateMainAction();
      return;
    }

    this.selectedTemplate = this.templates.find(t => t.id == templateId);
    if (this.selectedTemplate) {
      this.showTemplateInfo(this.selectedTemplate);
      this.updateMainAction();
    }
  }

  showTemplateInfo(template) {
    const templateInfo = document.getElementById('templateInfo');
    const camposList = document.getElementById('camposList');
    
    if (!templateInfo || !camposList) return;
    
    // Limpa a lista anterior
    camposList.innerHTML = '';
    
    // Armazena os campos para paginação
    this.allCampos = template.campos || [];
    this.currentPage = 0;
    this.camposPerPage = 5;
    
    // Adiciona os Campos do Formulário com paginação
    if (this.allCampos.length > 0) {
      this.renderCamposPage();
      this.renderPaginationControls();
    } else {
      // Se não há campos, mostra uma mensagem
      const li = document.createElement('li');
      li.className = 'campo-item';
      li.textContent = 'Nenhum campo definido neste template';
      camposList.appendChild(li);
    }
    
    templateInfo.classList.remove('hidden');
  }

  renderCamposPage() {
    const camposList = document.getElementById('camposList');
    const startIndex = this.currentPage * this.camposPerPage;
    const endIndex = startIndex + this.camposPerPage;
    const camposToShow = this.allCampos.slice(startIndex, endIndex);
    
    // Limpa a lista
    camposList.innerHTML = '';
    
    // Adiciona os campos da página atual
    camposToShow.forEach(campo => {
      const li = document.createElement('li');
      li.className = 'campo-item';
      
      const nomeSpan = document.createElement('span');
      nomeSpan.className = 'campo-nome';
      nomeSpan.textContent = campo.nome || campo.name || 'Campo';
      
      const valorSpan = document.createElement('span');
      valorSpan.className = 'campo-valor';
      valorSpan.textContent = campo.valor || campo.value || 'Valor não definido';
      
      li.appendChild(nomeSpan);
      li.appendChild(valorSpan);
      camposList.appendChild(li);
    });
  }

  renderPaginationControls() {
    const templateInfo = document.getElementById('templateInfo');
    const totalPages = Math.ceil(this.allCampos.length / this.camposPerPage);
    
    // Remove controles de paginação existentes
    const existingPagination = templateInfo.querySelector('.pagination-controls');
    if (existingPagination) {
      existingPagination.remove();
    }
    
    // Se há apenas uma página, não mostra controles
    if (totalPages <= 1) return;
    
    // Cria controles de paginação
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    
    // Botão anterior
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '‹';
    prevBtn.disabled = this.currentPage === 0;
    prevBtn.onclick = () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderCamposPage();
        this.renderPaginationControls();
      }
    };
    
    // Informação da página
    const pageInfo = document.createElement('span');
    pageInfo.className = 'pagination-info';
    pageInfo.textContent = `${this.currentPage + 1} de ${totalPages}`;
    
    // Botão próximo
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '›';
    nextBtn.disabled = this.currentPage === totalPages - 1;
    nextBtn.onclick = () => {
      if (this.currentPage < totalPages - 1) {
        this.currentPage++;
        this.renderCamposPage();
        this.renderPaginationControls();
      }
    };
    
    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextBtn);
    
    templateInfo.appendChild(paginationDiv);
  }

  hideTemplateInfo() {
    const templateInfo = document.getElementById('templateInfo');
    if (templateInfo) {
      templateInfo.classList.add('hidden');
    }
  }

  async fillForm() {
    if (!this.selectedTemplate) {
      this.showStatus('Selecione um template primeiro', 'error');
      return;
    }

    try {
      this.showStatus('Preenchendo formulário...', 'info');
      
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      
      const response = await browser.tabs.sendMessage(tab.id, {
        action: 'fillForm',
        template: this.selectedTemplate
      });

      if (response && response.success) {
        this.showStatus(`✅ Formulário preenchido com sucesso! ${response.filledFields} campos preenchidos.`, 'success');
        
        // Registra o uso do template
        await this.recordTemplateUsage();
        
        // Fecha o popup após sucesso
        setTimeout(() => {
          window.close();
        }, 2000);
      } else {
        this.showStatus('❌ Erro ao preencher formulário. Verifique se há campos na página.', 'error');
      }
    } catch (error) {
      console.error('Erro ao preencher formulário:', error);
      this.showStatus('Erro ao comunicar com a página. Recarregue a página e tente novamente.', 'error');
    }
  }

  async recordTemplateUsage() {
    try {
      // Registra o uso do template no backend
      const baseUrl = 'https://backend-production-0914.up.railway.app';
      
      const response = await fetch(`${baseUrl}/api/v1/public/templates/${this.selectedTemplate.id}/uso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
        },
        body: JSON.stringify({ success: true })
      });

      if (response.ok) {
        console.log('FormSync: Uso do template registrado com sucesso');
        
        // Atualiza estatísticas locais
        if (!this.selectedTemplate.totalUso) {
          this.selectedTemplate.totalUso = 0;
        }
        this.selectedTemplate.totalUso++;
        this.selectedTemplate.ultimoUso = new Date().toISOString();
      } else {
        console.error('FormSync: Erro ao registrar uso do template:', response.status);
      }
      
    } catch (error) {
      console.error('FormSync: Erro ao registrar uso do template:', error);
    }
  }

  /**
   * Testa a conexão com o servidor backend
   */
  async testConnection() {
    try {
      this.showStatus('Testando conexão...', 'info');
      
      const baseUrl = 'https://backend-production-0914.up.railway.app';
      
      const response = await fetch(`${baseUrl}/api/v1/public/health`, {
        method: 'GET',
        headers: {
          'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.showStatus(`✅ Conectado! ${data.message}`, 'success');
        console.log('FormSync: Conexão testada com sucesso:', data);
      } else {
        this.showStatus(`❌ Erro ${response.status}: ${response.statusText}`, 'error');
        console.error('FormSync: Erro ao testar conexão:', response.status);
      }
    } catch (error) {
      console.error('FormSync: Erro ao testar conexão:', error);
      
      if (error.message.includes('Failed to fetch')) {
        this.showStatus('❌ Servidor não está rodando em https://backend-production-0914.up.railway.app', 'error');
      } else {
        this.showStatus(`❌ Erro: ${error.message}`, 'error');
      }
    }
  }

  openTemplateManager() {
    // Abre o gerenciador de templates em uma nova aba
    browser.tabs.create({
      url: 'https://formsync.netlify.app/templates' // URL do frontend Angular
    });
  }

  showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${type}`;
      statusDiv.classList.remove('hidden');
      
      // Auto-hide após 5 segundos
      setTimeout(() => {
        if (statusDiv) {
          statusDiv.classList.add('hidden');
        }
      }, 5000);
    }
  }
}

// Inicializa o popup quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new FormSyncPopup();
});

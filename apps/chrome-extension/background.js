// FormSync - Background Service Worker
class FormSyncBackground {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('FormSync: Background service worker inicializado');
  }

  setupEventListeners() {
    // Listener para instalação da extensão
    chrome.runtime.onInstalled.addListener((details) => {
      this.onExtensionInstalled(details);
    });

    // Listener para mensagens do popup ou content scripts
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Indica que a resposta será assíncrona
    });

    // Listener para mudanças de abas
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.onTabUpdated(tabId, changeInfo, tab);
    });

    // Listener para mudanças de abas ativas
    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.onTabActivated(activeInfo);
    });
  }

  onExtensionInstalled(details) {
    console.log('FormSync: Extensão instalada/atualizada:', details);
    
    if (details.reason === 'install') {
      // Primeira instalação
      this.showWelcomePage();
    } else if (details.reason === 'update') {
      // Atualização
      console.log('FormSync: Extensão atualizada para versão', chrome.runtime.getManifest().version);
    }
  }

  showWelcomePage() {
    // Abre a página de boas-vindas na primeira instalação
    chrome.tabs.create({
      url: 'https://formsync.netlify.app/welcome'
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      console.log('FormSync: Mensagem recebida no background:', request);
      
      switch (request.action) {
        case 'getTemplates':
          const templates = await this.getTemplates();
          sendResponse({ success: true, templates });
          break;
          
        case 'saveTemplate':
          const result = await this.saveTemplate(request.template);
          sendResponse({ success: true, result });
          break;
          
        case 'recordUsage':
          await this.recordTemplateUsage(request.templateId, request.success);
          sendResponse({ success: true });
          break;
          
        case 'ping':
          sendResponse({ success: true, message: 'FormSync está funcionando!' });
          break;
          
        case 'template_created':
        case 'template_updated':
        case 'template_deleted':
          // Notificação do frontend sobre mudanças nos templates
          console.log('FormSync: Notificação de template recebida:', request);
          await this.handleTemplateNotification(request);
          sendResponse({ success: true, message: 'Notificação processada' });
          break;
          
        default:
          sendResponse({ success: false, error: 'Ação não reconhecida' });
      }
    } catch (error) {
      console.error('FormSync: Erro ao processar mensagem:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async getTemplates() {
    try {
      console.log('FormSync: Carregando templates no background...');
      
      // Carrega templates do usuário específico (usuarioId=6) da API
      const baseUrl = 'https://backend-production-0914.up.railway.app';
      
      // Buscar Formulários do usuário específico
      const response = await fetch(`${baseUrl}/api/v1/public/templates?usuarioId=6`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('FormSync: Templates carregados no background:', data);
        return data || [];
      } else {
        console.error('FormSync: Erro ao carregar templates no background:', response.status);
        return [];
      }
    } catch (error) {
      console.error('FormSync: Erro ao carregar templates no background:', error);
      return [];
    }
  }

  async saveTemplate(template) {
    try {
      // Salva template real no backend usando API pública
      const baseUrl = 'https://backend-production-0914.up.railway.app';
      const url = `${baseUrl}/api/v1/public/templates`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
        },
        body: JSON.stringify(template)
      });

      if (response.ok) {
        const savedTemplate = await response.json();
        console.log('FormSync: Template salvo com sucesso:', savedTemplate);
        return savedTemplate;
      } else {
        console.error('FormSync: Erro ao salvar template:', response.status);
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('FormSync: Erro ao salvar template:', error);
      throw error;
    }
  }

  async recordTemplateUsage(templateId, success) {
    try {
      // Registra o uso do template no backend usando API pública
      const baseUrl = 'https://backend-production-0914.up.railway.app';
      const response = await fetch(`${baseUrl}/api/v1/public/templates/${templateId}/uso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
        },
        body: JSON.stringify({ success })
      });

      if (response.ok) {
        console.log(`FormSync: Uso do template ${templateId} registrado com sucesso`);
      } else {
        console.error('FormSync: Erro ao registrar uso do template:', response.status);
      }
    } catch (error) {
      console.error('FormSync: Erro ao registrar uso do template:', error);
    }
  }

  onTabUpdated(tabId, changeInfo, tab) {
    // Monitora mudanças nas abas para detectar formulários
    if (changeInfo.status === 'complete' && tab.url) {
      this.analyzePageForForms(tabId, tab.url);
    }
  }

  onTabActivated(activeInfo) {
    // Atualiza o contexto quando uma nova aba é ativada
    console.log('FormSync: Nova aba ativada:', activeInfo.tabId);
  }

  async analyzePageForForms(tabId, url) {
    try {
      // Verifica se a página pode conter formulários
      if (this.isFormPage(url)) {
        console.log('FormSync: Página de formulário detectada:', url);
        
        // Pode enviar mensagem para o content script para análise adicional
        // chrome.tabs.sendMessage(tabId, { action: 'analyzePage' });
      }
    } catch (error) {
      console.error('FormSync: Erro ao analisar página:', error);
    }
  }

  isFormPage(url) {
    // Lista de padrões de URL que podem conter formulários
    const formPatterns = [
      /login/i,
      /signin/i,
      /register/i,
      /signup/i,
      /apply/i,
      /candidate/i,
      /job/i,
      /career/i,
      /form/i,
      /submit/i
    ];
    
    return formPatterns.some(pattern => pattern.test(url));
  }

  // Método para sincronizar com o backend (futuro)
  async syncWithBackend() {
    try {
      // Futuramente será implementado para sincronizar templates
      // com o backend em tempo real
      console.log('FormSync: Sincronização com backend (não implementada ainda)');
    } catch (error) {
      console.error('FormSync: Erro na sincronização:', error);
    }
  }

  /**
   * Processa notificações de templates do frontend
   */
  async handleTemplateNotification(notification) {
    try {
      console.log('FormSync: Processando notificação de template:', notification);
      
      switch (notification.action) {
        case 'template_created':
          console.log(`🆕 Novo Formulário criado: ${notification.templateName} (ID: ${notification.templateId})`);
          // Limpar cache local para forçar recarregamento
          await this.clearTemplateCache();
          break;
          
        case 'template_updated':
          console.log(`✏️ Template atualizado: ${notification.templateName} (ID: ${notification.templateId})`);
          await this.clearTemplateCache();
          break;
          
        case 'template_deleted':
          console.log(`🗑️ Template deletado: ${notification.templateName} (ID: ${notification.templateId})`);
          await this.clearTemplateCache();
          break;
          
        default:
          console.log('FormSync: Ação de template não reconhecida:', notification.action);
      }
      
      // Notificar todas as abas ativas sobre a mudança
      await this.notifyAllTabs(notification);
      
    } catch (error) {
      console.error('FormSync: Erro ao processar notificação de template:', error);
    }
  }

  /**
   * Limpa cache local de templates
   */
  async clearTemplateCache() {
    try {
      // Limpar cache do chrome.storage se disponível
      if (chrome.storage && chrome.storage.local) {
        await chrome.storage.local.remove(['templates', 'templates_cache']);
        console.log('FormSync: Cache de templates limpo');
      }
    } catch (error) {
      console.error('FormSync: Erro ao limpar cache:', error);
    }
  }

  /**
   * Notifica todas as abas ativas sobre mudanças nos templates
   */
  async notifyAllTabs(notification) {
    try {
      const tabs = await chrome.tabs.query({ active: true });
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'template_updated',
            notification: notification
          });
          console.log(`FormSync: Aba ${tab.id} notificada sobre mudança de template`);
        } catch (error) {
          // Ignora erros de abas que não têm content script
          console.log(`FormSync: Aba ${tab.id} não pôde ser notificada:`, error.message);
        }
      }
    } catch (error) {
      console.error('FormSync: Erro ao notificar abas:', error);
    }
  }
}

// Inicializa o background service worker
const formSyncBackground = new FormSyncBackground();

// Mantém o service worker ativo
chrome.runtime.onStartup.addListener(() => {
  console.log('FormSync: Service worker iniciado');
});

// Listener para manter o service worker ativo
chrome.runtime.onSuspend.addListener(() => {
  console.log('FormSync: Service worker suspenso');
});

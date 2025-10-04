// Script que será injetado nas páginas web - Versão Firefox
class FormFiller {
    constructor() {
        this.init();
        this.markAsLoaded();
    }

    init() {
        this.listenForMessages();
        this.addPasswordDetection();
        console.log('MyPassword: FormFiller inicializado com sucesso');
    }

    markAsLoaded() {
        // Marcar que o script foi carregado
        window.myPasswordLoaded = true;
        document.documentElement.setAttribute('data-mypassword', 'loaded');
    }

    listenForMessages() {
        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log('MyPassword: Mensagem recebida:', request);
            
            if (request.action === 'fillForm') {
                console.log('MyPassword: Preenchendo formulário...', request);
                this.fillFormFields(request.username, request.password);
                sendResponse({ success: true, message: 'Formulário preenchido com sucesso' });
            } else if (request.action === 'ping') {
                // Responder a pings para verificar se está funcionando
                sendResponse({ success: true, message: 'MyPassword está funcionando!' });
            }
            
            // Sempre retornar true para indicar que vamos responder assincronamente
            return true;
        });
    }

    addPasswordDetection() {
        // Detectar campos de senha e usuário automaticamente
        const observer = new MutationObserver(() => {
            this.detectFormFields();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Detectar campos existentes
        this.detectFormFields();
    }

    detectFormFields() {
        // Buscar campos de usuário/email com mais opções
        const usernameSelectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[name*="user"]',
            'input[name*="email"]',
            'input[name*="login"]',
            'input[name*="account"]',
            'input[id*="user"]',
            'input[id*="email"]',
            'input[id*="login"]',
            'input[id*="account"]',
            'input[placeholder*="usuário"]',
            'input[placeholder*="email"]',
            'input[placeholder*="login"]',
            'input[placeholder*="user"]',
            'input[placeholder*="e-mail"]'
        ];
        
        // Buscar campos de senha
        const passwordSelectors = [
            'input[type="password"]',
            'input[name*="pass"]',
            'input[name*="senha"]',
            'input[id*="pass"]',
            'input[id*="senha"]',
            'input[placeholder*="senha"]',
            'input[placeholder*="password"]'
        ];

        // Combinar todos os seletores
        const usernameFields = document.querySelectorAll(usernameSelectors.join(','));
        const passwordFields = document.querySelectorAll(passwordSelectors.join(','));

        console.log('MyPassword: Campos detectados:', {
            username: usernameFields.length,
            password: passwordFields.length
        });

        // Adicionar indicadores visuais
        usernameFields.forEach(field => {
            if (!field.dataset.passwordManager) {
                field.dataset.passwordManager = 'username';
                this.addFieldIndicator(field, '👤');
            }
        });

        passwordFields.forEach(field => {
            if (!field.dataset.passwordManager) {
                field.dataset.passwordManager = 'password';
                this.addFieldIndicator(field, '🔒');
            }
        });
    }

    addFieldIndicator(field, emoji) {
        // Criar indicador visual
        const indicator = document.createElement('div');
        indicator.className = 'mypassword-indicator';
        indicator.textContent = emoji;
        indicator.style.cssText = `
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 16px;
            pointer-events: none;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.9);
            padding: 2px;
            border-radius: 3px;
        `;

        // Posicionar o campo para poder posicionar o indicador
        if (getComputedStyle(field).position === 'static') {
            field.style.position = 'relative';
        }

        // Adicionar o indicador
        field.parentNode.appendChild(indicator);
    }

    fillFormFields(username, password) {
        console.log('MyPassword: Preenchendo campos com:', { username, password });
        
        // Buscar campos de usuário
        const usernameFields = this.findUsernameFields();
        const passwordFields = this.findPasswordFields();
        
        console.log('MyPassword: Campos encontrados:', {
            username: usernameFields.length,
            password: passwordFields.length
        });

        // Preencher campos de usuário
        usernameFields.forEach(field => {
            if (field && !field.readOnly && !field.disabled) {
                this.fillField(field, username);
            }
        });

        // Preencher campos de senha
        passwordFields.forEach(field => {
            if (field && !field.readOnly && !field.disabled) {
                this.fillField(field, password);
            }
        });

        // Tentar submeter o formulário se houver apenas um
        this.trySubmitForm();
    }

    findUsernameFields() {
        const selectors = [
            'input[type="text"]',
            'input[type="email"]',
            'input[name*="user"]',
            'input[name*="email"]',
            'input[name*="login"]',
            'input[name*="account"]',
            'input[id*="user"]',
            'input[id*="email"]',
            'input[id*="login"]',
            'input[id*="account"]',
            'input[placeholder*="usuário"]',
            'input[placeholder*="email"]',
            'input[placeholder*="login"]',
            'input[placeholder*="user"]',
            'input[placeholder*="e-mail"]'
        ];
        
        return Array.from(document.querySelectorAll(selectors.join(',')));
    }

    findPasswordFields() {
        const selectors = [
            'input[type="password"]',
            'input[name*="pass"]',
            'input[name*="senha"]',
            'input[id*="pass"]',
            'input[id*="senha"]',
            'input[placeholder*="senha"]',
            'input[placeholder*="password"]'
        ];
        
        return Array.from(document.querySelectorAll(selectors.join(',')));
    }

    fillField(field, value) {
        try {
            // Simular digitação real
            field.focus();
            field.value = value;
            
            // Disparar eventos para ativar validações
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('blur', { bubbles: true }));
            
            console.log('MyPassword: Campo preenchido:', field.name || field.id, value);
        } catch (error) {
            console.error('MyPassword: Erro ao preencher campo:', error);
        }
    }

    trySubmitForm() {
        // Buscar formulários
        const forms = document.querySelectorAll('form');
        
        if (forms.length === 1) {
            // Se houver apenas um formulário, tentar submeter
            const form = forms[0];
            const submitButton = form.querySelector('input[type="submit"], button[type="submit"], button:not([type])');
            
            if (submitButton) {
                console.log('MyPassword: Tentando submeter formulário automaticamente');
                // Aguardar um pouco antes de submeter
                setTimeout(() => {
                    submitButton.click();
                }, 500);
            }
        }
    }

    // Método para limpar indicadores
    cleanup() {
        const indicators = document.querySelectorAll('.mypassword-indicator');
        indicators.forEach(indicator => indicator.remove());
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FormFiller();
    });
} else {
    new FormFiller();
}

// Limpar quando a página for descarregada
window.addEventListener('beforeunload', () => {
    if (window.formFiller) {
        window.formFiller.cleanup();
    }
});

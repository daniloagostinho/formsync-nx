// Teste com Dados Reais - FormSync
let debugLogs = [];

function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    debugLogs.push({ message: logEntry, type });
    updateDebugLogs();
    console.log(logEntry);
}

function updateDebugLogs() {
    const logsDiv = document.getElementById('debugLogs');
    if (logsDiv) {
        logsDiv.innerHTML = debugLogs.map(log => 
            `<div class="${log.type}">${log.message}</div>`
        ).join('');
    }
}

async function loadRealData() {
    const statusDiv = document.getElementById('apiStatus');
    const resultDiv = document.getElementById('templatesResult');
    
    try {
        statusDiv.innerHTML = '<div class="info">🔄 Carregando dados da API...</div>';
        log('Iniciando carregamento de dados da API', 'info');
        
        const response = await fetch('https://backend-production-0914.up.railway.app/api/v1/public/templates?usuarioId=6', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        log(`Dados carregados: ${data.length} templates encontrados`, 'success');
        
        statusDiv.innerHTML = `<div class="success">✅ ${data.length} templates carregados com sucesso!</div>`;
        
        // Descriptografa os templates
        log('Iniciando descriptografia dos templates...', 'info');
        const decryptedTemplates = await window.formSyncDecryptionService.decryptTemplates(data);
        
        // Exibe os resultados
        displayTemplates(decryptedTemplates);
        
    } catch (error) {
        log(`Erro ao carregar dados: ${error.message}`, 'error');
        statusDiv.innerHTML = `<div class="error">❌ Erro ao carregar dados: ${error.message}</div>`;
    }
}

function displayTemplates(templates) {
    const resultDiv = document.getElementById('templatesResult');
    
    let html = '<h4>📋 Templates Descriptografados:</h4>';
    
    templates.forEach((template, index) => {
        html += `
            <div class="field-result">
                <h5>Template ${index + 1}: ${template.nome}</h5>
                <p><strong>Descrição:</strong> ${template.descricao || 'Sem descrição'}</p>
                <p><strong>Campos:</strong></p>
                <ul>
        `;
        
        if (template.campos && template.campos.length > 0) {
            template.campos.forEach(campo => {
                html += `
                    <li>
                        <strong>${campo.nome}</strong> (${campo.tipo}): 
                        <span style="color: #28a745; font-weight: bold;">${campo.valor}</span>
                    </li>
                `;
            });
        } else {
            html += '<li>Nenhum campo encontrado</li>';
        }
        
        html += `
                </ul>
            </div>
        `;
    });
    
    resultDiv.innerHTML = html;
    log(`Exibindo ${templates.length} templates descriptografados`, 'success');
}

function clearResults() {
    document.getElementById('apiStatus').innerHTML = '';
    document.getElementById('templatesResult').innerHTML = '';
    debugLogs = [];
    updateDebugLogs();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    log('Página de teste carregada', 'info');
    
    if (window.formSyncDecryptionService) {
        log('Serviço de descriptografia disponível', 'success');
    } else {
        log('Serviço de descriptografia não encontrado', 'error');
    }
});









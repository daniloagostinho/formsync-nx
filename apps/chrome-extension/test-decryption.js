// Teste de Descriptografia - FormSync
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

function updateServiceStatus() {
    const statusDiv = document.getElementById('serviceStatus');
    
    if (window.formSyncDecryptionService) {
        statusDiv.innerHTML = `
            <div class="success">
                ✅ Serviço de descriptografia carregado com sucesso
            </div>
            <pre>Chave: ${window.formSyncDecryptionService.encryptionKey}
IV: ${window.formSyncDecryptionService.encryptionIV}
Algoritmo: ${window.formSyncDecryptionService.algorithm}</pre>
        `;
        log('Serviço de descriptografia inicializado', 'success');
    } else {
        statusDiv.innerHTML = `
            <div class="error">
                ❌ Serviço de descriptografia não encontrado
            </div>
        `;
        log('Serviço de descriptografia não encontrado', 'error');
    }
}

async function testDecryption() {
    const input = document.getElementById('encryptedInput');
    const resultDiv = document.getElementById('testResult');
    const encryptedValue = input.value.trim();

    if (!encryptedValue) {
        resultDiv.innerHTML = `
            <div class="error">
                ❌ Por favor, insira um valor criptografado para testar
            </div>
        `;
        return;
    }

    if (!window.formSyncDecryptionService) {
        resultDiv.innerHTML = `
            <div class="error">
                ❌ Serviço de descriptografia não disponível
            </div>
        `;
        return;
    }

    try {
        log(`Testando descriptografia de: ${encryptedValue.substring(0, 50)}...`, 'info');
        
        const isEncrypted = window.formSyncDecryptionService.isEncrypted(encryptedValue);
        log(`Valor é criptografado: ${isEncrypted}`, isEncrypted ? 'success' : 'info');
        
        const decryptedValue = await window.formSyncDecryptionService.decrypt(encryptedValue);
        
        resultDiv.innerHTML = `
            <div class="success">
                ✅ Descriptografia realizada com sucesso!
            </div>
            <h4>Valor Original (Criptografado):</h4>
            <pre>${encryptedValue}</pre>
            <h4>Valor Descriptografado:</h4>
            <pre>${decryptedValue}</pre>
        `;
        
        log(`Descriptografia bem-sucedida: ${decryptedValue}`, 'success');
        
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="error">
                ❌ Erro na descriptografia: ${error.message}
            </div>
        `;
        log(`Erro na descriptografia: ${error.message}`, 'error');
    }
}

function clearResults() {
    document.getElementById('encryptedInput').value = '';
    document.getElementById('testResult').innerHTML = '';
    debugLogs = [];
    updateDebugLogs();
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    log('Página de teste carregada', 'info');
    updateServiceStatus();
    
    // Teste automático com um valor de exemplo
    setTimeout(() => {
        if (window.formSyncDecryptionService) {
            log('Executando teste automático...', 'info');
            // Aqui você pode adicionar um teste automático se necessário
        }
    }, 1000);
});









// Teste Rápido - FormSync
async function runQuickTest() {
    const resultDiv = document.getElementById('testResult');
    const statusDiv = document.getElementById('status');
    
    try {
        statusDiv.innerHTML = '<div class="info">🔄 Executando teste...</div>';
        
        // Dados reais da API (exemplo)
        const testData = "\\xc30d04070302b4abb9396dd519e873d2370142272b464fbee32b8aba765842d3577e320a2301e380dc50ab63b15fc459639786a857c8edbb319715553782b3ef381667218d3fb802";
        
        console.log('FormSync: Testando descriptografia com dados reais...');
        console.log('FormSync: Dados de teste:', testData);
        
        if (!window.formSyncDecryptionService) {
            throw new Error('Serviço de descriptografia não encontrado');
        }
        
        // Testa a detecção
        const isEncrypted = window.formSyncDecryptionService.isEncrypted(testData);
        console.log('FormSync: Dados são criptografados?', isEncrypted);
        
        if (!isEncrypted) {
            resultDiv.innerHTML = `
                <div class="error">
                    ❌ Dados não foram detectados como criptografados
                </div>
                <pre>Dados: ${testData}</pre>
            `;
            return;
        }
        
        // Testa a descriptografia
        const decryptedValue = await window.formSyncDecryptionService.decrypt(testData);
        console.log('FormSync: Valor descriptografado:', decryptedValue);
        
        resultDiv.innerHTML = `
            <div class="success">
                ✅ Descriptografia realizada com sucesso!
            </div>
            <h4>Valor Original:</h4>
            <pre>${testData}</pre>
            <h4>Valor Descriptografado:</h4>
            <pre style="color: #28a745; font-weight: bold;">${decryptedValue}</pre>
        `;
        
        statusDiv.innerHTML = '<div class="success">✅ Teste concluído com sucesso!</div>';
        
    } catch (error) {
        console.error('FormSync: Erro no teste:', error);
        resultDiv.innerHTML = `
            <div class="error">
                ❌ Erro no teste: ${error.message}
            </div>
        `;
        statusDiv.innerHTML = '<div class="error">❌ Teste falhou</div>';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    
    if (window.formSyncDecryptionService) {
        statusDiv.innerHTML = '<div class="success">✅ Serviço de descriptografia carregado</div>';
        console.log('FormSync: Serviço de descriptografia disponível');
    } else {
        statusDiv.innerHTML = '<div class="error">❌ Serviço de descriptografia não encontrado</div>';
        console.error('FormSync: Serviço de descriptografia não encontrado');
    }
});









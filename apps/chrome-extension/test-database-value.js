// Teste com valor real do banco de dados
document.addEventListener('DOMContentLoaded', async () => {
    // Adiciona event listener para o botão
    const testButton = document.getElementById('testButton');
    if (testButton) {
        testButton.addEventListener('click', testDatabaseValue);
    }
    console.log('FormSync: Testando valor real do banco...');
    
    // Valor real do banco
    const valorDoBanco = "\\xc30d04070302b4abb9396dd519e873d2370142272b464fbee32b8aba765842d3577e320a2301e380dc50ab63b15fc459639786a857c8edbb319715553782b3ef381667218d3fb802";
    
    console.log('Valor original:', valorDoBanco);
    console.log('Tamanho:', valorDoBanco.length);
    console.log('Começa com \\x:', valorDoBanco.startsWith('\\x'));
    
    if (window.formSyncDecryptionService) {
        try {
            // Teste 1: Com o serviço atual
            console.log('=== TESTE 1: Serviço Atual ===');
            const isEncrypted = window.formSyncDecryptionService.isEncrypted(valorDoBanco);
            console.log('É detectado como criptografado?', isEncrypted);
            
            if (isEncrypted) {
                const decrypted = await window.formSyncDecryptionService.decrypt(valorDoBanco);
                console.log('Valor descriptografado:', decrypted);
            }
            
            // Teste 2: Tentativa manual de descriptografia
            console.log('=== TESTE 2: Descriptografia Manual ===');
            
            // Remove o prefixo \x
            const hexString = valorDoBanco.substring(2);
            console.log('String hexadecimal:', hexString.substring(0, 50) + '...');
            
            // Converte para bytes
            const bytes = new Uint8Array(hexString.length / 2);
            for (let i = 0; i < hexString.length; i += 2) {
                bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
            }
            console.log('Bytes convertidos:', bytes.slice(0, 20));
            
            // Teste 3: Verificação se é Base64 válido
            console.log('=== TESTE 3: Verificação Base64 ===');
            const base64String = btoa(String.fromCharCode.apply(null, bytes));
            console.log('Como Base64:', base64String.substring(0, 50) + '...');
            
            // Teste 4: Tentativa de descriptografia direta
            console.log('=== TESTE 4: Tentativa Direta ===');
            try {
                const decoder = new TextDecoder();
                const decoded = decoder.decode(bytes);
                console.log('Decodificação direta:', decoded.substring(0, 50));
            } catch (e) {
                console.log('Erro na decodificação direta:', e.message);
            }
            
        } catch (error) {
            console.error('Erro nos testes:', error);
        }
    } else {
        console.error('Serviço de descriptografia não encontrado');
    }
});

// Função para testar manualmente
window.testDatabaseValue = async function() {
    const input = document.getElementById('testInput');
    const result = document.getElementById('testResult');
    
    if (!input || !result) {
        console.error('Elementos não encontrados');
        return;
    }
    
    const value = input.value || "\\xc30d04070302b4abb9396dd519e873d2370142272b464fbee32b8aba765842d3577e320a2301e380dc50ab63b15fc459639786a857c8edbb319715553782b3ef381667218d3fb802";
    
    try {
        if (window.formSyncDecryptionService) {
            const decrypted = await window.formSyncDecryptionService.decrypt(value);
            result.innerHTML = `
                <h4>Resultado:</h4>
                <p><strong>Original:</strong> ${value.substring(0, 50)}...</p>
                <p><strong>Descriptografado:</strong> ${decrypted}</p>
            `;
        } else {
            result.innerHTML = '<p style="color: red;">Serviço não encontrado</p>';
        }
    } catch (error) {
        result.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
    }
};

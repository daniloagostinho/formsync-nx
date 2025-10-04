// Background script para Firefox
browser.runtime.onInstalled.addListener(() => {
    console.log('MyPassword extensão instalada com sucesso!');
});

// Listener para mensagens de outras partes da extensão
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPasswords') {
        // Aqui você pode implementar lógica adicional se necessário
        sendResponse({ success: true });
    }
});

// Nota: Context menu foi removido pois não é necessário para funcionalidade básica
// e pode causar problemas de compatibilidade

// Script de debug para monitorar chamadas Stripe
console.log('🔍 [DEBUG_SCRIPT] Script de debug Stripe ativado!');

// Interceptar fetch global para capturar chamadas diretas
const originalFetch = window.fetch;
window.fetch = function(...args) {
  const url = args[0];
  
  if (typeof url === 'string' && url.includes('api.stripe.com')) {
    console.log('🚨 [FETCH_INTERCEPTOR] Chamada fetch para Stripe detectada!');
    console.log('   - URL:', url);
    console.log('   - Argumentos:', args);
    console.log('   - Stack trace:', new Error().stack);
  }
  
  return originalFetch.apply(this, args).then(response => {
    if (typeof url === 'string' && url.includes('api.stripe.com')) {
      console.log('📡 [FETCH_INTERCEPTOR] Resposta da Stripe:', response.status, response.statusText);
    }
    return response;
  }).catch(error => {
    if (typeof url === 'string' && url.includes('api.stripe.com')) {
      console.error('❌ [FETCH_INTERCEPTOR] Erro na chamada Stripe:', error);
    }
    throw error;
  });
};

// Interceptar XMLHttpRequest
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  if (typeof url === 'string' && url.includes('api.stripe.com')) {
    console.log('🚨 [XHR_INTERCEPTOR] XMLHttpRequest para Stripe detectado!');
    console.log('   - Method:', method);
    console.log('   - URL:', url);
    console.log('   - Stack trace:', new Error().stack);
  }
  
  return originalXHROpen.call(this, method, url, ...args);
};

console.log('✅ [DEBUG_SCRIPT] Interceptadores instalados!');

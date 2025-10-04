export const swConfig = {
  // Configurações do Service Worker
  enabled: true,
  
  // Estratégias de cache
  cache: {
    // Cache de assets estáticos
    static: {
      name: 'static-cache-v1',
      urls: [
        '/assets/**/*',
        '/favicon.ico',
        '/manifest.json'
      ]
    },
    
    // Cache de API
    api: {
      name: 'api-cache-v1',
      maxAge: 5 * 60 * 1000 // 5 minutos
    }
  },
  
  // Estratégia de atualização
  update: {
    // Verificar atualizações a cada 1 hora
    checkInterval: 60 * 60 * 1000,
    // Forçar atualização após 24 horas
    forceUpdateAfter: 24 * 60 * 60 * 1000
  }
};

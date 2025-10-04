import { ApplicationConfig } from '@angular/core';

export const angularOptimizations = {
  // Configurações de performance do Angular 20
  
  // Zone.js otimizações
  zone: {
    // Coalescing de eventos para melhor performance
    eventCoalescing: true,
    // Detecção de mudanças assíncrona
    async: true,
    // Otimizações de timing
    timing: {
      // Delay para detecção de mudanças
      changeDetectionDelay: 0,
      // Throttling de eventos
      eventThrottling: true
    }
  },
  
  // Configurações de build
  build: {
    // Tree shaking automático
    treeShaking: true,
    // Minificação agressiva
    minification: true,
    // Dead code elimination
    deadCodeElimination: true,
    // Side effects optimization
    sideEffects: false
  },
  
  // Configurações de runtime
  runtime: {
    // Lazy loading otimizado
    lazyLoading: {
      // Preload de rotas críticas
      preloadCritical: true,
      // Preload inteligente baseado em uso
      intelligentPreload: true,
      // Cache de módulos
      moduleCaching: true
    },
    
    // Change detection otimizado
    changeDetection: {
      // Estratégia OnPush por padrão
      defaultStrategy: 'OnPush',
      // Detecção de mudanças assíncrona
      async: true,
      // Coalescing de mudanças
      coalescing: true
    }
  },
  
  // Configurações de PWA
  pwa: {
    // Service worker
    serviceWorker: true,
    // Cache de assets
    assetCaching: true,
    // Cache de API
    apiCaching: true,
    // Offline support
    offline: true
  }
};

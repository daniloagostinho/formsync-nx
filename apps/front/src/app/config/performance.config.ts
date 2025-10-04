import { ApplicationConfig } from '@angular/core';

export const performanceConfig = {
  // Configurações de performance
  changeDetection: {
    // Estratégia de detecção de mudanças otimizada
    strategy: 'OnPush',
    // Coalescing de eventos para melhor performance
    eventCoalescing: true,
    // Detecção de mudanças assíncrona
    async: true
  },
  
  // Configurações de build
  build: {
    // Otimizações de bundle
    optimization: true,
    // Tree shaking
    treeShaking: true,
    // Minificação
    minification: true
  },
  
  // Configurações de lazy loading
  lazyLoading: {
    // Preload de rotas críticas
    preloadCritical: true,
    // Preload de rotas frequentes
    preloadFrequent: true,
    // Delay para preload de rotas ocasionais
    preloadDelay: 5000
  }
};

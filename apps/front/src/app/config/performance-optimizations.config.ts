export const performanceOptimizations = {
    // Otimizações de Change Detection
    changeDetection: {
        // Estratégia padrão
        defaultStrategy: 'OnPush',

        // Componentes que devem usar OnPush
        onPushComponents: [
            'app-home',
            'app-footer',
            'app-sidebar',
            'app-loading-skeleton',
            'app-loading-button',
            'app-terms',
            'app-privacy',
            'app-cookies'
        ],

        // Componentes que devem manter Default (mudam frequentemente)
        defaultComponents: [
            'app-dashboard',
            'app-upload-csv',
            'app-template-manager',
            'app-analytics',
            'app-perfil'
        ],

        // Configurações de performance
        performance: {
            // Detecção assíncrona
            async: true,
            // Coalescing de eventos
            eventCoalescing: true,
            // Throttling de mudanças (60fps)
            changeDetectionThrottling: 16,
            // Detecção em lotes
            batchChangeDetection: true,
            // Execução fora da zona quando possível
            runOutsideZone: true
        }
    },

    // Otimizações de Lazy Loading
    lazyLoading: {
        // Preload de rotas críticas
        preloadCritical: true,
        // Preload de rotas frequentes
        preloadFrequent: true,
        // Delay para preload de rotas ocasionais
        preloadDelay: 5000,
        // Cache de módulos
        moduleCaching: true
    },

    // Otimizações de Bundle
    bundle: {
        // Tree shaking
        treeShaking: true,
        // Minificação
        minification: true,
        // Dead code elimination
        deadCodeElimination: true,
        // Side effects optimization
        sideEffects: false
    },

    // Otimizações de Runtime
    runtime: {
        // Service worker
        serviceWorker: true,
        // Cache de assets
        assetCaching: true,
        // Cache de API
        apiCaching: true,
        // Lazy loading de imagens
        imageLazyLoading: true
    }
};

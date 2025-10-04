import { ChangeDetectionStrategy } from '@angular/core';

export const changeDetectionConfig = {
    // Estratégia padrão para componentes
    defaultStrategy: ChangeDetectionStrategy.OnPush,

    // Componentes que devem usar OnPush
    onPushComponents: [
        'app-home',
        'app-footer',
        'app-sidebar',
        'app-loading-skeleton',
        'app-loading-button'
    ],

    // Componentes que devem manter Default (mudam frequentemente)
    defaultComponents: [
        'app-dashboard',
        'app-upload-csv',
        'app-template-manager',
        'app-analytics'
    ],

    // Configurações de performance
    performance: {
        // Detecção de mudanças assíncrona
        async: true,
        // Coalescing de eventos
        eventCoalescing: true,
        // Throttling de mudanças
        changeDetectionThrottling: 16, // ~60fps
        // Detecção de mudanças em lotes
        batchChangeDetection: true
    }
};

export const standaloneOptimizations = {
    // Configurações para Standalone Components
    components: {
        // Habilitar tree shaking automático
        enableTreeShaking: true,

        // Optimizações de imports
        optimizeImports: true,

        // Componentes já convertidos para standalone
        standaloneComponents: [
            'AppComponent',
            'HomeComponent',
            'FooterComponent',
            'SidebarComponent',
            'LoadingSkeletonComponent',
            'LoadingButtonComponent',
            'TermsComponent',
            'PrivacyComponent',
            'CookiesComponent',
            'DemoComponent',
            'FaqComponent',
            'ContatoComponent',
            'RegistrarComponent',
            'LoginComponent',
            'VerificarCodigoComponent',
            'SucessoComponent',
            'ListaNotificacoesComponent',
            'TopbarComponent',
            'HeaderComponent',
            'CookieBannerComponent',
            'TourComponent',
            'ChatbotComponent',
            'CustomNotificationComponent',
            'LazyImageDirective'
        ],

        // Componentes candidatos para conversão
        candidatesForConversion: [
            'DashboardComponent',
            'UploadCsvComponent',
            'TemplateManagerComponent',
            'AnalyticsComponent',
            'PerfilComponent',
            'UpgradeComponent',
            'ConfiguracaoNotificacoesComponent',
            'CancelarAssinaturaComponent',
            'PlanCalculatorPageComponent',
            'SecurityDashboardComponent'
        ]
    },

    // Otimizações de Tree Shaking
    treeShaking: {
        // Shake unused Angular Material modules
        shakeUnusedMaterialModules: true,

        // Shake unused RxJS operators
        shakeUnusedRxJSOperators: true,

        // Shake unused utility functions
        shakeUnusedUtilities: true,

        // Dead code elimination
        deadCodeElimination: true,

        // Side effects optimization
        sideEffectsOptimization: true
    },

    // Otimizações de Bundle
    bundleOptimizations: {
        // Split vendor chunks
        splitVendorChunks: true,

        // Common chunk optimization
        commonChunkOptimization: true,

        // Module concatenation
        moduleConcatenation: true,

        // Scope hoisting
        scopeHoisting: true
    },

    // Imports otimizados
    optimizedImports: {
        // Angular Material - imports específicos
        angularMaterial: {
            strategy: 'specific', // 'specific' | 'full'
            modules: [
                'MatButtonModule',
                'MatIconModule',
                'MatCardModule',
                'MatFormFieldModule',
                'MatInputModule',
                'MatSelectModule',
                'MatProgressSpinnerModule',
                'MatDialogModule',
                'MatSnackBarModule',
                'MatTooltipModule',
                'MatSlideToggleModule',
                'MatExpansionModule',
                'MatListModule',
                'MatDividerModule',
                'MatChipsModule',
                'MatBadgeModule'
            ]
        },

        // RxJS - imports específicos
        rxjs: {
            strategy: 'specific',
            operators: [
                'map',
                'filter',
                'tap',
                'catchError',
                'finalize',
                'switchMap',
                'mergeMap',
                'distinctUntilChanged',
                'debounceTime',
                'takeUntil'
            ]
        },

        // Lodash - tree shaking habilitado
        lodash: {
            strategy: 'specific',
            functions: []
        }
    }
};

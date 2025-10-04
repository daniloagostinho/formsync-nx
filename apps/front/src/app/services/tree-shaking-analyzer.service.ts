import { Injectable } from '@angular/core';

export interface TreeShakingAnalysis {
    componentName: string;
    isStandalone: boolean;
    importCount: number;
    unusedImports: string[];
    optimizationSuggestions: string[];
    estimatedBundleImpact: {
        size: string;
        shakingPotential: 'high' | 'medium' | 'low';
    };
}

@Injectable({
    providedIn: 'root'
})
export class TreeShakingAnalyzerService {

    constructor() { }

    /**
     * Analisa um componente para otimizações de tree shaking
     */
    analyzeComponent(componentMetadata: any): TreeShakingAnalysis {
        const analysis: TreeShakingAnalysis = {
            componentName: componentMetadata.name || 'Unknown',
            isStandalone: componentMetadata.standalone || false,
            importCount: componentMetadata.imports?.length || 0,
            unusedImports: [],
            optimizationSuggestions: [],
            estimatedBundleImpact: {
                size: 'unknown',
                shakingPotential: 'low'
            }
        };

        // Verificar se é standalone
        if (!analysis.isStandalone) {
            analysis.optimizationSuggestions.push('Convert to standalone component for better tree shaking');
        }

        // Analisar imports
        if (analysis.importCount === 0 && analysis.isStandalone) {
            analysis.optimizationSuggestions.push('Add specific imports instead of relying on modules');
        }

        // Calcular impacto no bundle
        analysis.estimatedBundleImpact = this.calculateBundleImpact(analysis.importCount);

        // Verificar padrões de otimização
        if (componentMetadata.changeDetection !== 'OnPush') {
            analysis.optimizationSuggestions.push('Use OnPush change detection for better performance');
        }

        return analysis;
    }

    /**
     * Calcula o impacto estimado no bundle
     */
    private calculateBundleImpact(importCount: number): { size: string; shakingPotential: 'high' | 'medium' | 'low' } {
        if (importCount <= 5) {
            return { size: '< 10KB', shakingPotential: 'high' };
        } else if (importCount <= 15) {
            return { size: '10-30KB', shakingPotential: 'medium' };
        } else {
            return { size: '> 30KB', shakingPotential: 'low' };
        }
    }

    /**
     * Gera relatório de otimização para múltiplos componentes
     */
    generateOptimizationReport(components: any[]): {
        totalComponents: number;
        standaloneComponents: number;
        optimizationOpportunities: number;
        estimatedSavings: string;
        recommendations: string[];
    } {
        const analyses = components.map(comp => this.analyzeComponent(comp));

        const standaloneCount = analyses.filter(a => a.isStandalone).length;
        const optimizationOpportunities = analyses.filter(a => a.optimizationSuggestions.length > 0).length;

        const recommendations = [
            `Convert ${components.length - standaloneCount} components to standalone`,
            'Implement OnPush change detection where applicable',
            'Optimize Angular Material imports',
            'Remove unused RxJS operators',
            'Enable tree shaking in build configuration'
        ];

        return {
            totalComponents: components.length,
            standaloneComponents: standaloneCount,
            optimizationOpportunities,
            estimatedSavings: `${Math.round((optimizationOpportunities / components.length) * 30)}% bundle reduction`,
            recommendations
        };
    }

    /**
     * Verifica otimizações específicas do Angular Material
     */
    analyzeMaterialImports(imports: string[]): {
        optimized: boolean;
        suggestions: string[];
        potentialSavings: string;
    } {
        const materialImports = imports.filter(imp => imp.includes('Mat'));
        const hasFullMaterialImport = imports.some(imp => imp === 'MaterialModule' || imp === 'AngularMaterialModule');

        const suggestions: string[] = [];

        if (hasFullMaterialImport) {
            suggestions.push('Replace full Material module import with specific component imports');
        }

        if (materialImports.length > 10) {
            suggestions.push('Consider creating a shared Material module for this feature');
        }

        return {
            optimized: !hasFullMaterialImport && materialImports.length < 15,
            suggestions,
            potentialSavings: hasFullMaterialImport ? '200-400KB' : '10-50KB'
        };
    }

    /**
     * Verifica otimizações específicas do RxJS
     */
    analyzeRxJSImports(imports: string[]): {
        optimized: boolean;
        suggestions: string[];
        potentialSavings: string;
    } {
        const rxjsImports = imports.filter(imp => imp.includes('rxjs'));
        const hasFullRxJSImport = imports.some(imp => imp === 'rxjs' || imp === 'rxjs/operators');

        const suggestions: string[] = [];

        if (hasFullRxJSImport) {
            suggestions.push('Import specific operators instead of full RxJS library');
        }

        return {
            optimized: !hasFullRxJSImport,
            suggestions,
            potentialSavings: hasFullRxJSImport ? '100-200KB' : '5-20KB'
        };
    }

    /**
     * Sugere otimizações automáticas
     */
    suggestAutomaticOptimizations(): string[] {
        return [
            'Enable tree shaking in angular.json',
            'Configure webpack for better dead code elimination',
            'Use Angular CLI budgets to monitor bundle size',
            'Implement lazy loading for all feature modules',
            'Convert all components to standalone',
            'Use OnPush change detection strategy',
            'Optimize third-party library imports',
            'Enable build optimizer in production'
        ];
    }
}

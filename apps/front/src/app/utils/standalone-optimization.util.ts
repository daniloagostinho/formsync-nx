import { Type } from '@angular/core';

export class StandaloneOptimizationUtil {

    /**
     * Otimiza imports para componentes standalone
     */
    static optimizeImports(imports: Type<any>[]): Type<any>[] {
        // Remove duplicatas
        const uniqueImports = [...new Set(imports)];

        // Ordena imports para melhor tree shaking
        return uniqueImports.sort((a, b) => {
            const aName = a.name || '';
            const bName = b.name || '';

            // Angular core modules primeiro
            if (aName.startsWith('Common') && !bName.startsWith('Common')) return -1;
            if (!aName.startsWith('Common') && bName.startsWith('Common')) return 1;

            // Angular Material modules em segundo
            if (aName.startsWith('Mat') && !bName.startsWith('Mat')) return -1;
            if (!aName.startsWith('Mat') && bName.startsWith('Mat')) return 1;

            // Componentes customizados por último
            return aName.localeCompare(bName);
        });
    }

    /**
     * Verifica se um componente está otimizado para standalone
     */
    static isOptimizedStandalone(componentMetadata: any): boolean {
        return !!(
            componentMetadata.standalone &&
            componentMetadata.imports &&
            componentMetadata.imports.length > 0
        );
    }

    /**
     * Sugere otimizações para um componente
     */
    static suggestOptimizations(componentMetadata: any): string[] {
        const suggestions: string[] = [];

        if (!componentMetadata.standalone) {
            suggestions.push('Convert to standalone component');
        }

        if (componentMetadata.imports && componentMetadata.imports.length === 0) {
            suggestions.push('Add specific imports instead of using modules');
        }

        if (!componentMetadata.changeDetection || componentMetadata.changeDetection === 'Default') {
            suggestions.push('Consider using OnPush change detection strategy');
        }

        return suggestions;
    }

    /**
     * Calcula o impacto no bundle de um componente standalone
     */
    static calculateBundleImpact(imports: Type<any>[]): {
        estimatedSize: string;
        treeShakingPotential: 'high' | 'medium' | 'low';
    } {
        const importCount = imports.length;

        // Estimativa básica baseada no número de imports
        let estimatedSize = '< 5KB';
        let treeShakingPotential: 'high' | 'medium' | 'low' = 'high';

        if (importCount > 10) {
            estimatedSize = '10-20KB';
            treeShakingPotential = 'medium';
        }

        if (importCount > 20) {
            estimatedSize = '> 20KB';
            treeShakingPotential = 'low';
        }

        return {
            estimatedSize,
            treeShakingPotential
        };
    }

    /**
     * Verifica dependências desnecessárias
     */
    static findUnusedDependencies(
        imports: Type<any>[],
        usedInTemplate: string[],
        usedInComponent: string[]
    ): Type<any>[] {
        const allUsed = [...usedInTemplate, ...usedInComponent];

        return imports.filter(imp => {
            const importName = imp.name || '';
            return !allUsed.some(used =>
                importName.toLowerCase().includes(used.toLowerCase()) ||
                used.toLowerCase().includes(importName.toLowerCase())
            );
        });
    }
}

/**
 * Decorator para marcar componentes como otimizados
 */
export function OptimizedStandalone(config?: {
    treeShaking?: boolean;
    bundleSize?: 'small' | 'medium' | 'large';
}) {
    return function (target: any) {
        target.__optimizedStandalone = true;
        target.__optimizationConfig = config || {};
        return target;
    };
}

/**
 * Interface para configuração de otimização
 */
export interface StandaloneOptimizationConfig {
    enableTreeShaking: boolean;
    optimizeImports: boolean;
    deadCodeElimination: boolean;
    bundleAnalysis: boolean;
}

import { Injectable, ChangeDetectorRef, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChangeDetectionOptimizerService {
    private changeDetectionSubject = new BehaviorSubject<boolean>(false);
    public changeDetection$: Observable<boolean> = this.changeDetectionSubject.asObservable();

    constructor(private ngZone: NgZone) { }

    /**
     * Otimiza a detecção de mudanças para componentes com OnPush
     */
    optimizeChangeDetection(cdr: ChangeDetectorRef, strategy: 'onPush' | 'default' = 'onPush') {
        if (strategy === 'onPush') {
            // Para componentes OnPush, forçar detecção apenas quando necessário
            this.ngZone.runOutsideAngular(() => {
                // Executar fora da zona para melhor performance
                setTimeout(() => {
                    this.ngZone.run(() => {
                        cdr.detectChanges();
                    });
                }, 0);
            });
        }
    }

    /**
     * Força detecção de mudanças em componentes OnPush
     */
    forceChangeDetection(cdr: ChangeDetectorRef) {
        this.ngZone.run(() => {
            cdr.detectChanges();
        });
    }

    /**
     * Marca para verificação de mudanças (mais eficiente que detectChanges)
     */
    markForCheck(cdr: ChangeDetectorRef) {
        this.ngZone.run(() => {
            cdr.markForCheck();
        });
    }

    /**
     * Otimiza detecção de mudanças em lotes
     */
    batchChangeDetection(changeDetectors: ChangeDetectorRef[]) {
        this.ngZone.runOutsideAngular(() => {
            // Agrupar todas as mudanças
            requestAnimationFrame(() => {
                this.ngZone.run(() => {
                    changeDetectors.forEach(cdr => {
                        cdr.detectChanges();
                    });
                });
            });
        });
    }

    /**
     * Configura throttling para detecção de mudanças
     */
    setupThrottling(cdr: ChangeDetectorRef, delay: number = 16) {
        let timeoutId: any;

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                this.ngZone.run(() => {
                    cdr.detectChanges();
                });
            }, delay);
        };
    }
}

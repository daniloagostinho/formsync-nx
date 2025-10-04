import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrivacyService } from '../../services/privacy.service';
import { Subscription } from 'rxjs';

export interface LgpdConsentResult {
    politicaPrivacidade: boolean;
    marketing: boolean;
    cookies: boolean;
}

@Component({
    selector: 'app-lgpd-consent',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-blue-900">Consentimento LGPD</h3>
          <p class="text-sm text-blue-700">Para continuar, aceite nossa política de privacidade</p>
        </div>
      </div>

      <!-- Checkboxes de Consentimento -->
      <div class="space-y-4">
        <!-- Política de Privacidade (Obrigatório) -->
        <div class="flex items-start gap-3">
          <input
            type="checkbox"
            id="politicaPrivacidade"
            [(ngModel)]="consentimento.politicaPrivacidade"
            (change)="onConsentimentoChange()"
            class="mt-1 w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
            required
          >
          <label for="politicaPrivacidade" class="flex-1 text-sm text-blue-800 leading-relaxed">
            <span class="font-medium">Política de Privacidade</span> 
            <span class="text-red-600">*</span>
            <br>
            <span class="text-blue-700">Li e aceito a coleta e uso dos meus dados pessoais conforme descrito na política de privacidade.</span>
          </label>
        </div>

        <!-- Marketing (Opcional) -->
        <div class="flex items-start gap-3">
          <input
            type="checkbox"
            id="marketing"
            [(ngModel)]="consentimento.marketing"
            (change)="onConsentimentoChange()"
            class="mt-1 w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
          >
          <label for="marketing" class="flex-1 text-sm text-blue-800 leading-relaxed">
            <span class="font-medium">Marketing e Comunicações</span>
            <br>
            <span class="text-blue-700">Aceito receber e-mails sobre novos recursos, atualizações e ofertas especiais.</span>
          </label>
        </div>

        <!-- Cookies (Opcional) -->
        <div class="flex items-start gap-3">
          <input
            type="checkbox"
            id="cookies"
            [(ngModel)]="consentimento.cookies"
            (change)="onConsentimentoChange()"
            class="mt-1 w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
          >
          <label for="cookies" class="flex-1 text-sm text-blue-800 leading-relaxed">
            <span class="font-medium">Cookies e Analytics</span>
            <br>
            <span class="text-blue-700">Aceito o uso de cookies para melhorar a experiência e analisar o uso do serviço.</span>
          </label>
        </div>
      </div>

      <!-- Links para Políticas -->
      <div class="pt-4 border-t border-blue-200">
        <div class="flex flex-wrap gap-4 text-sm">
          <a 
            routerLink="/privacidade" 
            target="_blank"
            class="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
          >
            📋 Política de Privacidade
          </a>
          <a 
            routerLink="/termos" 
            target="_blank"
            class="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
          >
            📄 Termos de Uso
          </a>
        </div>
      </div>

      <!-- Status do Consentimento -->
      <div class="bg-white rounded-lg p-3 border border-blue-100">
        <div class="flex items-center justify-between">
          <span class="text-sm text-blue-700">Status do consentimento:</span>
          <div class="flex items-center gap-2">
            <div 
              class="w-3 h-3 rounded-full"
              [ngClass]="consentimento.politicaPrivacidade ? 'bg-green-500' : 'bg-red-500'"
            ></div>
            <span 
              class="text-sm font-medium"
              [ngClass]="consentimento.politicaPrivacidade ? 'text-green-600' : 'text-red-600'"
            >
              {{ consentimento.politicaPrivacidade ? '✓ Completo' : '✗ Pendente' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Botão de Revogar -->
      <div *ngIf="consentimento.politicaPrivacidade" class="text-center">
        <button
          type="button"
          (click)="revogarConsentimento()"
          class="text-sm text-red-600 hover:text-red-800 underline transition-colors duration-200"
        >
          Revogar consentimento
        </button>
      </div>
    </div>
  `,
    styles: []
})
export class LgpdConsentComponent implements OnInit, OnDestroy {
    @Input() consentimento: LgpdConsentResult = {
        politicaPrivacidade: false,
        marketing: false,
        cookies: false
    };

    @Output() consentimentoChange = new EventEmitter<LgpdConsentResult>();
    
    private subscriptions: Subscription[] = [];
    carregando = false;

    constructor(private privacyService: PrivacyService) {}

    ngOnInit() {
        // Carregar status de consentimento do backend
        this.carregarStatusConsentimento();
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }

    carregarStatusConsentimento() {
        const sub = this.privacyService.consentimento$.subscribe(status => {
            if (status) {
                this.consentimento = {
                    politicaPrivacidade: status.consentimentoLGPD || false,
                    marketing: status.consentimentoMarketing || false,
                    cookies: status.consentimentoAnalytics || false
                };
            }
        });
        this.subscriptions.push(sub);
    }

    onConsentimentoChange() {
        this.consentimentoChange.emit(this.consentimento);
        
        // Salvar no backend
        this.salvarConsentimento();
    }

    salvarConsentimento() {
        this.carregando = true;
        
        // Salvar consentimento LGPD
        if (this.consentimento.politicaPrivacidade) {
            const sub = this.privacyService.registrarConsentimento({
                tipoDado: 'LGPD',
                consentimento: true
            }).subscribe({
                next: () => {
                    console.log('Consentimento LGPD salvo');
                },
                error: (error) => {
                    console.error('Erro ao salvar consentimento LGPD:', error);
                }
            });
            this.subscriptions.push(sub);
        }

        // Salvar consentimento Marketing
        const subMarketing = this.privacyService.registrarConsentimento({
            tipoDado: 'MARKETING',
            consentimento: this.consentimento.marketing
        }).subscribe({
            next: () => {
                console.log('Consentimento Marketing salvo');
            },
            error: (error) => {
                console.error('Erro ao salvar consentimento Marketing:', error);
            }
        });
        this.subscriptions.push(subMarketing);

        // Salvar consentimento Analytics
        const subAnalytics = this.privacyService.registrarConsentimento({
            tipoDado: 'ANALYTICS',
            consentimento: this.consentimento.cookies
        }).subscribe({
            next: () => {
                console.log('Consentimento Analytics salvo');
                this.carregando = false;
            },
            error: (error) => {
                console.error('Erro ao salvar consentimento Analytics:', error);
                this.carregando = false;
            }
        });
        this.subscriptions.push(subAnalytics);
    }

    revogarConsentimento() {
        this.consentimento = {
            politicaPrivacidade: false,
            marketing: false,
            cookies: false
        };
        this.consentimentoChange.emit(this.consentimento);
        this.salvarConsentimento();
    }

    get isConsentimentoCompleto(): boolean {
        return this.consentimento.politicaPrivacidade;
    }
}

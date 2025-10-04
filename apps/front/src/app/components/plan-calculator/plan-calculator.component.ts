import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { calcularPlanoRecomendado, getPlanoConfig, PLANOS_CONFIG, PlanoConfig } from '../../shared/planos-config';

@Component({
  selector: 'app-plan-calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule
  ],
  template: `
    <div class="plan-calculator">
      <div class="calculator-header">
        <mat-icon class="calculator-icon">calculate</mat-icon>
        <h3>🧮 Qual plano é ideal para você?</h3>
        <p>Responda 2 perguntas simples e descubra!</p>
      </div>

      <!-- Layout em grid: inputs à esquerda, instrução à direita -->
      <div class="calculator-content">
        <!-- Coluna esquerda - Formulário -->
        <div class="calculator-form">
          <div class="question">
            <label for="qtd-templates">📁 Quantos formulários diferentes você precisa?</label>
            <select 
              id="qtd-templates" 
              [(ngModel)]="selectedTemplates" 
              (change)="calcular()"
              class="form-select">
              <option value="">Selecione...</option>
              <option value="1-3">1 a 3 (Uso básico: login, cadastros simples)</option>
              <option value="4-10">4 a 10 (Uso pessoal + trabalho)</option>
              <option value="11-25">11 a 25 (Profissional ativo)</option>
              <option value="26-50">26 a 50 (Freelancer/consultor)</option>
              <option value="50+">Mais de 50 (Empresa/equipe)</option>
            </select>
          </div>

          <div class="question">
            <label for="qtd-campos">📄 Cada formulário tem quantos campos em média?</label>
            <select 
              id="qtd-campos" 
              [(ngModel)]="selectedCampos" 
              (change)="calcular()"
              class="form-select">
              <option value="">Selecione...</option>
              <option value="5-10">5 a 10 campos (Simples: email, senha, nome)</option>
              <option value="10-20">10 a 20 campos (Médio: cadastros completos)</option>
              <option value="20-50">20 a 50 campos (Complexo: formulários detalhados)</option>
              <option value="50+">Mais de 50 campos (Muito complexo)</option>
            </select>
          </div>
        </div>

        <!-- Coluna direita - Instrução ou Resultado -->
        <div class="calculator-instruction">
          <div *ngIf="!planoRecomendado" class="instruction-content">
            <div class="instruction-icon">💡</div>
            <h4>Selecione as opções acima para ver nossa recomendação personalizada!</h4>
            <p>Nossa calculadora inteligente analisará suas necessidades e sugerirá o plano ideal para você.</p>
          </div>

          <!-- Resultado da Calculadora -->
          <div *ngIf="planoRecomendado" class="calculator-result">
            <div class="bg-white rounded-xl border border-gray-200 p-6 flex flex-col h-full shadow-sm">
              <div class="text-center mb-6">
                <div class="inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  RECOMENDADO PARA VOCÊ
                </div>
                <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{{ planoRecomendado.nomeCompleto }}</h3>
                <div class="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{{ planoRecomendado.precoFormatado }}</div>
                <p class="text-gray-600 text-sm sm:text-base">{{ planoRecomendado.limiteTemplates }} formulários • {{ planoRecomendado.limiteTotalCampos }} campos</p>
              </div>

              <ul class="space-y-4 mb-6 flex-grow">
                <li *ngFor="let recurso of planoRecomendado.recursosSimples.slice(0, 4)" 
                    class="flex items-center gap-3 text-gray-700 text-sm sm:text-base">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{{ recurso }}</span>
                </li>
              </ul>

              <button routerLink="/upgrade" 
                      class="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 min-h-[48px] flex items-center justify-center shadow-md">
                <span class="material-icons mr-2 text-lg">star</span>
                <span>Ver todos os planos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './plan-calculator.component.css'
})
export class PlanCalculatorComponent {
  selectedTemplates = '';
  selectedCampos = '';
  planoRecomendado: PlanoConfig | null = null;
  showComparison = false;

  calcular() {
    if (!this.selectedTemplates || !this.selectedCampos) {
      this.planoRecomendado = null;
      return;
    }

    // Extrair números das seleções
    const qtdTemplates = this.extractNumber(this.selectedTemplates);
    const mediaCampos = this.extractNumber(this.selectedCampos);

    // Calcular plano recomendado
    const planoId = calcularPlanoRecomendado(qtdTemplates, mediaCampos);
    this.planoRecomendado = getPlanoConfig(planoId);

    console.log('📊 Calculadora:', {
      templates: qtdTemplates,
      campos: mediaCampos,
      recomendado: planoId
    });
  }

  private extractNumber(range: string): number {
    // Extrair o primeiro número do range
    if (range.includes('1-3')) return 3;
    if (range.includes('4-10')) return 10;
    if (range.includes('11-25')) return 25;
    if (range.includes('26-50')) return 50;
    if (range.includes('50+')) return 100;
    if (range.includes('5-10')) return 10;
    if (range.includes('10-20')) return 20;
    if (range.includes('20-50')) return 50;
    return 10; // padrão
  }

  getCardClass(): string {
    if (!this.planoRecomendado) return '';

    switch (this.planoRecomendado.corCard) {
      case 'blue': return 'plan-card-blue';
      case 'orange': return 'plan-card-orange';
      case 'purple': return 'plan-card-purple';
      default: return 'plan-card-gray';
    }
  }

  getAllPlanos(): PlanoConfig[] {
    return Object.values(PLANOS_CONFIG);
  }
}






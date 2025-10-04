import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import {
  AnalyticsService,
  PreenchimentoAnalytics,
  CampoAnalytics,
  SiteAnalytics,
  InsightAnalytics,
  HeatmapData,
} from '../../services/analytics.service';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { registerables } from 'chart.js';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

@Component({
  standalone: true,
  selector: 'app-analytics',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    FormsModule,
    SidebarComponent,
    FooterComponent,
  ],
  template: `
    <div style="display: flex; min-height: 100vh;">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>

      <!-- Conteúdo principal -->
      <div style="flex: 1; padding: 24px; background-color: #f9fafb;">
        <!-- Sistema de Alertas -->
        <div *ngIf="errorMessage" class="mb-6">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  Erro
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ errorMessage }}
                </div>
              </div>
              <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                  <button (click)="clearError()" class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600">
                    <span class="sr-only">Fechar</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sistema de Avisos -->
        <div *ngIf="warningMessage" class="mb-6">
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">
                  Aviso
                </h3>
                <div class="mt-2 text-sm text-yellow-700">
                  {{ warningMessage }}
                </div>
              </div>
              <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                  <button (click)="clearWarning()" class="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600">
                    <span class="sr-only">Fechar</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Header do Analytics -->
        <div class="analytics-card mb-6">
          <div class="p-4">
            <div class="flex justify-between items-center">
              <div>
                <h1 class="m-0 text-xl font-semibold text-gray-900">
                  <mat-icon class="mr-3 text-indigo-600">analytics</mat-icon>
                  Analytics Premium
                </h1>
                <p class="mt-2 text-gray-600 text-base">
                  Acompanhe seu desempenho e otimize sua produtividade
                </p>
              </div>
              <div class="flex items-end gap-4">
                <div class="flex flex-col">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <div class="relative period-dropdown-container">
                    <button
                      type="button"
                      (click)="togglePeriodDropdown()"
                      class="w-48 px-4 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-gray-900 cursor-pointer hover:border-gray-400 text-base font-medium text-left flex items-center justify-between"
                      style="height: 48px;"
                    >
                      <span>{{ getPeriodText(periodoSelecionado) }}</span>
                      <svg 
                        class="w-5 h-5 text-gray-400 transition-transform duration-200" 
                        [class.rotate-180]="periodDropdownOpen"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    <!-- Dropdown Customizado -->
                    <div 
                      *ngIf="periodDropdownOpen"
                      class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-[99999] overflow-hidden dropdown-options"
                      style="z-index: 999999 !important;"
                    >
                      <div 
                        *ngFor="let option of periodOptions" 
                        (click)="selectPeriod(option.value)"
                        class="px-4 py-3 cursor-pointer transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-700 border-b border-gray-100 last:border-b-0"
                        [class.bg-indigo-50]="option.value == periodoSelecionado"
                        [class.text-indigo-700]="option.value == periodoSelecionado"
                      >
                        {{ option.label }}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  mat-raised-button
                  color="primary"
                  (click)="atualizarAnalytics()"
                  [disabled]="carregando"
                  class="clean-button px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  matTooltip="Atualizar analytics"
                >
                  <mat-icon class="mr-2">refresh</mat-icon>
                  {{ carregando ? 'Carregando...' : 'Atualizar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <ng-container *ngIf="carregando; else analyticsContent">
          <div class="analytics-card mb-6">
            <div class="flex justify-center items-center h-96 p-8">
              <div class="text-center">
                <div class="loading-spinner h-16 w-16 mx-auto"></div>
                <h3 class="mt-6 text-2xl font-bold text-gray-700">
                  Carregando Analytics
                </h3>
                <p class="text-gray-500 mt-3 text-lg">
                  Aguarde enquanto preparamos seus dados de desempenho...
                </p>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #analyticsContent>
          <!-- Métricas Principais -->
          <div class="mb-6">
            <mat-grid-list 
              [cols]="getGridCols()" 
              rowHeight="200px" 
              gutterSize="16px"
              class="responsive-grid"
            >
              <!-- Card Total de Preenchimentos -->
              <mat-grid-tile>
                <div class="stats-card relative">
                  <div class="p-4 h-full flex flex-col justify-center">
                    <div class="text-center">
                      <h3 class="m-0 mb-2 text-base font-semibold text-gray-900">
                        Total de Preenchimentos
                      </h3>
                      <div class="flex items-center justify-center mb-2">
                        <span class="text-2xl font-bold text-gray-900">{{
                          totalPreenchimentos
                        }}</span>
                      </div>
                      <p class="m-0 text-gray-600 text-sm">
                        Formulários preenchidos no período
                      </p>
                    </div>
                  </div>
                </div>
              </mat-grid-tile>

              <!-- Card Tempo Economizado -->
              <mat-grid-tile>
                <div class="stats-card relative">
                  <div class="p-4 h-full flex flex-col justify-center">
                    <div class="text-center">
                      <h3 class="m-0 mb-2 text-base font-semibold text-gray-900">
                        Tempo Economizado
                      </h3>
                      <div class="flex items-center justify-center mb-2">
                        <span class="text-2xl font-bold text-gray-900">{{
                          tempoEconomizado
                        }}</span>
                      </div>
                      <p class="m-0 text-gray-600 text-sm">
                        Horas economizadas com automação
                      </p>
                    </div>
                  </div>
                </div>
              </mat-grid-tile>

              <!-- Card Sites Únicos -->
              <mat-grid-tile>
                <div class="stats-card relative">
                  <div class="p-4 h-full flex flex-col justify-center">
                    <div class="text-center">
                      <h3 class="m-0 mb-2 text-base font-semibold text-gray-900">
                        Sites Únicos
                      </h3>
                      <div class="flex items-center justify-center mb-2">
                        <span class="text-2xl font-bold text-gray-900">{{
                          sitesUnicos
                        }}</span>
                      </div>
                      <p class="m-0 text-gray-600 text-sm">
                        Sites onde você utilizou a extensão
                      </p>
                    </div>
                  </div>
                </div>
              </mat-grid-tile>

              <!-- Card Taxa de Sucesso -->
              <mat-grid-tile>
                <div class="stats-card relative">
                  <div class="p-4 h-full flex flex-col justify-center">
                    <div class="text-center">
                      <h3 class="m-0 mb-2 text-base font-semibold text-gray-900">
                        Taxa de Sucesso
                      </h3>
                      <div class="flex items-center justify-center mb-2">
                        <span class="text-2xl font-bold text-gray-900"
                          >{{ taxaSucesso }}%</span
                        >
                      </div>
                      <p class="m-0 text-gray-600 text-sm">
                        Preenchimentos bem-sucedidos
                      </p>
                    </div>
                  </div>
                </div>
              </mat-grid-tile>
            </mat-grid-list>
          </div>

          <!-- Gráficos -->
          <div class="mb-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Gráfico de Atividade -->
              <div class="analytics-card">
                <div class="p-4">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center"
                    >
                      <mat-icon class="text-indigo-600">timeline</mat-icon>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 m-0">
                        Atividade de Preenchimento
                      </h3>
                      <p class="text-gray-600 text-sm m-0">
                        Evolução dos preenchimentos ao longo do tempo
                      </p>
                    </div>
                  </div>

                  <div class="min-h-[300px] flex items-center justify-center relative">
                    <canvas
                      #atividadeChart
                      class="w-full h-full"
                      *ngIf="dadosPreenchimentos.length > 0"
                    ></canvas>
                    <div 
                      *ngIf="carregandoGraficos && dadosPreenchimentos.length > 0"
                      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg"
                    >
                      <div class="text-center">
                        <div class="loading-spinner h-8 w-8 mx-auto"></div>
                        <p class="text-sm text-gray-600 mt-2">Criando gráfico...</p>
                      </div>
                    </div>
                    <!-- Estado vazio para gráfico de atividade -->
                    <div
                      *ngIf="dadosPreenchimentos.length === 0"
                      class="text-center"
                    >
                      <div
                        class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <mat-icon class="text-gray-400 text-2xl"
                          >timeline</mat-icon
                        >
                      </div>
                      <h4 class="text-lg font-semibold text-gray-700 mb-2">
                        Nenhum dado de atividade
                      </h4>
                      <p class="text-gray-500 text-sm">
                        Comece a usar a extensão para ver sua evolução de
                        preenchimentos
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gráfico de Sites -->
              <div class="analytics-card">
                <div class="p-4">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center"
                    >
                      <mat-icon class="text-green-600">pie_chart</mat-icon>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 m-0">
                        Sites Mais Utilizados
                      </h3>
                      <p class="text-gray-600 text-sm m-0">
                        Distribuição de preenchimentos por site
                      </p>
                    </div>
                  </div>

                  <div class="min-h-[300px] flex items-center justify-center relative">
                    <canvas
                      #sitesChart
                      class="w-full h-full"
                      *ngIf="dadosSites.length > 0"
                    ></canvas>
                    <div 
                      *ngIf="carregandoGraficos && dadosSites.length > 0"
                      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg"
                    >
                      <div class="text-center">
                        <div class="loading-spinner h-8 w-8 mx-auto"></div>
                        <p class="text-sm text-gray-600 mt-2">Criando gráfico...</p>
                      </div>
                    </div>
                    <!-- Estado vazio para gráfico de sites -->
                    <div *ngIf="dadosSites.length === 0" class="text-center">
                      <div
                        class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <mat-icon class="text-gray-400 text-2xl"
                          >public</mat-icon
                        >
                      </div>
                      <h4 class="text-lg font-semibold text-gray-700 mb-2">
                        Nenhum site registrado
                      </h4>
                      <p class="text-gray-500 text-sm">
                        Preencha formulários em diferentes sites para ver as
                        estatísticas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Gráfico de Campos -->
              <div class="analytics-card">
                <div class="p-4">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center"
                    >
                      <mat-icon class="text-amber-600">bar_chart</mat-icon>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 m-0">
                        Campos Mais Utilizados
                      </h3>
                      <p class="text-gray-600 text-sm m-0">
                        Top campos mais preenchidos
                      </p>
                    </div>
                  </div>

                  <div class="min-h-[300px] flex items-center justify-center relative">
                    <canvas
                      #camposChart
                      class="w-full h-full"
                      *ngIf="dadosCampos.length > 0"
                    ></canvas>
                    <div 
                      *ngIf="carregandoGraficos && dadosCampos.length > 0"
                      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg"
                    >
                      <div class="text-center">
                        <div class="loading-spinner h-8 w-8 mx-auto"></div>
                        <p class="text-sm text-gray-600 mt-2">Criando gráfico...</p>
                      </div>
                    </div>
                    <!-- Estado vazio para gráfico de campos -->
                    <div *ngIf="dadosCampos.length === 0" class="text-center">
                      <div
                        class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <mat-icon class="text-gray-400 text-2xl"
                          >input</mat-icon
                        >
                      </div>
                      <h4 class="text-lg font-semibold text-gray-700 mb-2">
                        Nenhum campo utilizado
                      </h4>
                      <p class="text-gray-500 text-sm">
                        Adicione campos no painel e use a extensão para ver as
                        estatísticas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Heatmap de Horários -->
              <div class="analytics-card">
                <div class="p-4">
                  <div class="flex items-center gap-3 mb-4">
                    <div
                      class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"
                    >
                      <mat-icon class="text-purple-600">grid_on</mat-icon>
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-gray-900 m-0">
                        Heatmap de Horários
                      </h3>
                      <p class="text-gray-600 text-sm m-0">
                        Padrões de uso por horário e dia
                      </p>
                    </div>
                  </div>

                  <div class="min-h-[300px] flex items-center justify-center relative">
                    <canvas
                      #heatmapChart
                      class="w-full h-full"
                      *ngIf="dadosPreenchimentos.length > 0"
                    ></canvas>
                    <div 
                      *ngIf="carregandoGraficos && dadosPreenchimentos.length > 0"
                      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg"
                    >
                      <div class="text-center">
                        <div class="loading-spinner h-8 w-8 mx-auto"></div>
                        <p class="text-sm text-gray-600 mt-2">Criando gráfico...</p>
                      </div>
                    </div>
                    <!-- Estado vazio para heatmap -->
                    <div
                      *ngIf="dadosPreenchimentos.length === 0"
                      class="text-center"
                    >
                      <div
                        class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <mat-icon class="text-gray-400 text-2xl"
                          >schedule</mat-icon
                        >
                      </div>
                      <h4 class="text-lg font-semibold text-gray-700 mb-2">
                        Nenhum padrão de horário
                      </h4>
                      <p class="text-gray-500 text-sm">
                        Use a extensão em diferentes horários para ver seus
                        padrões de uso
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Insights e Recomendações -->
          <div class="mb-6">
            <div class="analytics-card">
              <div class="p-4">
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center"
                  >
                    <mat-icon class="text-yellow-600">lightbulb</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900 m-0">
                      Insights e Recomendações
                    </h3>
                    <p class="text-gray-600 text-sm m-0">
                      Análise inteligente baseada em seus dados
                    </p>
                  </div>
                </div>

                <!-- Estado vazio para insights -->
                <div *ngIf="insights.length === 0" class="text-center py-8">
                  <div
                    class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <mat-icon class="text-gray-400 text-2xl"
                      >lightbulb</mat-icon
                    >
                  </div>
                  <h4 class="text-lg font-semibold text-gray-700 mb-2">
                    Comece a usar a extensão
                  </h4>
                  <p class="text-gray-500 text-sm">
                    Preencha seu primeiro formulário para ver suas estatísticas
                  </p>
                </div>

                <!-- Lista de insights quando há dados -->
                <div
                  *ngFor="let insight of insights"
                  class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg mb-3 last:mb-0"
                >
                  <div
                    class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    [ngClass]="{
                      'bg-green-100 text-green-600':
                        insight.tipo === 'positive',
                      'bg-blue-100 text-blue-600': insight.tipo === 'info',
                      'bg-yellow-100 text-yellow-600':
                        insight.tipo === 'warning'
                    }"
                  >
                    <mat-icon class="text-sm">{{ insight.icone }}</mat-icon>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-base font-semibold text-gray-800 mb-1">
                      {{ insight.titulo }}
                    </h4>
                    <p class="text-sm text-gray-600">{{ insight.descricao }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ng-template>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styleUrl: './analytics.component.css',
})
export class AnalyticsComponent implements OnInit, OnDestroy, AfterViewInit {
  // ViewChild para os gráficos
  @ViewChild('atividadeChart', { static: false })
  atividadeChartRef!: ElementRef;
  @ViewChild('sitesChart', { static: false }) sitesChartRef!: ElementRef;
  @ViewChild('camposChart', { static: false }) camposChartRef!: ElementRef;
  @ViewChild('heatmapChart', { static: false }) heatmapChartRef!: ElementRef;

  // Dados de analytics
  totalPreenchimentos = 0;
  tempoEconomizado = '0h';
  sitesUnicos = 0;
  taxaSucesso = 0;
  insights: InsightAnalytics[] = [];

  // Estado de carregamento
  carregando = false;
  carregandoGraficos = false;
  periodoSelecionado = '30';
  periodDropdownOpen = false;

  // Opções do período
  periodOptions = [
    { value: '7', label: 'Últimos 7 dias' },
    { value: '30', label: 'Últimos 30 dias' },
    { value: '90', label: 'Últimos 90 dias' },
    { value: '365', label: 'Último ano' }
  ];

  // Dados para gráficos
  dadosPreenchimentos: PreenchimentoAnalytics[] = [];
  dadosCampos: CampoAnalytics[] = [];
  dadosSites: SiteAnalytics[] = [];
  dadosHeatmap: HeatmapData[] = [];

  // Sistema de tratamento de erros
  errorMessage: string = '';
  warningMessage: string = '';

  // Instâncias dos gráficos
  private atividadeChart?: Chart;
  private sitesChart?: Chart;
  private camposChart?: Chart;
  private heatmapChart?: Chart;

  // Subject para debounce do período
  private periodoChangeSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private analyticsService: AnalyticsService,
  ) {
    // Configurar debounce para mudanças de período
    this.periodoChangeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(periodo => {
      this.periodoSelecionado = periodo;
      this.atualizarPeriodo();
    });
  }

  ngOnInit() {
    console.log('🚀 Componente Analytics inicializado');
    this.carregarAnalytics();

    // Listener para fechar dropdown quando clicar fora
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy() {
    console.log('🗑️ Componente Analytics destruído');
    this.destruirGraficos();

    // Remover listener
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  private onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.period-dropdown-container')) {
      this.periodDropdownOpen = false;
    }
  }

  ngAfterViewInit() {
    console.log('�� View inicializada, aguardando dados...');
    // Os gráficos serão criados após os dados serem carregados
  }

  togglePeriodDropdown() {
    this.periodDropdownOpen = !this.periodDropdownOpen;
  }

  selectPeriod(value: string) {
    this.periodDropdownOpen = false;
    this.periodoChangeSubject.next(value);
  }

  getPeriodText(value: string): string {
    const option = this.periodOptions.find(opt => opt.value === value);
    return option ? option.label : 'Últimos 30 dias';
  }

  /**
   * Retorna o número de colunas do grid baseado no tamanho da tela
   */
  getGridCols(): number {
    if (window.innerWidth < 640) return 1;      // Mobile
    if (window.innerWidth < 768) return 2;      // Tablet pequeno
    if (window.innerWidth < 1024) return 3;     // Tablet
    return 4;                                    // Desktop
  }



  atualizarPeriodo() {
    console.log('📅 Período alterado para:', this.periodoSelecionado);
    this.carregarAnalytics();
  }

  atualizarAnalytics() {
    console.log('🔄 Atualizando analytics manualmente...');
    this.carregarAnalytics();
  }

  private carregarAnalytics() {
    this.carregando = true;
    console.log('🔄 Carregando analytics...');
    console.log('🔑 Token disponível:', !!localStorage.getItem('token'));

    // Carregar dados de analytics usando o serviço
    this.analyticsService.getAnalyticsData(this.periodoSelecionado).subscribe({
      next: (analyticsData) => {
        console.log('✅ Analytics carregados:', analyticsData);

        // Atualizar métricas principais
        this.totalPreenchimentos = analyticsData.totalPreenchimentos;
        this.tempoEconomizado = analyticsData.tempoEconomizado;
        this.sitesUnicos = analyticsData.sitesUnicos;
        this.taxaSucesso = analyticsData.taxaSucesso;

        // Carregar dados para gráficos
        this.carregarDadosGraficos();

        this.carregando = false;
        console.log('✅ Analytics carregados com sucesso');
      },
      error: (error) => {
        console.error('❌ Erro ao carregar analytics:', error);
        this.setError('Erro ao carregar dados de analytics. Verifique sua conexão e tente novamente.');
        this.carregando = false;
      },
    });
  }

  private carregarDadosGraficos() {
    console.log('📊 Carregando dados para gráficos...');

    // Carregar preenchimentos por período
    this.analyticsService
      .getPreenchimentosPorPeriodo(this.periodoSelecionado)
      .subscribe({
        next: (preenchimentos) => {
          this.dadosPreenchimentos = preenchimentos;
          console.log(
            '✅ Preenchimentos carregados:',
            preenchimentos.length,
            preenchimentos,
          );
        },
        error: (error) => {
          console.error('❌ Erro ao carregar preenchimentos:', error);
          this.setWarning('Erro ao carregar dados de preenchimentos. Alguns gráficos podem não ser exibidos.');
          this.dadosPreenchimentos = [];
        },
      });

    // Carregar campos mais utilizados
    this.analyticsService.getCamposMaisUtilizados().subscribe({
      next: (campos) => {
        this.dadosCampos = campos;
        console.log('✅ Campos carregados:', campos.length, campos);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar campos:', error);
        this.setWarning('Erro ao carregar dados de campos. Alguns gráficos podem não ser exibidos.');
        this.dadosCampos = [];
      },
    });

    // Carregar sites mais acessados
    this.analyticsService.getSitesMaisAcessados().subscribe({
      next: (sites) => {
        this.dadosSites = sites;
        console.log('✅ Sites carregados:', sites.length, sites);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar sites:', error);
        this.setError('Erro ao carregar dados de sites. Tente novamente.');
        this.dadosSites = [];
      },
    });

    // Carregar dados de heatmap
    this.analyticsService.getHeatmapData(this.periodoSelecionado).subscribe({
      next: (heatmap) => {
        this.dadosHeatmap = heatmap;
        console.log('✅ Heatmap carregado:', heatmap.length, heatmap);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar heatmap:', error);
        this.setWarning('Não foi possível carregar dados de horários. Usando dados padrão.');
        this.dadosHeatmap = [];
      },
    });

    // Carregar insights
    this.analyticsService.getInsights().subscribe({
      next: (insights) => {
        this.insights = insights;
        console.log('✅ Insights carregados:', insights.length, insights);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar insights:', error);
        this.setWarning('Erro ao carregar insights. As recomendações não estarão disponíveis.');
        this.insights = [];
      },
    });

    // Criar gráficos após os dados estarem carregados
    setTimeout(() => {
      console.log('🎨 Criando gráficos...');
      this.carregandoGraficos = true;
      this.criarGraficos();
      this.carregandoGraficos = false;
    }, 200);
  }

  private criarGraficos() {
    console.log('🎨 Criando gráficos com dados:', {
      preenchimentos: this.dadosPreenchimentos.length,
      campos: this.dadosCampos.length,
      sites: this.dadosSites.length,
    });

    // Verificar se temos dados suficientes para criar gráficos
    if (
      this.dadosPreenchimentos.length === 0 &&
      this.dadosCampos.length === 0 &&
      this.dadosSites.length === 0
    ) {
      console.log('⚠️ Nenhum dado disponível para criar gráficos');
      return;
    }

    try {
      this.criarGraficoAtividade();
      this.criarGraficoSites();
      this.criarGraficoCampos();
      this.criarGraficoHeatmap();

      console.log('✅ Todos os gráficos criados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao criar gráficos:', error);
    }
  }

  private criarGraficoAtividade() {
    console.log('📈 Criando gráfico de atividade...');

    if (!this.atividadeChartRef?.nativeElement) {
      console.warn('⚠️ Elemento atividadeChart não encontrado');
      return;
    }

    const ctx = this.atividadeChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ Contexto 2D não disponível');
      return;
    }

    // Destruir gráfico anterior se existir
    if (this.atividadeChart) {
      this.atividadeChart.destroy();
    }

    // Verificar se temos dados para o gráfico
    if (this.dadosPreenchimentos.length === 0) {
      console.warn('⚠️ Nenhum dado de preenchimento disponível para o gráfico');
      return;
    }

    // Verificar se as datas são válidas
    const dadosValidos = this.dadosPreenchimentos.filter(
      (d) => d.data && d.data instanceof Date,
    );

    if (dadosValidos.length === 0) {
      console.warn(
        '⚠️ Nenhuma data válida encontrada nos dados de preenchimento',
      );
      return;
    }

    const labels = dadosValidos.map((d) =>
      d.data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    );
    const data = dadosValidos.map((d) => d.quantidade);

    console.log('📊 Dados do gráfico de atividade:', { labels, data });

    this.atividadeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Preenchimentos',
            data: data,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: '#6b7280',
            },
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: '#6b7280',
            },
          },
        },
      },
    });
  }

  private criarGraficoSites() {
    console.log('🌐 Criando gráfico de sites...');

    if (!this.sitesChartRef?.nativeElement) {
      console.warn('⚠️ Elemento sitesChart não encontrado');
      return;
    }

    const ctx = this.sitesChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ Contexto 2D não disponível');
      return;
    }

    // Destruir gráfico anterior se existir
    if (this.sitesChart) {
      this.sitesChart.destroy();
    }

    // Verificar se temos dados para o gráfico
    if (this.dadosSites.length === 0) {
      console.warn('⚠️ Nenhum dado de sites disponível para o gráfico');
      return;
    }

    const labels = this.dadosSites.map((s) => s.dominio);
    const data = this.dadosSites.map((s) => s.quantidadePreenchimentos);

    console.log('📊 Dados do gráfico de sites:', { labels, data });
    const colors = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#f5576c',
      '#4facfe',
      '#00f2fe',
      '#43e97b',
      '#38f9d7',
      '#fa709a',
      '#fee140',
    ];

    this.sitesChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors.slice(0, data.length),
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              color: '#374151',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
      },
    });
  }

  private criarGraficoCampos() {
    console.log('📝 Criando gráfico de campos de template...');

    if (!this.camposChartRef?.nativeElement) {
      console.warn('⚠️ Elemento camposChart não encontrado');
      return;
    }

    const ctx = this.camposChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ Contexto 2D não disponível');
      return;
    }

    // Destruir gráfico anterior se existir
    if (this.camposChart) {
      this.camposChart.destroy();
    }

    // Verificar se temos dados para o gráfico
    if (this.dadosCampos.length === 0) {
      console.warn(
        '⚠️ Nenhum dado de campos de template disponível para o gráfico',
      );
      return;
    }

    // Verificar se as datas são válidas
    const dadosValidos = this.dadosCampos.filter(
      (c) => c.ultimoUso && c.ultimoUso instanceof Date,
    );

    if (dadosValidos.length === 0) {
      console.warn(
        '⚠️ Nenhuma data válida encontrada nos dados de campos de template',
      );
      return;
    }

    const labels = dadosValidos.map(
      (c) => `${c.nomeCampo} (${c.nomeTemplate})`,
    );
    const data = dadosValidos.map((c) => c.quantidadeUsos);

    console.log('📊 Dados do gráfico de campos de template:', { labels, data });

    this.camposChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Quantidade de Usos',
            data: data,
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: '#667eea',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: '#6b7280',
            },
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
            ticks: {
              color: '#6b7280',
            },
          },
        },
      },
    });
  }

  private criarGraficoHeatmap() {
    console.log('🔥 Criando gráfico heatmap...');

    if (!this.heatmapChartRef?.nativeElement) {
      console.warn('⚠️ Elemento heatmapChart não encontrado');
      return;
    }

    const ctx = this.heatmapChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ Contexto 2D não disponível');
      return;
    }

    // Destruir gráfico anterior se existir
    if (this.heatmapChart) {
      this.heatmapChart.destroy();
    }

    // Verificar se temos dados reais para o heatmap
    if (this.dadosHeatmap.length === 0) {
      console.warn('⚠️ Nenhum dado de heatmap disponível');
      return;
    }

    // Dados reais do backend ou dados padrão se não houver dados
    const horas = ['00h', '06h', '12h', '18h', '24h'];
    const dias = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    // Converter dados do backend para formato do Chart.js
    const dados: { x: number; y: number; r: number }[] = this.dadosHeatmap.map(item => ({
      x: item.hora,
      y: item.dia,
      r: Math.max(item.quantidade, 1) // Mínimo de 1 para visualização
    }));

    // Se não houver dados reais, usar dados padrão baseados em preenchimentos existentes
    if (dados.length === 0 && this.dadosPreenchimentos.length > 0) {
      console.log('📊 Usando dados padrão para heatmap baseado em preenchimentos');
      for (let i = 0; i < dias.length; i++) {
        for (let j = 0; j < horas.length; j++) {
          const preenchimentosNoHorario = this.dadosPreenchimentos.filter(p => {
            if (!p.data) return false;
            const hora = p.data.getHours();
            const dia = p.data.getDay();
            return hora >= j * 6 && hora < (j + 1) * 6 && dia === i;
          }).length;

          if (preenchimentosNoHorario > 0) {
            dados.push({
              x: j,
              y: i,
              r: Math.max(preenchimentosNoHorario, 1)
            });
          }
        }
      }
    }

    this.heatmapChart = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [
          {
            label: 'Atividade',
            data: dados,
            backgroundColor: (context: any) => {
              const value = context.raw.r;
              const alpha = Math.min(value / 10, 1);
              return `rgba(102, 126, 234, ${alpha})`;
            },
            borderColor: '#667eea',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: (context: any) => {
                const dataIndex = context[0].dataIndex;
                const x = context[0].raw.x;
                const y = context[0].raw.y;
                return `${dias[y]} - ${horas[x]}`;
              },
              label: (context: any) => {
                return `Atividade: ${context.raw.r} preenchimentos`;
              },
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#667eea',
            borderWidth: 1,
            cornerRadius: 8,
          },
        },
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            min: -0.5,
            max: horas.length - 0.5,
            ticks: {
              stepSize: 1,
              callback: function (value: any) {
                return horas[value] || '';
              },
              color: '#6b7280',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
          y: {
            type: 'linear',
            position: 'left',
            min: -0.5,
            max: dias.length - 0.5,
            ticks: {
              stepSize: 1,
              callback: function (value: any) {
                return dias[value] || '';
              },
              color: '#6b7280',
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    });
  }

  private destruirGraficos() {
    console.log('🗑️ Destruindo gráficos anteriores...');

    try {
      if (this.atividadeChart) {
        this.atividadeChart.destroy();
        this.atividadeChart = undefined;
        console.log('✅ Gráfico de atividade destruído');
      }
      if (this.sitesChart) {
        this.sitesChart.destroy();
        this.sitesChart = undefined;
        console.log('✅ Gráfico de sites destruído');
      }
      if (this.camposChart) {
        this.camposChart.destroy();
        this.camposChart = undefined;
        console.log('✅ Gráfico de campos destruído');
      }
      if (this.heatmapChart) {
        this.heatmapChart.destroy();
        this.heatmapChart = undefined;
        console.log('✅ Gráfico heatmap destruído');
      }
    } catch (error) {
      console.error('❌ Erro ao destruir gráficos:', error);
    }
  }

  /**
   * Limpa mensagem de erro
   */
  clearError(): void {
    this.errorMessage = '';
  }

  /**
   * Limpa mensagem de aviso
   */
  clearWarning(): void {
    this.warningMessage = '';
  }

  /**
   * Define mensagem de erro
   */
  setError(message: string): void {
    this.errorMessage = message;
    this.warningMessage = ''; // Limpa avisos quando há erro

    // Auto-limpeza após 10 segundos
    setTimeout(() => {
      if (this.errorMessage === message) {
        this.clearError();
      }
    }, 10000);
  }

  /**
   * Define mensagem de aviso
   */
  setWarning(message: string): void {
    this.warningMessage = message;
    this.errorMessage = ''; // Limpa erros quando há aviso

    // Auto-limpeza após 8 segundos
    setTimeout(() => {
      if (this.warningMessage === message) {
        this.clearWarning();
      }
    }, 8000);
  }
}

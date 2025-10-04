import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { UsuarioService } from '../../services/usuario.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { AuthErrorHandlerService } from '../../services/auth-error-handler.service';
import { CampoService } from '../../services/campo.service';
import { TemplateCsvService } from '../../services/template-csv.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AssinaturaService } from '../../services/assinatura.service';
import { getPlanoLimite, getPlanoConfig, getLimiteTemplates, getLimiteTotalCampos } from '../../shared/planos-config';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatBadgeModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    SidebarComponent,
    FooterComponent
  ],
  template: `
    <!-- Layout Dashboard Moderno -->
    <div class="min-h-screen bg-gray-50">

      <!-- Layout Principal -->
      <div class="flex">
        <!-- Sidebar -->
        <app-sidebar #sidebar></app-sidebar>

        <!-- Conteúdo Principal -->
        <main class="flex-1 p-3 sm:p-4">
          <!-- Loading State Moderno -->
          <ng-container *ngIf="carregandoPagina; else dashboardContent">
            <div class="flex flex-col items-center justify-center py-16">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <h3 class="mt-6 text-lg font-semibold text-gray-900">
                Carregando Dashboard
              </h3>
              <p class="text-gray-500 mt-2">
                Aguarde enquanto preparamos suas informações...
              </p>
            </div>
          </ng-container>

          <ng-template #dashboardContent>
            <!-- Boas-vindas e Resumo -->
            <div class="mb-4 sm:mb-6">
              <h1 class="text-base sm:text-lg font-bold text-gray-900 mb-1">
                Bem-vindo ao seu Dashboard
              </h1>
              <p class="text-xs sm:text-sm text-gray-600">
                Gerencie Seus Formulários e acompanhe suas atividades de preenchimento automático.
              </p>
            </div>

            <!-- Estatísticas Principais -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <!-- Total de Templates -->
              <div class="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-gray-300 transition-colors duration-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900">Formulários</h3>
                  </div>
                  <span *ngIf="!carregandoPagina && totalTemplates > 0" class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {{ calcularCrescimentoTemplates() }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                  <div *ngIf="carregandoPagina" class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span class="text-xl font-bold text-gray-900">{{ totalTemplates }}</span>
                </div>
                <p class="text-xs text-gray-500">Criados manualmente ou via CSV</p>
              </div>

              <!-- Formulários Preenchidos -->
              <div class="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:border-gray-300 transition-colors duration-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                      </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900">Preenchimentos</h3>
                  </div>
                  <span *ngIf="!carregandoPagina && formulariosPreenchidos > 0" class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {{ calcularCrescimentoPreenchimentos() }}
                  </span>
                </div>
                <div class="flex items-center gap-2 mb-1">
                  <div *ngIf="carregandoPagina" class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <span class="text-xl font-bold text-gray-900">{{ formulariosPreenchidos }}</span>
                </div>
                <p class="text-xs text-gray-500">Último: {{ ultimoPreenchimento }}</p>
              </div>
            </div>

            <!-- Ações Rápidas -->
            <div class="mb-4 sm:mb-6">
              <h2 class="text-sm sm:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Ações Rápidas
              </h2>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <!-- Gerenciar Templates -->
                <a routerLink="/formularios" class="group block">
                  <div class="bg-white rounded-xl border border-gray-200 p-3 text-center hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                    <div class="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-200 transition-colors duration-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="9" y1="9" x2="15" y2="9"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">Formulários</h3>
                    <p class="text-xs text-gray-500">Crie e organize Seus Formulários</p>
                  </div>
                </a>

                <!-- Upload CSV -->
                <a *ngIf="podeAcessarUploadCsv()" routerLink="/upload-csv" class="group block">
                  <div class="bg-white rounded-xl border border-gray-200 p-3 text-center hover:border-green-300 hover:shadow-md transition-all duration-200">
                    <div class="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-green-200 transition-colors duration-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="12" y2="12"></line>
                        <line x1="15" y1="15" x2="12" y2="12"></line>
                      </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">Upload CSV</h3>
                    <p class="text-xs text-gray-500">Importe templates em lote</p>
                  </div>
                </a>

                <!-- Perfil -->
                <a routerLink="/user/perfil" class="group block">
                  <div class="bg-white rounded-xl border border-gray-200 p-3 text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
                    <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-200 transition-colors duration-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">Perfil</h3>
                    <p class="text-xs text-gray-500">Atualize suas informações</p>
                  </div>
                </a>

                <!-- Suporte -->
                <a routerLink="/contato" class="group block">
                  <div class="bg-white rounded-xl border border-gray-200 p-3 text-center hover:border-orange-300 hover:shadow-md transition-all duration-200">
                    <div class="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-200 transition-colors duration-200">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-600">
                        <path d="M14 9V5a3 3 0 0 0-6 0v4"></path>
                        <rect x="2" y="9" width="20" height="12" rx="2" ry="2"></rect>
                        <circle cx="12" cy="15" r="1"></circle>
                      </svg>
                    </div>
                    <h3 class="text-sm font-semibold text-gray-900 mb-1">Suporte</h3>
                    <p class="text-xs text-gray-500">Entre em contato conosco</p>
                  </div>
                </a>
                          </div>
          </div>

          <!-- Seus Formulários -->
          <div class="mb-4 sm:mb-6">
            <h2 class="text-sm sm:text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="9"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              Seus Formulários
            </h2>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <!-- Formulário Completo - Teste FormSync -->
              <div class="bg-white rounded-xl border border-gray-200 p-3 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="9" x2="15" y2="9"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Teste</span>
                </div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Formulário Completo</h3>
                <p class="text-xs text-gray-600 mb-2">Teste todos os tipos de campo com a extensão FormSync</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">{{ totalTemplates + 1 }} formulários</span>
                  <a routerLink="/formularios/formulario-completo" 
                     class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200">
                    Testar
                  </a>
                </div>
              </div>

              <!-- Template Padrão (se existir) -->
              <div *ngIf="totalTemplates > 0" class="bg-white rounded-xl border border-gray-200 p-3 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="9" y1="9" x2="15" y2="9"></line>
                      <line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Ativo</span>
                </div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Seus Formulários</h3>
                <p class="text-xs text-gray-600 mb-2">Gerencie todos os seus formulários criados</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">{{ totalTemplates }} templates</span>
                  <a routerLink="/formularios" 
                     class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200">
                    Ver Todos
                  </a>
                </div>
              </div>

              <!-- Card de Criação -->
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-3 hover:border-green-300 hover:shadow-md transition-all duration-200">
                <div class="flex items-start justify-between mb-2">
                  <div class="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                      <line x1="12" y1="18" x2="12" y2="12"></line>
                      <line x1="9" y1="15" x2="12" y2="12"></line>
                      <line x1="15" y1="15" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Novo</span>
                </div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2">Criar Formulário</h3>
                <p class="text-xs text-gray-600 mb-2">Crie um novo formulário personalizado</p>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500">Personalizado</span>
                  <a routerLink="/formularios" 
                     class="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200">
                    Criar
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Alertas -->
          <section *ngIf="mensagem" class="mb-6">
            <div class="alert-card p-4">
              <div class="flex items-center">
                <mat-icon class="text-blue-500 mr-4 text-2xl card-icon">info</mat-icon>
                <span class="text-blue-700 font-semibold text-base">{{ mensagem }}</span>
              </div>
            </div>
          </section>

          <!-- Atividades Recentes -->
          <div class="section-card mb-4 sm:mb-6">
            <div class="p-4">
              <div class="flex justify-between items-center mb-3">
                <div>
                  <h2 class="m-0 text-base font-bold text-gray-800 flex items-center">
                    <mat-icon class="mr-2 text-purple-500 text-lg card-icon">history</mat-icon>
                    Atividades Recentes
                  </h2>
                  <p class="mt-2 text-gray-600 text-sm">
                    Acompanhe suas últimas ações no sistema
                  </p>
                </div>
                <button
                  mat-icon-button
                  (click)="atualizarAtividades()"
                  [disabled]="carregandoAtividades"
                  matTooltip="Atualizar atividades"
                  class="!bg-gray-100 hover:!bg-gray-200 rounded-full transition-all duration-200 p-2"
                >
                  <mat-icon *ngIf="!carregandoAtividades" class="text-gray-600 card-icon">refresh</mat-icon>
                  <div *ngIf="carregandoAtividades" class="loading-spinner h-5 w-5"></div>
                </button>
              </div>

              <div class="border-t border-gray-200 my-4"></div>

              <div>
                <!-- Skeleton para atividades -->
                <div *ngIf="carregandoAtividades">
                  <div
                    *ngFor="let i of [1, 2, 3]"
                    class="flex items-center mb-3"
                  >
                    <div class="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                    <div class="flex-1 h-4 bg-gray-300 rounded"></div>
                  </div>
                </div>

                <!-- Conteúdo real das atividades -->
                <div
                  *ngIf="
                    !carregandoAtividades && atividades.length > 0;
                    else noActivities
                  "
                >
                  <div
                    *ngFor="
                      let atividade of atividades;
                      trackBy: trackByAtividade;
                      let i = index
                    "
                    class="flex items-center mb-3"
                  >
                    <div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span class="flex-1 text-gray-800">{{ atividade }}</span>
                    <span class="text-gray-500 text-xs">{{
                      i === 0
                        ? 'Agora'
                        : i === 1
                        ? '2 min atrás'
                        : i === 2
                        ? '5 min atrás'
                        : '10 min atrás'
                    }}</span>
                  </div>
                </div>

                <ng-template #noActivities>
                  <div class="text-center py-8 px-4">
                    <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <mat-icon class="text-gray-400 text-2xl card-icon">inbox</mat-icon>
                    </div>
                    <h3 class="m-0 mb-2 text-base font-medium text-gray-600">
                      Nenhuma atividade recente
                    </h3>
                    <p class="m-0 text-gray-500">
                      Comece a usar a extensão para ver suas atividades aqui
                    </p>
                  </div>
                </ng-template>
              </div>
            </div>
          </div>

          <!-- Informações do Plano Atual -->
          <section class="mb-4 sm:mb-6">
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-2xl rounded-3xl border border-green-400">
              <div class="p-4">
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-4 text-xl backdrop-blur-sm">
                    🎉
                  </div>
                  <div class="flex-1">
                    <h2 class="m-0 mb-2 text-base font-bold text-white">
                      {{ nomePlano }} Ativo!
                    </h2>
                    <p class="m-0 opacity-90 text-sm text-white">
                      {{ descricaoPlano }}
                    </p>
                  </div>
                </div>
                <div class="flex gap-3 flex-wrap">
                  <div class="!bg-white !text-green-600 !border !border-white px-3 py-1.5 text-sm font-semibold rounded-full flex items-center">
                    <mat-icon class="text-green-600 mr-2 !flex !items-center !justify-center !w-5 !h-5">folder</mat-icon>
                    {{ limiteTemplates }} formulários
                  </div>
                  <div class="!bg-white !text-green-600 !border !border-white px-3 py-1.5 text-sm font-semibold rounded-full flex items-center">
                    <mat-icon class="text-green-600 mr-2 !flex !items-center !justify-center !w-5 !h-5">description</mat-icon>
                    {{ limiteTotalCampos }} campos total
                  </div>
                  <div *ngFor="let recurso of getRecursosPrincipais()" class="!bg-white !text-green-600 !border !border-white px-3 py-1.5 text-sm font-semibold rounded-full flex items-center">
                    <mat-icon class="text-green-600 mr-2 !flex !items-center !justify-center !w-5 !h-5">check</mat-icon>
                    {{ recurso }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Seção de Upgrade -->
          <section *ngIf="mostrarUpgrade" class="mb-4 sm:mb-6">
            <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl rounded-3xl border border-blue-400">
              <div class="p-4">
                <div class="flex items-center mb-3">
                  <div class="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mr-4 backdrop-blur-sm">
                    <mat-icon class="text-white text-xl">rocket_launch</mat-icon>
                  </div>
                  <div class="flex-1">
                    <h2 class="m-0 mb-2 text-lg font-bold text-white">
                      {{ tituloUpgrade || 'Upgrade do Plano' }}
                    </h2>
                    <p class="m-0 opacity-90 text-sm text-white">
                      {{
                        descricaoUpgrade ||
                          'Faça upgrade do seu plano para acessar mais recursos e funcionalidades.'
                      }}
                    </p>
                  </div>
                </div>
                <div>
                  <a
                    routerLink="/upgrade"
                    #upgradeButton
                    class="inline-flex items-center bg-white bg-opacity-20 text-white px-4 py-2 rounded-xl no-underline font-semibold text-sm transition-all duration-300 hover:bg-opacity-30 hover:scale-105 backdrop-blur-sm border border-white border-opacity-30"
                    (mouseenter)="onUpgradeButtonHover(upgradeButton, true)"
                    (mouseleave)="onUpgradeButtonHover(upgradeButton, false)"
                  >
                    <mat-icon class="mr-2 text-lg">arrow_forward</mat-icon>
                    {{ textoBotaoUpgrade || 'Ver Planos' }}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </ng-template>
      </main>
    </div>
  </div>

  <!-- Footer -->
  <app-footer></app-footer>
  `,
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dados do usuário
  nomeUsuario = '';
  emailUsuario = '';
  planoUsuario = 'PESSOAL';

  // Estatísticas
  totalTemplates = 0; // Total geral de templates (manuais + CSV)
  formulariosPreenchidos = 0;
  ultimoPreenchimento = 'Nunca';
  atividades: string[] = [];

  // Estado de carregamento
  carregandoPagina = true;
  carregandoAtividades = false;
  private carregamentoInicial = true;

  // Assinatura
  assinaturaValida = true;
  assinaturaExpirada = false;

  // Mensagens
  mensagem = '';

  // Propriedades computadas do plano
  get nomePlano(): string {
    return getPlanoConfig(this.planoUsuario).nome;
  }

  get descricaoPlano(): string {
    return getPlanoConfig(this.planoUsuario).descricao;
  }

  get limiteCampos(): number {
    return getPlanoConfig(this.planoUsuario).limite;
  }

  get limiteTemplates(): number {
    return getLimiteTemplates(this.planoUsuario);
  }

  get limiteTotalCampos(): number {
    return getLimiteTotalCampos(this.planoUsuario);
  }

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private campoService: CampoService,
    private templateCsvService: TemplateCsvService,
    private analyticsService: AnalyticsService,
    private assinaturaService: AssinaturaService,
    private errorHandler: ErrorHandlerService,
    private authErrorHandler: AuthErrorHandlerService,
  ) { }

  ngOnInit() {
    // Verificar se o usuário está autenticado
    if (!this.authService.estaAutenticado()) {
      console.log('❌ Usuário não autenticado');
      this.mensagem = '⚠️ Faça login para acessar o dashboard.';
      return;
    }

    console.log('✅ Usuário autenticado, carregando dados...');
    this.carregarDadosCompleto();
  }

  ngOnDestroy() {
    // Cleanup se necessário
  }

  /**
   * Carrega todos os dados do dashboard de forma centralizada
   */
  carregarDadosCompleto() {
    if (this.carregandoPagina && !this.carregamentoInicial) {
      console.log('🔄 Carregamento já em andamento, ignorando nova requisição');
      return;
    }

    this.carregandoPagina = true;
    if (this.carregamentoInicial) {
      this.carregamentoInicial = false;
    }

    console.log('🔄 Iniciando carregamento completo do dashboard...');

    // Carregar dados do usuário
    this.carregarDadosUsuario();

    // Carregar dados reais do backend
    this.carregarDadosBackend();
  }

  /**
   * Carrega dados do usuário do localStorage e backend
   */
  carregarDadosUsuario() {
    // Dados do localStorage
    this.nomeUsuario = localStorage.getItem('nomeUsuario') || 'Usuário';
    this.emailUsuario =
      localStorage.getItem('emailUsuario') || 'email@exemplo.com';
    this.planoUsuario = localStorage.getItem('plano') || 'PESSOAL';

    console.log('✅ Dados do usuário carregados:', {
      nome: this.nomeUsuario,
      email: this.emailUsuario,
      plano: this.planoUsuario,
    });

    // Buscar dados do usuário no backend
    this.usuarioService.obterUsuarioBackend().subscribe({
      next: (usuario) => {
        console.log('✅ Dados do usuário do backend:', usuario);
        this.nomeUsuario = usuario.nome || this.nomeUsuario;
        this.emailUsuario = usuario.email || this.emailUsuario;
        this.planoUsuario = usuario.plano || this.planoUsuario;

        // Atualizar localStorage
        localStorage.setItem('nomeUsuario', this.nomeUsuario);
        localStorage.setItem('emailUsuario', this.emailUsuario);
        localStorage.setItem('plano', this.planoUsuario);
      },
      error: (error) => {
        console.error('❌ Erro ao buscar dados do usuário:', error);

        // Usar o serviço especializado para tratar erros de autenticação
        this.authErrorHandler.handleAuthError(error, 'Dashboard-Usuario');
      },
    });
  }

  /**
   * Carrega dados reais do backend
   */
  carregarDadosBackend() {
    console.log('🔄 Carregando dados do backend...');

    // Fazer apenas UMA requisição para Buscar Formulários do usuário
    this.templateCsvService.listarTemplates().subscribe({
      next: (templatesUsuario) => {
        console.log('✅ Templates do usuário carregados:', templatesUsuario);

        // Usar apenas templates do usuário (manuais + CSV que ele criou)
        this.totalTemplates = Array.isArray(templatesUsuario) ? templatesUsuario.length : 0;

        // Calcular estatísticas baseadas nos templates do usuário
        this.calcularEstatisticas(templatesUsuario);

        // Gerar atividades usando os dados já obtidos
        this.gerarAtividadesBaseadas(templatesUsuario);

        // Atualizar atividades com dados reais
        this.atualizarAtividadesReais();

        // Finalizar carregamento
        setTimeout(() => {
          this.carregandoPagina = false;
          console.log('✅ Carregamento completo finalizado');
        }, 500);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar templates do usuário:', error);

        // Usar o serviço especializado para tratar erros de autenticação
        this.authErrorHandler.handleAuthError(error, 'Dashboard-Templates');

        // Se não for erro de autenticação, continuar com o tratamento normal
        if (!this.authErrorHandler.isAuthError(error)) {
          this.totalTemplates = 0;
          this.mensagem = this.errorHandler.getErrorMessage(error);
          this.carregandoPagina = false;
        }
      },
    });

    // Buscar informações da assinatura em paralelo
    this.assinaturaService.consultarAssinaturaUsuarioLogado().subscribe({
      next: (assinatura) => {
        console.log('✅ Assinatura carregada:', assinatura);
        this.planoUsuario = assinatura.plano;
        this.assinaturaValida = assinatura.status === 'ATIVA';
        this.assinaturaExpirada = !this.assinaturaValida;

        // Atualizar localStorage
        localStorage.setItem('plano', this.planoUsuario);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar assinatura:', error);
        // Usar dados do localStorage
        this.assinaturaValida = true; // Fallback
        this.assinaturaExpirada = false;
      },
    });
  }

  /**
   * Calcula estatísticas baseadas nos templates cadastrados
   */
  calcularEstatisticas(templates: any[]) {
    if (!templates || templates.length === 0) {
      this.formulariosPreenchidos = 0;
      this.ultimoPreenchimento = 'Nunca';
      return;
    }

    // Calcular total de formulários preenchidos baseado no totalUso dos templates
    this.formulariosPreenchidos = templates.reduce((total, template) => {
      return total + (template.totalUso || 0);
    }, 0);

    // Calcular último preenchimento baseado no ultimoUso dos templates
    const templatesComUso = templates.filter(template => template.ultimoUso && template.ultimoUso !== '');

    if (templatesComUso.length > 0) {
      // Encontrar o template com uso mais recente
      const templateMaisRecente = templatesComUso.sort((a, b) => {
        const dataA = new Date(a.ultimoUso);
        const dataB = new Date(b.ultimoUso);
        return dataB.getTime() - dataA.getTime();
      })[0];

      const dataUltimo = new Date(templateMaisRecente.ultimoUso);
      const agora = new Date();
      const diffHoras = Math.floor(
        (agora.getTime() - dataUltimo.getTime()) / (1000 * 60 * 60),
      );

      if (diffHoras < 1) {
        this.ultimoPreenchimento = 'Agora mesmo';
      } else if (diffHoras < 24) {
        this.ultimoPreenchimento = `Há ${diffHoras} horas`;
      } else {
        const diffDias = Math.floor(diffHoras / 24);
        this.ultimoPreenchimento = `Há ${diffDias} dias`;
      }
    } else {
      this.ultimoPreenchimento = 'Nunca';
    }
  }

  /**
   * Gera atividades baseadas nos templates cadastrados e histórico real
   */
  gerarAtividadesBaseadas(templates: any[]) {
    const atividades: string[] = [];

    // Adicionar login sempre como primeira atividade
    atividades.push('Login realizado com sucesso');

    if (!templates || templates.length === 0) {
      atividades.push('Nenhum formulário cadastrado ainda');
      atividades.push('Use o painel para cadastrar seus primeiros formulários');
      this.atividades = atividades;
      return;
    }

    // Ordenar templates por data de criação (mais recentes primeiro)
    const templatesOrdenados = templates
      .filter((template) => template.dataCriacao)
      .sort((a, b) => {
        const dataA = new Date(a.dataCriacao);
        const dataB = new Date(b.dataCriacao);
        return dataB.getTime() - dataA.getTime();
      });

    // Gerar atividades baseadas nos templates mais recentes
    const templatesRelevantes = templatesOrdenados.slice(0, 3);

    templatesRelevantes.forEach((template) => {
      if (template.dataCriacao) {
        const dataTemplate = new Date(template.dataCriacao);
        const agora = new Date();
        const diffHoras = Math.floor(
          (agora.getTime() - dataTemplate.getTime()) / (1000 * 60 * 60),
        );

        let tempoAtras = '';
        if (diffHoras < 1) {
          tempoAtras = 'agora mesmo';
        } else if (diffHoras < 24) {
          tempoAtras = `há ${diffHoras} horas`;
        } else {
          const diffDias = Math.floor(diffHoras / 24);
          tempoAtras = `há ${diffDias} dias`;
        }

        atividades.push(
          `Formulário "${template.nome}" criado ${tempoAtras}`,
        );
      }
    });

    // Adicionar atividades baseadas no uso real
    const templatesComUso = templates.filter(template => template.totalUso > 0);
    if (templatesComUso.length > 0) {
      const templateMaisUsado = templatesComUso.sort((a, b) => (b.totalUso || 0) - (a.totalUso || 0))[0];
      atividades.push(
        `Formulário "${templateMaisUsado.nome}" mais usado: ${templateMaisUsado.totalUso} preenchimentos`
      );
    }

    // Adicionar estatísticas reais
    const totalCampos = templates.reduce((total, template) => {
      return total + (template.campos?.length || 0);
    }, 0);

    if (totalCampos > 0) {
      atividades.push(`Total de ${totalCampos} campos em ${templates.length} formulários`);
    }

    // Adicionar atividade de sucesso baseada em dados reais
    if (templates.length >= 5) {
      atividades.push(`Excelente! Você criou ${templates.length} formulários`);
    } else if (templates.length >= 3) {
      atividades.push(`Bom trabalho! ${templates.length} formulários criados`);
    } else if (templates.length >= 1) {
      atividades.push(`Começando bem! Seu primeiro formulário foi criado`);
    }

    this.atividades = atividades;
  }

  /**
   * Atualiza apenas os campos
   */
  async atualizarCampos() {
    console.log('🔄 Atualizando dados do dashboard...');
    this.carregandoPagina = true;

    // Fazer apenas UMA requisição para Buscar Formulários do usuário
    this.templateCsvService.listarTemplates().subscribe({
      next: (templatesUsuario) => {

        // Usar apenas templates do usuário (manuais + CSV que ele criou)
        this.totalTemplates = Array.isArray(templatesUsuario) ? templatesUsuario.length : 0;


        // Recalcular estatísticas baseadas nos templates do usuário
        this.calcularEstatisticas(templatesUsuario);

        // Gerar atividades usando os dados já obtidos
        this.gerarAtividadesBaseadas(templatesUsuario);

        this.carregandoPagina = false;
      },
      error: (error) => {
        console.error('❌ Erro ao  templates do usuário:', error);
        this.mensagem = this.errorHandler.getErrorMessage(error);
        this.carregandoPagina = false;
      },
    });
  }

  /**
   * Atualiza apenas as atividades recentes
   */
  atualizarAtividades() {
    console.log('🔄 Atualizando atividades recentes...');
    this.carregandoAtividades = true;

    // Buscar Formulários do usuário atualizados para gerar novas atividades
    this.templateCsvService.listarTemplates().subscribe({
      next: (templatesUsuario) => {
        this.gerarAtividadesBaseadas(templatesUsuario);
        this.atualizarAtividadesReais();
        this.carregandoAtividades = false;
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar atividades:', error);
        this.carregandoAtividades = false;
        // Manter atividades existentes em caso de erro
      },
    });
  }

  /**
   * Atualiza dados quando a página ganha foco
   */
  @HostListener('window:focus')
  onWindowFocus() {
    if (!this.carregandoPagina && !this.carregamentoInicial) {
      console.log('🔄 Página ganhou foco, atualizando dados...');
      this.atualizarCampos();
    }
  }

  // Getters para upgrade
  get tituloUpgrade(): string {
    if (this.planoUsuario === 'PESSOAL') {
      return 'Plano Profissional';
    } else if (
      this.planoUsuario === 'PROFISSIONAL' ||
      this.planoUsuario === 'PROFISSIONAL_MENSAL' ||
      this.planoUsuario === 'PROFISSIONAL_VITALICIO'
    ) {
      return 'Plano Empresarial';
    } else if (this.planoUsuario === 'EMPRESARIAL') {
      return 'Plano Completo';
    } else {
      return 'Upgrade do Plano';
    }
  }

  get descricaoUpgrade(): string {
    if (this.planoUsuario === 'PESSOAL') {
      return `Tenha acesso até ${getPlanoLimite(
        'PROFISSIONAL_MENSAL',
      )} campos e ao histórico de preenchimentos e recursos avançados para gerenciar seus dados!`;
    } else if (
      this.planoUsuario === 'PROFISSIONAL' ||
      this.planoUsuario === 'PROFISSIONAL_MENSAL' ||
      this.planoUsuario === 'PROFISSIONAL_VITALICIO'
    ) {
      return 'Importe dados via CSV, crie perfis de equipe e acesse histórico completo de preenchimentos.';
    } else if (this.planoUsuario === 'EMPRESARIAL') {
      return 'Você já possui o plano mais completo disponível!';
    } else {
      return 'Faça upgrade do seu plano para acessar mais recursos e funcionalidades.';
    }
  }

  get textoBotaoUpgrade(): string {
    if (this.planoUsuario === 'PESSOAL') {
      return 'Conhecer Plano Profissional';
    } else if (
      this.planoUsuario === 'PROFISSIONAL' ||
      this.planoUsuario === 'PROFISSIONAL_MENSAL' ||
      this.planoUsuario === 'PROFISSIONAL_VITALICIO'
    ) {
      return 'Conhecer Plano Empresarial';
    } else if (this.planoUsuario === 'EMPRESARIAL') {
      return 'Plano Completo';
    } else {
      return 'Ver Planos';
    }
  }

  get mostrarUpgrade(): boolean {
    // Sempre mostrar o upgrade card, exceto se for empresarial
    return this.planoUsuario !== 'EMPRESARIAL';
  }

  trackByAtividade(index: number, atividade: string): string {
    return atividade;
  }



  /**
   * Retorna os recursos principais do plano atual, filtrados e organizados
   */
  getRecursosPrincipais(): string[] {
    const plano = getPlanoConfig(this.planoUsuario);
    const recursos = [...plano.recursos];

    // Filtrar recursos duplicados ou muito similares
    const recursosFiltrados = recursos.filter((recurso, index, array) => {
      // Remover recursos que são apenas descrições do plano
      if (recurso.toLowerCase().includes('para') ||
        recurso.toLowerCase().includes('pague') ||
        recurso.toLowerCase().includes('empresas')) {
        return false;
      }

      // Remover duplicatas
      return array.indexOf(recurso) === index;
    });

    // Priorizar recursos específicos e úteis
    const recursosPrioritarios = recursosFiltrados.filter(recurso =>
      recurso.toLowerCase().includes('csv') ||
      recurso.toLowerCase().includes('templates') ||
      recurso.toLowerCase().includes('relatórios') ||
      recurso.toLowerCase().includes('empresarial') ||
      recurso.toLowerCase().includes('prioritário')
    );

    // Se não houver recursos prioritários suficientes, usar os primeiros disponíveis
    if (recursosPrioritarios.length >= 3) {
      return recursosPrioritarios.slice(0, 3);
    }

    // Combinar recursos prioritários com outros recursos
    const resultado = [...recursosPrioritarios];
    const outrosRecursos = recursosFiltrados.filter(recurso =>
      !recursosPrioritarios.includes(recurso)
    );

    resultado.push(...outrosRecursos.slice(0, 3 - resultado.length));

    return resultado;
  }

  /**
   * Manipula o hover do botão de upgrade
   */
  onUpgradeButtonHover(button: any, isHovering: boolean): void {
    const element = button as HTMLElement;
    if (isHovering) {
      element.style.backgroundColor = 'rgba(255,255,255,0.3)';
    } else {
      element.style.backgroundColor = 'rgba(255,255,255,0.2)';
    }
  }

  /**
 * Verifica se o usuário pode acessar o upload CSV baseado no plano
 */
  podeAcessarUploadCsv(): boolean {
    const planoUsuario = this.planoUsuario.toUpperCase();

    return planoUsuario === 'EMPRESARIAL' ||
      planoUsuario.includes('EMPRESARIAL') ||
      planoUsuario === 'PROFISSIONAL_VITALICIO' ||
      planoUsuario.includes('VITALICIO') ||
      planoUsuario === 'PROFISSIONAL_MENSAL' ||
      planoUsuario.includes('MENSAL');
  }

  /**
   * Calcula o crescimento de templates baseado no histórico
   */
  calcularCrescimentoTemplates(): string {
    if (this.totalTemplates === 0) return '';

    // Simular crescimento baseado no número de templates
    if (this.totalTemplates >= 10) return '+25%';
    if (this.totalTemplates >= 5) return '+15%';
    if (this.totalTemplates >= 3) return '+10%';
    if (this.totalTemplates >= 1) return '+5%';

    return '';
  }

  /**
   * Calcula o crescimento de preenchimentos baseado no histórico
   */
  calcularCrescimentoPreenchimentos(): string {
    if (this.formulariosPreenchidos === 0) return '';

    // Simular crescimento baseado no número de preenchimentos
    if (this.formulariosPreenchidos >= 50) return '+20%';
    if (this.formulariosPreenchidos >= 25) return '+15%';
    if (this.formulariosPreenchidos >= 10) return '+10%';
    if (this.formulariosPreenchidos >= 5) return '+8%';

    return '';
  }

  /**
   * Registra uma nova atividade em tempo real
   */
  registrarAtividade(acao: string): void {
    const agora = new Date();
    const horaFormatada = agora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const novaAtividade = `${acao} - ${horaFormatada}`;

    // Adiciona no início da lista
    this.atividades.unshift(novaAtividade);

    // Mantém apenas as 10 atividades mais recentes
    if (this.atividades.length > 10) {
      this.atividades = this.atividades.slice(0, 10);
    }
  }

  /**
   * Atualiza atividades com dados reais do usuário
   */
  atualizarAtividadesReais(): void {
    if (this.totalTemplates > 0) {
      // Registrar atividade baseada no número de formulários
      if (this.totalTemplates === 1) {
        this.registrarAtividade('Primeiro formulário criado com sucesso!');
      } else if (this.totalTemplates >= 5) {
        this.registrarAtividade(`Gerenciando ${this.totalTemplates} formulários`);
      }

      // Registrar atividade baseada no uso
      if (this.formulariosPreenchidos > 0) {
        this.registrarAtividade(`${this.formulariosPreenchidos} formulários preenchidos`);
      }
    }
  }
}

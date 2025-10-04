import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { Router } from '@angular/router';

// Angular Material imports - apenas componentes funcionais essenciais
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSpinner } from '@angular/material/progress-spinner';

// Services and models
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { AssinaturaService } from '../../services/assinatura.service';
import { NotificationService } from '../../services/notification.service';
import { SecurityService } from '../../services/security.service';
import { environment } from '../../../environments/environment';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { PrivacyManagerComponent } from '../privacy-manager/privacy-manager.component';

interface AssinaturaDetalhes {
  dataInicio: Date;
  dataProximaCobranca: Date;
  status: string;
  plano: string;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    SidebarComponent,
    FooterComponent,
    PrivacyManagerComponent
  ],
  template: `
    <!-- Layout Perfil Moderno -->
    <div class="min-h-screen bg-gray-50">

      <!-- Layout Principal -->
      <div class="flex">
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>

        <!-- Conteúdo Principal -->
        <main class="flex-1 p-4">
          <!-- Loading State Moderno -->
          <ng-container *ngIf="carregandoPagina; else perfilContent">
            <div class="flex flex-col items-center justify-center py-16">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <h3 class="mt-4 text-lg font-semibold text-gray-900">
                Carregando Perfil
              </h3>
              <p class="text-gray-500 mt-2 text-sm">
                Aguarde enquanto preparamos suas informações...
              </p>
            </div>
          </ng-container>

          <ng-template #perfilContent>
            <!-- Boas-vindas e Header -->
            <div class="mb-6">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h1 class="text-lg font-bold text-gray-900 mb-1">
                    Perfil do Usuário
                  </h1>
                  <p class="text-gray-600 text-sm">
                    Gerencie suas informações pessoais e configurações da conta.
                  </p>
                </div>
                <div class="flex-shrink-0">
                  <button 
                    class="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    (click)="salvar()" 
                    [disabled]="carregando || !usuario.nome || !usuario.email || !isValidEmail(usuario.email)"
                    matTooltip="Salvar alterações do perfil">
                    <div *ngIf="carregando" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <svg *ngIf="!carregando" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17,21 17,13 7,13 7,21"></polyline>
                      <polyline points="7,3 7,8 15,8"></polyline>
                    </svg>
                    <span>{{ carregando ? 'Salvando...' : 'Salvar Perfil' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Informações Pessoais -->
            <div class="mb-6">
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-gray-900">Informações Pessoais</h2>
                    <p class="text-gray-500 text-xs">Atualize seus dados pessoais e de contato</p>
                  </div>
                </div>
                
                <form (ngSubmit)="salvar()" #perfilForm="ngForm" novalidate class="space-y-4">
                  
                  <!-- Nome -->
                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      [(ngModel)]="usuario.nome"
                      required
                      placeholder="Digite seu nome completo"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      aria-describedby="nomeHelp nomeError"
                    />
                    <p class="text-xs text-gray-500 mt-1" id="nomeHelp">
                      Seu nome completo como aparecerá no sistema
                    </p>
                    <div *ngIf="perfilForm.submitted && !usuario.nome" class="text-red-500 text-xs mt-1 flex items-center" id="nomeError">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      Por favor, informe seu nome completo
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      [(ngModel)]="usuario.email"
                      required
                      placeholder="seu@email.com"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                      aria-describedby="emailHelp emailError"
                    />
                    <p class="text-xs text-gray-500 mt-1" id="emailHelp">
                      Seu endereço de e-mail para login e comunicações
                    </p>
                    <div *ngIf="perfilForm.submitted && !usuario.email" class="text-red-500 text-xs mt-1 flex items-center" id="emailError">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      Por favor, informe um e-mail válido
                    </div>
                    <div *ngIf="perfilForm.submitted && usuario.email && !isValidEmail(usuario.email)" class="text-red-500 text-xs mt-1 flex items-center" id="emailError">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      Por favor, informe um formato de e-mail válido
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <!-- Informações da Assinatura -->
            <div class="mb-6">
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-600">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                      <line x1="1" y1="10" x2="23" y2="10"></line>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-gray-900">Assinatura e Plano</h2>
                    <p class="text-gray-500 text-xs">Gerencie sua assinatura e veja os detalhes do seu plano</p>
                  </div>
                </div>
                
                <!-- Loading state para assinatura -->
                <div *ngIf="carregandoAssinatura" class="flex flex-col items-center justify-center py-6 space-y-3">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                  <p class="text-gray-600 text-sm">Carregando informações da assinatura...</p>
                </div>

                <!-- Dados da assinatura -->
                <div *ngIf="!carregandoAssinatura" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Plano Atual -->
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6"></path>
                            <path d="m15.5 3.5-1.4 1.4m-3.2 3.2-1.4 1.4m0 3.2 1.4 1.4m3.2 3.2 1.4 1.4"></path>
                          </svg>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-600 mb-1">Plano Atual</label>
                          <div class="text-sm font-semibold text-gray-800">{{ planoAtual }}</div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Status -->
                    <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                      <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-lg flex items-center justify-center" 
                             [ngClass]="assinaturaValida ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-orange-500 to-red-600'">
                          <svg *ngIf="assinaturaValida" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                            <polyline points="20,6 9,17 4,12"></polyline>
                          </svg>
                          <svg *ngIf="!assinaturaValida" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                          </svg>
                        </div>
                        <div>
                          <label class="block text-xs font-medium text-gray-600 mb-1">Status</label>
                          <div>
                            <span *ngIf="assinaturaValida" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-500 mr-1">
                                <polyline points="20,6 9,17 4,12"></polyline>
                              </svg>
                              Ativa
                            </span>
                            <span *ngIf="!assinaturaValida" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 mr-1">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                              </svg>
                              {{ assinaturaDetalhes?.status === 'CANCELADA' ? 'Cancelada' : 'Expirada' }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Detalhes da assinatura -->
                  <div *ngIf="assinaturaDetalhes" class="border-t border-gray-200 pt-4">
                    <!-- Mensagem informativa quando cancelada -->
                    <div *ngIf="!assinaturaValida" class="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div class="flex items-center gap-2">
                        <mat-icon class="text-yellow-600 text-sm">info</mat-icon>
                        <div>
                          <p class="text-xs text-yellow-800">
                            <strong>Sua assinatura foi cancelada.</strong> Para continuar usando os recursos premium, 
                            <button (click)="irParaUpgrade()" class="text-yellow-700 underline hover:text-yellow-800">
                              renove sua assinatura
                            </button>.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">Data de Início</label>
                            <div class="text-sm font-semibold text-gray-800">{{ assinaturaDetalhes.dataInicio | date:'dd/MM/yyyy' }}</div>
                          </div>
                        </div>
                      </div>
                      <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                        <div class="flex items-center space-x-3">
                          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                          </div>
                          <div>
                            <label class="block text-xs font-medium text-gray-600 mb-1">
                              {{ assinaturaValida ? 'Próxima Cobrança' : 'Status Atual' }}
                            </label>
                            <div class="text-sm font-semibold text-gray-800">
                              {{ assinaturaValida ? 
                                (assinaturaDetalhes.dataProximaCobranca | date:'dd/MM/yyyy') : 
                                assinaturaDetalhes.status 
                              }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Ações da Assinatura -->
            <div class="mb-6">
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-600">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-gray-900">Ações da Assinatura</h2>
                    <p class="text-gray-500 text-xs">Gerencie sua assinatura e plano</p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Upgrade do Plano -->
                  <div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:border-blue-300 transition-colors duration-200">
                    <div class="flex items-start space-x-3">
                      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white">
                          <line x1="7" y1="17" x2="17" y2="7"></line>
                          <polyline points="7,7 17,7 17,17"></polyline>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <h3 class="text-base font-semibold text-gray-800 mb-1">Upgrade do Plano</h3>
                        <p class="text-gray-600 text-xs mb-3">Acesse mais recursos e funcionalidades avançadas</p>
                        <button 
                          (click)="irParaUpgrade()"
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                          Ver Planos
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Cancelar/Renovar Assinatura -->
                  <div class="p-4 rounded-lg border transition-colors duration-200"
                       [ngClass]="{
                         'bg-gradient-to-br from-red-50 to-pink-50 border-red-200 hover:border-red-300': assinaturaValida,
                         'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-300': !assinaturaValida
                       }">
                    <div class="flex items-start space-x-3">
                      <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                           [ngClass]="{
                             'bg-gradient-to-br from-red-500 to-pink-600': assinaturaValida,
                             'bg-gradient-to-br from-green-500 to-emerald-600': !assinaturaValida
                           }">
                        <mat-icon class="text-white text-sm">
                          {{ assinaturaValida ? 'cancel' : 'refresh' }}
                        </mat-icon>
                      </div>
                      <div class="flex-1">
                        <h3 class="text-base font-semibold text-gray-800 mb-1">
                          {{ assinaturaValida ? 'Cancelar Assinatura' : 'Renovar Assinatura' }}
                        </h3>
                        <p class="text-gray-600 text-xs mb-3">
                          {{ assinaturaValida ? 'Cancele sua assinatura a qualquer momento' : 'Reative sua assinatura para continuar usando os recursos premium' }}
                        </p>
                        <button 
                          (click)="assinaturaValida ? irParaCancelamento() : irParaUpgrade()"
                          [class]="assinaturaValida ? 
                            'inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm' :
                            'inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm'">
                          <mat-icon class="text-sm">
                            {{ assinaturaValida ? 'cancel' : 'refresh' }}
                          </mat-icon>
                          {{ assinaturaValida ? 'Cancelar' : 'Renovar' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configurações de Segurança -->
            <div class="mb-6">
              <div class="bg-white rounded-xl border border-gray-200 p-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-purple-600">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-gray-900">Segurança da Conta</h2>
                    <p class="text-gray-500 text-xs">Gerencie as configurações de segurança da sua conta</p>
                  </div>
                </div>
                
                <div class="space-y-3">
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                    <div class="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <div>
                        <h4 class="font-medium text-gray-800 text-sm">Alterar Senha</h4>
                        <p class="text-xs text-gray-600">Atualize sua senha de acesso</p>
                      </div>
                    </div>
                    <button 
                      class="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm"
                      (click)="abrirModalSenha()">
                      Alterar
                    </button>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                    <div class="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c-1.4-2.3-3.8-4-6.5-4.5"></path>
                        <path d="M3 12c1.4-2.3 3.8-4 6.5-4.5"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <div>
                        <h4 class="font-medium text-gray-800 text-sm">Autenticação em Duas Etapas</h4>
                        <p class="text-xs text-gray-600">Adicione uma camada extra de segurança</p>
                      </div>
                    </div>
                    <button class="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm">
                      Configurar
                    </button>
                  </div>
                  
                  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                    <div class="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                        <line x1="8" y1="21" x2="16" y2="21"></line>
                        <line x1="12" y1="17" x2="12" y2="21"></line>
                      </svg>
                      <div>
                        <h4 class="font-medium text-gray-800 text-sm">Dispositivos Conectados</h4>
                        <p class="text-xs text-gray-600">Gerencie os dispositivos com acesso à sua conta</p>
                      </div>
                    </div>
                    <button class="px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm">
                      Ver Dispositivos
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gerenciador de Privacidade LGPD -->
            <div class="mb-6">
              <app-privacy-manager></app-privacy-manager>
            </div>

            <!-- Zona de Perigo -->
            <div class="mb-6">
              <div class="bg-white rounded-xl border border-red-200 p-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-red-800">Zona de Perigo</h2>
                    <p class="text-red-600 text-xs">Ações irreversíveis da conta</p>
                  </div>
                </div>
                
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-start space-x-3">
                    <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-base font-semibold text-red-800 mb-1">Excluir Minha Conta</h3>
                      <p class="text-red-700 text-xs mb-3">
                        <strong>Ação permanente:</strong> Todos os seus dados, formulários salvos, configurações e histórico 
                        serão excluídos permanentemente. Esta ação não pode ser desfeita.
                      </p>
                      
                      <!-- Lista de consequências -->
                      <div class="bg-white border border-red-200 rounded-lg p-3 mb-3">
                        <h4 class="font-medium text-red-800 mb-2 text-sm">O que será excluído:</h4>
                        <ul class="space-y-1 text-xs text-red-700">
                          <li class="flex items-center gap-2">
                            <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Todos os dados pessoais (nome, email, preferências)
                          </li>
                          <li class="flex items-center gap-2">
                            <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Formulários salvos e templates criados
                          </li>
                          <li class="flex items-center gap-2">
                            <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Histórico de preenchimentos e configurações
                          </li>
                          <li class="flex items-center gap-2">
                            <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            Assinatura ativa e dados de pagamento
                          </li>
                        </ul>
                      </div>
                      
                      <button 
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                        [disabled]="carregandoExclusao"
                        (click)="abrirModalExclusao()">
                        <svg *ngIf="!carregandoExclusao" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <div *ngIf="carregandoExclusao" class="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>{{ carregandoExclusao ? 'Excluindo...' : 'Excluir Minha Conta' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-template>
        </main>
      </div>
    </div>

    <!-- Modal de Exclusão de Conta -->
    <div *ngIf="mostrarModalExclusao" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         (click)="fecharModalExclusao()">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4" 
           (click)="$event.stopPropagation()">
        
        <!-- Header do Modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-600">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-red-800">Excluir Minha Conta</h2>
          </div>
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            (click)="fecharModalExclusao()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6">
          <!-- Aviso de Confirmação -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-red-800 mb-2">⚠️ Esta ação é irreversível!</h3>
            <p class="text-red-700 text-sm">
              Ao excluir sua conta, todos os seus dados serão permanentemente removidos de nossos servidores. 
              Isso inclui formulários, templates, histórico e qualquer assinatura ativa.
            </p>
          </div>

          <!-- Formulário de Confirmação -->
          <form (ngSubmit)="excluirConta()" #exclusaoForm="ngForm" novalidate class="space-y-4">
            
            <!-- Motivo da Exclusão -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Por que você está excluindo sua conta? (Opcional)
              </label>
              <select
                name="motivoExclusao"
                [(ngModel)]="motivoExclusao"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200">
                <option value="">Selecione um motivo</option>
                <option value="nao_uso_mais">Não uso mais o serviço</option>
                <option value="encontrei_alternativa">Encontrei uma alternativa melhor</option>
                <option value="muito_caro">Muito caro</option>
                <option value="bugs_problemas">Muitos bugs ou problemas</option>
                <option value="falta_recursos">Falta de recursos que preciso</option>
                <option value="privacidade">Preocupações com privacidade</option>
                <option value="outro">Outro motivo</option>
              </select>
            </div>

            <!-- Campo adicional se "outro" for selecionado -->
            <div *ngIf="motivoExclusao === 'outro'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Descreva o motivo:
              </label>
              <textarea
                name="outroMotivo"
                [(ngModel)]="outroMotivo"
                rows="3"
                placeholder="Descreva brevemente o motivo..."
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200">
              </textarea>
            </div>

            <!-- Confirmação de Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, digite seu email: *
              </label>
              <input
                type="email"
                name="emailConfirmacao"
                [(ngModel)]="emailConfirmacao"
                required
                placeholder="Digite seu email para confirmar"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
              <div *ngIf="exclusaoForm.submitted && !emailConfirmacao" class="text-red-500 text-sm mt-1">
                Email de confirmação é obrigatório
              </div>
              <div *ngIf="exclusaoForm.submitted && emailConfirmacao && emailConfirmacao !== usuario.email" class="text-red-500 text-sm mt-1">
                O email não confere com o email da conta
              </div>
            </div>

            <!-- Checkbox de Confirmação -->
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                id="confirmoExclusao"
                name="confirmoExclusao"
                [(ngModel)]="confirmoExclusao"
                required
                class="mt-1 w-5 h-5 text-red-600 bg-white border-2 border-red-300 rounded focus:ring-red-500 focus:ring-2"
              >
              <label for="confirmoExclusao" class="text-sm text-gray-700 leading-relaxed">
                Confirmo que entendo que esta ação é <strong>irreversível</strong> e que todos os meus dados serão 
                <strong>permanentemente excluídos</strong>. Não poderei recuperar minha conta ou dados após a exclusão.
              </label>
            </div>
            <div *ngIf="exclusaoForm.submitted && !confirmoExclusao" class="text-red-500 text-sm">
              Você deve confirmar que entende as consequências
            </div>

            <!-- Botões -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                class="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                (click)="fecharModalExclusao()"
                [disabled]="carregandoExclusao">
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                [disabled]="carregandoExclusao || !isValidExclusaoForm()">
                <div *ngIf="carregandoExclusao" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{{ carregandoExclusao ? 'Excluindo...' : 'Sim, Excluir Permanentemente' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Gerenciamento de Consentimento -->
    <div *ngIf="mostrarModalConsentimento" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         (click)="fecharModalConsentimento()">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" 
           (click)="$event.stopPropagation()">
        
        <!-- Header do Modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Gerenciar Consentimento</h2>
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            (click)="fecharModalConsentimento()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6">
          <p class="text-gray-600 text-sm mb-6">
            Gerencie suas preferências de privacidade e consentimento de acordo com a LGPD.
          </p>

          <div class="space-y-4">
            <!-- Marketing -->
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentimentoMarketing"
                [(ngModel)]="consentimentoMarketing"
                class="mt-1 w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
              >
              <label for="consentimentoMarketing" class="text-sm text-gray-700 leading-relaxed">
                <strong class="font-medium">Marketing e Comunicações</strong><br>
                Aceito receber e-mails sobre novos recursos, atualizações e ofertas especiais.
              </label>
            </div>

            <!-- Cookies -->
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                id="consentimentoCookies"
                [(ngModel)]="consentimentoCookies"
                class="mt-1 w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
              >
              <label for="consentimentoCookies" class="text-sm text-gray-700 leading-relaxed">
                <strong class="font-medium">Cookies e Analytics</strong><br>
                Aceito o uso de cookies para melhorar a experiência e analisar o uso do serviço.
              </label>
            </div>
          </div>

          <!-- Botões -->
          <div class="flex gap-3 pt-6">
            <button
              type="button"
              class="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              (click)="fecharModalConsentimento()">
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              (click)="salvarConsentimento()">
              Salvar Preferências
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Alteração de Senha -->
    <div *ngIf="mostrarModalSenha" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
         (click)="fecharModalSenha()">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full mx-4" 
           (click)="$event.stopPropagation()">
        
        <!-- Header do Modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Alterar Senha</h2>
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            (click)="fecharModalSenha()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6">
          <form (ngSubmit)="alterarSenha()" #senhaForm="ngForm" novalidate class="space-y-4">
            
            <!-- Senha Atual -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual *
              </label>
              <input
                type="password"
                name="senhaAtual"
                [(ngModel)]="senhaAtual"
                required
                placeholder="Digite sua senha atual"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <div *ngIf="senhaForm.submitted && !senhaAtual" class="text-red-500 text-sm mt-1">
                Senha atual é obrigatória
              </div>
            </div>

            <!-- Nova Senha -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha *
              </label>
              <input
                type="password"
                name="novaSenha"
                [(ngModel)]="novaSenha"
                required
                (input)="validarNovaSenha()"
                placeholder="Digite sua nova senha forte"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              
              <!-- Indicador de Força da Senha -->
              <div *ngIf="novaSenha" class="mt-2">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm text-gray-600">Força da senha:</span>
                  <div class="flex gap-1">
                    <div *ngFor="let i of [1,2,3,4,5]" 
                         class="w-3 h-2 rounded-full transition-colors duration-200"
                         [ngClass]="getSenhaStrengthColor(i)"></div>
                  </div>
                  <span class="text-xs font-medium" [ngClass]="getSenhaStrengthTextColor()">
                    {{ getSenhaStrengthText() }}
                  </span>
                </div>
                
                <!-- Requisitos da Senha -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="flex items-center gap-1" [ngClass]="getRequisitoClass('length')">
                    <span [ngClass]="getRequisitoIcon('length')">●</span>
                    Mín. {{ minPasswordLength }} caracteres
                  </div>
                  <div class="flex items-center gap-1" [ngClass]="getRequisitoClass('uppercase')">
                    <span [ngClass]="getRequisitoIcon('uppercase')">●</span>
                    Uma maiúscula
                  </div>
                  <div class="flex items-center gap-1" [ngClass]="getRequisitoClass('number')">
                    <span [ngClass]="getRequisitoIcon('number')">●</span>
                    Um número
                  </div>
                  <div class="flex items-center gap-1" [ngClass]="getRequisitoClass('special')">
                    <span [ngClass]="getRequisitoIcon('special')">●</span>
                    Um especial
                  </div>
                </div>
              </div>
              
              <div *ngIf="senhaForm.submitted && !novaSenha" class="text-red-500 text-sm mt-1">
                Nova senha é obrigatória
              </div>
              <div *ngIf="senhaForm.submitted && novaSenha && !isValidPassword(novaSenha)" class="text-red-500 text-sm mt-1">
                Senha não atende aos requisitos de segurança
              </div>
            </div>

            <!-- Confirmar Nova Senha -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha *
              </label>
              <input
                type="password"
                name="confirmarNovaSenha"
                [(ngModel)]="confirmarNovaSenha"
                required
                placeholder="Confirme sua nova senha"
                class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              />
              <div *ngIf="senhaForm.submitted && !confirmarNovaSenha" class="text-red-500 text-sm mt-1">
                Confirmação de senha é obrigatória
              </div>
              <div *ngIf="senhaForm.submitted && confirmarNovaSenha && novaSenha !== confirmarNovaSenha" class="text-red-500 text-sm mt-1">
                As senhas não coincidem
              </div>
            </div>

            <!-- Botões -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                class="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                (click)="fecharModalSenha()"
                [disabled]="carregandoAlteracaoSenha">
                Cancelar
              </button>
              <button
                type="submit"
                class="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                [disabled]="carregandoAlteracaoSenha || !isValidPasswordForm()">
                <div *ngIf="carregandoAlteracaoSenha" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{{ carregandoAlteracaoSenha ? 'Alterando...' : 'Alterar Senha' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <app-footer></app-footer>
  `,
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  usuario: Usuario = {
    nome: '',
    email: ''
  };

  carregando = false;
  carregandoAssinatura = false;
  carregandoPagina = true;

  // Propriedades para assinatura
  planoAtual = 'Pessoal';
  assinaturaValida = true;
  assinaturaDetalhes: AssinaturaDetalhes | null = null;
  userId: number | null = null;
  assinaturaCarregada = false; // Flag para evitar carregamento duplicado
  userIdObtido = false; // Flag para evitar obtenção duplicada do userId

  // Propriedades para alteração de senha
  mostrarModalSenha = false;
  carregandoAlteracaoSenha = false;
  senhaAtual = '';
  novaSenha = '';
  confirmarNovaSenha = '';

  // Propriedades para exclusão de conta
  mostrarModalExclusao = false;
  carregandoExclusao = false;
  motivoExclusao = '';
  outroMotivo = '';
  emailConfirmacao = '';
  confirmoExclusao = false;

  // Propriedades para gerenciamento de consentimento
  mostrarModalConsentimento = false;
  consentimentoMarketing = false;
  consentimentoCookies = false;

  // Propriedades para download de dados
  carregandoDownload = false;

  // Configurações de segurança
  readonly minPasswordLength = environment.security.minPasswordLength;

  constructor(
    private usuarioService: UsuarioService,
    private assinaturaService: AssinaturaService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private securityService: SecurityService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('🚀 Componente Perfil inicializado');
    console.log('🔍 Verificando token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');

    this.carregarDadosCompleto();
  }

  carregarDadosCompleto() {
    this.carregandoPagina = true;

    // Verificar se o token é válido
    this.verificarTokenValido().then(() => {
      this.carregarUsuario();

      // Simular carregamento inicial
      setTimeout(() => {
        this.carregandoPagina = false;
      }, 1500);
    });
  }

  verificarTokenValido(): Promise<void> {
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token não encontrado');
        this.notificationService.showError('Token não encontrado. Faça login novamente.');
        resolve();
        return;
      }

      // Tentar decodificar o token JWT para verificar se está válido
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Converter para milissegundos
        const agora = Date.now();

        console.log('🔍 Token expira em:', new Date(exp));
        console.log('🔍 Agora:', new Date(agora));
        console.log('🔍 Token válido:', agora < exp);
        console.log('🔍 Payload do token:', payload);
        console.log('🔍 Usuário no token:', payload.sub || payload.userId || payload.id || 'Não encontrado');

        if (agora >= exp) {
          console.error('❌ Token expirado');
          this.notificationService.showError('Sessão expirada. Faça login novamente.');
          localStorage.removeItem('token');
          resolve();
          return;
        }

        console.log('✅ Token válido');
        resolve();
      } catch (error) {
        console.error('❌ Erro ao decodificar token:', error);
        this.notificationService.showError('Token inválido. Faça login novamente.');
        localStorage.removeItem('token');
        resolve();
      }
    });
  }

  carregarUsuario() {
    this.carregando = true;

    // Primeiro tenta carregar do backend
    this.usuarioService.obterUsuarioBackend().subscribe({
      next: (usuario) => {
        console.log('📥 Usuário carregado do backend:', usuario);

        this.usuario = {
          nome: usuario.nome || '',
          email: usuario.email || '',
          id: usuario.id
        };
        this.planoAtual = this.getNomePlano(usuario.plano || 'PESSOAL');
        this.userId = usuario.id || null;
        this.carregando = false;

        // Verificar se o ID corresponde ao token
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const tokenEmail = payload.sub || payload.email;
            console.log('🔍 Email no token:', tokenEmail);
            console.log('🔍 Email do usuário:', usuario.email);
            console.log('🔍 ID do usuário:', usuario.id);

            if (tokenEmail === usuario.email) {
              console.log('✅ Token corresponde ao usuário');
              // Dados carregados com sucesso - não exibir notificação pois já há loading state
            } else {
              console.warn('⚠️ Token não corresponde ao usuário');
              this.notificationService.showError('Token não corresponde ao usuário. Faça login novamente.');
              localStorage.removeItem('token');
              return;
            }
          } catch (error) {
            console.error('❌ Erro ao verificar token:', error);
          }
        }

        // Carregar assinatura se temos o ID
        if (this.userId) {
          this.carregarAssinatura();
        }
      },
      error: (error) => {
        console.error('Erro ao carregar usuário do backend:', error);
        // Fallback para dados locais
        const usuarioLocal = this.usuarioService.obterUsuario();
        this.usuario = {
          nome: usuarioLocal.nome || '',
          email: usuarioLocal.email || ''
        };
        this.planoAtual = this.getNomePlano(usuarioLocal.plano || 'PESSOAL');
        this.carregando = false;
        this.notificationService.showInfo('Carregando dados locais...');

        // Tentar obter ID do usuário apenas se não conseguimos do backend
        this.obterUserIdAlternativo().then(() => {
          if (this.userId) {
            this.carregarAssinatura();
          }
        });
      }
    });
  }

  obterUserIdAlternativo(): Promise<void> {
    return new Promise((resolve) => {
      // Evitar chamadas duplicadas
      if (this.userIdObtido) {
        console.log('⚠️ userId já foi obtido, pulando...');
        resolve();
        return;
      }

      console.log('🔍 Iniciando obtenção do ID do usuário...');
      this.userIdObtido = true; // Marcar como obtido

      // Tentar obter o ID do usuário através de uma chamada específica
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token não encontrado no localStorage');
        this.notificationService.showError('Token não encontrado. Faça login novamente.');
        resolve();
        return;
      }

      console.log('🔑 Token encontrado:', token.substring(0, 20) + '...');
      console.log('🔑 Token completo:', token);

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      console.log('📡 Fazendo requisição para:', `${environment.apiUrl}/usuarios/me`);
      console.log('📡 Headers:', headers);

      // Usar a mesma URL que o backend está usando para obter o usuário logado
      this.http.get<Usuario>(`${environment.apiUrl}/usuarios/me`, { headers })
        .pipe(
          catchError(error => {
            console.error('❌ Erro ao obter ID do usuário:', error);
            console.error('❌ Status:', error.status);
            console.error('❌ Mensagem:', error.error?.message);
            console.error('❌ Headers de resposta:', error.headers);
            return of(null);
          })
        )
        .subscribe(response => {
          console.log('📥 Resposta recebida:', response);

          if (response && response.id) {
            this.userId = response.id;
            console.log('✅ ID do usuário obtido com sucesso:', this.userId);
            this.carregarAssinatura();
          } else {
            console.error('❌ Resposta não contém ID do usuário:', response);
            this.notificationService.showInfo('Não foi possível obter o ID do usuário. Algumas funcionalidades podem não estar disponíveis.');
          }
          resolve();
        });
    });
  }

  carregarAssinatura() {
    // Evitar carregamento duplicado
    if (this.assinaturaCarregada) {
      console.log('⚠️ Assinatura já foi carregada, pulando...');
      return;
    }

    console.log('🔍 Carregando assinatura do usuário logado');
    this.carregandoAssinatura = true;
    this.assinaturaCarregada = true; // Marcar como carregada

    // Usar o método que retorna os detalhes completos da assinatura
    this.assinaturaService.consultarAssinaturaUsuarioLogado().subscribe({
      next: (assinatura) => {
        // Verificar se a assinatura está ativa baseado no status
        this.assinaturaValida = assinatura.status === 'ATIVA';

        // Carregar também os detalhes da assinatura
        this.assinaturaDetalhes = {
          dataInicio: new Date(assinatura.dataInicio),
          dataProximaCobranca: new Date(assinatura.dataProximaCobranca),
          status: assinatura.status,
          plano: assinatura.plano
        };

        this.carregandoAssinatura = false;
        console.log('✅ Status da assinatura carregado:', assinatura.status);
        console.log('✅ Assinatura válida:', this.assinaturaValida);
      },
      error: (error) => {
        console.error('❌ Erro ao carregar assinatura:', error);

        // Se não conseguir carregar, assumir que não há assinatura ativa
        this.assinaturaValida = false;
        this.carregandoAssinatura = false;

        if (error.status === 404) {
          console.log('ℹ️ Nenhuma assinatura encontrada, assumindo como cancelada');
        } else {
          this.notificationService.showError('Erro ao verificar assinatura. Tente novamente.');
        }
      }
    });
  }

  consultarAssinatura() {
    console.log('🔍 Consultando assinatura do usuário logado');
    console.log('🔍 userId atual:', this.userId);
    this.carregandoAssinatura = true;

    // Usar dados reais do banco
    this.consultarAssinaturaReal();
  }

  private consultarAssinaturaReal() {
    console.log('🔍 Consultando assinatura real do banco de dados');

    // Verificar se o token ainda está válido antes de fazer a requisição
    const token = localStorage.getItem('token');
    if (!token) {
      this.carregandoAssinatura = false;
      this.notificationService.showError('Token não encontrado. Faça login novamente.');
      return;
    }

    console.log('🔑 Token sendo usado:', token.substring(0, 20) + '...');

    this.assinaturaService.consultarAssinaturaUsuarioLogado().subscribe({
      next: (assinatura) => {
        // Converter strings para Date
        this.assinaturaDetalhes = {
          dataInicio: new Date(assinatura.dataInicio),
          dataProximaCobranca: new Date(assinatura.dataProximaCobranca),
          status: assinatura.status,
          plano: assinatura.plano
        };
        this.carregandoAssinatura = false;
        console.log('✅ Detalhes da assinatura carregados do banco:', this.assinaturaDetalhes);
        // Detalhes carregados - não exibir notificação pois já há loading state
      },
      error: (error) => {
        console.error('❌ Erro ao consultar assinatura:', error);
        console.error('❌ Status do erro:', error.status);
        console.error('❌ Mensagem do erro:', error.error?.message);
        console.error('❌ URL da requisição:', error.url);
        this.carregandoAssinatura = false;

        // Tratamento específico para diferentes tipos de erro
        if (error.status === 404) {
          this.notificationService.showInfo('Nenhuma assinatura ativa encontrada.');
        } else if (error.status === 403) {
          this.notificationService.showError('Você não tem permissão para consultar esta assinatura. Verifique se está logado com a conta correta.');
        } else if (error.status === 401) {
          this.notificationService.showError('Sessão expirada. Faça login novamente.');
          localStorage.removeItem('token');
        } else {
          this.notificationService.showError('Erro ao carregar detalhes da assinatura. Tente novamente.');
        }
      }
    });
  }





  renovarAssinatura() {
    // Redirecionar para a página de upgrade/renovação
    window.location.href = '/upgrade';
  }

  getUserId(): number | null {
    return this.userId;
  }

  getNomePlano(plano: string): string {
    switch (plano?.toUpperCase()) {
      case 'PESSOAL':
        return 'Pessoal';
      case 'PROFISSIONAL':
      case 'PROFISSIONAL_MENSAL':
      case 'PROFISSIONAL_VITALICIO':
        return 'Profissional';
      case 'EMPRESARIAL':
        return 'Empresarial';
      default:
        return 'Pessoal';
    }
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidNome(nome: string): boolean {
    return Boolean(nome && nome.trim().length >= 2);
  }

  isFormValid(): boolean {
    return this.isValidNome(this.usuario.nome) && this.isValidEmail(this.usuario.email);
  }



  salvar() {
    if (!this.isFormValid()) {
      this.notificationService.showError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    this.carregando = true;

    // Salvar no backend
    this.usuarioService.atualizarUsuario(this.usuario).subscribe({
      next: (usuarioAtualizado) => {
        console.log('✅ Perfil atualizado com sucesso no backend:', usuarioAtualizado);

        // Atualizar dados locais
        this.usuario = {
          id: usuarioAtualizado.id,
          nome: usuarioAtualizado.nome,
          email: usuarioAtualizado.email
        };

        // Salvar também localmente para cache
        this.usuarioService.salvarUsuario(this.usuario);

        // Para atualização de perfil, usar mensagem padrão (API retorna objeto Usuario, não mensagem)
        this.notificationService.showSuccess('Perfil atualizado com sucesso!');
        this.carregando = false;
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar perfil:', error);
        this.carregando = false;

        // Sempre usar a mensagem da API se disponível
        let mensagem = 'Erro ao atualizar perfil. Tente novamente.';

        if (error.error?.message) {
          mensagem = error.error.message;
        } else {
          // Fallback para códigos específicos se não houver mensagem
          if (error.status === 409) {
            mensagem = 'Este e-mail já está sendo usado por outro usuário.';
          } else if (error.status === 401) {
            mensagem = 'Sessão expirada. Faça login novamente.';
            localStorage.removeItem('token');
          } else if (error.status === 400) {
            mensagem = 'Dados inválidos. Verifique as informações.';
          }
        }

        this.notificationService.showError(mensagem);
      }
    });
  }



  // Métodos para modal de alteração de senha
  abrirModalSenha() {
    this.mostrarModalSenha = true;
    this.limparCamposSenha();
  }

  fecharModalSenha() {
    this.mostrarModalSenha = false;
    this.limparCamposSenha();
  }

  limparCamposSenha() {
    this.senhaAtual = '';
    this.novaSenha = '';
    this.confirmarNovaSenha = '';
    this.carregandoAlteracaoSenha = false;
  }

  isValidPasswordForm(): boolean {
    return !!(
      this.senhaAtual &&
      this.novaSenha &&
      this.confirmarNovaSenha &&
      this.isValidPassword(this.novaSenha) &&
      this.novaSenha === this.confirmarNovaSenha
    );
  }

  // Validação de senha forte
  isValidPassword(password: string): boolean {
    if (!password) return false;

    // Verificar senhas sequenciais
    if (this.isSequentialPassword(password)) {
      return false;
    }

    // Verificar senhas repetitivas
    if (this.isRepetitivePassword(password)) {
      return false;
    }

    // Usar o SecurityService para validações padrão
    const validation = this.securityService.validatePassword(password);
    return validation.isValid;
  }

  // Verificar se é senha sequencial
  private isSequentialPassword(password: string): boolean {
    const sequentialPatterns = [
      '123456', '12345', '1234', '123', '12',
      '000000', '00000', '0000', '000', '00',
      '111111', '11111', '1111', '111', '11',
      'abcdef', 'abcde', 'abcd', 'abc', 'ab',
      'qwerty', 'qwert', 'qwer', 'qwe', 'qw'
    ];

    return sequentialPatterns.some(pattern =>
      password.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  // Verificar se é senha repetitiva
  private isRepetitivePassword(password: string): boolean {
    if (password.length < 3) return false;

    // Verificar repetição de caracteres
    for (let i = 0; i < password.length - 2; i++) {
      if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
        return true;
      }
    }

    // Verificar padrões repetitivos
    const patterns = ['aa', 'bb', 'cc', '11', '22', '33', '00'];
    return patterns.some(pattern => password.toLowerCase().includes(pattern));
  }

  // Validar senha em tempo real
  validarNovaSenha() {
    // Este método é chamado pelo template para validação em tempo real
    // A validação é feita automaticamente pelo isValidPassword
  }

  // Métodos para indicador de força da senha
  getSenhaStrengthColor(index: number): string {
    if (!this.novaSenha) return 'bg-gray-200';

    const strength = this.calculatePasswordStrength(this.novaSenha);
    if (index <= strength) {
      if (strength <= 2) return 'bg-red-500';
      if (strength <= 3) return 'bg-yellow-500';
      if (strength <= 4) return 'bg-blue-500';
      return 'bg-green-500';
    }
    return 'bg-gray-200';
  }

  getSenhaStrengthTextColor(): string {
    if (!this.novaSenha) return 'text-gray-500';

    const strength = this.calculatePasswordStrength(this.novaSenha);
    if (strength <= 2) return 'text-red-600';
    if (strength <= 3) return 'text-yellow-600';
    if (strength <= 4) return 'text-blue-600';
    return 'text-green-600';
  }

  getSenhaStrengthText(): string {
    if (!this.novaSenha) return '';

    const strength = this.calculatePasswordStrength(this.novaSenha);
    if (strength <= 2) return 'Muito fraca';
    if (strength <= 3) return 'Fraca';
    if (strength <= 4) return 'Média';
    return 'Forte';
  }

  calculatePasswordStrength(password: string): number {
    let score = 0;

    if (password.length >= environment.security.minPasswordLength) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    if (password.length >= 12) score++;

    return Math.min(score, 5);
  }

  // Métodos para requisitos da senha
  getRequisitoClass(requisito: string): string {
    if (!this.novaSenha) return 'text-gray-400';

    const isValid = this.isRequisitoValid(requisito, this.novaSenha);
    return isValid ? 'text-green-600' : 'text-gray-400';
  }

  getRequisitoIcon(requisito: string): string {
    if (!this.novaSenha) return '●';

    const isValid = this.isRequisitoValid(requisito, this.novaSenha);
    return isValid ? '✓' : '●';
  }

  isRequisitoValid(requisito: string, senha: string): boolean {
    switch (requisito) {
      case 'length':
        return senha.length >= environment.security.minPasswordLength;
      case 'uppercase':
        return /[A-Z]/.test(senha);
      case 'number':
        return /\d/.test(senha);
      case 'special':
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha);
      default:
        return false;
    }
  }

  alterarSenha() {
    if (!this.isValidPasswordForm()) {
      this.notificationService.showError('Por favor, preencha todos os campos corretamente.');
      return;
    }

    this.carregandoAlteracaoSenha = true;

    this.usuarioService.alterarSenha(this.senhaAtual, this.novaSenha).subscribe({
      next: (response) => {
        console.log('✅ Senha alterada com sucesso:', response);
        // Usar a mensagem da API ou fallback
        const mensagem = response?.message || 'Senha alterada com sucesso!';
        this.notificationService.showSuccess(mensagem);
        this.carregandoAlteracaoSenha = false;
        this.fecharModalSenha();
      },
      error: (error) => {
        console.error('❌ Erro ao alterar senha:', error);
        this.carregandoAlteracaoSenha = false;

        // Sempre usar a mensagem da API se disponível
        let mensagem = 'Erro ao alterar senha. Tente novamente.';

        if (error.error?.message) {
          mensagem = error.error.message;
        } else {
          // Fallback para códigos específicos se não houver mensagem
          if (error.status === 401) {
            if (error.error?.errorCode === 'INVALID_CURRENT_PASSWORD') {
              mensagem = 'Senha atual incorreta.';
            } else {
              mensagem = 'Sessão expirada. Faça login novamente.';
              localStorage.removeItem('token');
              this.fecharModalSenha();
            }
          } else if (error.status === 400) {
            if (error.error?.errorCode === 'PASSWORD_TOO_SHORT') {
              mensagem = 'Nova senha deve ter pelo menos 6 caracteres.';
            } else if (error.error?.errorCode === 'SAME_PASSWORD') {
              mensagem = 'A nova senha deve ser diferente da senha atual.';
            } else {
              mensagem = 'Dados inválidos. Verifique as informações.';
            }
          }
        }

        this.notificationService.showError(mensagem);
      }
    });
  }

  // Método para navegar para a tela de cancelamento de assinatura
  irParaCancelamento() {
    console.log('🚀 [DEBUG] irParaCancelamento() chamado');
    console.log('🚀 [DEBUG] Router disponível:', !!this.router);
    console.log('🚀 [DEBUG] Router tipo:', typeof this.router);
    console.log('🚀 [DEBUG] Navegando para cancelamento de assinatura');

    try {
      // ✅ CORREÇÃO: Usar rota absoluta completa para evitar conflitos
      this.router.navigate(['/perfil/cancelar-assinatura']);
      console.log('✅ [DEBUG] Navegação executada com sucesso');
    } catch (error) {
      console.error('❌ [DEBUG] Erro na navegação:', error);
      this.notificationService.showError('Erro ao navegar para cancelamento de assinatura');
    }
  }

  // Método para navegar para a tela de upgrade de plano
  irParaUpgrade() {
    console.log('🚀 Navegando para upgrade de plano');
    // ✅ CORREÇÃO: Usar rota absoluta completa para evitar conflitos
    this.router.navigate(['/perfil/upgrade']);
  }

  // Métodos para modal de exclusão de conta
  abrirModalExclusao() {
    this.mostrarModalExclusao = true;
    this.limparCamposExclusao();
  }

  fecharModalExclusao() {
    this.mostrarModalExclusao = false;
    this.limparCamposExclusao();
  }

  limparCamposExclusao() {
    this.motivoExclusao = '';
    this.outroMotivo = '';
    this.emailConfirmacao = '';
    this.confirmoExclusao = false;
    this.carregandoExclusao = false;
  }

  isValidExclusaoForm(): boolean {
    return !!(
      this.emailConfirmacao &&
      this.emailConfirmacao === this.usuario.email &&
      this.confirmoExclusao
    );
  }

  excluirConta() {
    if (!this.isValidExclusaoForm()) {
      this.notificationService.showError('Por favor, preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.carregandoExclusao = true;

    // Preparar dados para envio
    const dadosExclusao = {
      emailConfirmacao: this.emailConfirmacao,
      motivoExclusao: this.motivoExclusao,
      outroMotivo: this.motivoExclusao === 'outro' ? this.outroMotivo : '',
      confirmoExclusao: this.confirmoExclusao
    };

    console.log('🗑️ Iniciando exclusão de conta:', dadosExclusao);

    // Chamar serviço de exclusão
    this.usuarioService.excluirConta(dadosExclusao).subscribe({
      next: (response) => {
        console.log('✅ Conta excluída com sucesso:', response);

        // Limpar dados locais
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        // Mostrar mensagem de sucesso
        this.notificationService.showSuccess('Sua conta foi excluída com sucesso. Lamentamos sua saída.');

        // Redirecionar para a página inicial após um delay
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Erro ao excluir conta:', error);
        this.carregandoExclusao = false;

        let mensagem = 'Erro ao excluir conta. Tente novamente.';

        if (error.error?.message) {
          mensagem = error.error.message;
        } else if (error.status === 401) {
          mensagem = 'Sessão expirada. Faça login novamente.';
          localStorage.removeItem('token');
          this.fecharModalExclusao();
        } else if (error.status === 400) {
          mensagem = 'Dados inválidos. Verifique as informações.';
        }

        this.notificationService.showError(mensagem);
      }
    });
  }

  // Métodos para modal de gerenciamento de consentimento
  abrirModalConsentimento() {
    this.mostrarModalConsentimento = true;
    this.carregarConsentimentoAtual();
  }

  fecharModalConsentimento() {
    this.mostrarModalConsentimento = false;
  }

  carregarConsentimentoAtual() {
    // Carregar preferências atuais do usuário
    this.usuarioService.obterConsentimento().subscribe({
      next: (consentimento) => {
        this.consentimentoMarketing = consentimento.marketing || false;
        this.consentimentoCookies = consentimento.cookies || false;
      },
      error: (error) => {
        console.warn('⚠️ Erro ao carregar consentimento atual:', error);
        // Usar valores padrão
        this.consentimentoMarketing = false;
        this.consentimentoCookies = false;
      }
    });
  }

  salvarConsentimento() {
    const novoConsentimento = {
      marketing: this.consentimentoMarketing,
      cookies: this.consentimentoCookies,
      dataAtualizacao: new Date().toISOString()
    };

    console.log('💾 Salvando consentimento:', novoConsentimento);

    this.usuarioService.atualizarConsentimento(novoConsentimento).subscribe({
      next: (response) => {
        console.log('✅ Consentimento atualizado:', response);
        this.notificationService.showSuccess('Preferências de privacidade atualizadas com sucesso!');
        this.fecharModalConsentimento();
      },
      error: (error) => {
        console.error('❌ Erro ao atualizar consentimento:', error);

        let mensagem = 'Erro ao atualizar preferências. Tente novamente.';
        if (error.error?.message) {
          mensagem = error.error.message;
        }

        this.notificationService.showError(mensagem);
      }
    });
  }

  // Método para baixar dados pessoais
  baixarMeusDados() {
    this.carregandoDownload = true;

    console.log('📥 Iniciando download dos dados pessoais');

    this.usuarioService.baixarDadosPessoais().subscribe({
      next: (response) => {
        try {
          // Formatar dados para melhor legibilidade
          const dadosFormatados = this.formatarDadosParaDownload(response);

          // Criar e fazer download do arquivo JSON
          const blob = new Blob([JSON.stringify(dadosFormatados, null, 2)], {
            type: 'application/json;charset=utf-8'
          });

          // Gerar nome do arquivo com timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const nomeArquivo = `meus-dados-formsync-${timestamp}.json`;

          // Criar link de download
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = nomeArquivo;
          link.style.display = 'none';

          // Executar download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Limpar recursos
          window.URL.revokeObjectURL(url);

          this.carregandoDownload = false;
          this.notificationService.showSuccess('Download dos seus dados realizado com sucesso!');
          console.log('✅ Download concluído:', nomeArquivo);

        } catch (error) {
          console.error('❌ Erro ao processar dados para download:', error);
          this.carregandoDownload = false;
          this.notificationService.showError('Erro ao processar seus dados. Tente novamente.');
        }
      },
      error: (error) => {
        console.error('❌ Erro ao baixar dados:', error);
        this.carregandoDownload = false;

        let mensagem = 'Erro ao preparar seus dados. Tente novamente.';

        if (error.error?.message) {
          mensagem = error.error.message;
        } else if (error.status === 401) {
          mensagem = 'Sessão expirada. Faça login novamente.';
          localStorage.removeItem('token');
        } else if (error.status === 404) {
          mensagem = 'Dados não encontrados. Verifique se sua conta está ativa.';
        }

        this.notificationService.showError(mensagem);
      }
    });
  }

  /**
   * Formata os dados para download, organizando e adicionando metadados
   */
  private formatarDadosParaDownload(dados: any): any {
    const dadosFormatados = {
      // Metadados do arquivo
      metadados: {
        dataExportacao: new Date().toISOString(),
        versaoFormato: '1.0',
        plataforma: 'FormSync',
        usuario: {
          id: dados.id || 'N/A',
          email: dados.email || 'N/A',
          nome: dados.nome || 'N/A'
        }
      },

      // Dados pessoais
      dadosPessoais: {
        perfil: {
          nome: dados.nome,
          email: dados.email,
          foto: dados.foto,
          dataCriacao: dados.dataCriacao,
          dataAtualizacao: dados.dataAtualizacao
        },
        plano: dados.plano,
        assinatura: dados.assinatura
      },

      // Dados de consentimento LGPD
      consentimentoLGPD: {
        politicaPrivacidade: dados.lgpdConsentimento?.politicaPrivacidade || false,
        marketing: dados.lgpdConsentimento?.marketing || false,
        cookies: dados.lgpdConsentimento?.cookies || false,
        dataConsentimento: dados.lgpdConsentimento?.dataConsentimento,
        versaoPolitica: dados.lgpdConsentimento?.versaoPolitica
      },

      // Dados de uso (se disponíveis)
      dadosUso: {
        formulariosCriados: dados.formularios || [],
        templatesSalvos: dados.templates || [],
        historicoPreenchimentos: dados.historico || [],
        configuracoes: dados.configuracoes || {}
      },

      // Informações de segurança
      informacoesSeguranca: {
        ultimoLogin: dados.ultimoLogin,
        dispositivosConectados: dados.dispositivos || [],
        alteracoesSenha: dados.alteracoesSenha || []
      }
    };

    return dadosFormatados;
  }
} 
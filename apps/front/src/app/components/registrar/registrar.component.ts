import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { CheckoutService } from '../../services/checkout.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { FooterComponent } from '../footer/footer.component';
import { LgpdConsentResult } from '../lgpd-consent/lgpd-consent.component';
import { SecurityService } from '../../services/security.service';
import { environment } from '../../../environments/environment';

declare const Stripe: any;

@Component({
  selector: 'app-registrar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, FooterComponent],
  template: `
    <!-- Hero Section com Formulário de Cadastro - Estilo Trello -->
    <section class="py-16 bg-white text-gray-900 flex items-center justify-center px-6">
      <div class="w-full max-w-6xl">
        <!-- Layout Principal -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Conteúdo da Esquerda - Alinhado com a logo -->
          <div class="text-center lg:text-left lg:pl-4">
            <!-- Header Principal -->
            <h1 class="text-5xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight -mt-[250px]">
              Crie sua conta
            </h1>
            
            <!-- Subheading -->
            <p class="text-xl mb-8 text-gray-600 leading-relaxed">
              Comece gratuitamente em segundos e automatize qualquer formulário na internet
            </p>

            <!-- Informações do Plano]
              <div class="bg-gray-50 rounded-lg p-8 border border-gray-100 mb-8">
              <div class="text-center mb-4">
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200 mb-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                  </svg>
                  {{ planoNome }}
                </div>
                <p class="text-gray-600 text-sm">
                  <span *ngIf="plano === 'RH'">100% de funcionamento garantido em sites de RH como LinkedIn, Indeed, Catho e mais.</span>
                  <span *ngIf="plano === 'VENDAS'">Automação completa para CRMs e plataformas de vendas como Salesforce, HubSpot, Pipedrive.</span>
                  <span *ngIf="plano === 'ECOMMERCE'">Preenchimento perfeito em marketplaces como Mercado Livre, Amazon, Shopify.</span>
                  <span *ngIf="plano === 'FREE'">Até 10 templates, extensão básica.</span>
                  <span *ngIf="plano === 'PESSOAL'">Até 100 templates, backup/sync opcional.</span>
                  <span *ngIf="plano === 'PROFISSIONAL'">Até 500 templates, compartilhamento e relatórios.</span>
                  <span *ngIf="plano === 'EMPRESARIAL'">Plano sob demanda para empresas, recursos avançados.</span>
                </p>
              </div>
              
              <div class="text-center">
                <a routerLink="/planos" class="text-blue-600 hover:underline font-medium transition-colors duration-200">
                  Trocar plano →
                </a>
              </div>
            </div> 
            -->
          
            
            <!-- Benefícios -->
            <div class="space-y-4">
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Automatize qualquer formulário</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Disponível em todas as plataformas</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">100% de precisão</span>
              </div>
            </div>
          </div>

          <!-- Card de Cadastro - Alinhado com o botão "Começar por R$ 14,90/mês" -->
          <div class="bg-gray-50 rounded-lg p-8 border border-gray-100 lg:pr-4 mt-8">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Criar conta</h2>
              <p class="text-gray-600">Preencha seus dados para começar</p>
            </div>

            <!-- Mensagens de Status -->
            <div *ngIf="mensagemErro" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span class="text-red-800 text-sm font-medium">{{ mensagemErro }}</span>
              </div>
            </div>

            <div *ngIf="mensagemSucesso" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-green-800 text-sm font-medium">{{ mensagemSucesso }}</span>
              </div>
            </div>

            <!-- Formulário de cadastro -->
            <form [formGroup]="registerForm" (ngSubmit)="registrar()" class="space-y-6">
              <!-- Campo Nome -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
                <input 
                  type="text" 
                  formControlName="nome"
                  placeholder="Digite seu nome" 
                  data-cy="name"
                  [class]="'w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 ' + (registerForm.get('nome')?.invalid && registerForm.get('nome')?.touched ? 'border-red-500' : 'border-gray-300')"
                />
                <!-- Mensagem de erro para nome -->
                <div *ngIf="registerForm.get('nome')?.invalid && registerForm.get('nome')?.touched" class="mt-2 text-sm text-red-600">
                  <span *ngIf="registerForm.get('nome')?.errors?.['required']">Nome é obrigatório</span>
                  <span *ngIf="registerForm.get('nome')?.errors?.['minlength']">Nome deve ter pelo menos 2 caracteres</span>
                  <span *ngIf="registerForm.get('nome')?.errors?.['maxlength']">Nome deve ter no máximo 100 caracteres</span>
                  <span *ngIf="registerForm.get('nome')?.errors?.['invalidCharacters']">Nome contém caracteres inválidos</span>
                  <span *ngIf="registerForm.get('nome')?.errors?.['leadingTrailingSpaces']">Nome não pode começar ou terminar com espaços</span>
                </div>
              </div>

              <!-- Campo Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="Digite seu e-mail" 
                  autocomplete="email"
                  data-cy="email"
                  [class]="'w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 ' + (registerForm.get('email')?.invalid && registerForm.get('email')?.touched ? 'border-red-500' : 'border-gray-300')"
                />
                <!-- Mensagem de erro para email -->
                <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="mt-2 text-sm text-red-600">
                  <span *ngIf="registerForm.get('email')?.errors?.['required']">E-mail é obrigatório</span>
                  <span *ngIf="registerForm.get('email')?.errors?.['invalidFormat']">Formato de e-mail inválido</span>
                  <span *ngIf="registerForm.get('email')?.errors?.['invalidDomain']">Domínio de e-mail inválido</span>
                  <span *ngIf="registerForm.get('email')?.errors?.['multipleEmails']">Não é permitido múltiplos e-mails</span>
                  <span *ngIf="registerForm.get('email')?.errors?.['internationalEmail']">E-mail internacional não suportado</span>
                </div>
              </div>

              <!-- Campo Senha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <div class="relative">
                  <input 
                    [type]="hidePassword ? 'password' : 'text'"
                    formControlName="senha"
                    placeholder="Crie uma senha forte" 
                    autocomplete="new-password"
                    data-cy="password"
                    (input)="validarSenha()"
                    [class]="'w-full px-4 py-3 pr-12 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 ' + (registerForm.get('senha')?.invalid && registerForm.get('senha')?.touched ? 'border-red-500' : 'border-gray-300')"
                  />
                  <button 
                    type="button"
                    (click)="hidePassword = !hidePassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg *ngIf="hidePassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <svg *ngIf="!hidePassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Indicador de Força da Senha -->
                <div *ngIf="registerForm.get('senha')?.value" class="mt-2">
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
                
                <!-- Mensagem de erro para senha -->
                <div *ngIf="registerForm.get('senha')?.invalid && registerForm.get('senha')?.touched" class="mt-2 text-sm text-red-600">
                  <span *ngIf="registerForm.get('senha')?.errors?.['required']">Senha é obrigatória</span>
                  <span *ngIf="registerForm.get('senha')?.errors?.['weakPassword']">Senha muito fraca</span>
                  <span *ngIf="registerForm.get('senha')?.errors?.['sequentialPassword']">Senha sequencial não permitida</span>
                  <span *ngIf="registerForm.get('senha')?.errors?.['repetitivePassword']">Senha com padrões repetitivos</span>
                </div>
              </div>

              <!-- Campo Confirmar Senha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                <div class="relative">
                  <input 
                    [type]="hideConfirmPassword ? 'password' : 'text'"
                    formControlName="confirmarSenha"
                    placeholder="Confirme sua senha" 
                    autocomplete="new-password"
                    data-cy="confirm-password"
                    [class]="'w-full px-4 py-3 pr-12 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 ' + (registerForm.get('confirmarSenha')?.invalid && registerForm.get('confirmarSenha')?.touched ? 'border-red-500' : 'border-gray-300')"
                  />
                  <button 
                    type="button"
                    (click)="hideConfirmPassword = !hideConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg *ngIf="hideConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <svg *ngIf="!hideConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                    </svg>
                  </button>
                </div>
                <!-- Mensagem de erro para confirmar senha -->
                <div *ngIf="registerForm.get('confirmarSenha')?.invalid && registerForm.get('confirmarSenha')?.touched" class="mt-2 text-sm text-red-600">
                  <span *ngIf="registerForm.get('confirmarSenha')?.errors?.['required']">Confirmação de senha é obrigatória</span>
                  <span *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmarSenha')?.touched">As senhas não coincidem</span>
                </div>
              </div>

              <!-- Consentimento LGPD - Botão para Modal -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-blue-900">Consentimento LGPD</h4>
                    <p class="text-sm text-blue-700">Aceite nossa política de privacidade para continuar</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span 
                      class="text-sm font-medium"
                      [ngClass]="lgpdConsentimento.politicaPrivacidade ? 'text-green-600' : 'text-red-600'"
                    >
                      {{ lgpdConsentimento.politicaPrivacidade ? 'Aceito' : 'Pendente' }}
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  (click)="abrirModalLgpd()"
                  class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  {{ lgpdConsentimento.politicaPrivacidade ? 'Alterar Consentimento' : 'Gerencie sua Privacidade Para Continuar' }}
                </button>
              </div>


              <!-- CTA Principal -->
              <button
                type="submit"
                [disabled]="registerForm.invalid || carregando || !lgpdConsentimento.politicaPrivacidade"
                data-cy="register-button"
                class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold text-lg rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <div *ngIf="carregando" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <svg *ngIf="!carregando" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-7a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                {{ carregando ? 'Criando conta...' : 'Criar conta' }}
              </button>

              <!-- Link secundário -->
              <div class="text-center">
                <a routerLink="/login" class="text-gray-600 font-medium hover:text-gray-900 transition-colors duration-200">
                  Já tem conta? Entrar →
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal LGPD -->
    <div *ngIf="mostrarModalLgpd" 
         class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         (click)="fecharModalLgpd()">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col" 
           (click)="$event.stopPropagation()">
        
        <!-- Header do Modal -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">Consentimento LGPD</h2>
              <p class="text-sm text-gray-600">Gerencie suas preferências de privacidade</p>
            </div>
          </div>
          <button 
            class="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            (click)="fecharModalLgpd()">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Conteúdo do Modal -->
        <div class="p-6 overflow-y-auto flex-1">
          <div class="space-y-4">
            <!-- Política de Privacidade (Obrigatório) -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="modalPoliticaPrivacidade"
                  [(ngModel)]="lgpdConsentimento.politicaPrivacidade"
                  class="mt-1 w-5 h-5 text-red-600 bg-white border-2 border-red-300 rounded focus:ring-red-500 focus:ring-2"
                  required
                >
                <label for="modalPoliticaPrivacidade" class="flex-1 text-sm text-red-800 leading-relaxed">
                  <span class="font-semibold">Política de Privacidade</span> 
                  <span class="text-red-600 font-bold">*</span>
                  <br>
                  <span class="text-red-700">Li e aceito a coleta e uso dos meus dados pessoais conforme descrito na política de privacidade. Este consentimento é obrigatório para criar sua conta.</span>
                </label>
              </div>
            </div>

            <!-- Marketing (Opcional) -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="modalMarketing"
                  [(ngModel)]="lgpdConsentimento.marketing"
                  class="mt-1 w-5 h-5 text-green-600 bg-white border-2 border-green-300 rounded focus:ring-green-500 focus:ring-2"
                >
                <label for="modalMarketing" class="flex-1 text-sm text-green-800 leading-relaxed">
                  <span class="font-semibold">Marketing e Comunicações</span>
                  <span class="text-green-600 text-xs ml-1">(Opcional)</span>
                  <br>
                  <span class="text-green-700">Aceito receber e-mails sobre novos recursos, atualizações e ofertas especiais do FormSync.</span>
                </label>
              </div>
            </div>

            <!-- Cookies (Opcional) -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="modalCookies"
                  [(ngModel)]="lgpdConsentimento.cookies"
                  class="mt-1 w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                >
                <label for="modalCookies" class="flex-1 text-sm text-blue-800 leading-relaxed">
                  <span class="font-semibold">Cookies e Analytics</span>
                  <span class="text-blue-600 text-xs ml-1">(Opcional)</span>
                  <br>
                  <span class="text-blue-700">Aceito o uso de cookies para melhorar a experiência e analisar o uso do serviço.</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Links para Políticas -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 class="font-semibold text-gray-800 mb-2">📋 Documentos Importantes:</h4>
            <div class="flex flex-wrap gap-3 text-sm">
              <a 
                routerLink="/privacidade" 
                target="_blank"
                class="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
              >
                📄 Política de Privacidade
              </a>
              <a 
                routerLink="/termos" 
                target="_blank"
                class="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
              >
                📜 Termos de Uso
              </a>
            </div>
          </div>

        </div>

        <!-- Botões - Fixos no final -->
        <div class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              (click)="fecharModalLgpd()">
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 px-3 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              [disabled]="!lgpdConsentimento.politicaPrivacidade"
              (click)="salvarConsentimentoModal()">
              {{ lgpdConsentimento.politicaPrivacidade ? 'Salvar Preferências' : 'Aceitar Política (Obrigatório)' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styles: [],
})
export class RegistrarComponent implements OnInit {
  registerForm: FormGroup;
  mensagemErro = '';
  mensagemSucesso = '';
  carregando = false;
  plano: string = '';
  planoNome: string = '';
  senhaValidation: { isValid: boolean; errors: string[] } = { isValid: false, errors: [] };
  hidePassword = true;
  hideConfirmPassword = true;

  // Consentimento LGPD
  lgpdConsentimento: LgpdConsentResult = {
    politicaPrivacidade: false,
    marketing: false,
    cookies: false
  };

  // Modal LGPD
  mostrarModalLgpd = false;

  // Configurações de segurança
  readonly minPasswordLength = environment.security.minPasswordLength;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private errorHandler: ErrorHandlerService,
    private securityService: SecurityService,
  ) {
    this.registerForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.nomeValidator
      ]],
      email: ['', [Validators.required, this.emailValidator]],
      senha: ['', [Validators.required, this.strongPasswordValidator]],
      confirmarSenha: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      // Atualiza o plano sempre que o query param mudar
      this.plano = params['plano'] || 'PESSOAL';
      this.planoNome = this.getNomePlano(this.plano);
    });
  }

  // Validador customizado para o campo nome
  nomeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const nome = control.value as string;

    // Verifica se há espaços no início ou fim
    if (nome.trim() !== nome) {
      return { leadingTrailingSpaces: true };
    }

    // Verifica se contém apenas caracteres válidos (letras, números, espaços, acentos, hífens e apóstrofos)
    // Padrão permite: A-Z, a-z, 0-9, À-ÿ (acentos), espaços, hífens (-) e apóstrofos (')
    const validPattern = /^[a-zA-Z0-9À-ÿ\u00C0-\u017F\s\-']+$/;
    if (!validPattern.test(nome)) {
      return { invalidCharacters: true };
    }

    return null;
  }

  // Validador customizado para o campo email
  emailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const email = control.value as string;

    // Verifica se há espaços no início ou fim
    if (email.trim() !== email) {
      return { invalidFormat: true };
    }

    // Verifica se contém múltiplos emails (separados por vírgula, ponto e vírgula, etc.)
    if (email.includes(',') || email.includes(';') || email.includes('|')) {
      return { multipleEmails: true };
    }

    // Regex básico para formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return { invalidFormat: true };
    }

    // Verifica se o domínio é válido (pelo menos 2 caracteres após o ponto)
    const domainPart = email.split('@')[1];
    if (!domainPart || domainPart.split('.')[1]?.length < 2) {
      return { invalidDomain: true };
    }

    // Verifica se é um email internacional (domínios de país com mais de 2 caracteres)
    const countryDomains = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'int'];
    const domainParts = domainPart.split('.');
    const topLevelDomain = domainParts[domainParts.length - 1];

    if (topLevelDomain.length > 3 && !countryDomains.includes(topLevelDomain)) {
      return { internationalEmail: true };
    }

    return null;
  }

  // Validador personalizado para verificar se as senhas coincidem
  passwordMatchValidator(form: FormGroup) {
    const senha = form.get('senha')?.value;
    const confirmarSenha = form.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { passwordMismatch: true };
  }

  // Validador de senha forte
  strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const password = control.value as string;

    // Verificar senhas sequenciais
    if (this.isSequentialPassword(password)) {
      return { sequentialPassword: true };
    }

    // Verificar senhas repetitivas
    if (this.isRepetitivePassword(password)) {
      return { repetitivePassword: true };
    }

    // Usar o SecurityService para validações padrão
    const validation = this.securityService.validatePassword(password);
    if (!validation.isValid) {
      return { weakPassword: true };
    }

    return null;
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
  validarSenha() {
    const senha = this.registerForm.get('senha')?.value;
    if (senha) {
      this.senhaValidation = this.securityService.validatePassword(senha);

      // Verificar validações customizadas
      if (this.isSequentialPassword(senha)) {
        this.senhaValidation.isValid = false;
        this.senhaValidation.errors.push('Senha sequencial não permitida');
      }

      if (this.isRepetitivePassword(senha)) {
        this.senhaValidation.isValid = false;
        this.senhaValidation.errors.push('Senha com padrões repetitivos');
      }
    }
  }

  // Métodos para indicador de força da senha
  getSenhaStrengthColor(index: number): string {
    const senha = this.registerForm.get('senha')?.value;
    if (!senha) return 'bg-gray-200';

    const strength = this.calculatePasswordStrength(senha);
    if (index <= strength) {
      if (strength <= 2) return 'bg-red-500';
      if (strength <= 3) return 'bg-yellow-500';
      if (strength <= 4) return 'bg-blue-500';
      return 'bg-green-500';
    }
    return 'bg-gray-200';
  }

  getSenhaStrengthTextColor(): string {
    const senha = this.registerForm.get('senha')?.value;
    if (!senha) return 'text-gray-500';

    const strength = this.calculatePasswordStrength(senha);
    if (strength <= 2) return 'text-red-600';
    if (strength <= 3) return 'text-yellow-600';
    if (strength <= 4) return 'text-blue-600';
    return 'text-green-600';
  }

  getSenhaStrengthText(): string {
    const senha = this.registerForm.get('senha')?.value;
    if (!senha) return '';

    const strength = this.calculatePasswordStrength(senha);
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
    const senha = this.registerForm.get('senha')?.value;
    if (!senha) return 'text-gray-400';

    const isValid = this.isRequisitoValid(requisito, senha);
    return isValid ? 'text-green-600' : 'text-gray-400';
  }

  getRequisitoIcon(requisito: string): string {
    const senha = this.registerForm.get('senha')?.value;
    if (!senha) return '●';

    const isValid = this.isRequisitoValid(requisito, senha);
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

  // Getters para facilitar o acesso aos campos do formulário
  get nome() { return this.registerForm.get('nome')?.value; }
  get email() { return this.registerForm.get('email')?.value; }
  get senha() { return this.registerForm.get('senha')?.value; }
  get confirmarSenha() { return this.registerForm.get('confirmarSenha')?.value; }

  // Marca todos os campos como tocados para exibir as validações
  marcarCamposComoTocados() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getNomePlano(plano: string): string {
    switch (plano) {
      // Planos Especializados
      case 'RH':
        return 'FormSync RH (R$ 49,90/mês)';
      case 'VENDAS':
        return 'FormSync Vendas (R$ 49,90/mês)';
      case 'ECOMMERCE':
        return 'FormSync Varejo (R$ 49,90/mês)';

      // Novos Planos
      case 'FREE':
        return 'Free (R$ 0,00)';
      case 'PESSOAL':
        return 'Pessoal (R$ 14,90/mês)';
      case 'PROFISSIONAL':
        return 'Profissional (R$ 39,90/mês)';
      case 'EMPRESARIAL':
        return 'Empresarial (Sob demanda)';
      default:
        return 'Pessoal (R$ 14,90/mês)';
    }
  }

  /**
   * Verifica se o plano é especializado
   */
  isPlanoEspecializado(): boolean {
    return ['RH', 'VENDAS', 'ECOMMERCE'].includes(this.plano);
  }

  /**
   * Obtém o número de sites mapeados por área
   */
  getSitesCount(): string {
    switch (this.plano) {
      case 'RH':
        return '6+';
      case 'VENDAS':
        return '6+';
      case 'ECOMMERCE':
        return '6+';
      default:
        return '10+';
    }
  }

  // Método para lidar com mudanças no consentimento LGPD
  onLgpdConsentimentoChange(consentimento: LgpdConsentResult) {
    this.lgpdConsentimento = consentimento;
    console.log('🔒 [LGPD] Consentimento atualizado:', this.lgpdConsentimento);
  }

  // Métodos para modal LGPD
  abrirModalLgpd() {
    this.mostrarModalLgpd = true;
  }

  fecharModalLgpd() {
    this.mostrarModalLgpd = false;
  }

  salvarConsentimentoModal() {
    if (!this.lgpdConsentimento.politicaPrivacidade) {
      // Mostrar mensagem de erro se política não foi aceita
      return;
    }

    console.log('🔒 [LGPD] Consentimento salvo via modal:', this.lgpdConsentimento);
    this.fecharModalLgpd();
  }

  registrar() {
    if (this.registerForm.invalid) {
      this.marcarCamposComoTocados();
      this.mensagemErro = 'Por favor, corrija os erros no formulário.';
      this.mensagemSucesso = '';
      return;
    }

    // Verificar consentimento LGPD obrigatório
    if (!this.lgpdConsentimento.politicaPrivacidade) {
      this.mensagemErro = 'É necessário aceitar a política de privacidade para continuar.';
      this.mensagemSucesso = '';
      return;
    }

    this.carregando = true;

    // Verificar feature flag para pular checkout
    console.log('🔍 [DEBUG] Environment skipStripeCheckout:', environment.skipStripeCheckout);
    console.log('🔍 [DEBUG] Environment completo:', environment);
    
    if (environment.skipStripeCheckout) {
      console.log('🚀 [FEATURE_FLAG] Checkout do Stripe desabilitado - pulando para cadastro direto');
      this.cadastrarUsuarioSemCheckout();
    } else {
      console.log('🔔 [FRONTEND_CHECKOUT] Preparando cadastro e pagamento...');
      this.cadastrarUsuarioComCheckout();
    }
  }

  private cadastrarUsuarioSemCheckout() {
    const novoUsuario: Usuario = {
      nome: this.registerForm.get('nome')?.value,
      email: this.registerForm.get('email')?.value,
      senha: this.registerForm.get('senha')?.value,
      plano: this.plano,
      // Campos de consentimento LGPD individuais
      consentimentoLGPD: this.lgpdConsentimento.politicaPrivacidade,
      consentimentoMarketing: this.lgpdConsentimento.marketing,
      consentimentoAnalytics: this.lgpdConsentimento.cookies,
      dataConsentimento: new Date().toISOString(),
      ipConsentimento: '127.0.0.1', // TODO: Implementar captura real do IP
      userAgentConsentimento: navigator.userAgent
    };

    this.usuarioService.cadastrar(novoUsuario).subscribe({
      next: (response: any) => {
        console.log('✅ [FEATURE_FLAG] Usuário cadastrado sem checkout:', response);
        this.mensagemSucesso = 'Conta criada com sucesso! Redirecionando...';

        // Redirecionar para página de sucesso ou dashboard
        setTimeout(() => {
          this.router.navigate(['/sucesso'], {
            queryParams: {
              email: this.registerForm.get('email')?.value,
              plano: this.plano,
              skipCheckout: 'true'
            }
          });
        }, 2000);
      },
      error: (err: any) => {
        console.error('❌ [FEATURE_FLAG] Erro ao cadastrar usuário:', err);
        this.carregando = false;

        if (err.status === 409) {
          this.mensagemErro = 'Este email já está cadastrado. Use outro email ou faça login.';
        } else {
          this.mensagemErro = this.errorHandler.getErrorMessage(err);
        }
      },
    });
  }

  private cadastrarUsuarioComCheckout() {
    const novoUsuario: Usuario = {
      nome: this.registerForm.get('nome')?.value,
      email: this.registerForm.get('email')?.value,
      senha: this.registerForm.get('senha')?.value,
      plano: this.plano,
      // Campos de consentimento LGPD individuais
      consentimentoLGPD: this.lgpdConsentimento.politicaPrivacidade,
      consentimentoMarketing: this.lgpdConsentimento.marketing,
      consentimentoAnalytics: this.lgpdConsentimento.cookies,
      dataConsentimento: new Date().toISOString(),
      ipConsentimento: '127.0.0.1', // TODO: Implementar captura real do IP
      userAgentConsentimento: navigator.userAgent
    };

    this.usuarioService.cadastrar(novoUsuario).subscribe({
      next: () => {
        console.log(
          '✅ [FRONTEND_CHECKOUT] Usuário cadastrado, seguindo para checkout',
        );
        this.criarCheckoutERedirecionar();
      },
      error: (err: any) => {
        console.error(
          '❌ [FRONTEND_CHECKOUT] Erro ao cadastrar usuário antes do checkout:',
          err,
        );
        console.error('   - Status:', err.status);
        console.error('   - Error object:', err.error);
        console.error('   - Full error:', err);

        // IMPORTANTE: Verificar se é erro 409 e mostrar mensagem
        if (err.status === 409) {
          console.log('🚨 [FRONTEND_CHECKOUT] Erro 409 detectado - Usuário já existe');
          this.carregando = false;
          this.mensagemErro = 'Este email já está cadastrado. Use outro email ou faça login.';
          console.log('   - Mensagem de erro exibida:', this.mensagemErro);
          return; // IMPORTANTE: Não continuar para checkout
        }

        this.carregando = false;
        this.mensagemErro = this.errorHandler.getErrorMessage(err);
        console.log('   - Mensagem de erro exibida:', this.mensagemErro);
      },
    });
  }

  private criarCheckoutERedirecionar() {
    this.checkoutService
      .criarCheckout({ plano: this.plano, email: this.registerForm.get('email')?.value })
      .subscribe({
        next: (res: { id: string }) => {
          console.log(
            '✅ [FRONTEND_CHECKOUT] Checkout criado no backend:',
            res,
          );
          console.log('   - Session ID:', res.id);
          this.initializeStripeCheckout(res.id);
        },
        error: (err: any) => {
          console.error('❌ [FRONTEND_CHECKOUT] Erro ao criar checkout:', err);
          this.carregando = false;
          this.mensagemErro = this.errorHandler.getErrorMessage(err);
        },
      });
  }

  private initializeStripeCheckout(sessionId: string): void {
    console.log('🔍 [FRONTEND_STRIPE] Iniciando Stripe checkout...');
    console.log('   - Session ID:', sessionId);
    console.log('   - Timestamp:', new Date().toISOString());

    // Aguarda o Stripe carregar se não estiver disponível
    if (typeof Stripe === 'undefined') {
      console.log(
        '⏳ [FRONTEND_STRIPE] Stripe não carregado ainda. Aguardando...',
      );
      setTimeout(() => this.initializeStripeCheckout(sessionId), 100);
      return;
    }

    console.log(
      '✅ [FRONTEND_STRIPE] Stripe carregado. Iniciando redirecionamento...',
    );
    console.log('   - Stripe global object:', typeof Stripe);
    console.log(
      '   - Environment publishable key:',
      environment.stripe.publishableKey.substring(0, 10) + '...',
    );

    try {
      console.log('🔐 [FRONTEND_STRIPE] Criando instância Stripe...');
      console.log('   - Chave completa:', environment.stripe.publishableKey);
      console.log('   - Tamanho da chave:', environment.stripe.publishableKey.length);
      console.log('   - Primeiros 10 chars:', environment.stripe.publishableKey.substring(0, 10));
      console.log('   - Últimos 10 chars:', environment.stripe.publishableKey.substring(environment.stripe.publishableKey.length - 10));

      const stripe = Stripe(environment.stripe.publishableKey);
      console.log(
        '🚀 [FRONTEND_STRIPE] Redirecionando para checkout Stripe...',
      );
      console.log('   - Usando sessionId:', sessionId);

      // Usar abordagem mais simples que evita chamadas automáticas problemáticas
      stripe
        .redirectToCheckout({ sessionId })
        .then((result: any) => {
          console.log(
            '📡 [FRONTEND_STRIPE] Resposta do redirectToCheckout:',
            result,
          );

          if (result.error) {
            console.error(
              '❌ [FRONTEND_STRIPE] Erro no redirecionamento:',
              result.error,
            );
            console.error('   - Error type:', result.error.type);
            console.error('   - Error message:', result.error.message);

            // Verificar se é erro conhecido do payment_pages
            if (
              result.error.message &&
              result.error.message.includes('payment_pages')
            ) {
              console.log(
                '⚠️ [FRONTEND_STRIPE] Erro conhecido do payment_pages - funcionalidade não afetada',
              );
              return;
            }
            this.carregando = false;
            this.mensagemErro =
              result.error.message || 'Erro ao processar pagamento.';
          } else {
            console.log('✅ [FRONTEND_STRIPE] Redirecionamento bem-sucedido');
          }
        })
        .catch((error: any) => {
          console.error('❌ [FRONTEND_STRIPE] Erro no checkout Stripe:', error);
          console.error('   - Error stack:', error.stack);

          // Verificar se é erro conhecido do payment_pages
          if (
            error.message &&
            (error.message.includes('payment_pages') ||
              error.message.includes('401'))
          ) {
            console.log(
              '⚠️ [FRONTEND_STRIPE] Erro conhecido ignorado - checkout continua funcionando',
            );
            console.log(
              '🔄 [FRONTEND_STRIPE] Tentando redirecionamento manual como fallback...',
            );

            // Tentar redirecionamento manual como fallback
            const fallbackUrl = `https://checkout.stripe.com/pay/${sessionId}`;
            console.log('   - Fallback URL:', fallbackUrl);
            window.location.href = fallbackUrl;
            return;
          }

          this.carregando = false;
          this.mensagemErro = 'Erro ao processar pagamento. Tente novamente.';
        });
    } catch (error: any) {
      console.error('❌ [FRONTEND_STRIPE] Erro ao inicializar Stripe:', error);
      console.error('   - Error details:', error);
      this.carregando = false;
      this.mensagemErro =
        'Erro ao carregar sistema de pagamento. Tente novamente.';
    }
  }
}

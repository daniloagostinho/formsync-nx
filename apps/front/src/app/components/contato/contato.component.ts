import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../services/notification.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { ContatoService, ContatoRequest } from '../../services/contato.service';

@Component({
  standalone: true,
  selector: 'app-contato',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    FooterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Main Content -->
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="mb-6">
            <div class="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <mat-icon class="text-white text-4xl">contact_support</mat-icon>
            </div>
          </div>
          <h1 class="text-4xl lg:text-5xl font-bold text-slate-800 mb-6 leading-tight">
            Entre em <span class="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">Contato</span>
          </h1>
          <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Tem alguma dúvida, sugestão ou precisa de ajuda? Estamos aqui para ajudar você!
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <!-- Formulário de Contato -->
          <div class="lg:col-span-2">
            <mat-card class="p-8 border border-gray-100 rounded-2xl transition-all duration-300 hover:-translate-y-1">
              <div class="mb-6">
                <h2 class="text-2xl font-semibold text-slate-800 mb-2">
                  Envie sua mensagem
                </h2>
                <p class="text-slate-600">Preencha o formulário abaixo e entraremos em contato em breve</p>
              </div>

              <!-- Mensagem de Sucesso -->
              <div *ngIf="showSuccessMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3 animate-fade-in">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <mat-icon class="text-green-600 text-lg">check_circle</mat-icon>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-green-800 font-semibold text-sm mb-1">Mensagem Enviada!</h3>
                  <p class="text-green-700 text-sm leading-relaxed">{{ successMessage }}</p>
                </div>
                <button 
                  (click)="closeSuccessMessage()" 
                  class="flex-shrink-0 text-green-500 hover:text-green-700 transition-colors duration-200"
                  aria-label="Fechar mensagem">
                  <mat-icon class="text-lg">close</mat-icon>
                </button>
              </div>

              <!-- Mensagem de Erro -->
              <div *ngIf="showErrorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 animate-fade-in">
                <div class="flex-shrink-0">
                  <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <mat-icon class="text-red-600 text-lg">error</mat-icon>
                  </div>
                </div>
                <div class="flex-1">
                  <h3 class="text-red-800 font-semibold text-sm mb-1">Erro ao Enviar</h3>
                  <p class="text-red-700 text-sm leading-relaxed">{{ errorMessage }}</p>
                </div>
                <button 
                  (click)="closeErrorMessage()" 
                  class="flex-shrink-0 text-red-500 hover:text-red-700 transition-colors duration-200"
                  aria-label="Fechar mensagem">
                  <mat-icon class="text-lg">close</mat-icon>
                </button>
              </div>
              
              <mat-card-content>
                <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="mb-6">
                      <label class="block text-sm font-semibold text-slate-700 mb-2">Nome completo *</label>
                      <input
                        type="text"
                        formControlName="nome"
                        placeholder="Digite seu nome completo"
                        autocomplete="off"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                      />
                      <div *ngIf="contactForm.get('nome')?.invalid && (contactForm.get('nome')?.dirty || contactForm.get('nome')?.touched)" class="text-red-500 text-sm mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-base">error</mat-icon>
                        Nome é obrigatório
                      </div>
                    </div>

                    <div class="mb-6">
                      <label class="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                      <input
                        type="email"
                        formControlName="email"
                        placeholder="seu&#64;email.com"
                        autocomplete="off"
                        class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                      />
                      <div *ngIf="contactForm.get('email')?.hasError('required') && (contactForm.get('email')?.dirty || contactForm.get('email')?.touched)" class="text-red-500 text-sm mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-base">error</mat-icon>
                        Email é obrigatório
                      </div>
                      <div *ngIf="contactForm.get('email')?.hasError('email') && (contactForm.get('email')?.dirty || contactForm.get('email')?.touched)" class="text-red-500 text-sm mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-base">error</mat-icon>
                        Email inválido
                      </div>
                    </div>
                  </div>

                  <div class="mb-6">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Assunto *</label>
                    <input
                      type="text"
                      formControlName="assunto"
                      placeholder="Qual o motivo do contato?"
                      autocomplete="off"
                      class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400"
                    />
                    <div *ngIf="contactForm.get('assunto')?.invalid && (contactForm.get('assunto')?.dirty || contactForm.get('assunto')?.touched)" class="text-red-500 text-sm mt-1 flex items-center">
                      <mat-icon class="text-red-500 mr-1 text-base">error</mat-icon>
                      Assunto é obrigatório
                    </div>
                  </div>

                  <div class="mb-6">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Mensagem *</label>
                    <textarea
                      formControlName="mensagem"
                      rows="5"
                      placeholder="Descreva sua dúvida ou solicitação..."
                      class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 placeholder-slate-400 resize-none"
                    ></textarea>
                    <div *ngIf="contactForm.get('mensagem')?.hasError('required') && (contactForm.get('mensagem')?.dirty || contactForm.get('mensagem')?.touched)" class="text-red-500 text-sm mt-1 flex items-center">
                      <mat-icon class="text-red-500 mr-1 text-base">error</mat-icon>
                      Mensagem é obrigatória
                    </div>
                    <div *ngIf="contactForm.get('mensagem')?.hasError('minlength') && (contactForm.get('mensagem')?.dirty || contactForm.get('mensagem')?.touched)" class="text-red-500 text-sm mt-1 flex items-center">
                      <mat-icon class="text-red-500 mr-1 text-base">error</mat-icon>
                      Mensagem deve ter pelo menos 10 caracteres
                    </div>
                  </div>

                  <button 
                    type="submit"
                    [disabled]="contactForm.invalid || isSubmitting"
                    class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2">
                    <div *ngIf="isSubmitting" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <mat-icon *ngIf="!isSubmitting" class="text-white">send</mat-icon>
                    <span>{{ isSubmitting ? 'Enviando...' : 'Enviar Mensagem' }}</span>
                  </button>
                </form>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Informações de Contato -->
          <div class="space-y-6">
            <mat-card class="p-6 border border-gray-100 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white transition-all duration-300 hover:-translate-y-1">
              <mat-card-header class="mb-4">
                <mat-card-title class="text-xl font-semibold mb-2">
                  Informações de Contato
                </mat-card-title>
              </mat-card-header>
              
              <mat-card-content class="space-y-4">
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                  <mat-icon class="text-indigo-200">email</mat-icon>
                  <div>
                    <p class="font-medium text-sm">Email</p>
                    <p class="text-indigo-100 text-sm">contato&#64;formsync.com.br</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                  <mat-icon class="text-indigo-200">schedule</mat-icon>
                  <div>
                    <p class="font-medium text-sm">Horário de Atendimento</p>
                    <p class="text-indigo-100 text-sm">Segunda a Sexta: 9h às 18h</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                  <mat-icon class="text-indigo-200">location_on</mat-icon>
                  <div>
                    <p class="font-medium text-sm">Localização</p>
                    <p class="text-indigo-100 text-sm">São Paulo, Brasil</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>

            <mat-card class="p-6 border border-gray-100 rounded-2xl transition-all duration-300 hover:-translate-y-1">
              <mat-card-header class="mb-4">
                <mat-card-title class="text-lg font-semibold text-slate-800 mb-2">
                  Outras formas de contato
                </mat-card-title>
              </mat-card-header>
              
              <mat-card-content class="space-y-3">
                <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                  <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-green-600">chat</mat-icon>
                  </div>
                  <div>
                    <p class="font-medium text-slate-800">Chat ao vivo</p>
                    <p class="text-sm text-slate-600">Disponível no dashboard</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                  <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-blue-600">help</mat-icon>
                  </div>
                  <div>
                    <p class="font-medium text-slate-800">Central de Ajuda</p>
                    <p class="text-sm text-slate-600">Documentação e tutoriais</p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                  <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <mat-icon class="text-purple-600">forum</mat-icon>
                  </div>
                  <div>
                    <p class="font-medium text-slate-800">Comunidade</p>
                    <p class="text-sm text-slate-600">Fórum de usuários</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="mb-16">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-slate-800 mb-4">
              Perguntas <span class="bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">Frequentes</span>
            </h2>
            <p class="text-lg text-slate-600 max-w-2xl mx-auto">
              Respostas para as dúvidas mais comuns sobre o FormSync
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         <mat-card class="p-6 border border-gray-100 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-gray-200 group">
               <div class="text-center mb-4">
                 <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-200 transition-colors duration-200">
                   <mat-icon class="text-indigo-600 group-hover:text-indigo-700 transition-colors duration-200">question_mark</mat-icon>
                 </div>
                 <h3 class="text-lg font-semibold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors duration-200">
                   Como funciona o FormSync?
                 </h3>
               </div>
               <p class="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-200">
                 O FormSync é uma ferramenta que automatiza o preenchimento de formulários web usando dados de planilhas CSV, 
                 economizando tempo e reduzindo erros de digitação.
               </p>
             </mat-card>
            
                         <mat-card class="p-6 border border-gray-100 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-gray-200 group">
               <div class="text-center mb-4">
                 <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors duration-200">
                   <mat-icon class="text-green-600 group-hover:text-green-700 transition-colors duration-200">computer</mat-icon>
                 </div>
                 <h3 class="text-lg font-semibold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors duration-200">
                   Quais navegadores são suportados?
                 </h3>
               </div>
               <p class="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-200">
                 Suportamos Chrome, Firefox, Edge e Safari nas versões mais recentes. 
                 Nossa extensão é compatível com a maioria dos sites modernos.
               </p>
             </mat-card>
            
                         <mat-card class="p-6 border border-gray-100 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white hover:border-gray-200 group">
               <div class="text-center mb-4">
                 <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors duration-200">
                   <mat-icon class="text-blue-600 group-hover:text-blue-700 transition-colors duration-200">support_agent</mat-icon>
                 </div>
                 <h3 class="text-lg font-semibold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors duration-200">
                   Como obter suporte técnico?
                 </h3>
               </div>
               <p class="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-200">
                 Você pode entrar em contato através deste formulário, email ou usar o chat ao vivo 
                 disponível no dashboard da sua conta.
               </p>
             </mat-card>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="text-center">
          <mat-card class="p-8 border border-gray-100 rounded-2xl bg-gradient-to-br from-slate-50 to-white hover:border-gray-200 transition-all duration-300">
            <div class="max-w-2xl mx-auto">
              <h3 class="text-2xl font-bold text-slate-800 mb-4">
                Precisa de mais ajuda?
              </h3>
              <p class="text-slate-600 mb-6">
                Nossa equipe está sempre pronta para ajudar você a aproveitar ao máximo o FormSync
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a routerLink="/dashboard" class="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg">
                  <mat-icon class="mr-2 text-base">dashboard</mat-icon>
                  Ir para Dashboard
                </a>
                <a routerLink="/" class="inline-flex items-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 shadow-md">
                  <mat-icon class="mr-2 text-base">home</mat-icon>
                  Voltar ao Início
                </a>
              </div>
            </div>
          </mat-card>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styles: [`
    ::ng-deep .success-snackbar {
      background-color: #10b981 !important;
      color: white !important;
      font-weight: 500 !important;
    }
    
    ::ng-deep .error-snackbar {
      background-color: #ef4444 !important;
      color: white !important;
      font-weight: 500 !important;
    }
    
    ::ng-deep .success-snackbar .mat-mdc-snack-bar-action,
    ::ng-deep .error-snackbar .mat-mdc-snack-bar-action {
      color: white !important;
      font-weight: 600 !important;
    }
    
    ::ng-deep .success-snackbar .mdc-snackbar__surface,
    ::ng-deep .error-snackbar .mdc-snackbar__surface {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class ContatoComponent {
  contactForm: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  showErrorMessage = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private contatoService: ContatoService,
    private notificationService: NotificationService
  ) {
    this.contactForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      assunto: ['', [Validators.required]],
      mensagem: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      const contatoData: ContatoRequest = {
        nome: this.contactForm.get('nome')?.value,
        email: this.contactForm.get('email')?.value,
        assunto: this.contactForm.get('assunto')?.value,
        mensagem: this.contactForm.get('mensagem')?.value
      };

      this.contatoService.enviarMensagem(contatoData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.contactForm.reset();

          console.log('✅ [CONTATO] Resposta da API:', response);
          console.log('📢 [CONTATO] Exibindo mensagem de sucesso:', response.message);

          // Mostrar mensagem de sucesso integrada
          this.successMessage = response.message;
          this.showSuccessMessage = true;
          this.showErrorMessage = false;

          // Auto-fechar após 8 segundos
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 8000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Erro ao enviar mensagem:', error);

          // Mostrar mensagem de erro integrada
          this.errorMessage = 'Erro ao enviar mensagem. Tente novamente mais tarde.';
          this.showErrorMessage = true;
          this.showSuccessMessage = false;

          // Auto-fechar após 8 segundos
          setTimeout(() => {
            this.showErrorMessage = false;
          }, 8000);
        }
      });
    }
  }

  closeSuccessMessage() {
    this.showSuccessMessage = false;
  }

  closeErrorMessage() {
    this.showErrorMessage = false;
  }
}

import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { environment } from '../../../environments/environment';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-trello-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    FooterComponent
  ],
  template: `
    
    <!-- Hero Section com Formulário de Login - Estilo Trello -->
    <section class="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div class="w-full max-w-6xl">
        <!-- Layout Principal -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Conteúdo da Esquerda - Alinhado com a logo -->
          <div class="text-center lg:text-left lg:pl-4">
            <!-- Header Principal -->
            <h1 class="text-5xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight mt-[100px]">
              Bem-vindo de volta
            </h1>
            
            <!-- Subheading -->
            <p class="text-xl mb-8 text-gray-600 leading-relaxed">
              Acesse sua conta e continue automatizando formulários em qualquer site
            </p>
            
            <!-- Benefícios -->
            <div class="space-y-4 mb-8">
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Seus Formulários salvos</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Sincronização automática</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">100% seguro</span>
              </div>
            </div>
          </div>

          <!-- Card de Login - Alinhado com o botão "Começar por R$ 14,90/mês" -->
          <div class="bg-gray-50 rounded-lg p-8 border border-gray-200 lg:pr-4">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Entrar</h2>
              <p class="text-gray-600">Entre com seu email para continuar</p>
            </div>

            <!-- Mensagem de erro -->
            <div *ngIf="mensagemErro" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <span class="text-red-800 text-sm font-medium">{{ mensagemErro }}</span>
              </div>
            </div>

            <!-- Formulário de login -->
            <form [formGroup]="loginForm" (ngSubmit)="enviarCodigo()" class="space-y-6">
              <!-- Campo Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                <input 
                  type="email" 
                  formControlName="email"
                  placeholder="Digite seu e-mail" 
                  autocomplete="email"
                  data-cy="email"
                  [class]="'w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 ' + (loginForm.get('email')?.invalid && loginForm.get('email')?.touched ? 'border-red-500' : 'border-gray-300')"
                />
                <!-- Mensagem de erro para email -->
                <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="mt-2 text-sm text-red-600">
                  <span *ngIf="loginForm.get('email')?.errors?.['required']">E-mail é obrigatório</span>
                  <span *ngIf="loginForm.get('email')?.errors?.['invalidFormat']">Formato de e-mail inválido</span>
                  <span *ngIf="loginForm.get('email')?.errors?.['invalidDomain']">Domínio de e-mail inválido</span>
                  <span *ngIf="loginForm.get('email')?.errors?.['multipleEmails']">Não é permitido múltiplos e-mails</span>
                  <span *ngIf="loginForm.get('email')?.errors?.['internationalEmail']">E-mail internacional não suportado</span>
                </div>
              </div>

              <!-- CTA Principal -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || carregando"
                data-cy="login-button"
                class="w-full py-4 px-6 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <div *ngIf="carregando" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <svg *ngIf="!carregando" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                {{ carregando ? (environment.skipEmailVerification ? 'Entrando...' : 'Enviando código...') : 'Entrar' }}
              </button>

              <!-- Link secundário -->
              <div class="text-center">
                <a routerLink="/trello-register" class="text-gray-600 font-medium hover:text-gray-900 transition-colors duration-200">
                  Não tem conta? Criar conta gratuita →
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styles: []
})
export class TrelloLoginComponent {
  loginForm: FormGroup;
  mensagemErro = '';
  carregando = false;
  environment = environment;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, this.emailValidator]]
    });
  }

  ngOnInit() {
    console.log('🔧 [TRELLO_LOGIN] Environment config:');
    console.log('   - API URL:', environment.apiUrl);
    console.log('   - Skip Email Verification:', environment.skipEmailVerification);
    console.log('   - Production:', environment.production);
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

  // Getter para facilitar o acesso ao campo email
  get email() { return this.loginForm.get('email')?.value; }

  // Marca todos os campos como tocados para exibir as validações
  marcarCamposComoTocados() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  enviarCodigo() {
    console.log('🔐 [TRELLO_LOGIN] Iniciando processo de login...');
    console.log('   - Email:', this.email);
    console.log('   - Skip Email Verification:', environment.skipEmailVerification);

    if (this.loginForm.invalid) {
      this.marcarCamposComoTocados();
      this.mensagemErro = 'Por favor, corrija os erros no formulário.';
      return;
    }

    this.carregando = true;
    this.mensagemErro = '';

    // Verificar feature flag para pular verificação de email
    if (environment.skipEmailVerification) {
      console.log('🚀 [FEATURE_FLAG] Verificação de email desabilitada - fazendo login direto (Trello)');
      this.fazerLoginDireto();
      return;
    }

    console.log('📧 [TRELLO_LOGIN] Feature flag desabilitada - enviando código por email...');
    this.authService.enviarCodigo(this.email).subscribe({
      next: () => {
        this.carregando = false;
        this.router.navigate(['/verificar-codigo'], { queryParams: { email: this.email } });
      },
      error: (error: any) => {
        this.carregando = false;
        this.mensagemErro = this.errorHandler.getErrorMessage(error);
      }
    });
  }

  private fazerLoginDireto() {
    console.log('🔐 [LOGIN_DIRETO_TRELLO] Iniciando login direto para:', this.email);

    // Simular um código válido para o login direto
    const codigoSimulado = '123456';

    this.authService.verificarCodigo(this.email, codigoSimulado).subscribe({
      next: (res: any) => {
        console.log('✅ [LOGIN_DIRETO_TRELLO] Login realizado com sucesso:', res);
        this.authService.salvarToken(res.token);
        this.authService.salvarNomeUsuario(res.nome);
        localStorage.setItem('plano', res.plano);

        this.carregando = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        console.error('❌ [LOGIN_DIRETO_TRELLO] Erro no login direto:', error);
        this.carregando = false;
        this.mensagemErro = this.errorHandler.getErrorMessage(error);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { CheckoutService } from '../../services/checkout.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { environment } from '../../../environments/environment';
import { FooterComponent } from '../footer/footer.component';

declare const Stripe: any;

@Component({
  selector: 'app-trello-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FooterComponent],
  template: `
    <!-- Hero Section com Formulário de Cadastro - Estilo Trello -->
    <section class="py-16 bg-white text-gray-900 flex items-center justify-center px-6">
      <div class="w-full max-w-6xl">
        <!-- Layout Principal -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Conteúdo da Esquerda - Alinhado com a logo -->
          <div class="text-center lg:text-left lg:pl-4">
            <!-- Header Principal -->
            <h1 class="text-5xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Crie sua conta
            </h1>
            
            <!-- Subheading -->
            <p class="text-xl mb-8 text-gray-600 leading-relaxed">
              Comece gratuitamente em segundos e automatize qualquer formulário na internet
            </p>

            <!-- Informações do Plano -->
            <div class="bg-gray-50 rounded-lg p-8 border border-gray-200 mb-8">
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
              
              <!-- Link para trocar plano -->
              <div class="text-center">
                <a routerLink="/planos" class="text-blue-600 hover:underline font-medium transition-colors duration-200">
                  Trocar plano →
                </a>
              </div>
            </div>
            
            <!-- Benefícios -->
            <div class="space-y-4">
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Sem cartão de crédito</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">7 dias grátis</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">100% de precisão</span>
              </div>
            </div>
          </div>

          <!-- Card de Cadastro - Alinhado com o botão "Começar por R$ 14,90/mês" -->
          <div class="bg-gray-50 rounded-lg p-8 border border-gray-200 lg:pr-4 mt-8">
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
                <input 
                  type="password" 
                  formControlName="senha"
                  placeholder="Crie uma senha" 
                  autocomplete="new-password"
                  data-cy="password"
                  [class]="'w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 ' + (registerForm.get('senha')?.invalid && registerForm.get('senha')?.touched ? 'border-red-500' : 'border-gray-300')"
                />
                <!-- Mensagem de erro para senha -->
                <div *ngIf="registerForm.get('senha')?.invalid && registerForm.get('senha')?.touched" class="mt-2 text-sm text-red-600">
                  <span *ngIf="registerForm.get('senha')?.errors?.['required']">Senha é obrigatória</span>
                  <span *ngIf="registerForm.get('senha')?.errors?.['minlength']">Senha deve ter pelo menos 6 caracteres</span>
                </div>
              </div>

              <!-- Campo Confirmar Senha -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                <input 
                  type="password" 
                  formControlName="confirmarSenha"
                  placeholder="Confirme sua senha" 
                  autocomplete="new-password"
                  data-cy="confirm-password"
                  [class]="'w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-gray-900 placeholder-gray-400 ' + (registerForm.get('confirmarSenha')?.invalid && registerForm.get('confirmarSenha')?.touched ? 'border-red-500' : 'border-gray-300')"
                />
                <!-- Mensagem de erro para confirmar senha -->
                <div *ngIf="registerForm.get('confirmarSenha')?.invalid && registerForm.get('confirmarSenha')?.touched" class="mt-2 text-sm text-red-600">
                  <span *ngIf="registerForm.get('confirmarSenha')?.errors?.['required']">Confirmação de senha é obrigatória</span>
                  <span *ngIf="registerForm.errors?.['passwordMismatch'] && registerForm.get('confirmarSenha')?.touched">As senhas não coincidem</span>
                </div>
              </div>

              <!-- CTA Principal -->
              <button
                type="submit"
                [disabled]="registerForm.invalid || carregando"
                data-cy="register-button"
                class="w-full py-4 px-6 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <div *ngIf="carregando" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <svg *ngIf="!carregando" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
                {{ carregando ? 'Criando conta...' : 'Criar conta' }}
              </button>

              <!-- Link secundário -->
              <div class="text-center">
                <a routerLink="/trello-login" class="text-gray-600 font-medium hover:text-gray-900 transition-colors duration-200">
                  Já tem conta? Entrar →
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
  styles: [],
})
export class TrelloRegisterComponent implements OnInit {
  registerForm: FormGroup;
  mensagemErro = '';
  mensagemSucesso = '';
  carregando = false;
  plano: string = '';
  planoNome: string = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private errorHandler: ErrorHandlerService,
  ) {
    this.registerForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        this.nomeValidator
      ]],
      email: ['', [Validators.required, this.emailValidator]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
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
        return 'Pessoal (R$ 9,90/mês)';
      case 'PROFISSIONAL':
        return 'Profissional (R$ 24,90/mês)';
      case 'EMPRESARIAL':
        return 'Empresarial (Sob demanda)';
      default:
        return 'Pessoal (R$ 9,90/mês)';
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

  registrar() {
    if (this.registerForm.invalid) {
      this.marcarCamposComoTocados();
      this.mensagemErro = 'Por favor, corrija os erros no formulário.';
      this.mensagemSucesso = '';
      return;
    }

    this.carregando = true;

    // Se for plano gratuito, cadastra normalmente
    if (this.plano === 'FREE') {
      const novoUsuario: Usuario = {
        nome: this.registerForm.get('nome')?.value,
        email: this.registerForm.get('email')?.value,
        senha: this.registerForm.get('senha')?.value,
        plano: this.plano, // Usa o código do plano, não o nome
      };
      this.usuarioService.cadastrar(novoUsuario).subscribe({
        next: (usuarioCriado: any) => {
          this.mensagemErro = '';
          this.mensagemSucesso = 'Cadastro realizado com sucesso!';
          this.carregando = false;
          this.registerForm.reset();
          setTimeout(() => {
            this.router.navigate(['/trello-login']);
          }, 1500);
        },
        error: (err) => {
          this.carregando = false;
          this.mensagemSucesso = '';
          this.mensagemErro = this.errorHandler.getErrorMessage(err);
        },
      });
      return;
    }

    // Se for plano pago (incluindo especializados), primeiro garante cadastro do usuário
    console.log('🔔 [FRONTEND_CHECKOUT] Preparando cadastro e pagamento...');
    const novoUsuario: Usuario = {
      nome: this.registerForm.get('nome')?.value,
      email: this.registerForm.get('email')?.value,
      senha: this.registerForm.get('senha')?.value,
      plano: this.plano,
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

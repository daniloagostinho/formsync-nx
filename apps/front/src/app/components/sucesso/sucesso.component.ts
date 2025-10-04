import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CheckoutService } from '../../services/checkout.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { FooterComponent } from '../footer/footer.component';

interface AutoLoginResponse {
  token: string;
  nome: string;
  email: string;
  plano: string;
  warning?: string;
}

@Component({
  standalone: true,
  selector: 'app-sucesso',
  imports: [
    RouterModule,
    CommonModule,
    FooterComponent
  ],
  template: `
    <!-- Hero Section com Card de Sucesso -->
    <section class="min-h-screen bg-white flex items-center justify-center px-6">
      <div class="max-w-6xl mx-auto w-full">
        <!-- Layout Principal -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Conteúdo da Esquerda -->
          <div class="text-center lg:text-left">
            <!-- Header Principal -->
            <h1 class="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span *ngIf="!isSkipCheckout()">Pagamento Confirmado!</span>
              <span *ngIf="isSkipCheckout()">Conta Criada com Sucesso!</span>
            </h1>
            
            <!-- Subheading -->
            <p class="text-xl text-gray-600 mb-8 leading-relaxed">
              <span *ngIf="!isSkipCheckout()">Seu pagamento foi processado com sucesso. Você já pode acessar todas as funcionalidades do seu plano.</span>
              <span *ngIf="isSkipCheckout()">Sua conta foi criada com sucesso! Você já pode acessar todas as funcionalidades do seu plano.</span>
            </p>
            
            <!-- Informações do Plano -->
            <div class="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
              <div class="text-center mb-4">
                <!-- Badge de Sucesso -->
                <div class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200 mb-3">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span *ngIf="!isSkipCheckout()">Pagamento Aprovado</span>
                  <span *ngIf="isSkipCheckout()">Conta Ativada</span>
                </div>
                <p class="text-gray-600 text-sm">
                  <span *ngIf="!isSkipCheckout()">Sua assinatura está ativa e você tem acesso completo a todas as funcionalidades do FormSync.</span>
                  <span *ngIf="isSkipCheckout()">Sua conta está ativa e você tem acesso completo a todas as funcionalidades do FormSync.</span>
                </p>
              </div>
            </div>
            
            <!-- Benefícios -->
            <div class="space-y-4">
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Acesso imediato ao painel</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Templates ilimitados</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Suporte prioritário</span>
              </div>
            </div>
          </div>

          <!-- Card de Sucesso -->
          <div class="bg-gray-50 rounded-lg p-8 border border-gray-100">
            <div class="text-center mb-8">
              <!-- Ícone de sucesso -->
              <div class="mb-6">
                <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <div class="flex items-center gap-3 mb-2">
                <img src="assets/images/formsync-logo.svg" alt="FormSync Logo" class="w-8 h-8">
                <h2 class="text-2xl font-bold text-gray-900">Bem-vindo ao FormSync!</h2>
              </div>
              <p class="text-gray-600">
                <span *ngIf="!isSkipCheckout()">Seu pagamento foi confirmado com sucesso</span>
                <span *ngIf="isSkipCheckout()">Sua conta foi criada com sucesso</span>
              </p>
            </div>

            <!-- Status do auto-login -->
            <div *ngIf="loading" class="mb-6">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span class="text-blue-800 text-sm font-medium">🔔 Fazendo login automático...</span>
                </div>
              </div>
            </div>
            
            <!-- Mensagem de erro -->
            <div *ngIf="error" class="mb-6">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span class="text-red-800 text-sm font-medium">{{ error }}</span>
                </div>
              </div>
            </div>
            
            <!-- Countdown e redirecionamento automático -->
            <div *ngIf="!loading && !error" class="mb-6">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center gap-3">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span class="text-blue-800 text-sm font-medium">
                    Redirecionando automaticamente em <strong>{{ countdown }}</strong> segundos...
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Botão de ação -->
            <div class="mb-6">
              <button
                (click)="acessarPainelAgora()"
                [disabled]="isRedirecting || loading"
                class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <div *ngIf="!isRedirecting && !loading" class="flex items-center">
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"></path>
                  </svg>
                  <span>Acessar Painel Agora</span>
                </div>
                <div *ngIf="isRedirecting" class="flex items-center">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Redirecionando...</span>
                </div>
                <div *ngIf="loading" class="flex items-center">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Processando...</span>
                </div>
              </button>
            </div>
            
            <!-- Informações de contato -->
            <div class="text-center">
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p class="text-gray-600 text-sm mb-2 flex items-center justify-center">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  Em caso de dúvidas, entre em contato conosco:
                </p>
                <a 
                  href="mailto:suporte&#64;formsync.com" 
                  class="text-indigo-600 hover:text-indigo-800 font-semibold text-sm inline-flex items-center transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  suporte&#64;formsync.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styleUrl: './sucesso.component.css'
})
export class SucessoComponent implements OnInit {
  countdown = 5;
  isRedirecting = false;
  emailFromUrl: string | null = null;
  loading = false;
  error: string | null = null;
  private hasCountdownStarted = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  ngOnInit() {
    console.log('🚀 [SUCESSO] Componente inicializado');

    // Tentar pegar email da URL (se vier do Stripe ou cadastro direto)
    this.emailFromUrl = this.route.snapshot.queryParams['email'];
    const skipCheckout = this.route.snapshot.queryParams['skipCheckout'];
    console.log('📧 [SUCESSO] Email da URL:', this.emailFromUrl);
    console.log('🚀 [SUCESSO] Skip checkout:', skipCheckout);

    // Se tem email na URL, tentar login automático
    if (this.emailFromUrl) {
      if (skipCheckout === 'true') {
        console.log('🚀 [SUCESSO] Cadastro direto sem checkout - iniciando login automático');
        this.tentarLoginAutomatico();
      } else {
        console.log('🔐 [SUCESSO] Iniciando auto-login para:', this.emailFromUrl);
        this.tentarLoginAutomatico();
      }
    } else {
      console.log('⚠️ [SUCESSO] Nenhum email na URL, iniciando countdown direto');
      this.ensureCountdown();
    }
  }

  async verificarStatusUsuario() {
    if (!this.emailFromUrl) return;

    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/checkout/debug/user-status?email=${this.emailFromUrl}`)
      );

      if (response.status === 'success') {
        console.log('🔍 [SUCESSO] Status do usuário:', response);
        console.log('   - Usuário ID:', response.usuario.id);
        console.log('   - Assinaturas ativas:', response.assinaturasAtivas);

        if (response.assinaturasAtivas > 0) {
          console.log('✅ [SUCESSO] Usuário tem assinatura ativa!');
        } else {
          console.log('⚠️ [SUCESSO] Usuário sem assinatura ativa');
        }
      }
    } catch (error) {
      console.error('❌ [SUCESSO] Erro ao verificar status:', error);
    }
  }

  async tentarLoginAutomatico() {
    this.loading = true;
    this.error = null;

    try {
      console.log('🔔 [SUCESSO] Tentando login automático para:', this.emailFromUrl);

      // Verificar status do usuário primeiro
      await this.verificarStatusUsuario();

      // Aguardar um pouco para o webhook ser processado
      console.log('⏳ [SUCESSO] Aguardando processamento do webhook...');
      await this.delay(3000);

      // Tentar auto-login com retry logic
      let success = false;
      let attempts = 0;
      const maxAttempts = 3;

      while (!success && attempts < maxAttempts) {
        attempts++;
        console.log(`🔔 [SUCESSO] Tentativa ${attempts}/${maxAttempts} de auto-login`);

        try {
          // Tentar auto-login usando o novo endpoint
          const response = await firstValueFrom(
            this.http.post<AutoLoginResponse>(`${environment.apiUrl}/checkout/auto-login`, {
              email: this.emailFromUrl
            })
          );

          if (response && 'token' in response) {
            // Salvar token e dados do usuário
            this.authService.salvarToken(response.token);
            this.authService.salvarNomeUsuario(response.nome);
            this.authService.salvarPlano(response.plano);

            // Obter ID do usuário do endpoint /usuarios/me
            try {
              const userResponse = await firstValueFrom(
                this.http.get<any>(`${environment.apiUrl}/usuarios/me`)
              );

              if (userResponse && userResponse.id) {
                localStorage.setItem('userId', userResponse.id.toString());
                console.log('   - ID obtido do backend:', userResponse.id);
              }
            } catch (error) {
              console.warn('⚠️ [SUCESSO] Não foi possível obter ID do usuário:', error);
            }

            console.log('✅ [SUCESSO] Auto-login realizado com sucesso!');
            console.log('   - Nome:', response.nome);
            console.log('   - Email:', response.email);
            console.log('   - Plano:', response.plano);

            // Se há warning sobre assinatura sendo processada, mostrar mensagem
            if ('warning' in response) {
              console.log('⚠️ [SUCESSO] Aviso:', response.warning);
              this.error = 'Pagamento processado! Sua assinatura está sendo ativada. Você será redirecionado em alguns segundos.';
            }

            // Não redirecionar imediatamente; manter a experiência de sucesso com temporizador
            this.ensureCountdown();
            success = true;
          } else {
            throw new Error('Resposta inválida do servidor');
          }

        } catch (error: any) {
          console.error(`❌ [SUCESSO] Erro na tentativa ${attempts}:`, error);

          if (attempts < maxAttempts) {
            // Aguardar antes da próxima tentativa
            console.log(`⏳ [SUCESSO] Aguardando ${2000 * attempts}ms antes da próxima tentativa...`);
            await this.delay(2000 * attempts); // Delay progressivo
            continue;
          }
          // Se chegou aqui, todas as tentativas falharam
          if (error.status === 404) {
            this.error = 'Usuário não encontrado. O pagamento pode ainda estar sendo processado.';
          } else if (error.status === 403) {
            this.error = 'Usuário sem assinatura ativa.';
          } else {
            this.error = 'Erro ao fazer login automático. Tente fazer login manualmente.';
          }
        }
      }

      // Garantir que o temporizador esteja ativo
      this.ensureCountdown();

    } catch (error: any) {
      console.error('❌ [SUCESSO] Erro geral no auto-login:', error);
      this.error = 'Erro ao fazer login automático. Tente fazer login manualmente.';
      this.ensureCountdown();
    } finally {
      this.loading = false;
    }
  }

  startCountdown() {
    if (this.hasCountdownStarted) return;
    this.hasCountdownStarted = true;

    console.log('⏰ [SUCESSO] Countdown iniciado - 5 segundos para redirecionamento');

    const timer = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        clearInterval(timer);
        console.log('🚀 [SUCESSO] Countdown finalizado, redirecionando para dashboard');
        this.redirectToDashboard();
      }
    }, 1000);
  }

  private ensureCountdown() {
    if (!this.hasCountdownStarted) {
      console.log('⏰ [SUCESSO] Iniciando countdown automático');
      this.startCountdown();
    }
  }

  redirectToDashboard() {
    console.log('🔄 [SUCESSO] Redirecionando para dashboard...');
    this.isRedirecting = true;
    this.router.navigate(['/dashboard']);
  }

  acessarPainelAgora() {
    console.log('🔄 [SUCESSO] Usuário clicou em "Acessar Painel Agora"');
    this.isRedirecting = true;
    this.router.navigate(['/dashboard']);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isSkipCheckout(): boolean {
    return this.route.snapshot.queryParams['skipCheckout'] === 'true';
  }
} 
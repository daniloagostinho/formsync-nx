import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FooterComponent
  ],
  template: `
    <!-- Hero Section com Formulário de Verificação -->
    <section class="min-h-screen bg-white flex items-center justify-center px-6">
      <div class="w-full max-w-6xl">
        <!-- Layout Principal -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Conteúdo da Esquerda - Alinhado com a logo -->
          <div class="text-center lg:text-left lg:pl-4">
            <!-- Header Principal -->
            <h1 class="text-5xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Verificar código
            </h1>
            
            <!-- Subheading -->
            <p class="text-xl text-gray-600 mb-8 leading-relaxed">
              Digite o código de 6 dígitos que enviamos para seu email
            </p>
            
            <!-- Informações de segurança -->
            <div class="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
              <div class="flex items-center gap-3 justify-center lg:justify-start mb-4">
                <div class="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">Verificação Segura</h3>
                  <p class="text-sm text-gray-600">Código enviado para: <strong>{{ email }}</strong></p>
                </div>
              </div>
            </div>
            
            <!-- Benefícios -->
            <div class="space-y-4">
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Código válido por 10 minutos</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Verificação criptografada</span>
              </div>
              <div class="flex items-center gap-3 justify-center lg:justify-start">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600">Acesso seguro garantido</span>
              </div>
            </div>
          </div>

          <!-- Card de Verificação - Alinhado com o botão "Começar por R$ 14,90/mês" -->
          <div class="bg-gray-50 rounded-lg p-8 border border-gray-100 lg:pr-4">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Código de Verificação</h2>
              <p class="text-gray-600">Digite os 6 dígitos que enviamos para você</p>
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

            <!-- Mensagem de sucesso -->
            <div *ngIf="mensagemSucesso" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-green-800 text-sm font-medium">{{ mensagemSucesso }}</span>
              </div>
            </div>

            <!-- Formulário de verificação -->
            <form (ngSubmit)="verificarCodigo()" #codigoForm="ngForm" class="space-y-6">
              <!-- Campos de código -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3 text-center">Código de 6 dígitos</label>
                <div class="flex gap-3 justify-center">
                  <input
                    #codigoInput
                    type="text"
                    maxlength="1"
                    [(ngModel)]="codigoArray[i]"
                    name="codigo{{i}}"
                    (input)="onInput($event, i)"
                    (keydown)="onKeyDown($event, i)"
                    (paste)="onPaste($event)"
                    [class]="'w-12 h-12 text-center text-lg font-semibold border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 ' + (mensagemErro ? 'border-red-500' : 'border-gray-300')"
                    [id]="'codigo' + i"
                    autocomplete="off"
                    inputmode="numeric"
                    pattern="[0-9]"
                    required
                    data-cy="verification-code"
                    *ngFor="let i of [0,1,2,3,4,5]"
                  />
                </div>
                <p class="text-sm text-gray-600 text-center mt-3">
                  Digite os 6 dígitos do código enviado para seu e-mail
                </p>
              </div>

              <!-- CTA Principal -->
              <button
                type="submit"
                [disabled]="codigo.length < 6 || carregando || mensagemSucesso"
                data-cy="verify-button"
                class="w-full py-4 px-6 bg-indigo-600 text-white font-semibold text-lg rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <div *ngIf="carregando" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <div *ngIf="mensagemSucesso" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <svg *ngIf="!carregando && !mensagemSucesso" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {{ carregando ? 'Verificando código...' : mensagemSucesso ? 'Redirecionando...' : 'Verificar código' }}
              </button>

              <!-- Links secundários -->
              <div class="space-y-3">
                <div class="text-center">
                  <button 
                    type="button"
                    (click)="solicitarNovoCodigo()" 
                    [disabled]="carregandoNovoCodigo"
                    class="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 disabled:text-gray-400"
                  >
                    {{ carregandoNovoCodigo ? 'Enviando...' : 'Solicitar novo código' }}
                  </button>
                </div>
                <div class="text-center">
                  <button 
                    type="button"
                    (click)="voltarAoLogin()" 
                    class="text-gray-600 font-medium hover:text-gray-900 transition-colors duration-200"
                  >
                    ← Voltar ao login
                  </button>
                </div>
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
export class VerificarCodigoComponent {
  email = '';
  codigoArray: string[] = ['', '', '', '', '', ''];
  mensagemErro = '';
  carregando = false;
  carregandoNovoCodigo = false;
  mensagemSucesso = '';

  @ViewChildren('codigoInput') inputs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private errorHandler: ErrorHandlerService
  ) {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  get codigo(): string {
    return this.codigoArray.join('');
  }

  verificarCodigo() {
    if (this.codigo.length < 6) {
      this.mensagemErro = 'Código incompleto.';
      return;
    }

    if (this.carregando) {
      return; // Prevent duplicate submissions
    }

    this.carregando = true;

    console.log('🔐 Verificando código:', this.codigo, 'para email:', this.email);

    this.authService.verificarCodigo(this.email, this.codigo).subscribe({
      next: (res: any) => {
        console.log('✅ Código verificado com sucesso:', res);
        this.authService.salvarToken(res.token);
        this.authService.salvarNomeUsuario(res.nome);
        localStorage.setItem('plano', res.plano);

        // Mostrar mensagem de sucesso e redirecionar após delay
        this.mostrarSucessoERedirecionar();
      },
      error: err => {
        console.error('❌ Erro na verificação:', err);
        this.carregando = false;
        this.mensagemErro = this.errorHandler.getErrorMessage(err);
      },
    });
  }

  private mostrarSucessoERedirecionar() {
    console.log('✅ [LOGIN] Mostrando sucesso e preparando redirecionamento...');

    // Mostrar mensagem de sucesso e desabilitar campos
    this.mensagemErro = '';
    this.mensagemSucesso = 'Login realizado com sucesso! Redirecionando...';
    this.carregando = false; // Parar o loading do botão

    // Redirecionar para o dashboard após 2 segundos
    setTimeout(() => {
      console.log('🔄 [LOGIN] Redirecionando para dashboard...');
      this.router.navigate(['/dashboard']);
    }, 2000);
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length === 1 && /^\d$/.test(value)) {
      this.codigoArray[index] = value;
      const next = this.inputs.get(index + 1);
      next?.nativeElement.focus();
    } else if (value.length > 1) {
      // colou o código
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      pasted.forEach((char, i) => {
        this.codigoArray[i] = char;
        const inputRef = this.inputs.get(i);
        if (inputRef) inputRef.nativeElement.value = char;
      });
      const last = this.inputs.get(pasted.length - 1);
      last?.nativeElement.focus();
    } else {
      this.codigoArray[index] = '';
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.codigoArray[index] && index > 0) {
      const prev = this.inputs.get(index - 1);
      prev?.nativeElement.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text');
    if (!clipboardData) return;

    const pasted = clipboardData.replace(/\D/g, '').slice(0, 6).split('');
    if (pasted.length > 0) {
      pasted.forEach((char, i) => {
        this.codigoArray[i] = char;
        const inputRef = this.inputs.get(i);
        if (inputRef) inputRef.nativeElement.value = char;
      });
      const last = this.inputs.get(Math.min(pasted.length - 1, 5));
      last?.nativeElement.focus();
    }
  }

  solicitarNovoCodigo() {
    if (this.carregandoNovoCodigo) return;

    this.carregandoNovoCodigo = true;
    this.mensagemErro = '';

    this.authService.enviarCodigo(this.email).subscribe({
      next: () => {
        this.carregandoNovoCodigo = false;
        // Mostrar mensagem de sucesso usando snackbar
        this.mostrarMensagemSucesso('Novo código enviado com sucesso!');
        // Limpar campos de código
        this.codigoArray = ['', '', '', '', '', ''];
        this.inputs.forEach(input => {
          if (input.nativeElement) {
            input.nativeElement.value = '';
          }
        });
      },
      error: (error: any) => {
        this.carregandoNovoCodigo = false;
        this.mensagemErro = this.errorHandler.getErrorMessage(error);
      }
    });
  }

  voltarAoLogin() {
    this.router.navigate(['/login']);
  }

  private mostrarMensagemSucesso(mensagem: string) {
    // Usar snackbar do Angular Material
    const snackBar = document.createElement('div');
    snackBar.className = 'snackbar-success';
    snackBar.textContent = mensagem;
    snackBar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #4caf50;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      z-index: 1000;
      font-weight: 500;
    `;

    document.body.appendChild(snackBar);

    setTimeout(() => {
      if (snackBar.parentNode) {
        snackBar.remove();
      }
    }, 3000);
  }
} 
import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NotificationService } from '../../services/notification.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, filter, tap, Subscription, finalize } from 'rxjs';
import { Campo } from '../../models/campo.model';
import { CampoService } from '../../services/campo.service';
import { SidebarComponent } from '../sidebar/sidebar.component';


// Importações para validação
import { isCEP, isCNPJ, isCPF } from 'brazilian-values';

@Component({
  selector: 'app-dados-preenchimento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatIconModule,
    MatPaginatorModule,

    MatTooltipModule,
    SidebarComponent
  ],
  template: `
    <div style="display: flex; min-height: 100vh;">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>
      
      <!-- Loading State -->
      <ng-container *ngIf="carregandoPagina; else dadosPreenchimentoContent">
        <div style="flex: 1; padding: 24px; background-color: #f9fafb;">
          <!-- Loading Card -->
          <div class="bg-white shadow-xl rounded-xl border border-gray-100 mb-4">
            <div class="flex justify-center items-center h-64 p-6">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <h3 class="mt-4 text-lg font-bold text-gray-700">
                  Carregando Dados de Preenchimento
                </h3>
                <p class="text-gray-500 mt-2 text-sm">
                  Aguarde enquanto preparamos seus campos...
                </p>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- Main Content -->
      <ng-template #dadosPreenchimentoContent>
        <!-- Conteúdo principal -->
        <div style="flex: 1; padding: 24px; background-color: #f9fafb;">
          <!-- Header -->
          <div class="mb-6">
            <div class="bg-white shadow-xl rounded-xl border border-gray-100 p-6">
              <div class="text-center">
                <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <mat-icon class="text-white text-2xl">flash_on</mat-icon>
                </div>
                <h1 class="text-2xl font-bold text-gray-800 mb-3">Gerenciador de Senhas</h1>
                <p class="text-base text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Cadastre seus dados uma vez e preencha qualquer formulário com um clique. 
                  <strong class="text-blue-600">Rápido, seguro e inteligente.</strong>
                </p>
              </div>
            </div>
          </div>

          <!-- Layout Principal -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Formulário -->
            <div class="form-section">
              <div class="bg-white shadow-xl rounded-xl border border-gray-100 p-6">
                <div class="flex items-start space-x-3 mb-4">
                  <div class="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <mat-icon class="text-white text-lg">add_circle</mat-icon>
                  </div>
                  <div>
                    <h2 class="text-lg font-bold text-gray-800 mb-1">Adicionar Nova Senha</h2>
                    <p class="text-gray-600 text-sm">Preencha os campos abaixo para salvar sua senha</p>
                  </div>
                </div>
                
                <div class="border-t border-gray-200 my-4"></div>
                
                <div class="form-content">
                  <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>

                    <!-- Website -->
                    <div class="mb-4">
                      <label class="block text-sm font-semibold text-gray-700 mb-1">Website</label>
                      <input
                        type="text"
                        formControlName="site"
                        placeholder="Ex: google.com"
                        autocomplete="off"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                      />
                      <p class="text-xs text-gray-500 mt-1">Ex: google.com, linkedin.com</p>
                    </div>

                    <!-- Usuário -->
                    <div class="mb-4">
                      <label class="block text-sm font-semibold text-gray-700 mb-1">Usuário *</label>
                      <input 
                        type="text"
                        formControlName="nome"
                        placeholder="Ex: seu@email.com"
                        autocomplete="off"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                      />
                      <div *ngIf="campoInvalido('nome')" class="text-red-500 text-xs mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-sm">error</mat-icon>
                        Usuário é obrigatório
                      </div>
                    </div>

                    <!-- Senha -->
                    <div class="mb-4">
                      <label class="block text-sm font-semibold text-gray-700 mb-1">Senha *</label>
                      <input 
                        type="password"
                        formControlName="valor"
                        autocomplete="off"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400"
                      />
                      <div *ngIf="campoInvalido('valor')" class="text-red-500 text-xs mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-sm">error</mat-icon>
                        {{ mensagemCampo || 'Senha obrigatória' }}
                      </div>
                      <div *ngIf="form.get('valor')?.errors?.['formato'] && formatoCampo === 'data'" class="text-red-500 text-xs mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-sm">error</mat-icon>
                        Formato inválido. Ex: 31/12/2024
                      </div>
                      <div *ngIf="form.get('valor')?.errors?.['logico'] && formatoCampo === 'data'" class="text-red-500 text-xs mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-sm">error</mat-icon>
                        Data inválida.
                      </div>
                      <div *ngIf="form.get('valor')?.errors?.['formato'] && formatoCampo === 'cpf'" class="text-red-500 text-xs mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-sm">error</mat-icon>
                        Formato inválido. Ex: 123.456.789-00
                      </div>
                      <div *ngIf="form.get('valor')?.errors?.['logico'] && formatoCampo === 'cpf'" class="text-red-500 text-xs mt-1 flex items-center">
                        <mat-icon class="text-red-500 mr-1 text-sm">error</mat-icon>
                        CPF inválido.
                      </div>
                    </div>

                    <!-- Botão Submit -->
                    <button 
                      type="submit"
                      [disabled]="form.invalid || carregando"
                      class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2 text-sm">
                      <div *ngIf="carregando" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <mat-icon *ngIf="!carregando" class="text-white text-sm">{{ campoEditando ? 'check_circle' : 'add_circle' }}</mat-icon>
                      <span>{{ carregando ? 'Salvando...' : (campoEditando ? 'Atualizar Senha' : 'Salvar Senha') }}</span>
                    </button>
                  </form>

                  <!-- Feedback -->
                  <div *ngIf="mensagem" 
                       class="mt-4 p-3 rounded-lg border-l-4 flex items-start space-x-2"
                       [class]="mensagem.includes('sucesso') ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'">
                    <mat-icon class="mt-0.5 text-sm">{{ mensagem.includes('sucesso') ? 'check_circle' : 'warning' }}</mat-icon>
                    <div class="flex-1">
                      <span class="font-medium text-sm">{{ mensagem }}</span>
                      <div *ngIf="mostrarBotaoUpgrade" class="mt-2">
                        <a routerLink="/upgrade" 
                           class="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md text-sm">
                          <mat-icon class="mr-1 text-sm">upgrade</mat-icon>
                          Fazer Upgrade
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lista de Campos -->
            <div class="list-section">
              <div class="bg-white shadow-xl rounded-xl border border-gray-100 p-6">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-start space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <mat-icon class="text-white text-lg">list</mat-icon>
                    </div>
                    <div>
                      <h2 class="text-lg font-bold text-gray-800 mb-1 flex items-center">
                        Suas Senhas
                        <span *ngIf="totalElementos > 0" class="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">{{ totalElementos }}</span>
                      </h2>
                      <p class="text-gray-600 text-sm">Gerencie suas senhas salvas</p>
                    </div>
                  </div>
                  
                  <!-- Botão de Atualizar -->
                  <button 
                    (click)="carregarCampos()" 
                    [disabled]="carregando"
                    matTooltip="Atualizar lista"
                    class="bg-white hover:bg-gray-50 text-blue-600 border border-blue-300 hover:border-blue-400 px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm flex items-center space-x-1 text-sm">
                    <mat-icon *ngIf="!carregando" class="text-blue-600 text-sm">refresh</mat-icon>
                    <div *ngIf="carregando" class="animate-spin rounded-full h-3 w-3 border-2 border-blue-300 border-t-blue-600"></div>
                    <span>Atualizar</span>
                  </button>
                </div>
                
                <div class="border-t border-gray-200 my-4"></div>
                
                <div class="list-content">
                  <!-- Lista de campos -->
                  <div *ngIf="campos.length > 0" class="space-y-3">
                    <div *ngFor="let c of campos; trackBy: trackByCampo" class="bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-md">
                      <div class="flex justify-between items-start">
                        <div class="flex-1 space-y-2">
                          <div class="flex items-center space-x-2">
                            <div class="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                              <mat-icon class="text-white text-xs">person</mat-icon>
                            </div>
                            <strong class="text-sm font-semibold text-gray-800">{{ c.nome }}</strong>
                          </div>
                          <div class="flex items-center space-x-2">
                            <div class="w-5 h-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded flex items-center justify-center">
                              <mat-icon class="text-white text-xs">key</mat-icon>
                            </div>
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">{{ c.valor }}</span>
                          </div>
                          <div class="flex items-center space-x-2" *ngIf="c.site">
                            <div class="w-5 h-5 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center">
                              <mat-icon class="text-white text-xs">language</mat-icon>
                            </div>
                            <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">{{ c.site }}</span>
                          </div>
                        </div>
                        <div class="flex space-x-1">
                          <button 
                            (click)="editar(c)" 
                            matTooltip="Editar campo"
                            class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm flex items-center space-x-1 text-sm">
                            <mat-icon class="text-white text-sm">edit</mat-icon>
                            <span>Editar</span>
                          </button>
                          <button 
                            (click)="excluir(c.id!)" 
                            matTooltip="Excluir campo"
                            class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-sm flex items-center space-x-1 text-sm">
                              <mat-icon class="text-white text-sm">delete</mat-icon>
                              <span>Excluir</span>
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Estado vazio -->
                  <div *ngIf="campos.length === 0" class="text-center py-12 px-6">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <mat-icon class="text-gray-400 text-3xl">inbox</mat-icon>
                    </div>
                    <h3 class="text-lg font-bold text-gray-600 mb-3">Nenhum campo cadastrado</h3>
                    <p class="text-gray-500 text-sm mb-4 max-w-md mx-auto">
                      Comece adicionando seu primeiro campo no formulário ao lado. 
                      <strong class="text-blue-600">É rápido e fácil!</strong>
                    </p>
                    <div class="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                      <mat-icon class="text-sm">arrow_back</mat-icon>
                      <span>Use o formulário ao lado</span>
                    </div>
                  </div>

                  <!-- Paginação -->
                  <mat-paginator 
                    *ngIf="totalPaginas > 1"
                    [length]="totalElementos"
                    [pageSize]="tamanhoPagina"
                    [pageIndex]="pagina"
                    [pageSizeOptions]="[5, 10, 25]"
                    (page)="onPageChange($event)"
                    showFirstLastButtons
                    aria-label="Selecione a página">
                  </mat-paginator>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
    
    <!-- Footer 
    <app-footer></app-footer>
     
    -->
  `,
  styleUrl: './dados-preenchimento.component.css'
})
export class DadosPreenchimentoComponent implements OnDestroy {
  form!: FormGroup;
  campos: Campo[] = [];
  mensagem: string | null = null;
  formatoCampo: string = '';
  campoEditando: Campo | null = null;
  mensagemCampo: string = '';
  carregando: boolean = false;
  mostrarBotaoUpgrade: boolean = false;
  carregandoPagina: boolean = true; // Adicionado para controlar o estado de carregamento da página

  private nomeSubscription?: Subscription;

  // Regras de formato (mantidas do componente original)
  regrasFormato = [
    {
      chave: ['email'],
      formato: 'email',
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      mensagem: 'E-mail inválido',
    },
    {
      chave: ['cpf'],
      formato: 'cpf',
      mensagem: 'CPF inválido. Verifique o número e o formato (Ex: 123.456.789-00)',
      validador: (valor: string) => isCPF(valor),
    },
    {
      chave: ['cnpj'],
      formato: 'cnpj',
      regex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
      mensagem: 'CNPJ inválido. Ex: 12.345.678/0001-00',
      validador: (valor: string) => isCNPJ(valor),
    },
    {
      chave: ['cep'],
      formato: 'cep',
      regex: /^\d{5}-\d{3}$/,
      mensagem: 'CEP inválido. Ex: 12345-678',
      validador: (valor: string) => isCEP(valor),
    },
    {
      chave: ['telefone', 'celular'],
      formato: 'telefone',
      regex: /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/,
      mensagem: 'Telefone inválido. Ex: (11) 91234-5678',
    },
    {
      chave: ['data'],
      formato: 'data',
      mensagem: 'Data inválida. Ex: 31/12/2024',
      validador: (valor: string) => {
        const limpo = valor.replace(/\D/g, '');
        if (limpo.length !== 8) return false;

        const dia = Number(limpo.slice(0, 2));
        const mes = Number(limpo.slice(2, 4));
        const ano = Number(limpo.slice(4, 8));

        const data = new Date(ano, mes - 1, dia);
        return (
          data.getFullYear() === ano &&
          data.getMonth() === mes - 1 &&
          data.getDate() === dia
        );
      }
    },
    {
      chave: ['senha'],
      formato: 'senha',
      regex: /^.{6,}$/,
      mensagem: 'Senha muito curta. Mínimo 6 caracteres.',
    },
    {
      chave: ['placa'],
      formato: 'placa',
      regex: /^[A-Z]{3}\d{1}[A-Z0-9]{1}\d{2}$/,
      mensagem: 'Placa inválida. Ex: ABC1D23',
    },
    {
      chave: ['cartao'],
      formato: 'cartao',
      regex: /^\d{4} \d{4} \d{4} \d{4}$/,
      mensagem: 'Cartão inválido. Ex: 1234 5678 9012 3456',
      validador: (valor: string) => {
        const cleanValue = valor.replace(/\s/g, '');
        // Luhn algorithm for credit card validation
        if (!/^\d{13,19}$/.test(cleanValue)) return false;
        let sum = 0;
        let isEven = false;
        for (let i = cleanValue.length - 1; i >= 0; i--) {
          let digit = parseInt(cleanValue.charAt(i));
          if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          isEven = !isEven;
        }
        return sum % 10 === 0;
      },
    },
    {
      chave: ['cvv'],
      formato: 'cvv',
      regex: /^\d{3,4}$/,
      mensagem: 'CVV inválido. Ex: 123',
    },
    {
      chave: ['nome'],
      formato: 'nome',
      regex: /^[A-Za-zÀ-ú\s]+$/,
      mensagem: 'Nome inválido. Use apenas letras',
    },
    {
      chave: ['rg'],
      formato: 'rg',
      regex: /^\d{2}\.\d{3}\.\d{3}-\d{1}$/,
      mensagem: 'RG inválido. Ex: 12.345.678-9',
    },
    {
      chave: ['cnh'],
      formato: 'cnh',
      regex: /^\d{11}$/,
      mensagem: 'CNH inválida. Deve conter 11 dígitos',
    },
    {
      chave: ['pis', 'pasep', 'nis'],
      formato: 'pis',
      regex: /^\d{3}\.\d{5}\.\d{2}-\d{1}$/,
      mensagem: 'PIS/NIS/PASEP inválido. Ex: 123.45678.90-1',
    },
    {
      chave: ['titulo'],
      formato: 'titulo',
      regex: /^\d{12}$/,
      mensagem: 'Título de eleitor inválido. Deve conter 12 dígitos',
    },
  ];

  // Paginação
  pagina = 0;
  tamanhoPagina = 5;
  totalPaginas = 0;
  totalElementos = 0;
  sortBy = 'nome';
  sortDir = 'asc';

  constructor(
    private fb: FormBuilder,
    private campoService: CampoService,
  ) { }

  ngOnInit(): void {
    this.carregarCampos();
    this.inicializarFormulario();
  }

  private inicializarFormulario() {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      valor: ['', Validators.required],
      site: [''],
    });

    this.nomeSubscription = this.form
      .get('nome')!
      .valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        filter(val => !!val),
        tap((nome: string) => {
          const capitalizado =
            nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();
          this.form.get('nome')!.setValue(capitalizado, { emitEvent: false });

          const nomeFormatado = capitalizado.trim().toLowerCase();

          let regraAplicada = this.regrasFormato.find(regra =>
            regra.chave.some(chave => nomeFormatado.includes(chave)),
          );

          if (regraAplicada) {
            this.formatoCampo = regraAplicada.formato;
            this.mensagemCampo = regraAplicada.mensagem;
            this.setValidatorRegex(
              'valor',
              regraAplicada.regex,
              regraAplicada.validador,
            );
          } else {
            this.formatoCampo = '';
            this.mensagemCampo = 'Valor obrigatório';
            this.setValidatorRegex('valor', /.*/);
          }

          this.form.get('valor')!.updateValueAndValidity();
        }),
      )
      .subscribe();
  }

  private setValidatorRegex(
    controlName: string,
    regex?: RegExp,
    validador?: (valor: string) => boolean,
  ) {
    this.form.get(controlName)?.setValidators([
      Validators.required,
      control => {
        const valor = control.value;
        if (!valor) return { formatoInvalido: true };

        const validoRegex = regex ? regex.test(valor) : true;
        const validoExtra = validador ? validador(valor) : true;

        if (!validoRegex) return { formato: true };
        if (!validoExtra) return { logico: true };

        return null;
      },
    ]);
  }

  carregarCampos(pagina: number = 0) {
    this.carregando = true;
    this.carregandoPagina = true; // Inicia o carregamento da página

    this.campoService.listarCamposPaginado(pagina, this.tamanhoPagina, this.sortBy, this.sortDir)
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.carregandoPagina = false; // Finaliza o carregamento da página
        })
      )
      .subscribe({
        next: (response) => {
          this.campos = response.content;
          this.pagina = response.page;
          this.tamanhoPagina = response.size;
          this.totalPaginas = response.totalPages;
          this.totalElementos = response.totalElements;
        },
        error: (error) => {
          console.error('Erro ao carregar campos:', error);
          this.mensagem = 'Erro ao carregar campos. Tente novamente.';
          setTimeout(() => this.mensagem = null, 3000);
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pagina = event.pageIndex;
    this.tamanhoPagina = event.pageSize;
    this.carregarCampos(this.pagina);
  }

  async salvar() {
    if (this.carregando) {
      console.log('Operação já em andamento, ignorando nova chamada');
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const campo: Campo = {
      ...(this.campoEditando ?? {}),
      nome: this.form.value.nome,
      valor: this.form.value.valor,
      site: this.form.value.site,
    };

    this.mostrarBotaoUpgrade = false;
    this.carregando = true;

    try {
      console.log('Iniciando salvamento do campo:', campo.nome);

      this.campoService.salvarCampo(campo).subscribe({
        next: (campoSalvo) => {
          console.log('Campo salvo com sucesso:', campoSalvo.nome);

          this.form.reset();
          this.formatoCampo = '';
          this.campoEditando = null;

          this.mensagem = 'Campo salvo com sucesso ✅';
          this.carregarCampos(this.pagina);

          setTimeout(() => (this.mensagem = null), 2500);
        },
        error: (error: any) => {
          console.error('Erro ao salvar campo:', error);

          let mensagemTratada = 'Erro ao salvar campo. Tente novamente.';

          if (error.error?.message) {
            mensagemTratada = error.error.message;
          } else if (error.error?.mensagem) {
            mensagemTratada = error.error.mensagem;
          } else if (error.message) {
            mensagemTratada = error.message;
          }

          mensagemTratada = mensagemTratada
            .replace(/^403 FORBIDDEN\s*/, '')
            .replace(/^"|"$/g, '');

          this.mensagem = mensagemTratada;

          // Regra para mostrar botão Upgrade
          const upgradeKeywords = [
            'Limite de campos atingido',
            'limite de campos',
            'campo limit'
          ];

          const shouldShowUpgrade = upgradeKeywords.some(keyword =>
            mensagemTratada.toLowerCase().includes(keyword.toLowerCase())
          );

          this.mostrarBotaoUpgrade = shouldShowUpgrade;
        }
      });
    } finally {
      this.carregando = false;
    }
  }

  editar(campo: Campo) {
    this.campoEditando = campo;
    this.form.patchValue({ nome: campo.nome, valor: campo.valor, site: campo.site });
  }

  cancelarEdicao() {
    this.form.reset();
    this.formatoCampo = '';
    this.campoEditando = null;
  }

  excluir(id: number) {
    this.campoService.excluirCampo(id).subscribe({
      next: () => {
        this.mensagem = 'Campo excluído com sucesso ✅';
        this.carregarCampos(this.pagina);
        setTimeout(() => this.mensagem = null, 2500);
      },
      error: (error) => {
        console.error('Erro ao excluir campo:', error);
        this.mensagem = 'Erro ao excluir campo. Tente novamente.';
        setTimeout(() => this.mensagem = null, 3000);
      }
    });
  }



  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return control ? control.invalid && control.touched : false;
  }

  trackByCampo(index: number, campo: Campo): number {
    return campo.id || index;
  }

  ngOnDestroy(): void {
    if (this.nomeSubscription) {
      this.nomeSubscription.unsubscribe();
    }
  }
} 
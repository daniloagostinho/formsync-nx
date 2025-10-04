import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

@Component({
    selector: 'app-formulario-completo',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        MatSliderModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatIconModule,
        MatDividerModule,
        MatChipsModule
    ],
    template: `
    <div class="min-h-screen bg-gray-50 p-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl p-8 text-center mb-6">
          <h1 class="text-4xl font-bold mb-2">🚀 Formulário Completo</h1>
          <p class="text-xl opacity-90">Teste todos os tipos de campo com a extensão FormSync</p>
        </div>

        <!-- Formulário -->
        <mat-card class="mb-6">
          <mat-card-content>
            <form [formGroup]="formulario" (ngSubmit)="onSubmit()" class="space-y-8">
              
              <!-- DADOS PESSOAIS -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="text-indigo-600">person</mat-icon>
                  <h2 class="text-2xl font-semibold text-gray-800">Dados Pessoais</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Nome Completo *</mat-label>
                    <input matInput formControlName="nome" placeholder="Digite seu nome completo" required>
                    <mat-error *ngIf="formulario.get('nome')?.hasError('required')">
                      Nome é obrigatório
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>E-mail *</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="seu@email.com" required>
                    <mat-error *ngIf="formulario.get('email')?.hasError('required')">
                      E-mail é obrigatório
                    </mat-error>
                    <mat-error *ngIf="formulario.get('email')?.hasError('email')">
                      E-mail inválido
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Senha *</mat-label>
                    <input matInput type="password" formControlName="senha" placeholder="••••••••" required>
                    <mat-error *ngIf="formulario.get('senha')?.hasError('required')">
                      Senha é obrigatória
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Idade</mat-label>
                    <input matInput type="number" formControlName="idade" placeholder="25" min="16" max="100">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Telefone</mat-label>
                    <input matInput type="tel" formControlName="telefone" placeholder="(11) 99999-9999">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Website</mat-label>
                    <input matInput type="url" formControlName="website" placeholder="https://meusite.com">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>CPF</mat-label>
                    <input matInput formControlName="cpf" placeholder="000.000.000-00" maxlength="14">
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>CEP</mat-label>
                    <input matInput formControlName="cep" placeholder="00000-000" maxlength="9">
                  </mat-form-field>
                </div>
              </div>

              <!-- DATAS E HORÁRIOS -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="text-indigo-600">schedule</mat-icon>
                  <h2 class="text-2xl font-semibold text-gray-800">Datas e Horários</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Data de Nascimento</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="dataNascimento">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Horário Preferido</mat-label>
                    <input matInput type="time" formControlName="horario">
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Data e Hora da Entrevista</mat-label>
                  <input matInput type="datetime-local" formControlName="dataHora">
                </mat-form-field>
              </div>

              <!-- INFORMAÇÕES ADICIONAIS -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="text-indigo-600">info</mat-icon>
                  <h2 class="text-2xl font-semibold text-gray-800">Informações Adicionais</h2>
                </div>
                
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Biografia</mat-label>
                  <textarea matInput formControlName="biografia" rows="4" placeholder="Conte um pouco sobre você..."></textarea>
                </mat-form-field>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Estado Civil</mat-label>
                    <mat-select formControlName="estadoCivil">
                      <mat-option value="">Selecione...</mat-option>
                      <mat-option value="solteiro">Solteiro</mat-option>
                      <mat-option value="casado">Casado</mat-option>
                      <mat-option value="divorciado">Divorciado</mat-option>
                      <mat-option value="viuvo">Viúvo</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-3">Gênero</label>
                    <mat-radio-group formControlName="genero" class="flex flex-col space-y-2">
                      <mat-radio-button value="masculino" class="mb-2">
                        Masculino
                      </mat-radio-button>
                      <mat-radio-button value="feminino" class="mb-2">
                        Feminino
                      </mat-radio-button>
                      <mat-radio-button value="outro" class="mb-2">
                        Outro
                      </mat-radio-button>
                    </mat-radio-group>
                  </div>
                </div>

                <div class="w-full">
                  <label class="block text-sm font-medium text-gray-700 mb-3">Termos e Condições</label>
                  <div class="space-y-3">
                    <mat-checkbox formControlName="aceitaTermos" class="block">
                      Aceito os termos e condições
                    </mat-checkbox>
                    <mat-checkbox formControlName="aceitaNewsletter" class="block">
                      Desejo receber newsletter
                    </mat-checkbox>
                    <mat-checkbox formControlName="aceitaMarketing" class="block">
                      Aceito receber marketing
                    </mat-checkbox>
                  </div>
                </div>
              </div>

              <!-- CAMPOS ESPECIAIS -->
              <div class="form-section">
                <div class="section-header">
                  <mat-icon class="text-indigo-600">star</mat-icon>
                  <h2 class="text-2xl font-semibold text-gray-800">Campos Especiais</h2>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-3">Cor Favorita</label>
                    <input type="color" formControlName="corFavorita" class="w-full h-12 rounded border-2 border-gray-300">
                  </div>

                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-3">
                      Nível de Experiência: {{ formulario.get('nivelExperiencia')?.value || 5 }}
                    </label>
                    <mat-slider formControlName="nivelExperiencia" min="1" max="10" step="1" class="w-full">
                    </mat-slider>
                  </div>

                  <div class="w-full">
                    <label class="block text-sm font-medium text-gray-700 mb-3">Currículo</label>
                    <input type="file" formControlName="arquivo" accept=".pdf,.doc,.docx" 
                           class="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors">
                  </div>

                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Pesquisa</mat-label>
                    <input matInput type="search" formControlName="pesquisa" placeholder="Digite para pesquisar...">
                  </mat-form-field>
                </div>

                <input type="hidden" formControlName="campoOculto" value="valor_secreto_123">
                <div class="text-sm text-gray-500 italic mt-2">
                  Campo oculto (hidden) com valor: {{ formulario.get('campoOculto')?.value }}
                </div>
              </div>

              <!-- Botão de Envio -->
              <div class="flex justify-center pt-6">
                <button mat-raised-button 
                        type="submit" 
                        [disabled]="formulario.invalid"
                        class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 text-lg font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  🚀 Enviar Formulário
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Informações da Extensão -->
        <mat-card class="bg-blue-50 border-blue-200">
          <mat-card-content class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <mat-icon class="text-blue-600">extension</mat-icon>
              <h3 class="text-lg font-semibold text-blue-800">Como usar a extensão FormSync</h3>
            </div>
            <div class="text-blue-700 space-y-2">
              <p>• Instale a extensão FormSync no seu navegador</p>
              <p>• Clique no ícone da extensão para ativar o preenchimento automático</p>
              <p>• Todos os campos serão preenchidos automaticamente com dados de exemplo</p>
              <p>• Teste diferentes tipos de campo: texto, email, senha, datas, arquivos, etc.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
    styles: [`
    .form-section {
      @apply border-l-4 border-indigo-500 bg-gray-50 p-6 rounded-lg mb-6;
    }
    
    .section-header {
      @apply flex items-center gap-3 mb-6;
    }
    
    .mat-form-field {
      @apply w-full;
    }
    
    .mat-radio-button, .mat-checkbox {
      @apply block mb-2;
    }
    
    .mat-slider {
      @apply w-full;
    }
    
    input[type="color"] {
      @apply cursor-pointer;
    }
    
    input[type="file"] {
      @apply cursor-pointer;
    }
    
    .bg-gradient-to-r {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    }
    
    .hover\\:shadow-lg:hover {
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
    }
  `]
})
export class FormularioCompletoComponent implements OnInit {
    formulario: FormGroup;

    constructor(private fb: FormBuilder) {
        this.formulario = this.fb.group({
            // Dados Pessoais
            nome: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            senha: ['', Validators.required],
            idade: [''],
            telefone: [''],
            website: [''],
            cpf: [''],
            cep: [''],

            // Datas e Horários
            dataNascimento: [''],
            horario: [''],
            dataHora: [''],

            // Informações Adicionais
            biografia: [''],
            estadoCivil: [''],
            genero: [''],
            aceitaTermos: [false],
            aceitaNewsletter: [false],
            aceitaMarketing: [false],

            // Campos Especiais
            corFavorita: ['#3B82F6'],
            nivelExperiencia: [5],
            arquivo: [''],
            pesquisa: [''],
            campoOculto: ['valor_secreto_123']
        });
    }

    ngOnInit(): void {
        console.log('🚀 Formulário Completo carregado! Use a extensão FormSync para preenchimento automático.');
    }

    onSubmit(): void {
        if (this.formulario.valid) {
            console.log('📋 Formulário enviado:', this.formulario.value);
        } else {
            console.log('❌ Formulário inválido:', this.formulario.errors);
        }
    }
}



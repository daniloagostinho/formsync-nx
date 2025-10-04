import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PrivacyService, StatusConsentimento, DadosPessoais } from '../../services/privacy.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-privacy-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="privacy-manager-container">
      <!-- Header -->
      <div class="privacy-header">
        <div class="flex items-center gap-3 mb-2">
          <mat-icon class="text-blue-600 text-3xl">security</mat-icon>
          <h1 class="text-2xl font-bold text-gray-900">Gerenciar Privacidade</h1>
        </div>
        <p class="text-gray-600">Gerencie seus dados pessoais e preferências de privacidade conforme a LGPD</p>
      </div>

      <!-- Status de Consentimento -->
      <mat-card class="privacy-card mb-6">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            <mat-icon>check_circle</mat-icon>
            Status de Consentimento
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="consent-status-grid">
            <div class="consent-item" [ngClass]="{'active': statusConsentimento?.consentimentoLGPD}">
              <div class="consent-icon">
                <mat-icon>{{ statusConsentimento?.consentimentoLGPD ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
              <div class="consent-info">
                <h4>Política de Privacidade</h4>
                <p>Consentimento geral para coleta de dados</p>
              </div>
              <div class="consent-status">
                {{ statusConsentimento?.consentimentoLGPD ? 'Aceito' : 'Não aceito' }}
              </div>
            </div>

            <div class="consent-item" [ngClass]="{'active': statusConsentimento?.consentimentoMarketing}">
              <div class="consent-icon">
                <mat-icon>{{ statusConsentimento?.consentimentoMarketing ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
              <div class="consent-info">
                <h4>Marketing</h4>
                <p>E-mails promocionais e ofertas</p>
              </div>
              <div class="consent-status">
                {{ statusConsentimento?.consentimentoMarketing ? 'Aceito' : 'Não aceito' }}
              </div>
            </div>

            <div class="consent-item" [ngClass]="{'active': statusConsentimento?.consentimentoAnalytics}">
              <div class="consent-icon">
                <mat-icon>{{ statusConsentimento?.consentimentoAnalytics ? 'check_circle' : 'cancel' }}</mat-icon>
              </div>
              <div class="consent-info">
                <h4>Analytics</h4>
                <p>Análise de uso e melhorias</p>
              </div>
              <div class="consent-status">
                {{ statusConsentimento?.consentimentoAnalytics ? 'Aceito' : 'Não aceito' }}
              </div>
            </div>
          </div>

          <div class="consent-actions mt-4">
            <button 
              mat-raised-button 
              color="primary" 
              (click)="abrirDialogoConsentimento()"
              [disabled]="carregando">
              <mat-icon>edit</mat-icon>
              Alterar Consentimentos
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Dados Pessoais -->
      <mat-card class="privacy-card mb-6">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            <mat-icon>person</mat-icon>
            Meus Dados Pessoais
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="dadosPessoais" class="dados-pessoais-grid">
            <div class="dado-item">
              <label>Nome:</label>
              <span>{{ dadosPessoais.nome }}</span>
            </div>
            <div class="dado-item">
              <label>E-mail:</label>
              <span>{{ dadosPessoais.email }}</span>
            </div>
            <div class="dado-item">
              <label>Plano:</label>
              <span class="plano-badge">{{ dadosPessoais.plano }}</span>
            </div>
            <div class="dado-item">
              <label>Membro desde:</label>
              <span>{{ formatarData(dadosPessoais.dataCriacao) }}</span>
            </div>
            <div class="dado-item">
              <label>Última atualização:</label>
              <span>{{ formatarData(dadosPessoais.dataAtualizacao) }}</span>
            </div>
            <div class="dado-item">
              <label>Status:</label>
              <span class="status-badge" [ngClass]="getStatusClass(dadosPessoais.statusExclusao)">
                {{ getStatusText(dadosPessoais.statusExclusao) }}
              </span>
            </div>
          </div>

          <div class="dados-actions mt-4">
            <button 
              mat-stroked-button 
              (click)="carregarDadosPessoais()"
              [disabled]="carregando">
              <mat-icon>refresh</mat-icon>
              Atualizar Dados
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Ações de Privacidade -->
      <mat-card class="privacy-card mb-6">
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            <mat-icon>settings</mat-icon>
            Ações de Privacidade
          </mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="privacy-actions-grid">
            <!-- Exportar Dados -->
            <div class="action-item">
              <div class="action-info">
                <h4>Exportar Meus Dados</h4>
                <p>Baixe uma cópia completa dos seus dados em formato JSON</p>
              </div>
              <button 
                mat-raised-button 
                color="primary"
                (click)="exportarDados()"
                [disabled]="carregando">
                <mat-icon>download</mat-icon>
                Exportar
              </button>
            </div>

            <!-- Relatório de Dados -->
            <div class="action-item">
              <div class="action-info">
                <h4>Relatório de Dados</h4>
                <p>Visualize um relatório detalhado dos seus dados pessoais</p>
              </div>
              <button 
                mat-stroked-button
                (click)="gerarRelatorio()"
                [disabled]="carregando">
                <mat-icon>description</mat-icon>
                Gerar Relatório
              </button>
            </div>

            <!-- Solicitar Exclusão -->
            <div class="action-item danger-action">
              <div class="action-info">
                <h4>Solicitar Exclusão</h4>
                <p>Exclua permanentemente todos os seus dados pessoais</p>
                <small class="text-red-600">⚠️ Esta ação não pode ser desfeita</small>
              </div>
              <button 
                mat-raised-button 
                color="warn"
                (click)="solicitarExclusao()"
                [disabled]="carregando || estaEmProcessoExclusao()">
                <mat-icon>delete_forever</mat-icon>
                {{ estaEmProcessoExclusao() ? 'Exclusão Solicitada' : 'Solicitar Exclusão' }}
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Loading Overlay -->
      <div *ngIf="carregando" class="loading-overlay">
        <mat-spinner></mat-spinner>
        <p>Carregando...</p>
      </div>
    </div>
  `,
  styleUrls: ['./privacy-manager.component.css']
})
export class PrivacyManagerComponent implements OnInit, OnDestroy {
  statusConsentimento: StatusConsentimento | null = null;
  dadosPessoais: DadosPessoais | null = null;
  carregando = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private privacyService: PrivacyService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarStatusConsentimento();
    this.carregarDadosPessoais();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  carregarStatusConsentimento(): void {
    const sub = this.privacyService.consentimento$.subscribe(status => {
      this.statusConsentimento = status;
    });
    this.subscriptions.push(sub);
  }

  carregarDadosPessoais(): void {
    this.carregando = true;
    const sub = this.privacyService.obterDadosPessoais().subscribe({
      next: (response) => {
        this.dadosPessoais = response.dadosPessoais;
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados pessoais:', error);
        this.snackBar.open('Erro ao carregar dados pessoais', 'Fechar', { duration: 3000 });
        this.carregando = false;
      }
    });
    this.subscriptions.push(sub);
  }

  abrirDialogoConsentimento(): void {
    // Implementar diálogo de consentimento
    this.snackBar.open('Funcionalidade em desenvolvimento', 'Fechar', { duration: 2000 });
  }

  exportarDados(): void {
    this.carregando = true;
    this.privacyService.baixarDadosExportados();
    this.carregando = false;
    this.snackBar.open('Download iniciado!', 'Fechar', { duration: 3000 });
  }

  gerarRelatorio(): void {
    this.carregando = true;
    const sub = this.privacyService.gerarRelatorioDados().subscribe({
      next: (relatorio) => {
        console.log('Relatório gerado:', relatorio);
        this.snackBar.open('Relatório gerado com sucesso!', 'Fechar', { duration: 3000 });
        this.carregando = false;
      },
      error: (error) => {
        console.error('Erro ao gerar relatório:', error);
        this.snackBar.open('Erro ao gerar relatório', 'Fechar', { duration: 3000 });
        this.carregando = false;
      }
    });
    this.subscriptions.push(sub);
  }

  solicitarExclusao(): void {
    if (confirm('Tem certeza que deseja solicitar a exclusão de todos os seus dados? Esta ação não pode ser desfeita.')) {
      this.carregando = true;
      const sub = this.privacyService.solicitarExclusao().subscribe({
        next: (response) => {
          this.snackBar.open('Solicitação de exclusão registrada com sucesso', 'Fechar', { duration: 5000 });
          this.carregando = false;
          this.carregarStatusConsentimento();
        },
        error: (error) => {
          console.error('Erro ao solicitar exclusão:', error);
          this.snackBar.open('Erro ao solicitar exclusão', 'Fechar', { duration: 3000 });
          this.carregando = false;
        }
      });
      this.subscriptions.push(sub);
    }
  }

  estaEmProcessoExclusao(): boolean {
    return this.privacyService.estaEmProcessoExclusao();
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ATIVO': return 'status-ativo';
      case 'PENDENTE_EXCLUSAO': return 'status-pendente';
      case 'EXCLUIDO': return 'status-excluido';
      default: return 'status-desconhecido';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ATIVO': return 'Ativo';
      case 'PENDENTE_EXCLUSAO': return 'Pendente de Exclusão';
      case 'EXCLUIDO': return 'Excluído';
      default: return 'Desconhecido';
    }
  }
}




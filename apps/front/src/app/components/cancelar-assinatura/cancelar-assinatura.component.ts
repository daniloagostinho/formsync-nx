import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NotificationService } from '../../services/notification.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AssinaturaService, CancelarAssinaturaDTO, CancelamentoResponseDTO, AssinaturaResponseDTO } from '../../services/assinatura.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';

interface NotificacaoCustom {
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensagem: string;
  detalhes?: string;
  mostrar: boolean;
  icone: string;
}

@Component({
  selector: 'app-cancelar-assinatura',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,

    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './cancelar-assinatura.component.html',
  styleUrl: './cancelar-assinatura.component.css'
})
export class CancelarAssinaturaComponent implements OnInit, OnDestroy {
  cancelamentoForm: FormGroup;
  assinaturaAtual: AssinaturaResponseDTO | null = null;
  carregando = false;
  carregandoPagina = true;
  notificacao: NotificacaoCustom | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private assinaturaService: AssinaturaService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.cancelamentoForm = this.fb.group({
      motivo: ['', [Validators.required, Validators.minLength(10)]],
      dataCancelamento: [''],
      solicitarReembolso: [false]
    });
  }

  ngOnInit(): void {
    this.carregarAssinaturaAtual();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  mostrarNotificacao(tipo: 'success' | 'error' | 'warning' | 'info', titulo: string, mensagem: string, detalhes?: string): void {
    const icones = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    this.notificacao = {
      tipo,
      titulo,
      mensagem,
      detalhes,
      mostrar: true,
      icone: icones[tipo]
    };
  }

  fecharNotificacao(): void {
    if (this.notificacao) {
      // Iniciar animação de saída
      this.notificacao.mostrar = false;

      // Limpar a notificação após a animação
      setTimeout(() => {
        this.notificacao = null;
      }, 300);
    }
  }

  carregarAssinaturaAtual(): void {
    this.carregandoPagina = true;
    this.assinaturaService.consultarAssinaturaUsuarioLogado()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assinatura) => {
          this.assinaturaAtual = assinatura;
          this.carregandoPagina = false;

          // ✅ VERIFICAR SE ASSINATURA JÁ ESTÁ CANCELADA
          if (assinatura.status === 'CANCELADA') {
            this.mostrarNotificacao(
              'warning',
              'Assinatura Cancelada',
              'Esta assinatura já foi cancelada anteriormente.',
              'Você será redirecionado para o dashboard em alguns segundos.'
            );

            // Redirecionar para dashboard após 5 segundos
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 5000);
          }
        },
        error: (error) => {
          console.error('Erro ao carregar assinatura:', error);
          this.carregandoPagina = false;

          // ✅ MELHOR TRATAMENTO DE ERRO
          if (error.status === 404) {
            this.mostrarNotificacao(
              'info',
              'Assinatura Não Encontrada',
              'Nenhuma assinatura ativa foi encontrada para sua conta.',
              'Você será redirecionado para o dashboard.'
            );

            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 5000);
          } else {
            this.mostrarNotificacao(
              'error',
              'Erro ao Carregar',
              'Não foi possível carregar os dados da assinatura.',
              'Verifique sua conexão e tente novamente.'
            );
          }
        }
      });
  }

  onSubmit(): void {
    if (this.cancelamentoForm.invalid || !this.assinaturaAtual) {
      return;
    }

    // ✅ VERIFICAR SE ASSINATURA JÁ ESTÁ CANCELADA ANTES DE ENVIAR
    if (this.assinaturaAtual.status === 'CANCELADA') {
      this.mostrarNotificacao(
        'warning',
        'Assinatura Já Cancelada',
        'Esta assinatura já foi cancelada anteriormente.',
        'Não é possível cancelar novamente.'
      );
      return;
    }

    // ✅ PREVENIR MÚLTIPLOS CLIQUES
    if (this.carregando) {
      return;
    }

    this.carregando = true;
    const dto: CancelarAssinaturaDTO = {
      motivo: this.cancelamentoForm.value.motivo,
      dataCancelamento: this.cancelamentoForm.value.dataCancelamento || undefined,
      solicitarReembolso: this.cancelamentoForm.value.solicitarReembolso
    };

    this.assinaturaService.cancelarAssinatura(this.assinaturaAtual.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CancelamentoResponseDTO) => {
          this.carregando = false;

          // ✅ ATUALIZAR STATUS LOCAL PARA EVITAR NOVOS ENVIOS
          if (this.assinaturaAtual) {
            this.assinaturaAtual.status = 'CANCELADA';
          }

          // Criar mensagem detalhada sobre o reembolso
          let detalhesReembolso = '';

          if (response.dentroDoArrependimento) {
            detalhesReembolso = '✅ Reembolso integral processado conforme CDC Art. 49 (Direito de Arrependimento)';
          } else if (response.valorReembolso && response.valorReembolso > 0) {
            detalhesReembolso = `💰 Reembolso proporcional de R$ ${response.valorReembolso.toFixed(2)} será processado`;
          } else {
            detalhesReembolso = 'ℹ️ Não há reembolso aplicável para este cancelamento';
          }

          this.mostrarNotificacao(
            'success',
            'Assinatura Cancelada com Sucesso!',
            response.mensagem,
            detalhesReembolso + ' • Você será redirecionado em alguns segundos.'
          );

          // Redirecionar para dashboard após cancelamento (sem fechar automaticamente a notificação)
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 8000);
        },
        error: (error) => {
          console.error('Erro ao cancelar assinatura:', error);
          this.carregando = false;

          const mensagem = this.getMensagemErro(error);
          this.mostrarNotificacao(
            'error',
            'Erro ao Cancelar Assinatura',
            mensagem,
            'Verifique os dados e tente novamente.'
          );
        }
      });
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }

  getNomePlano(plano: string): string {
    const planos: { [key: string]: string } = {
      'GRATIS': 'Gratuito',
      'PROFISSIONAL': 'Profissional',
      'EMPRESARIAL': 'Empresarial',
      'VITALICIO': 'Vitalício'
    };
    return planos[plano] || plano;
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMensagemErro(error: any): string {
    // ✅ TRATAMENTO ESPECÍFICO PARA ASSINATURA JÁ CANCELADA
    if (error.error?.message && error.error.message.includes('CANCELADA')) {
      return 'Esta assinatura já foi cancelada anteriormente. Não é possível cancelar novamente.';
    }

    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 403) {
      return 'Você não tem permissão para cancelar esta assinatura';
    }
    if (error.status === 404) {
      return 'Assinatura não encontrada';
    }
    if (error.status === 400) {
      // ✅ VERIFICAR SE É ERRO DE STATUS ESPECÍFICO
      if (error.error?.message?.includes('Status atual')) {
        return 'Esta assinatura não pode ser cancelada devido ao seu status atual.';
      }
      return 'Dados inválidos para cancelamento';
    }
    return 'Erro ao cancelar assinatura. Tente novamente.';
  }
} 
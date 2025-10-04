import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

// Services and models
import { NotificacaoService } from '../../services/notificacao.service';
import { NotificacaoVencimento } from '../../models/notificacao.model';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-lista-notificacoes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,

    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatTooltipModule,
    MatBadgeModule,
    SidebarComponent,
    FooterComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './lista-notificacoes.component.html',
  styleUrl: './lista-notificacoes.component.css'
})
export class ListaNotificacoesComponent implements OnInit {
  notificacoes: NotificacaoVencimento[] = [];
  carregando = false;
  carregandoPagina = true;
  userId: number | null = null;

  constructor(
    private notificacaoService: NotificacaoService,
    private customNotificationService: NotificationService
  ) { }

  ngOnInit() {
    console.log('🚀 Componente Lista de Notificações inicializado');
    this.carregarNotificacoes();
  }

  carregarNotificacoes() {
    this.carregandoPagina = true;
    this.userId = this.getUserId();

    if (!this.userId) {
      this.mostrarMensagem('Usuário não identificado', 'error');
      this.carregandoPagina = false;
      return;
    }

    // Timeout de segurança para evitar loading infinito
    setTimeout(() => {
      if (this.carregandoPagina) {
        console.log('Timeout de carregamento atingido, usando lista vazia');
        this.carregandoPagina = false;
        this.notificacoes = [];
      }
    }, 10000); // 10 segundos de timeout

    this.notificacaoService.obterNotificacoes(this.userId).subscribe({
      next: (notificacoes) => {
        this.notificacoes = notificacoes;
        console.log('Notificações carregadas:', notificacoes);
        this.carregandoPagina = false;
      },
      error: (error) => {
        console.error('Erro ao carregar notificações:', error);
        const mensagem = error.error?.message || 'Erro ao carregar notificações';
        this.mostrarMensagem(mensagem, 'error');
        this.carregandoPagina = false;
      }
    });
  }

  marcarComoLida(notificacao: NotificacaoVencimento) {
    if (!notificacao.id) return;

    this.notificacaoService.marcarComoLida(notificacao.id).subscribe({
      next: () => {
        notificacao.lida = true;
        // Operação bem-sucedida, usar mensagem padrão
        this.mostrarMensagem('Notificação marcada como lida', 'success');
      },
      error: (error) => {
        console.error('Erro ao marcar notificação como lida:', error);
        const mensagem = error.error?.message || 'Erro ao marcar notificação como lida';
        this.mostrarMensagem(mensagem, 'error');
      }
    });
  }

  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub;
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return null;
    }
  }

  mostrarMensagem(mensagem: string, tipo: 'success' | 'error' | 'info' = 'success') {
    if (tipo === 'success') {
      this.customNotificationService.showSuccess(mensagem);
    } else if (tipo === 'error') {
      this.customNotificationService.showError(mensagem);
    } else {
      this.customNotificationService.showInfo(mensagem);
    }
  }

  getTipoIcone(tipo: string): string {
    switch (tipo) {
      case 'email': return 'email';
      case 'push': return 'notifications';
      case 'sms': return 'sms';
      default: return 'notifications';
    }
  }

  getTipoCor(tipo: string): string {
    switch (tipo) {
      case 'email': return 'primary';
      case 'push': return 'accent';
      case 'sms': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcone(status: string): string {
    switch (status) {
      case 'enviada': return 'done';
      case 'pendente': return 'schedule';
      case 'falha': return 'error';
      default: return 'info';
    }
  }

  getStatusCor(status: string): string {
    switch (status) {
      case 'enviada': return 'success';
      case 'pendente': return 'accent';
      case 'falha': return 'warn';
      default: return 'primary';
    }
  }

  getNotificacoesNaoLidas(): number {
    return this.notificacoes.filter(n => !n.lida).length;
  }

  getNotificacoesPorTipo(tipo: string): NotificacaoVencimento[] {
    return this.notificacoes.filter(n => n.tipo === tipo);
  }

  getDiasAteVencimento(dataVencimento: Date): number {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getUrgenciaTexto(dias: number): string {
    if (dias < 0) return 'Vencido';
    if (dias === 0) return 'Vence hoje';
    if (dias === 1) return 'Vence amanhã';
    if (dias <= 3) return 'Urgente';
    if (dias <= 7) return 'Próximo';
    return 'Normal';
  }

  getUrgenciaCor(dias: number): string {
    if (dias < 0) return 'warn';
    if (dias <= 1) return 'warn';
    if (dias <= 3) return 'accent';
    if (dias <= 7) return 'primary';
    return 'primary';
  }
} 
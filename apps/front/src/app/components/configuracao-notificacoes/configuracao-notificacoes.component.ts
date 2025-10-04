import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../services/notification.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';

// Services and models
import { NotificacaoService } from '../../services/notificacao.service';
import { ConfiguracaoNotificacao } from '../../models/notificacao.model';
import { UsuarioService } from '../../services/usuario.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'app-configuracao-notificacoes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,

    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSelectModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatListModule,
    SidebarComponent,
    FooterComponent,
    LoadingSkeletonComponent
  ],
  templateUrl: './configuracao-notificacoes.component.html',
  styleUrl: './configuracao-notificacoes.component.css'
})
export class ConfiguracaoNotificacoesComponent implements OnInit {
  configuracao: ConfiguracaoNotificacao = {
    usuarioId: 0,
    ativo: true,
    diasAntesVencimento: 7,
    emailAtivo: true,
    pushAtivo: false,
    smsAtivo: false,
    horarioNotificacao: '09:00'
  };

  carregando = false;
  carregandoPagina = true;
  salvando = false;
  testando = false;
  mensagem = '';
  tipoMensagem: 'success' | 'error' | 'info' = 'success';
  userId: number | null = null;
  modoDemo = false;

  // Opções para horários
  horariosDisponiveis = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  // Estatísticas
  estatisticas = {
    totalEnviadas: 0,
    totalLidas: 0,
    totalPendentes: 0,
    ultimaNotificacao: null as Date | null
  };

  constructor(
    private notificacaoService: NotificacaoService,
    private usuarioService: UsuarioService,
    private customNotificationService: NotificationService
  ) { }

  ngOnInit() {
    console.log('🚀 Componente Configuração de Notificações inicializado');
    this.carregarConfiguracao();
  }

  async carregarConfiguracao() {
    this.carregandoPagina = true;

    // Timeout de segurança para evitar loading infinito
    setTimeout(() => {
      if (this.carregandoPagina) {
        console.log('Timeout de carregamento atingido, usando configuração padrão');
        this.carregandoPagina = false;
        this.userId = this.getUserId() || 1;
        this.configuracao = this.notificacaoService.criarConfiguracaoPadrao(this.userId);
        this.carregarEstatisticas();
      }
    }, 10000); // 10 segundos de timeout

    try {
      // Obter userId
      this.userId = this.getUserId();
      if (!this.userId) {
        throw new Error('Usuário não identificado');
      }

      // Carregar configuração existente ou criar padrão
      this.notificacaoService.obterConfiguracao(this.userId).subscribe({
        next: (config) => {
          this.configuracao = config;
          this.carregarEstatisticas();
          this.carregandoPagina = false;
        },
        error: (error) => {
          console.log('Configuração não encontrada, criando padrão...', error);
          this.configuracao = this.notificacaoService.criarConfiguracaoPadrao(this.userId!);
          this.carregarEstatisticas();
          this.carregandoPagina = false;
        }
      });
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
      const mensagem = error.error?.message || 'Erro ao carregar configurações';
      this.mostrarMensagem(mensagem, 'error');
      this.carregandoPagina = false;
    }
  }

  carregarEstatisticas() {
    if (!this.userId) return;

    this.notificacaoService.obterEstatisticas(this.userId).subscribe({
      next: (stats) => {
        this.estatisticas = stats;
      },
      error: (error) => {
        console.error('Erro ao carregar estatísticas:', error);
        // Em caso de erro, definir estatísticas padrão
        this.estatisticas = {
          totalEnviadas: 0,
          totalLidas: 0,
          totalPendentes: 0,
          ultimaNotificacao: null
        };
      }
    });
  }

  salvarConfiguracao() {
    if (!this.userId) {
      this.mostrarMensagem('Usuário não identificado', 'error');
      return;
    }

    this.salvando = true;
    this.configuracao.usuarioId = this.userId;

    this.notificacaoService.salvarConfiguracao(this.configuracao).subscribe({
      next: (config) => {
        this.configuracao = config;
        // API retorna objeto de configuração, usar mensagem padrão
        this.mostrarMensagem('Configurações salvas com sucesso!', 'success');
      },
      error: (error) => {
        console.error('Erro ao salvar configuração:', error);
        const mensagem = error.error?.message || 'Erro ao salvar configurações';
        this.mostrarMensagem(mensagem, 'error');
      },
      complete: () => {
        this.salvando = false;
      }
    });
  }

  testarNotificacao(tipo: 'email' | 'push' | 'sms') {
    if (!this.userId) {
      this.mostrarMensagem('Usuário não identificado', 'error');
      return;
    }

    this.testando = true;
    this.notificacaoService.testarNotificacao(this.userId, tipo).subscribe({
      next: (sucesso) => {
        if (sucesso) {
          this.mostrarMensagem(`Notificação de teste ${tipo} enviada com sucesso!`, 'success');
        } else {
          this.mostrarMensagem(`Falha ao enviar notificação de teste ${tipo}`, 'error');
        }
      },
      error: (error) => {
        console.error('Erro ao testar notificação:', error);
        const mensagem = error.error?.message || `Erro ao testar notificação ${tipo}`;
        this.mostrarMensagem(mensagem, 'error');
      },
      complete: () => {
        this.testando = false;
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
    this.mensagem = mensagem;
    this.tipoMensagem = tipo;

    if (tipo === 'success') {
      this.customNotificationService.showSuccess(mensagem);
    } else if (tipo === 'error') {
      this.customNotificationService.showError(mensagem);
    } else {
      this.customNotificationService.showInfo(mensagem);
    }
  }

  limparMensagem() {
    this.mensagem = '';
  }

  // Métodos auxiliares para validação
  isConfiguracaoValida(): boolean {
    return this.configuracao.diasAntesVencimento > 0 &&
      this.configuracao.diasAntesVencimento <= 30 &&
      (this.configuracao.emailAtivo || this.configuracao.pushAtivo || this.configuracao.smsAtivo);
  }

  getStatusText(): string {
    if (!this.configuracao.ativo) return 'Desativado';
    if (this.configuracao.emailAtivo && this.configuracao.pushAtivo && this.configuracao.smsAtivo) {
      return 'Email, Push e SMS';
    }
    const tipos = [];
    if (this.configuracao.emailAtivo) tipos.push('Email');
    if (this.configuracao.pushAtivo) tipos.push('Push');
    if (this.configuracao.smsAtivo) tipos.push('SMS');
    return tipos.join(', ');
  }

  ativarModoDemo() {
    this.carregando = false;
    this.modoDemo = true;
    this.userId = this.getUserId() || 1;
    this.configuracao = this.notificacaoService.criarConfiguracaoPadrao(this.userId);
    this.estatisticas = {
      totalEnviadas: 5,
      totalLidas: 3,
      totalPendentes: 2,
      ultimaNotificacao: new Date()
    };
    this.mostrarMensagem('Modo demo ativado! Você pode testar todas as funcionalidades.', 'success');
  }
} 
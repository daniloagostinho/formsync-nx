import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from '../../services/notification.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AssinaturaService, CancelarAssinaturaDTO, CancelamentoResponseDTO } from '../../services/assinatura.service';
import { UsuarioService } from '../../services/usuario.service';
import { AuthService } from '../../services/auth.service';
import { PLANOS_CONFIG, PlanoConfig, getRecursosSimples, getDescricaoSimples, getExemploUso } from '../../shared/planos-config';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';


@Component({
  selector: 'app-upgrade',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    MatDialogModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule,

    SidebarComponent,
    FooterComponent,
  ],
  templateUrl: './upgrade.component.html',
  styleUrl: './upgrade.component.css',
})
export class UpgradeComponent implements OnInit, OnDestroy {
  planos: Record<string, PlanoConfig> = PLANOS_CONFIG;

  // Dados do usuário atual
  planoAtual = 'PESSOAL';
  assinaturaAtual: any = null;
  carregando = false;
  carregandoDados = false;
  carregandoPagina = true;
  mensagem = '';

  // Flags para controlar estados
  private destroy$ = new Subject<void>();
  carregandoUpgrade = false; // Tornado público para uso no template

  constructor(
    private assinaturaService: AssinaturaService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.carregarDadosUsuario();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarDadosUsuario(): void {
    this.carregandoPagina = true;
    this.carregandoDados = true;
    this.mensagem = '';

    // Carregar plano atual do localStorage
    const planoSalvo = localStorage.getItem('plano');
    if (planoSalvo) {
      this.planoAtual = planoSalvo;
    }

    // Carregar dados da assinatura atual usando o endpoint correto
    this.assinaturaService.consultarAssinaturaUsuarioLogado()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assinatura) => {
          this.assinaturaAtual = assinatura;
          // Atualizar o plano atual com o plano da assinatura ativa
          if (assinatura && assinatura.plano) {
            this.planoAtual = assinatura.plano;
            // Sincronizar com localStorage
            localStorage.setItem('plano', assinatura.plano);
            this.authService.salvarPlano(assinatura.plano);
          }
          this.carregandoPagina = false;
          this.carregandoDados = false;
        },
        error: (error) => {
          console.error('Erro ao carregar assinatura:', error);
          this.carregandoPagina = false;
          this.carregandoDados = false;
          if (error.status === 403 && error.error?.message?.includes('consultar suas próprias assinaturas')) {
            console.log('Usuário não tem assinatura ativa ou não pode consultar');
          } else {
            this.mensagem = '⚠️ Não foi possível carregar os dados da assinatura. Tente novamente.';
          }
        }
      });
  }

  fazerUpgrade(plano: string) {
    console.log(`🔄 fazerUpgrade chamado para plano: ${plano}`);

    if (this.carregandoUpgrade) {
      console.log('⚠️ Upgrade já em andamento, ignorando clique');
      return; // Evita múltiplos cliques
    }

    console.log('✅ Iniciando processo de upgrade');
    this.carregandoUpgrade = true;
    this.carregando = true;
    this.mensagem = '';

    // Validações
    if (!this.authService.estaAutenticado()) {
      this.mensagem = '❌ Você precisa estar logado para fazer upgrade.';
      this.carregando = false;
      this.carregandoUpgrade = false;
      return;
    }

    const userId = this.getUserId();
    if (!userId) {
      this.mensagem = '❌ Erro: Usuário não identificado. Faça login novamente.';
      this.carregando = false;
      this.carregandoUpgrade = false;
      return;
    }

    if (!this.podeAlterarPara(plano)) {
      this.mensagem = '❌ Não é possível alterar para este plano.';
      this.carregando = false;
      this.carregandoUpgrade = false;
      return;
    }

    // Criar nova assinatura
    const novaAssinatura = {
      userId: userId,
      plano: plano,
      status: 'ATIVA'
    };

    this.assinaturaService.criarAssinatura(novaAssinatura.userId, novaAssinatura.plano)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.mensagem = `✅ Upgrade para ${this.getNomePlano(plano)} realizado com sucesso!`;
          this.planoAtual = plano;
          // Atualizar localStorage e AuthService imediatamente
          localStorage.setItem('plano', plano);
          this.authService.salvarPlano(plano); // Atualiza reativamente
          this.carregando = false;
          this.carregandoUpgrade = false;

          // Mostrar notificação de sucesso
          const mensagem = `Upgrade para ${this.getNomePlano(plano)} realizado com sucesso!`;
          this.notificationService.showSuccess(mensagem);

          // Recarregar dados após 2 segundos
          setTimeout(() => {
            this.carregarDadosUsuario();
          }, 2000);
        },
        error: (error) => {
          console.error('Erro ao fazer upgrade:', error);
          this.mensagem = this.getMensagemErro(error);
          this.carregando = false;
          this.carregandoUpgrade = false;

          // Mostrar notificação de erro
          this.notificationService.showError(this.getMensagemErro(error));
        }
      });
  }

  private getUserId(): number | null {
    try {
      // Debug: mostrar todos os dados disponíveis
      console.log('🔍 Debug getUserId:');
      console.log('  - localStorage.userId:', localStorage.getItem('userId'));
      console.log('  - localStorage.userData:', localStorage.getItem('userData'));
      console.log('  - localStorage.token exists:', !!localStorage.getItem('token'));

      // 1. Tenta pegar do localStorage (userId)
      const userId = localStorage.getItem('userId');
      if (userId && !isNaN(Number(userId))) {
        console.log(`✅ Usando userId do localStorage: ${userId}`);
        return Number(userId);
      }

      // 2. Tenta pegar do token JWT
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('  - Token payload:', payload);
        if (payload.id && !isNaN(Number(payload.id))) {
          console.log(`✅ Usando userId do token: ${payload.id}`);
          return Number(payload.id);
        }
      }

      // 3. Fallback para userData
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('  - userData:', user);
        if (user.id && !isNaN(Number(user.id))) {
          console.log(`✅ Usando userId do userData: ${user.id}`);
          return Number(user.id);
        }
      }

      console.log('❌ Nenhum userId válido encontrado');
      return null;
    } catch (error) {
      console.error('❌ Erro ao decodificar token:', error);
      return null;
    }
  }

  getNomePlano(plano: string): string {
    const planos: { [key: string]: string } = {
      'FREE': 'Gratuito',
      'PESSOAL': 'Pessoal',
      'PROFISSIONAL': 'Profissional',
      'PROFISSIONAL_MENSAL': 'Profissional',
      'PROFISSIONAL_VITALICIO': 'Profissional Vitalício',
      'EMPRESARIAL': 'Empresarial'
    };
    return planos[plano] || plano;
  }

  isPlanoAtual(plano: string): boolean {
    return this.planoAtual?.toUpperCase() === plano?.toUpperCase();
  }

  podeFazerUpgrade(plano: string): boolean {
    if (!plano || !this.planoAtual) return false;

    // Lógica para verificar se pode fazer upgrade
    const planosHierarquia = ['FREE', 'PESSOAL', 'PROFISSIONAL', 'EMPRESARIAL'];
    const indexAtual = planosHierarquia.indexOf(this.planoAtual.toUpperCase());
    const indexNovo = planosHierarquia.indexOf(plano.toUpperCase());

    return indexNovo > indexAtual;
  }

  podeFazerDowngrade(plano: string): boolean {
    if (!plano || !this.planoAtual) return false;

    // Lógica para verificar se pode fazer downgrade
    const planosHierarquia = ['FREE', 'PESSOAL', 'PROFISSIONAL', 'EMPRESARIAL'];
    const indexAtual = planosHierarquia.indexOf(this.planoAtual.toUpperCase());
    const indexNovo = planosHierarquia.indexOf(plano.toUpperCase());

    return indexNovo < indexAtual;
  }

  podeAlterarPara(plano: string): boolean {
    // Pode upgrade, downgrade ou não é o plano atual
    return this.podeFazerUpgrade(plano) || this.podeFazerDowngrade(plano);
  }

  cancelarAssinatura() {
    console.log('🔄 cancelarAssinatura chamado');

    if (this.carregandoUpgrade) {
      console.log('⚠️ Cancelamento já em andamento, ignorando clique');
      return;
    }

    if (!this.assinaturaAtual) {
      this.mensagem = '❌ Nenhuma assinatura ativa encontrada para cancelar.';
      return;
    }

    console.log('✅ Iniciando processo de cancelamento real');
    this.carregandoUpgrade = true;
    this.carregando = true;
    this.mensagem = '';

    const dto: CancelarAssinaturaDTO = {
      motivo: 'Cancelamento via interface de upgrade/downgrade',
      solicitarReembolso: true // Sempre solicitar reembolso quando aplicável
    };

    this.assinaturaService.cancelarAssinatura(this.assinaturaAtual.id, dto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CancelamentoResponseDTO) => {
          console.log('✅ Cancelamento realizado com sucesso:', response);

          // Criar mensagem detalhada sobre o reembolso
          let mensagemDetalhada = '✅ Assinatura cancelada com sucesso!';

          if (response.dentroDoArrependimento) {
            mensagemDetalhada += '\n\n💰 Reembolso integral processado conforme CDC Art. 49 (Direito de Arrependimento)';
          } else if (response.valorReembolso && response.valorReembolso > 0) {
            mensagemDetalhada += `\n\n💰 Reembolso proporcional: R$ ${response.valorReembolso.toFixed(2)}`;
          } else {
            mensagemDetalhada += '\n\nℹ️ Não há reembolso aplicável para este cancelamento';
          }

          if (response.dataFim) {
            const dataFimFormatada = new Date(response.dataFim).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            mensagemDetalhada += `\n\n📅 Acesso válido até: ${dataFimFormatada}`;
          }

          this.mensagem = mensagemDetalhada;

          // Atualizar plano para FREE após cancelamento
          this.planoAtual = 'FREE';
          localStorage.setItem('plano', 'FREE');
          this.authService.salvarPlano('FREE');

          this.carregando = false;
          this.carregandoUpgrade = false;

          // Opcional: Recarregar dados após alguns segundos
          setTimeout(() => {
            this.carregarDadosUsuario();
          }, 3000);
        },
        error: (error) => {
          console.error('❌ Erro ao cancelar assinatura:', error);
          this.mensagem = this.getMensagemErro(error);
          this.carregando = false;
          this.carregandoUpgrade = false;
        }
      });
  }

  private getMensagemErro(error: any): string {
    // Priorizar mensagem da API se disponível
    if (error.error?.message) {
      return error.error.message;
    }

    // Fallback para mensagens específicas por status
    if (error.status === 403) {
      return '❌ Acesso negado. Verifique suas permissões.';
    } else if (error.status === 401) {
      return '❌ Sessão expirada. Faça login novamente.';
    } else if (error.status === 500) {
      return '❌ Erro interno do servidor. Tente novamente em alguns minutos.';
    } else if (error.status === 0) {
      return '❌ Erro de conexão. Verifique sua internet.';
    } else {
      return '❌ Erro inesperado. Tente novamente.';
    }
  }

  // Métodos para a estrutura didática
  getRecursosSimples(planoId: string): string[] {
    return getRecursosSimples(planoId);
  }

  getDescricaoSimples(planoId: string): string {
    return getDescricaoSimples(planoId);
  }

  getExemploUso(planoId: string): string {
    return getExemploUso(planoId);
  }
}

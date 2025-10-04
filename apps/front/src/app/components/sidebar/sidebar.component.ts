import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TourService } from '../../services/tour.service';
import { AuthService } from '../../services/auth.service';
import { MobileMenuService } from '../../services/mobile-menu.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    NgIf,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.Default
})
export class SidebarComponent implements OnInit, OnDestroy {
  planoUsuario: 'PESSOAL' | 'PROFISSIONAL' | 'PROFISSIONAL_MENSAL' | 'PROFISSIONAL_VITALICIO' | 'EMPRESARIAL' = 'PESSOAL';
  tourCompleted = false;
  mobileMenuOpen = false;
  private storageListener?: () => void;
  private subscription = new Subscription();
  private planoSub?: Subscription;

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private mobileMenuService: MobileMenuService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.definirPlanoUsuario();
    this.checkTourStatus();

    // Inscrever-se no observable de plano
    this.planoSub = this.authService.plano$.subscribe(plano => {
      this.definirPlanoUsuarioReativo(plano);
    });

    // Adicionar listener para mudanças no localStorage
    this.storageListener = () => {
      this.definirPlanoUsuario();
      this.checkTourStatus();
    };

    window.addEventListener('storage', this.storageListener);

    // Também verificar quando a página ganha foco (para mudanças no mesmo tab)
    window.addEventListener('focus', this.storageListener);

    // Escutar o serviço de menu mobile
    this.subscription.add(
      this.mobileMenuService.mobileMenuOpen$.subscribe(open => {
        console.log('🔍 Sidebar: mobileMenuOpen mudou para:', open);
        this.mobileMenuOpen = open;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy() {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      window.removeEventListener('focus', this.storageListener);
    }
    this.planoSub?.unsubscribe();
    this.subscription.unsubscribe();
  }

  definirPlanoUsuario() {
    const planoSalvo = localStorage.getItem('plano');

    if (!planoSalvo) {
      this.planoUsuario = 'PESSOAL';
      return;
    }

    // Converter para maiúsculas para comparação consistente
    const planoUpper = planoSalvo.toUpperCase();

    if (planoUpper === 'EMPRESARIAL' || planoUpper.includes('EMPRESARIAL')) {
      this.planoUsuario = 'EMPRESARIAL';
    } else if (planoUpper === 'PROFISSIONAL_VITALICIO' || planoUpper.includes('VITALICIO')) {
      this.planoUsuario = 'PROFISSIONAL_VITALICIO';
    } else if (planoUpper === 'PROFISSIONAL_MENSAL' || planoUpper.includes('MENSAL')) {
      this.planoUsuario = 'PROFISSIONAL_MENSAL';
    } else if (planoUpper.includes('PROFISSIONAL')) {
      this.planoUsuario = 'PROFISSIONAL';
    } else {
      this.planoUsuario = 'PESSOAL';
    }
  }



  // Novo método reativo para atualizar plano via Observable
  definirPlanoUsuarioReativo(planoNovo: string | null) {
    if (!planoNovo) {
      this.planoUsuario = 'PESSOAL';
      return;
    }

    // Converter para maiúsculas para comparação consistente
    const planoUpper = planoNovo.toUpperCase();

    if (planoUpper === 'EMPRESARIAL' || planoUpper.includes('EMPRESARIAL')) {
      this.planoUsuario = 'EMPRESARIAL';
    } else if (planoUpper === 'PROFISSIONAL_VITALICIO' || planoUpper.includes('VITALICIO')) {
      this.planoUsuario = 'PROFISSIONAL_VITALICIO';
    } else if (planoUpper === 'PROFISSIONAL_MENSAL' || planoUpper.includes('MENSAL')) {
      this.planoUsuario = 'PROFISSIONAL_MENSAL';
    } else if (planoUpper.includes('PROFISSIONAL')) {
      this.planoUsuario = 'PROFISSIONAL';
    } else {
      this.planoUsuario = 'PESSOAL';
    }


  }

  // Método para verificar se pode acessar upload CSV
  podeAcessarUploadCsv(): boolean {
    return this.planoUsuario === 'EMPRESARIAL' ||
      this.planoUsuario === 'PROFISSIONAL_MENSAL' ||
      this.planoUsuario === 'PROFISSIONAL_VITALICIO';
  }

  // Método para verificar se pode acessar Analytics
  podeAcessarAnalytics(): boolean {
    return this.planoUsuario === 'EMPRESARIAL' ||
      this.planoUsuario === 'PROFISSIONAL_MENSAL' ||
      this.planoUsuario === 'PROFISSIONAL_VITALICIO' ||
      this.planoUsuario === 'PROFISSIONAL';
  }

  // Método para verificar se pode acessar a Calculadora de Planos
  podeAcessarCalculadoraPlanos(): boolean {
    return true; // Todos os usuários podem acessar
  }

  /**
   * Verifica o status do tour
   */
  private checkTourStatus(): void {
    this.tourCompleted = this.tourService.hasCompletedTour();
  }

  /**
   * Inicia o tour guiado
   */
  startTour(): void {
    this.tourService.startTour();
  }

  /**
   * Pula o tour
   */
  skipTour(): void {
    this.tourService.skipTour();
    this.tourCompleted = true;
  }

  /**
   * Fecha o card de boas-vindas
   */
  closeWelcomeCard(): void {
    this.tourCompleted = true;
  }

  /**
   * Atualiza o plano do usuário
   */
  atualizarPlano(): void {
    this.definirPlanoUsuario();
    // Também pode verificar se há mudanças no AuthService
    if (this.authService.plano$) {
      this.authService.plano$.subscribe(plano => {
        this.definirPlanoUsuarioReativo(plano);
      });
    }
  }

  /**
   * Toggle mobile menu
   */
  toggleMobileMenu(): void {
    this.mobileMenuService.toggleMobileMenu();
  }

  /**
   * Close mobile menu
   */
  closeMobileMenu(): void {
    this.mobileMenuService.closeMobileMenu();
  }

  /**
   * Open mobile menu (for external calls)
   */
  openMobileMenu(): void {
    this.mobileMenuService.openMobileMenu();
  }

} 
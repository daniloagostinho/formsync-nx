import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  showArrow?: boolean;
  showOverlay?: boolean;
  action?: () => void;
}

export interface TourState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  isFirstTime: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private tourStateSubject = new BehaviorSubject<TourState>({
    isActive: false,
    currentStep: 0,
    totalSteps: 0,
    isFirstTime: false
  });

  public tourState$ = this.tourStateSubject.asObservable();

  private readonly TOUR_STORAGE_KEY = 'formsync_tour_completed';
  private readonly FIRST_TIME_KEY = 'formsync_first_visit';

  // Definição dos passos do tour
  private readonly TOUR_STEPS: TourStep[] = [
    {
      id: 'dashboard-overview',
      title: '🎯 Dashboard',
      content: 'Bem-vindo ao FormSync! Aqui você encontra um resumo completo das suas atividades e estatísticas.',
      target: '.dashboard-title',
      position: 'bottom',
      showArrow: true,
      showOverlay: true
    },
    {
      id: 'stats-cards',
      title: '📊 Estatísticas',
      content: 'Acompanhe seus dados em tempo real: total de campos, formulários preenchidos e status do seu plano.',
      target: '.stats-grid',
      position: 'top',
      showArrow: true,
      showOverlay: true
    },
    {
      id: 'quick-actions',
      title: '⚡ Ações Rápidas',
      content: 'Acesse rapidamente as principais funcionalidades: gerenciar campos, editar perfil e suporte.',
      target: '.actions-grid',
      position: 'top',
      showArrow: true,
      showOverlay: true
    },
    {
      id: 'sidebar-navigation',
      title: '🧭 Navegação',
      content: 'Use o menu lateral para navegar entre as diferentes seções do FormSync.',
      target: '.sidebar',
      position: 'right',
      showArrow: true,
      showOverlay: true
    },
    {
      id: 'templates',
      title: '📝 Templates',
      content: 'Gerencie todos os Seus Formulários. Crie, edite e organize seus formulários personalizados.',
      target: 'a[routerLink="/templates"]',
      position: 'right',
      showArrow: true,
      showOverlay: true,
      action: () => this.highlightElement('a[routerLink="/templates"]')
    },
    {
      id: 'upload-csv',
      title: '📁 Importar CSV',
      content: 'Importe seus dados em massa através de arquivos CSV. Ideal para grandes volumes de informações.',
      target: 'a[routerLink="/upload-csv"]',
      position: 'right',
      showArrow: true,
      showOverlay: true,
      action: () => this.highlightElement('a[routerLink="/upload-csv"]')
    },
    {
      id: 'profile-settings',
      title: '👤 Perfil',
      content: 'Configure suas informações pessoais e preferências da conta.',
      target: 'a[routerLink="/perfil"]',
      position: 'right',
      showArrow: true,
      showOverlay: true,
      action: () => this.highlightElement('a[routerLink="/perfil"]')
    },
    {
      id: 'upgrade-plan',
      title: '⭐ Upgrade',
      content: 'Explore planos premium para acessar mais recursos e funcionalidades avançadas.',
      target: 'a[routerLink="/upgrade"]',
      position: 'right',
      showArrow: true,
      showOverlay: true,
      action: () => this.highlightElement('a[routerLink="/upgrade"]')
    },
    {
      id: 'tour-completion',
      title: '🎉 Tudo Pronto!',
      content: 'Você já conhece os principais recursos do FormSync. Comece a usar e aproveite ao máximo a plataforma!',
      target: '.dashboard-container',
      position: 'top',
      showArrow: false,
      showOverlay: true
    }
  ];

  constructor() {
    this.checkFirstTime();
  }

  /**
   * Verifica se é a primeira visita do usuário
   */
  private checkFirstTime(): void {
    const hasVisited = localStorage.getItem(this.FIRST_TIME_KEY);
    if (!hasVisited) {
      localStorage.setItem(this.FIRST_TIME_KEY, 'true');
      this.tourStateSubject.next({
        ...this.tourStateSubject.value,
        isFirstTime: true
      });
    }
  }

  /**
   * Verifica se o tour já foi completado
   */
  hasCompletedTour(): boolean {
    return localStorage.getItem(this.TOUR_STORAGE_KEY) === 'true';
  }

  /**
   * Marca o tour como completado
   */
  markTourCompleted(): void {
    localStorage.setItem(this.TOUR_STORAGE_KEY, 'true');
  }

  /**
   * Inicia o tour
   */
  startTour(): void {
    const state: TourState = {
      isActive: true,
      currentStep: 0,
      totalSteps: this.TOUR_STEPS.length,
      isFirstTime: this.tourStateSubject.value.isFirstTime
    };

    this.tourStateSubject.next(state);
    this.showStep(0);
  }

  /**
   * Para o tour
   */
  stopTour(): void {
    this.hideAllHighlights();
    this.tourStateSubject.next({
      ...this.tourStateSubject.value,
      isActive: false,
      currentStep: 0
    });
  }

  /**
   * Avança para o próximo passo
   */
  nextStep(): void {
    const currentState = this.tourStateSubject.value;
    if (currentState.currentStep < this.TOUR_STEPS.length - 1) {
      const nextStep = currentState.currentStep + 1;
      this.tourStateSubject.next({
        ...currentState,
        currentStep: nextStep
      });
      this.showStep(nextStep);
    } else {
      this.completeTour();
    }
  }

  /**
   * Volta para o passo anterior
   */
  previousStep(): void {
    const currentState = this.tourStateSubject.value;
    if (currentState.currentStep > 0) {
      const prevStep = currentState.currentStep - 1;
      this.tourStateSubject.next({
        ...currentState,
        currentStep: prevStep
      });
      this.showStep(prevStep);
    }
  }

  /**
   * Completa o tour
   */
  completeTour(): void {
    this.markTourCompleted();
    this.stopTour();
  }

  /**
   * Pula o tour
   */
  skipTour(): void {
    this.markTourCompleted();
    this.stopTour();
  }

  /**
   * Obtém o passo atual
   */
  getCurrentStep(): TourStep | null {
    const currentState = this.tourStateSubject.value;
    if (currentState.isActive && currentState.currentStep < this.TOUR_STEPS.length) {
      return this.TOUR_STEPS[currentState.currentStep];
    }
    return null;
  }

  /**
   * Obtém todos os passos
   */
  getAllSteps(): TourStep[] {
    return [...this.TOUR_STEPS];
  }

  /**
   * Mostra um passo específico
   */
  private showStep(stepIndex: number): void {
    const step = this.TOUR_STEPS[stepIndex];
    if (!step) return;

    // Aguarda um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      this.hideAllHighlights();
      this.highlightElement(step.target);

      if (step.action) {
        step.action();
      }
    }, 100);
  }

  /**
   * Destaca um elemento
   */
  private highlightElement(selector: string): void {
    const element = document.querySelector(selector);
    if (element) {
      element.classList.add('tour-highlight');
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Remove todos os destaques
   */
  private hideAllHighlights(): void {
    const highlightedElements = document.querySelectorAll('.tour-highlight');
    highlightedElements.forEach(element => {
      element.classList.remove('tour-highlight');
    });
  }

  /**
   * Verifica se deve mostrar o tour automaticamente
   */
  shouldShowAutoTour(): boolean {
    return this.tourStateSubject.value.isFirstTime && !this.hasCompletedTour();
  }

  /**
   * Obtém o estado atual do tour
   */
  getCurrentState(): TourState {
    return this.tourStateSubject.value;
  }

  /**
   * Reseta o tour (para testes ou reset manual)
   */
  resetTour(): void {
    localStorage.removeItem(this.TOUR_STORAGE_KEY);
    localStorage.removeItem(this.FIRST_TIME_KEY);
    this.tourStateSubject.next({
      isActive: false,
      currentStep: 0,
      totalSteps: this.TOUR_STEPS.length,
      isFirstTime: true
    });
  }
} 
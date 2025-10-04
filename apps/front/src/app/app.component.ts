import { NgIf, NgClass } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { TopbarComponent } from './components/topbar/topbar.component';
import { CookieBannerComponent } from './components/cookie-banner/cookie-banner.component';
import { TourComponent } from './components/tour/tour.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { CustomNotificationComponent } from './components/custom-notification/custom-notification.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    NgIf,
    NgClass,
    TopbarComponent,
    CookieBannerComponent,
    TourComponent,
    ChatbotComponent,
    CustomNotificationComponent],
  template: `
    
  <!-- Header/Navigation -->
<header
  class="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm z-[60] h-16 md:h-16 h-20 border-b border-gray-200"
  *ngIf="exibirHeader">
  <div
    class="max-w-6xl mx-auto px-4 sm:px-5 h-full flex items-center justify-between"
  >
    <div class="flex items-center gap-2">
    <a routerLink="/" class="flex items-center gap-2 hover:opacity-80">
        <img src="assets/images/formsync-logo.svg" alt="FormSync Logo" class="w-8 h-8 mt-2">
        <span class="text-lg sm:text-xl font-bold text-blue-600">FormSync</span>
      </a>
    </div>

    <!-- Desktop CTA Buttons - Hidden on mobile -->
    <div class="hidden md:flex gap-3 lg:gap-4 items-center">
      <a
        routerLink="/login"
        class="text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg px-4 py-2.5 transition-colors text-base min-h-[44px] flex items-center"
        >Entrar</a
      >
      <a
        routerLink="/registrar"
        class="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 text-base min-h-[48px] flex items-center"
      >
        Começar por agora
      </a>
    </div>

    <!-- Mobile Menu Button -->
    <button
      class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
      (click)="toggleMobileMenu()"
      [attr.aria-expanded]="mobileMenuOpen"
      aria-label="Abrir menu de navegação"
    >
      <svg
        class="w-6 h-6 text-gray-700"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          *ngIf="!mobileMenuOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        ></path>
        <path
          *ngIf="mobileMenuOpen"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        ></path>
      </svg>
    </button>
  </div>

  <!-- Mobile Menu Overlay -->
  <div
    *ngIf="mobileMenuOpen"
    class="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[55] transition-opacity duration-300"
    (click)="closeMobileMenu()"
  ></div>

  <!-- Mobile Menu -->
  <div
    *ngIf="mobileMenuOpen"
    class="md:hidden fixed top-16 left-0 right-0 bg-white z-[60] border-t border-gray-100 transform transition-transform duration-300 ease-in-out">
    
    <!-- Menu Header -->
    <div class="px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-600">Menu</span>
        <button 
          (click)="closeMobileMenu()"
          class="p-1 rounded-lg hover:bg-gray-200 transition-colors">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Menu Content -->
    <nav class="px-4 py-4 space-y-2">
      <!-- Login Link -->
      <a routerLink="/login"
        class="block w-full text-left px-4 py-3 text-gray-700 font-medium hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 min-h-[48px] flex items-center"
        (click)="closeMobileMenu()">
        <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
        </svg>
        Entrar
      </a>

      <!-- CTA Button -->
      <a routerLink="/registrar"
        class="block w-full text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 min-h-[48px] flex items-center justify-center mt-4"
        (click)="closeMobileMenu()">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
        </svg>
        Começar agora
      </a>

      <!-- Additional Info -->
      <div class="pt-4 border-t border-gray-100">
        <p class="text-xs text-gray-500 text-center">
          7 dias grátis • Sem compromisso
        </p>
      </div>
    </nav>
  </div>
</header>

<!-- Topbar para páginas autenticadas -->
<app-topbar *ngIf="exibirTopbar"></app-topbar>

<!-- Conteúdo principal -->
<main role="main" [ngClass]="{'dashboard-layout': exibirTopbar}" class="min-h-screen">
  <router-outlet></router-outlet>
</main>

<!-- Banner de Cookies -->
<app-cookie-banner></app-cookie-banner>

<!-- Tour Guiado -->
<app-tour></app-tour>

<!-- Chatbot -->
<app-chatbot></app-chatbot>

<!-- Notificações Customizadas -->
<app-custom-notification></app-custom-notification>
  `,
  styleUrl: './app.css'
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    public router: Router,
    public authService: AuthService
  ) { }

  mobileMenuOpen: boolean = false;

  ngOnInit() {
    // O monitoramento será iniciado automaticamente pelo AuthService
    // quando um token for salvo
  }

  ngOnDestroy() {
    // Limpeza será feita automaticamente
  }

  get exibirTopbar(): boolean {
    // Mostra topbar apenas para rotas autenticadas
    const rotasPublicas = [
      '/',
      '/home',
      '/login',
      '/registrar',
      '/verificar-codigo',
      '/login-sucesso',
      '/demo',
      '/sucesso',
      '/termos',
      '/privacidade',
      '/cookies',
      '/gerenciar-cookies',
      '/contato'
    ];
    const urlSemQuery = this.router.url.split('?')[0];
    return !rotasPublicas.includes(urlSemQuery) && this.authService.estaAutenticado();
  }

  get exibirHeader(): boolean {
    // Mostra header apenas para rotas públicas, exceto as do Trello
    const rotasPublicas = [
      '/',
      '/home',
      '/login',
      '/registrar',
      '/verificar-codigo',
      '/login-sucesso',
      '/demo',
      '/sucesso',
      '/termos',
      '/privacidade',
      '/cookies',
      '/gerenciar-cookies',
      '/contato'
    ];

    // Rotas do Trello e páginas relacionadas que têm header próprio
    // Essas páginas não devem exibir o app-header pois têm design próprio
    const rotasTrello = [
      '/trello',
      '/trello-login',
      '/trello-register',
      '/faq',
      '/contato',
      '/termos',
      '/privacidade',
      '/cookies',
      '/demo'
    ];

    const urlSemQuery = this.router.url.split('?')[0];

    // Não exibe header para rotas do Trello e páginas relacionadas (elas têm design próprio)
    if (rotasTrello.includes(urlSemQuery)) {
      return false;
    }

    return rotasPublicas.includes(urlSemQuery);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}




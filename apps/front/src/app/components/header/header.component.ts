import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <!-- Header Moderno - Padrão Landing Page -->
    <header class="sticky top-0 z-[1000] w-full bg-white/95 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
      <div class="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        
        <!-- Logo FormSync - Design Profissional -->
        <a routerLink="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
          <div class="w-8 h-8 flex items-center justify-center">
            <img src="assets/images/formsync-logo.svg" alt="FormSync Logo" class="w-8 h-8">
          </div>
          <span class="text-base font-black text-blue-600">FormSync</span>
        </a>

        <!-- CTAs -->
        <div class="flex items-center gap-6">
          <!-- Login discreto -->
          <a routerLink="/login" class="hidden md:inline-flex text-gray-600 hover:text-gray-900 font-semibold text-base transition-colors duration-200">
            Entrar
          </a>
          
          <!-- CTA Principal -->
          <a routerLink="/registrar" [queryParams]="{ plano: 'PESSOAL' }" class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white font-bold text-base rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            Começar por agora
          </a>

          <!-- Menu Mobile -->
          <button 
            class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileMenuOpen"
            aria-label="Abrir menu de navegação">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path *ngIf="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              <path *ngIf="isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu Overlay -->
      <div *ngIf="isMobileMenuOpen" 
        class="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[55] transition-opacity duration-300"
        (click)="closeMobileMenu()">
      </div>

      <!-- Menu Mobile (quando aberto) -->
      <div *ngIf="isMobileMenuOpen" 
        class="md:hidden fixed top-16 left-0 right-0 bg-white z-[60] border-t border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out">
        
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
        <div class="px-4 py-4 space-y-2">
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
          <a routerLink="/registrar" [queryParams]="{ plano: 'PESSOAL' }" 
            class="block w-full text-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 min-h-[48px] flex items-center justify-center shadow-lg mt-4"
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
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  isMobileMenuOpen = false;

  constructor(private router: Router) { }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }
} 
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="bg-white border-t border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-16">
        <!-- Footer Main Content -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <!-- Logo + Description Column -->
          <div class="lg:col-span-1">
            <div class="mb-6">
              <div class="flex items-center gap-2 mb-4">
                <img src="assets/images/formsync-logo.svg" alt="FormSync Logo" class="w-6 h-6">
                <h3 class="text-lg font-bold text-blue-600">FormSync</h3>
              </div>
              <p class="text-gray-600 text-sm leading-relaxed">
                Automatize formulários em qualquer site com templates personalizados. 
                Economize horas todos os dias com 100% de precisão.
              </p>
            </div>
            
            <!-- Social Links -->
            <div class="flex gap-4">
              <a
                href="https://www.linkedin.com/company/formsync"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Produto Column -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-6">Produto</h4>
            <nav class="space-y-4">
              <a routerLink="/" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Funcionalidades
              </a>
              <a routerLink="/registrar" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Preços
              </a>
            </nav>
          </div>

          <!-- Suporte Column -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-6">Suporte</h4>
            <nav class="space-y-4">
              <a routerLink="/faq" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Perguntas Frequentes
              </a>
              <a routerLink="/contato" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Central de ajuda
              </a>
              <a routerLink="/contato" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Contato
              </a>
              <a href="https://wa.me/5511947033324" target="_blank" rel="noopener noreferrer" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                WhatsApp
              </a>
            </nav>
          </div>

          <!-- Legal Column -->
          <div>
            <h4 class="text-sm font-semibold text-gray-900 mb-6">Legal</h4>
            <nav class="space-y-4">
              <a routerLink="/termos" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Termos de uso
              </a>
              <a routerLink="/privacidade" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Privacidade
              </a>
              <a routerLink="/cookies" class="block text-gray-600 hover:text-indigo-600 transition-colors duration-200 text-sm">
                Cookies
              </a>
            </nav>
          </div>
        </div>

        <!-- Footer Bottom -->
        <div class="border-t border-gray-200 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex flex-col items-start gap-2">
              <p class="text-gray-500 text-xs">
                © 2024 FormSync. Todos os direitos reservados.
              </p>
              <div class="flex items-center gap-2">
                <span class="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  BETA
                </span>
                <span class="text-gray-400 text-xs">Versão em desenvolvimento</span>
              </div>
            </div>
            <div class="flex items-center gap-8">
              <a routerLink="/termos" class="text-gray-500 text-xs hover:text-indigo-600 transition-colors duration-200">
                Termos
              </a>
              <a routerLink="/privacidade" class="text-gray-500 text-xs hover:text-indigo-600 transition-colors duration-200">
                Privacidade
              </a>
              <a routerLink="/cookies" class="text-gray-500 text-xs hover:text-indigo-600 transition-colors duration-200">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent { }

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { PlanCalculatorComponent } from '../plan-calculator/plan-calculator.component';

@Component({
  selector: 'app-plan-calculator-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    FooterComponent,
    PlanCalculatorComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 w-full">
      <!-- Layout Principal -->
      <div class="flex min-h-screen w-full">
        <!-- Sidebar -->
        <app-sidebar></app-sidebar>

        <!-- Conteúdo Principal - Sem restrições de largura -->
        <main class="flex-1 p-6 w-full min-w-0">
          <!-- Header da Página -->
          <div class="mb-8 w-full">
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900">Calculadora de Planos</h1>
                <p class="text-gray-600">Descubra o plano ideal para suas necessidades</p>
              </div>
            </div>
          </div>

          <!-- Introdução -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200 w-full">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">Como funciona?</h3>
                <p class="text-blue-800 text-sm leading-relaxed">
                  Nossa calculadora inteligente analisa suas necessidades específicas e recomenda o plano perfeito. 
                  Responda apenas 2 perguntas simples e receba uma recomendação personalizada baseada no número de 
                  formulários e campos que você precisa gerenciar.
                </p>
              </div>
            </div>
          </div>

          <!-- Calculadora - Ocupando toda a largura disponível -->
          <div class="w-full min-w-0">
            <app-plan-calculator></app-plan-calculator>
          </div>

          <!-- Informações Adicionais -->
          <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Benefício 1 -->
            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Recomendação Precisa</h4>
              <p class="text-gray-600 text-sm">
                Algoritmo inteligente que analisa suas necessidades reais e sugere o plano mais adequado.
              </p>
            </div>

            <!-- Benefício 2 -->
            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Economia de Tempo</h4>
              <p class="text-gray-600 text-sm">
                Evite escolher planos inadequados e economize tempo com nossa análise automatizada.
              </p>
            </div>

            <!-- Benefício 3 -->
            <div class="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Suporte Personalizado</h4>
              <p class="text-gray-600 text-sm">
                Receba orientações específicas para seu caso de uso e necessidades profissionais.
              </p>
            </div>
          </div>

          <!-- CTA Final -->
          <div class="mt-12 text-center">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
              <h3 class="text-2xl font-bold mb-4 text-white">Pronto para começar?</h3>
              <p class="text-indigo-100 mb-6">
                Use nossa calculadora para encontrar o plano ideal e comece a organizar seus formulários hoje mesmo!
              </p>
              <button 
                routerLink="/upgrade"
                class="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-200 hover:scale-105 shadow-lg">
                Ver todos os planos
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styleUrl: './plan-calculator-page.component.css'
})
export class PlanCalculatorPageComponent {
  // Componente simples, sem lógica adicional necessária
}

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <section class="bg-indigo-600 text-white py-16 sm:py-20">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
          Perguntas Frequentes
        </h1>
        <p class="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto">
          Tire suas dúvidas sobre o FormSync e como automatizar seus formulários
        </p>
      </div>
    </section>

    <!-- FAQ Content -->
    <section class="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-white">
      <div class="max-w-4xl mx-auto">
        
        <!-- Navegação rápida -->
        <div class="mb-12 sm:mb-16">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Navegação rápida</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a href="#funcionamento" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <h3 class="font-semibold text-gray-900 mb-1">Como funciona</h3>
              <p class="text-sm text-gray-600">Entenda o processo</p>
            </a>
            <a href="#seguranca" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <h3 class="font-semibold text-gray-900 mb-1">Segurança</h3>
              <p class="text-sm text-gray-600">Proteção dos dados</p>
            </a>
            <a href="#compatibilidade" class="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <h3 class="font-semibold text-gray-900 mb-1">Compatibilidade</h3>
              <p class="text-sm text-gray-600">Navegadores e sites</p>
            </a>
          </div>
        </div>

        <!-- FAQ Items -->
        <div class="space-y-6">
          
          <!-- Seção: Como funciona -->
          <div id="funcionamento">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
              Como funciona
            </h2>
            
            <div class="space-y-4">
              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    É uma extensão de navegador?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Sim, usamos uma extensão leve que conecta seus dados com qualquer site da web. É segura, rápida e não rastreia
                    sua navegação. A extensão apenas facilita o preenchimento automático dos formulários que você autorizar.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Como o FormSync detecta os campos automaticamente?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Nossa inteligência artificial analisa a estrutura do formulário e identifica os campos por suas características 
                    (nome, tipo, placeholder, etc.). Depois conecta automaticamente com os dados do seu template correspondente.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Preciso de cartão de crédito para testar?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Não! O plano gratuito não requer cartão de crédito. Você pode testar completamente grátis e fazer upgrade
                    quando quiser. O plano Free inclui 1 template com até 5 campos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção: Segurança -->
          <div id="seguranca" class="pt-8">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
              Segurança e Privacidade
            </h2>
            
            <div class="space-y-4">
              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    É seguro? Meus dados ficam protegidos?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Absolutamente. Seus dados ficam salvos com criptografia de ponta a ponta e só você tem acesso. Nunca
                    compartilhamos suas informações. Além disso, você pode escolher manter seus dados apenas localmente no seu dispositivo.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Onde ficam armazenados os Meus Formulários?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Você pode escolher: armazenamento local (no seu dispositivo) ou na nuvem criptografada. 
                    O armazenamento na nuvem permite sincronizar entre dispositivos e fazer backup automático.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    A extensão pode ver outros sites que eu visito?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Não. A extensão só atua quando você ativa o preenchimento automático em formulários específicos. 
                    Não rastreamos sua navegação nem coletamos dados de outros sites.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção: Compatibilidade -->
          <div id="compatibilidade" class="pt-8">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
              Compatibilidade
            </h2>
            
            <div class="space-y-4">
              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Funciona em qualquer navegador?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Sim. Chrome, Edge, Firefox e Brave. A extensão é compatível com todos os navegadores modernos.
                    Mantenha sempre a versão mais recente para melhor performance.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Funciona em sites governamentais?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Sim! O FormSync funciona em qualquer site, incluindo portais governamentais, bancos, e-commerce e muito mais.
                    Nossa IA se adapta a diferentes tipos de formulários automaticamente.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Funciona em formulários com captcha?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    O FormSync preenche automaticamente os campos de texto, mas elementos de segurança como captcha 
                    precisam ser resolvidos manualmente por você, por questões de segurança.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Seção: Planos e Pagamento -->
          <div class="pt-8">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
              Planos e Pagamento
            </h2>
            
            <div class="space-y-4">
              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Posso cancelar a qualquer momento?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Sim! Você pode cancelar sua assinatura a qualquer momento. Seus dados ficam salvos e você pode continuar
                    usando o plano gratuito. Não há taxas de cancelamento.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Vocês oferecem garantia de reembolso?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    Sim! Oferecemos garantia de 7 dias ou seu dinheiro de volta. Se você não ficar satisfeito com o FormSync,
                    devolvemos 100% do seu dinheiro sem perguntas.
                  </p>
                </div>
              </div>

              <div class="border border-gray-200 rounded-lg">
                <div class="p-4 sm:p-6 border-b border-gray-200">
                  <h3 class="text-base sm:text-lg font-semibold text-gray-900">
                    Como funciona o upgrade de planos?
                  </h3>
                </div>
                <div class="p-4 sm:p-6 bg-gray-50">
                  <p class="text-gray-700 leading-relaxed text-sm sm:text-base">
                    O upgrade é instantâneo. Você paga apenas a diferença proporcional do período restante.
                    Todos os seus dados e templates são mantidos automaticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- CTA Final -->
        <div class="mt-16 sm:mt-20 text-center">
          <div class="bg-indigo-50 rounded-lg p-6 sm:p-8">
            <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Ainda tem dúvidas?
            </h3>
            <p class="text-gray-600 mb-6">
              Nossa equipe de suporte está pronta para ajudar você
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                routerLink="/contato"
                class="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Entrar em contato
              </a>
              <a 
                href="mailto:suporte@formsync.com"
                class="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
              >
                Enviar email
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
    
    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styles: [`
    html {
      scroll-behavior: smooth;
    }
  `]
})
export class FaqComponent { }

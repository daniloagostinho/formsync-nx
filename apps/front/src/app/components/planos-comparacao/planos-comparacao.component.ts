import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PLANOS_CONFIG, PlanoConfig } from '../../shared/planos-config';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-planos-comparacao',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule,
    FooterComponent
  ],
  template: `
    <div class="planos-comparacao">
      <div class="comparacao-header">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          📊 Comparação Detalhada dos Planos
        </h2>
        <p class="text-gray-600 mb-6">
          Escolha o plano ideal comparando recursos, limites e preços
        </p>
      </div>

      <!-- Tabela de Comparação -->
      <div class="comparacao-table-container">
        <table class="comparacao-table">
          <thead>
            <tr>
              <th class="feature-header">Recursos</th>
              <th class="plano-header plano-pessoal">
                <div class="plano-info">
                  <h3>{{ planos['PESSOAL'].nome }}</h3>
                  <div class="preco">{{ planos['PESSOAL'].precoFormatado }}</div>
                </div>
              </th>
              <th class="plano-header plano-profissional">
                <div class="plano-info">
                  <h3>{{ planos['PROFISSIONAL_MENSAL'].nome }}</h3>
                  <div class="preco">{{ planos['PROFISSIONAL_MENSAL'].precoFormatado }}</div>
                  <div class="badge-popular">★ Mais Popular</div>
                </div>
              </th>
              <th class="plano-header plano-vitalicio">
                <div class="plano-info">
                  <h3>{{ planos['PROFISSIONAL_VITALICIO'].nome }}</h3>
                  <div class="preco">{{ planos['PROFISSIONAL_VITALICIO'].precoFormatado }}</div>
                  <div class="badge-vitalicio">
                    <mat-icon>star</mat-icon>
                    <span>Vitalício</span>
                  </div>
                </div>
              </th>
              <th class="plano-header plano-empresarial">
                <div class="plano-info">
                  <h3>{{ planos['EMPRESARIAL'].nome }}</h3>
                  <div class="preco">{{ planos['EMPRESARIAL'].precoFormatado }}</div>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Limites de Templates -->
            <tr>
              <td class="feature-name">
                <div class="feature-info">
                  <mat-icon>folder</mat-icon>
                  <span>Formulários</span>
                </div>
              </td>
              <td class="feature-value">{{ planos['PESSOAL'].limiteTemplates }}</td>
              <td class="feature-value">{{ planos['PROFISSIONAL_MENSAL'].limiteTemplates }}</td>
              <td class="feature-value">{{ planos['PROFISSIONAL_VITALICIO'].limiteTemplates }}</td>
              <td class="feature-value">{{ planos['EMPRESARIAL'].limiteTemplates }}</td>
            </tr>

            <!-- Limites de Campos -->
            <tr>
              <td class="feature-name">
                <div class="feature-info">
                  <mat-icon>description</mat-icon>
                  <span>Campos Total</span>
                </div>
              </td>
              <td class="feature-value">{{ planos['PESSOAL'].limiteTotalCampos }}</td>
              <td class="feature-value">{{ planos['PROFISSIONAL_MENSAL'].limiteTotalCampos }}</td>
              <td class="feature-value">{{ planos['PROFISSIONAL_VITALICIO'].limiteTotalCampos }}</td>
              <td class="feature-value">{{ planos['EMPRESARIAL'].limiteTotalCampos }}</td>
            </tr>

            <!-- Limites por Template -->
            <tr>
              <td class="feature-name">
                <div class="feature-info">
                  <mat-icon>article</mat-icon>
                  <span>Campos por Template</span>
                </div>
              </td>
              <td class="feature-value">{{ planos['PESSOAL'].limiteCamposPorTemplate }}</td>
              <td class="feature-value">{{ planos['PROFISSIONAL_MENSAL'].limiteCamposPorTemplate }}</td>
              <td class="feature-value">{{ planos['PROFISSIONAL_VITALICIO'].limiteCamposPorTemplate }}</td>
              <td class="feature-value">{{ planos['EMPRESARIAL'].limiteCamposPorTemplate }}</td>
            </tr>

            <!-- Upload CSV -->
            <tr>
              <td class="feature-name">
                <div class="feature-info">
                  <mat-icon>upload_file</mat-icon>
                  <span>Upload CSV</span>
                </div>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-no">close</mat-icon>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-yes">check</mat-icon>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-yes">check</mat-icon>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-yes">check</mat-icon>
              </td>
            </tr>

            <!-- Agendamento -->
            <tr>
              <td class="feature-name">
                <div class="feature-info">
                  <mat-icon>schedule</mat-icon>
                  <span>Agendamento</span>
                </div>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-no">close</mat-icon>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-no">close</mat-icon>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-no">close</mat-icon>
              </td>
              <td class="feature-value">
                <mat-icon class="feature-icon-yes">check</mat-icon>
              </td>
            </tr>

            <!-- Suporte -->
            <tr>
              <td class="feature-name">
                <div class="feature-info">
                  <mat-icon>support_agent</mat-icon>
                  <span>Suporte</span>
                </div>
              </td>
              <td class="feature-value">Email</td>
              <td class="feature-value">Prioritário</td>
              <td class="feature-value">Vitalício</td>
              <td class="feature-value">Empresarial</td>
            </tr>

            <!-- Atualizações -->
            <tr>
              <td class="feature-name">
                <div class="feature-info">
                  <mat-icon>system_update</mat-icon>
                  <span>Atualizações</span>
                </div>
              </td>
              <td class="feature-value">Básicas</td>
              <td class="feature-value">Automáticas</td>
              <td class="feature-value">Gratuitas</td>
              <td class="feature-value">Prioritárias</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Cards de Recomendação -->
      <div class="recomendacoes mt-8">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">
          💡 Recomendações por Perfil
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Pessoal -->
          <div class="recomendacao-card">
            <div class="recomendacao-header pessoal">
              <mat-icon>person</mat-icon>
              <h4>Pessoal</h4>
            </div>
            <p class="recomendacao-text">
              Ideal para testar o sistema e uso básico. Até 3 formulários com 30 campos total.
            </p>
            <div class="recomendacao-preco">Gratuito</div>
          </div>

          <!-- Profissional Mensal -->
          <div class="recomendacao-card">
            <div class="recomendacao-header profissional">
              <mat-icon>work</mat-icon>
              <h4>Profissional</h4>
            </div>
            <p class="recomendacao-text">
              Para freelancers e profissionais ativos. 25 formulários com 500 campos e upload CSV.
            </p>
            <div class="recomendacao-preco">R$ 19,90/mês</div>
            <div class="badge-recomendacao">
              <mat-icon>star</mat-icon>
              <span>Mais Popular</span>
            </div>
          </div>

          <!-- Profissional Vitalício -->
          <div class="recomendacao-card">
            <div class="recomendacao-header vitalicio">
              <mat-icon>star</mat-icon>
              <h4>Vitalício</h4>
            </div>
            <p class="recomendacao-text">
              Investimento único. 50 formulários com 1000 campos. Economia a longo prazo.
            </p>
            <div class="recomendacao-preco">R$ 299,90</div>
            <div class="nota-vitalicio">
              <mat-icon>info</mat-icon>
              <span>Ideal para uso intensivo</span>
            </div>
          </div>

          <!-- Empresarial -->
          <div class="recomendacao-card">
            <div class="recomendacao-header empresarial">
              <mat-icon>business</mat-icon>
              <h4>Empresarial</h4>
            </div>
            <p class="recomendacao-text">
              Para equipes e empresas. 100 formulários com 2000 campos e agendamento.
            </p>
            <div class="recomendacao-preco">R$ 99,90/mês</div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="cta-section mt-8 text-center">
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          🚀 Pronto para começar?
        </h3>
        <p class="text-gray-600 mb-4">
          Escolha o plano ideal e comece a organizar seus formulários hoje mesmo!
        </p>
        <button mat-raised-button color="primary" class="cta-button">
          <mat-icon>rocket_launch</mat-icon>
          Escolher Plano
        </button>
      </div>
    </div>
    
    <!-- Footer -->
    <app-footer></app-footer>
  `,
  styleUrl: './planos-comparacao.component.css'
})
export class PlanosComparacaoComponent {
  planos: Record<string, PlanoConfig> = PLANOS_CONFIG;
}

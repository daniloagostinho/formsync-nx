import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-loading-skeleton',
  imports: [CommonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loading-skeleton-card">
      <div class="flex justify-center items-center h-96 p-8">
        <div class="text-center">
          <div class="loading-spinner h-16 w-16 mx-auto"></div>
          <h3 class="mt-6 text-2xl font-bold text-gray-700">
            {{ titulo || 'Carregando...' }}
          </h3>
          <p class="text-gray-500 mt-3 text-lg">
            {{ mensagem || 'Aguarde enquanto preparamos suas informações...' }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-skeleton-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 24px;
      transition: all 0.2s ease;
    }
    
    .loading-spinner {
      border: 2px solid #e5e7eb;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() titulo: string = '';
  @Input() mensagem: string = '';
}

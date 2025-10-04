import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [disabled]="loading || disabled"
      [attr.aria-describedby]="ariaDescribedBy"
      [attr.aria-label]="ariaLabel"
      (click)="onClick.emit($event)"
      class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
    >
      <div *ngIf="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
      <mat-icon *ngIf="!loading && icon" class="text-white">{{ icon }}</mat-icon>
      {{ loading ? loadingText : text }}
    </button>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LoadingButtonComponent {
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() text: string = 'Enviar';
  @Input() loadingText: string = 'Enviando...';
  @Input() icon: string = '';
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() ariaDescribedBy: string = '';
  @Input() ariaLabel: string = '';
  @Output() onClick = new EventEmitter<Event>();
} 
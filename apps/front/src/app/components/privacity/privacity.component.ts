import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-privacity',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './privacity.component.html',
  styleUrl: './privacity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyComponent {
  dataAtualizacao = new Date('2024-12-19');
} 
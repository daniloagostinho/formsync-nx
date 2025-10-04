import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FooterComponent
  ],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent {
  dataAtualizacao = new Date('2024-12-19');
  dataInicioBeta = new Date('2024-12-01');
  dataFimBeta = new Date('2025-03-31');
} 
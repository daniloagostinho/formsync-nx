import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div style="padding: 40px; text-align: center;">
      <h2>Demo da Extensão</h2>
      <p>Aqui vai a demonstração da extensão FormSync.</p>
      <p>Esta página mostrará como a extensão funciona na prática.</p>
    </div>
    
    <!-- Footer -->
    <app-footer></app-footer>
  `
})
export class DemoComponent { } 
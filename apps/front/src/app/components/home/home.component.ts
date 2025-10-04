import { Component, OnInit, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.initTypingAnimations();
  }

  private initTypingAnimations(): void {
    // Aguarda um pouco para garantir que o DOM está pronto
    setTimeout(() => {
      this.startTypingAnimation();
    }, 500);
  }

  private startTypingAnimation(): void {
    const typingElements = document.querySelectorAll('.typing-animation, .typing-animation-delayed');

    typingElements.forEach((element, index) => {
      const text = element.getAttribute('data-text') || '';
      const delay = index * 2500; // Delay progressivo entre elementos

      setTimeout(() => {
        this.typeText(element as HTMLElement, text);
      }, delay);
    });
  }

  private typeText(element: HTMLElement, text: string): void {
    let currentText = '';
    let charIndex = 0;
    const typingSpeed = 50; // Velocidade da digitação em ms

    // Adiciona classe para mostrar o cursor
    element.classList.add('typing');

    const typeInterval = setInterval(() => {
      if (charIndex < text.length) {
        currentText += text.charAt(charIndex);
        element.textContent = currentText;
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // Remove a classe de typing e adiciona a classe de animado
        element.classList.remove('typing');
        element.classList.add('animated');

        // Remove o cursor após a animação
        setTimeout(() => {
          element.style.borderRight = 'none';
        }, 1000);
      }
    }, typingSpeed);
  }

  // Método para reiniciar as animações (útil para testes)
  restartTypingAnimation(): void {
    const typingElements = document.querySelectorAll('.typing-animation, .typing-animation-delayed');

    typingElements.forEach(element => {
      element.classList.remove('animated', 'typing');
      element.textContent = '';
      (element as HTMLElement).style.borderRight = '3px solid transparent';
    });

    // Aguarda um pouco e reinicia
    setTimeout(() => {
      this.startTypingAnimation();
    }, 100);
  }
} 
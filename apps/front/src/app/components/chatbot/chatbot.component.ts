import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SUPPORT_CONFIG } from '../../config/support.config';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  isContactOpen: boolean = false;

  toggleContact(): void {
    this.isContactOpen = !this.isContactOpen;
  }

  openWhatsApp(): void {
    const config = SUPPORT_CONFIG.whatsapp;

    // Mensagem simplificada
    const message = encodeURIComponent(
      `${config.defaultMessage} FormSync - Templates universais para qualquer site. Página: ${window.location.href}`
    );

    // URL do WhatsApp
    const whatsappUrl = `https://wa.me/${config.phoneNumber}?text=${message}`;

    // Abrir em nova aba
    window.open(whatsappUrl, '_blank');
  }
} 
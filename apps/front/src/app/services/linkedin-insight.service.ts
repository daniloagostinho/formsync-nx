import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    _linkedin_data_partner_id: string;
    _linkedin_partner_id: string;
    lintrk: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class LinkedInInsightService {

  private partnerId = 'YOUR_LINKEDIN_PARTNER_ID';

  constructor(private router: Router) {
    this.initializeInsightTag();
  }

  /**
   * Inicializa o LinkedIn Insight Tag
   */
  private initializeInsightTag(): void {
    // Configura o LinkedIn Insight Tag
    window._linkedin_data_partner_id = this.partnerId;
    window._linkedin_partner_id = this.partnerId;

    // Carrega o script do LinkedIn
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    document.head.appendChild(script);

    // Rastreia navegação de páginas
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  /**
   * Rastreia visualização de página
   */
  trackPageView(url: string): void {
    if (typeof window.lintrk !== 'undefined') {
      window.lintrk('track', {
        conversion_id: 0,
        value: 0
      });
    }
  }

  /**
   * Rastreia conversões
   */
  trackConversion(conversionId: number, value: number, currency: string = 'BRL'): void {
    if (typeof window.lintrk !== 'undefined') {
      window.lintrk('track', {
        conversion_id: conversionId,
        value: value,
        currency: currency
      });
    }
  }

  /**
   * Rastreia cadastros
   */
  trackRegistration(): void {
    this.trackConversion(123456, 0); // ID de conversão para cadastros
  }

  /**
   * Rastreia compras
   */
  trackPurchase(value: number): void {
    this.trackConversion(123457, value); // ID de conversão para compras
  }

  /**
   * Rastreia downloads
   */
  trackDownload(): void {
    this.trackConversion(123458, 0); // ID de conversão para downloads
  }

  /**
   * Rastreia demonstrações
   */
  trackDemo(): void {
    this.trackConversion(123459, 0); // ID de conversão para demonstrações
  }

  /**
   * Rastreia contatos
   */
  trackContact(): void {
    this.trackConversion(123460, 0); // ID de conversão para contatos
  }
} 
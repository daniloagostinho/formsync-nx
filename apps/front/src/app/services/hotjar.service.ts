import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HotjarService {

  private hotjarId = 1234567; // Substitua pelo seu ID do Hotjar

  constructor() {
    this.initializeHotjar();
  }

  /**
   * Inicializa o Hotjar
   */
  private initializeHotjar(): void {
    // Configura o Hotjar
    window._hjSettings = {
      hjid: this.hotjarId,
      hjsv: 6
    };

    // Carrega o script do Hotjar
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://static.hotjar.com/c/hotjar-' + this.hotjarId + '.js?sv=6';
    document.head.appendChild(script);
  }

  /**
   * Rastreia eventos personalizados
   */
  trackEvent(eventName: string, parameters?: { [key: string]: any }): void {
    if (typeof window.hj !== 'undefined') {
      window.hj('event', eventName, parameters);
    }
  }

  /**
   * Rastreia conversões
   */
  trackConversion(conversionType: string, value?: number): void {
    this.trackEvent('conversion', {
      type: conversionType,
      value: value
    });
  }

  /**
   * Rastreia cadastros
   */
  trackRegistration(): void {
    this.trackEvent('registration');
  }

  /**
   * Rastreia downloads
   */
  trackDownload(fileName: string): void {
    this.trackEvent('download', {
      file_name: fileName
    });
  }

  /**
   * Rastreia cliques em botões
   */
  trackButtonClick(buttonName: string, page?: string): void {
    this.trackEvent('button_click', {
      button_name: buttonName,
      page: page || window.location.pathname
    });
  }

  /**
   * Rastreia visualização de planos
   */
  trackPlanView(planName: string): void {
    this.trackEvent('plan_view', {
      plan_name: planName
    });
  }

  /**
   * Rastreia seleção de planos
   */
  trackPlanSelection(planName: string, planPrice: number): void {
    this.trackEvent('plan_selection', {
      plan_name: planName,
      plan_price: planPrice
    });
  }

  /**
   * Rastreia demonstrações
   */
  trackDemo(): void {
    this.trackEvent('demo_viewed');
  }

  /**
   * Rastreia contatos
   */
  trackContact(): void {
    this.trackEvent('contact');
  }

  /**
   * Rastreia erros
   */
  trackError(errorMessage: string): void {
    this.trackEvent('error', {
      message: errorMessage
    });
  }

  /**
   * Rastreia tempo na página
   */
  trackTimeOnPage(timeSpent: number): void {
    this.trackEvent('time_on_page', {
      time_spent: timeSpent
    });
  }

  /**
   * Rastreia scroll
   */
  trackScroll(depth: number): void {
    this.trackEvent('scroll', {
      depth: depth
    });
  }
} 
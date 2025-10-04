import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

@Injectable({
  providedIn: 'root'
})
export class GtmService {

  private gtmId = 'GTM-XXXXXXX'; // Substitua pelo seu ID do GTM

  constructor(private router: Router) {
    this.initializeGTM();
  }

  /**
   * Inicializa o Google Tag Manager
   */
  private initializeGTM(): void {
    // Configura o dataLayer
    window.dataLayer = window.dataLayer || [];

    // Carrega o script do GTM
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${this.gtmId}');
    `;
    document.head.appendChild(script);

    // Adiciona o noscript do GTM
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${this.gtmId}`;
    iframe.height = '0';
    iframe.width = '0';
    iframe.style.display = 'none';
    iframe.style.visibility = 'hidden';
    noscript.appendChild(iframe);
    document.head.appendChild(noscript);

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
    window.dataLayer.push({
      event: 'page_view',
      page_path: url,
      page_title: this.getPageTitle(url)
    });
  }

  /**
   * Rastreia eventos personalizados
   */
  trackEvent(eventName: string, parameters?: { [key: string]: any }): void {
    window.dataLayer.push({
      event: eventName,
      ...parameters
    });
  }

  /**
   * Rastreia conversões
   */
  trackConversion(conversionType: string, value?: number): void {
    this.trackEvent('conversion', {
      conversion_type: conversionType,
      value: value,
      currency: 'BRL'
    });
  }

  /**
   * Rastreia cadastros
   */
  trackRegistration(): void {
    this.trackEvent('registration');
  }

  /**
   * Rastreia compras
   */
  trackPurchase(planName: string, planPrice: number): void {
    this.trackEvent('purchase', {
      plan_name: planName,
      value: planPrice,
      currency: 'BRL'
    });
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
      page: page || this.router.url
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
  trackError(errorMessage: string, errorCode?: string): void {
    this.trackEvent('error', {
      error_message: errorMessage,
      error_code: errorCode,
      page: this.router.url
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
      scroll_depth: depth
    });
  }

  /**
   * Rastreia interações com extensão
   */
  trackExtensionInteraction(action: string, success: boolean): void {
    this.trackEvent('extension_interaction', {
      action: action,
      success: success
    });
  }

  /**
   * Obtém o título da página baseado na URL
   */
  private getPageTitle(url: string): string {
    const pageTitles: { [key: string]: string } = {
      '/': 'FormSync - Preenchimento Inteligente de Formulários',
      '/registrar': 'Cadastre-se Grátis | FormSync',
      '/login': 'Login | FormSync',
      '/demo': 'Demonstração | FormSync',
      '/planos': 'Planos e Preços | FormSync',
      '/faq': 'Perguntas Frequentes | FormSync',
      '/sobre': 'Sobre Nós | FormSync',
      '/contato': 'Contato | FormSync'
    };

    return pageTitles[url] || 'FormSync';
  }
} 
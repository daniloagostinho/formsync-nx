import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FacebookPixelService {

  private pixelId = 'YOUR_PIXEL_ID';

  constructor(private router: Router) {
    this.initializePixel();
  }

  /**
   * Inicializa o Facebook Pixel
   */
  private initializePixel(): void {
    // Carrega o script do Facebook Pixel
    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${this.pixelId}');
      fbq('track', 'PageView');
    `;
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
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', 'PageView', {
        page_path: url,
        page_title: this.getPageTitle(url)
      });
    }
  }

  /**
   * Rastreia eventos personalizados
   */
  trackEvent(eventName: string, parameters?: { [key: string]: any }): void {
    if (typeof window.fbq !== 'undefined') {
      window.fbq('track', eventName, parameters);
    }
  }

  /**
   * Rastreia conversões
   */
  trackConversion(value: number, currency: string = 'BRL'): void {
    this.trackEvent('Purchase', {
      value: value,
      currency: currency
    });
  }

  /**
   * Rastreia cadastros
   */
  trackRegistration(): void {
    this.trackEvent('CompleteRegistration');
  }

  /**
   * Rastreia downloads
   */
  trackDownload(fileName: string): void {
    this.trackEvent('Download', {
      content_name: fileName
    });
  }

  /**
   * Rastreia cliques em botões
   */
  trackButtonClick(buttonName: string): void {
    this.trackEvent('CustomEvent', {
      event_name: 'button_click',
      button_name: buttonName
    });
  }

  /**
   * Rastreia visualização de conteúdo
   */
  trackContentView(contentName: string, contentType: string): void {
    this.trackEvent('ViewContent', {
      content_name: contentName,
      content_type: contentType
    });
  }

  /**
   * Rastreia adição ao carrinho (para planos)
   */
  trackAddToCart(planName: string, planPrice: number): void {
    this.trackEvent('AddToCart', {
      content_name: planName,
      value: planPrice,
      currency: 'BRL'
    });
  }

  /**
   * Rastreia início de checkout
   */
  trackInitiateCheckout(planName: string, planPrice: number): void {
    this.trackEvent('InitiateCheckout', {
      content_name: planName,
      value: planPrice,
      currency: 'BRL'
    });
  }

  /**
   * Rastreia início de teste gratuito
   */
  trackStartTrial(): void {
    this.trackEvent('StartTrial');
  }

  /**
   * Rastreia contato
   */
  trackContact(): void {
    this.trackEvent('Contact');
  }

  /**
   * Rastreia demonstração
   */
  trackDemo(): void {
    this.trackEvent('CustomEvent', {
      event_name: 'demo_viewed'
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
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CookieConsentService {
  private consentSubject = new BehaviorSubject<CookieConsent | null>(null);
  public consent$ = this.consentSubject.asObservable();

  constructor() {
    this.loadConsent();
  }

  /**
   * Carrega o consentimento salvo no localStorage
   */
  private loadConsent(): void {
    const savedConsent = localStorage.getItem('cookieConsent');
    if (savedConsent) {
      try {
        const consent = JSON.parse(savedConsent);
        this.consentSubject.next(consent);
      } catch (error) {
        console.error('Erro ao carregar consentimento de cookies:', error);
        this.clearConsent();
      }
    }
  }

  /**
   * Salva o consentimento do usuário
   */
  saveConsent(consent: CookieConsent): void {
    localStorage.setItem('cookieConsent', JSON.stringify(consent));
    this.consentSubject.next(consent);
    
    // Emite evento para outros componentes
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: consent 
    }));
  }

  /**
   * Obtém o consentimento atual
   */
  getConsent(): CookieConsent | null {
    return this.consentSubject.value;
  }

  /**
   * Verifica se o usuário já deu consentimento
   */
  hasConsent(): boolean {
    return this.consentSubject.value !== null;
  }

  /**
   * Verifica se analytics está permitido
   */
  isAnalyticsAllowed(): boolean {
    const consent = this.getConsent();
    return consent?.analytics === true;
  }

  /**
   * Verifica se marketing está permitido
   */
  isMarketingAllowed(): boolean {
    const consent = this.getConsent();
    return consent?.marketing === true;
  }

  /**
   * Verifica se cookies essenciais estão permitidos (sempre true)
   */
  isEssentialAllowed(): boolean {
    return true; // Cookies essenciais são sempre permitidos
  }

  /**
   * Limpa o consentimento salvo
   */
  clearConsent(): void {
    localStorage.removeItem('cookieConsent');
    this.consentSubject.next(null);
  }

  /**
   * Atualiza apenas uma categoria de consentimento
   */
  updateConsentCategory(category: keyof CookieConsent, value: boolean): void {
    const currentConsent = this.getConsent();
    if (currentConsent) {
      const updatedConsent = {
        ...currentConsent,
        [category]: value,
        timestamp: new Date().toISOString()
      };
      this.saveConsent(updatedConsent);
    }
  }

  /**
   * Aceita todos os cookies
   */
  acceptAll(): void {
    const consent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    };
    this.saveConsent(consent);
  }

  /**
   * Rejeita todos os cookies opcionais
   */
  rejectAll(): void {
    const consent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    };
    this.saveConsent(consent);
  }

  /**
   * Verifica se o consentimento expirou (mais de 1 ano)
   */
  isConsentExpired(): boolean {
    const consent = this.getConsent();
    if (!consent?.timestamp) return true;

    const consentDate = new Date(consent.timestamp);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    return consentDate < oneYearAgo;
  }

  /**
   * Obtém estatísticas de consentimento (para analytics)
   */
  getConsentStats(): { analytics: number; marketing: number; total: number } {
    const consent = this.getConsent();
    if (!consent) return { analytics: 0, marketing: 0, total: 0 };

    return {
      analytics: consent.analytics ? 1 : 0,
      marketing: consent.marketing ? 1 : 0,
      total: 1
    };
  }
} 
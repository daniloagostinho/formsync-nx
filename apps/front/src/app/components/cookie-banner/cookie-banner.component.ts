import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { CookieConsentService } from '../../services/cookie-consent.service';
import { CookieConsent } from '../../models/cookie-consent.model';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatExpansionModule
  ],
  template: `
    <div *ngIf="showBanner" class="cookie-banner-overlay">
      <div class="cookie-banner-container">
        <mat-card class="cookie-banner-card">
          <div class="cookie-banner-header">
            <div class="cookie-banner-icon">
              <mat-icon>cookie</mat-icon>
            </div>
            <div class="cookie-banner-title">
              <h2>🍪 Usamos Cookies</h2>
              <p>Para melhorar sua experiência e analisar o uso do site</p>
            </div>
          </div>

          <div class="cookie-banner-content">
            <p class="cookie-description">
              Utilizamos cookies essenciais para o funcionamento do site e cookies opcionais para analytics e marketing. 
              Você pode escolher quais tipos de cookies aceitar.
            </p>

            <mat-expansion-panel class="cookie-details-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>settings</mat-icon>
                  Configurar Cookies
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="cookie-options">
                <div class="cookie-option">
                  <div class="cookie-option-info">
                    <h4>Cookies Essenciais</h4>
                    <p>Necessários para o funcionamento básico do site</p>
                  </div>
                  <mat-slide-toggle 
                    [checked]="true" 
                    [disabled]="true"
                    color="primary">
                  </mat-slide-toggle>
                </div>

                <div class="cookie-option">
                  <div class="cookie-option-info">
                    <h4>Cookies de Analytics</h4>
                    <p>Google Analytics, GTM e Hotjar para análise de uso</p>
                  </div>
                  <mat-slide-toggle 
                    [(ngModel)]="analyticsCookies"
                    color="primary">
                  </mat-slide-toggle>
                </div>

                <div class="cookie-option">
                  <div class="cookie-option-info">
                    <h4>Cookies de Marketing</h4>
                    <p>Facebook Pixel para anúncios personalizados</p>
                  </div>
                  <mat-slide-toggle 
                    [(ngModel)]="marketingCookies"
                    color="primary">
                  </mat-slide-toggle>
                </div>
              </div>
            </mat-expansion-panel>

            <div class="cookie-links">
              <a routerLink="/cookies" class="cookie-link">
                <mat-icon>info</mat-icon>
                Política de Cookies
              </a>
              <a routerLink="/privacidade" class="cookie-link">
                <mat-icon>security</mat-icon>
                Política de Privacidade
              </a>
            </div>
          </div>

          <div class="cookie-banner-actions">
            <button 
              mat-stroked-button 
              (click)="acceptAll()"
              class="accept-all-btn">
              <mat-icon>check_circle</mat-icon>
              Aceitar Todos
            </button>
            <button 
              mat-raised-button 
              color="primary"
              (click)="savePreferences()"
              class="save-btn">
              <mat-icon>save</mat-icon>
              Salvar Preferências
            </button>
            <button 
              mat-button 
              (click)="rejectAll()"
              class="reject-btn">
              <mat-icon>block</mat-icon>
              Rejeitar Todos
            </button>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styleUrl: './cookie-banner.component.css'
})
export class CookieBannerComponent implements OnInit {
  showBanner = false;
  analyticsCookies = false;
  marketingCookies = false;

  constructor(private cookieConsentService: CookieConsentService) {}

  ngOnInit() {
    // Verifica se o usuário já fez uma escolha sobre cookies
    if (!this.cookieConsentService.hasConsent()) {
      this.showBanner = true;
    }
  }

  acceptAll() {
    this.analyticsCookies = true;
    this.marketingCookies = true;
    this.savePreferences();
  }

  rejectAll() {
    this.analyticsCookies = false;
    this.marketingCookies = false;
    this.savePreferences();
  }

  savePreferences() {
    const consent: CookieConsent = {
      essential: true,
      analytics: this.analyticsCookies,
      marketing: this.marketingCookies,
      timestamp: new Date().toISOString()
    };

    this.cookieConsentService.saveConsent(consent);
    this.showBanner = false;

    // Inicializa serviços baseado no consentimento
    this.initializeServices(consent);
  }

  private initializeServices(consent: any) {
    if (consent.analytics) {
      // Inicializa Google Analytics
      this.loadGoogleAnalytics();
    }

    if (consent.marketing) {
      // Inicializa Facebook Pixel
      this.loadFacebookPixel();
    }

    // Hotjar sempre é inicializado se analytics for aceito
    if (consent.analytics) {
      this.loadHotjar();
    }
  }

  private loadGoogleAnalytics() {
    // Script do Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });
  }

  private loadFacebookPixel() {
    // Script do Facebook Pixel
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
      fbq('init', 'YOUR_PIXEL_ID');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);
  }

  private loadHotjar() {
    // Script do Hotjar
    window._hjSettings = {
      hjid: 1234567,
      hjsv: 6
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://static.hotjar.com/c/hotjar-1234567.js?sv=6';
    document.head.appendChild(script);
  }
} 
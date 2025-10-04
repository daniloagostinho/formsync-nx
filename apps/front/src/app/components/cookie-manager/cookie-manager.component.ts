import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { NotificationService } from '../../services/notification.service';
import { CookieConsentService, CookieConsent } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-manager',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    FormsModule,
    MatExpansionModule,

  ],
  template: `
    <div class="cookie-manager-container">
      <div class="dashboard-card">
        <div class="cookie-manager-header">
          <div class="cookie-manager-icon">
            <mat-icon>settings</mat-icon>
          </div>
          <div class="cookie-manager-title">
            <h2>Gerenciar Cookies</h2>
            <p>Configure suas preferências de cookies</p>
          </div>
        </div>

        <div class="cookie-manager-content">
          <p class="cookie-description">
            Você pode alterar suas preferências de cookies a qualquer momento. 
            As alterações entrarão em vigor imediatamente.
          </p>

          <div class="cookie-options">
            <div class="cookie-option">
              <div class="cookie-option-info">
                <h4>Cookies Essenciais</h4>
                <p>Necessários para o funcionamento básico do site (sempre ativos)</p>
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
                <p>Google Analytics, GTM e Hotjar para análise de uso do site</p>
                <small class="cookie-detail">Ajuda a melhorar a experiência do usuário</small>
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
                <small class="cookie-detail">Permite mostrar anúncios mais relevantes</small>
              </div>
              <mat-slide-toggle 
                [(ngModel)]="marketingCookies"
                color="primary">
              </mat-slide-toggle>
            </div>
          </div>

          <div class="cookie-actions">
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

          <div class="cookie-info">
            <div class="expansion-panel">
              <div class="panel-header">
                <div class="panel-title">
                  <mat-icon>info</mat-icon>
                  Informações Adicionais
                </div>
              </div>
              
              <div class="panel-content">
                <h4>Como funcionam os cookies?</h4>
                <p>Cookies são pequenos arquivos de texto armazenados no seu dispositivo que nos ajudam a:</p>
                <ul class="info-list">
                  <li>Manter você logado durante sua sessão</li>
                  <li>Lembrar suas preferências</li>
                  <li>Analisar como você usa nosso site</li>
                  <li>Melhorar a experiência do usuário</li>
                </ul>

                <h4>Seus direitos</h4>
                <p>Você tem o direito de:</p>
                <ul class="info-list">
                  <li>Recusar cookies não essenciais</li>
                  <li>Alterar suas preferências a qualquer momento</li>
                  <li>Excluir cookies através das configurações do navegador</li>
                  <li>Solicitar informações sobre os dados coletados</li>
                </ul>

                <h4>Mais informações</h4>
                <p>
                  Para mais detalhes sobre como usamos cookies, consulte nossa 
                  <a routerLink="/cookies" class="text-primary">Política de Cookies</a> e 
                  <a routerLink="/privacidade" class="text-primary">Política de Privacidade</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './cookie-manager.component.css'
})
export class CookieManagerComponent implements OnInit {
  analyticsCookies = false;
  marketingCookies = false;

  constructor(
    private cookieConsentService: CookieConsentService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    // Carrega as preferências atuais
    const consent = this.cookieConsentService.getConsent();
    if (consent) {
      this.analyticsCookies = consent.analytics;
      this.marketingCookies = consent.marketing;
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

    this.notificationService.showSuccess('Preferências de cookies salvas com sucesso!');
  }
} 
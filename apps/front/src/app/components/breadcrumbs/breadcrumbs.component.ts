import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs/operators';

interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule
  ],
  template: `
    <nav *ngIf="breadcrumbs.length > 1" class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb-list">
        <li *ngFor="let item of breadcrumbs; let last = last" class="breadcrumb-item">
          <a 
            *ngIf="!last && !item.active" 
            [routerLink]="item.url" 
            class="breadcrumb-link"
            [attr.aria-label]="'Ir para ' + item.label">
            {{ item.label }}
          </a>
          <span 
            *ngIf="last || item.active" 
            class="breadcrumb-current"
            [attr.aria-current]="last ? 'page' : null">
            {{ item.label }}
          </span>
          <mat-icon *ngIf="!last" class="breadcrumb-separator">chevron_right</mat-icon>
        </li>
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      padding: 16px 0;
      background-color: #fafafa;
      border-bottom: 1px solid #e0e0e0;
    }

    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      font-size: 14px;
    }

    .breadcrumb-link {
      color: #1976d2;
      text-decoration: none;
      transition: color 0.2s ease;
    }

    .breadcrumb-link:hover {
      color: #1565c0;
      text-decoration: underline;
    }

    .breadcrumb-current {
      color: #666;
      font-weight: 500;
    }

    .breadcrumb-separator {
      font-size: 16px;
      color: #999;
      margin: 0 8px;
    }

    @media (max-width: 768px) {
      .breadcrumb-nav {
        padding: 12px 0;
      }
      
      .breadcrumb-list {
        padding: 0 16px;
        flex-wrap: wrap;
      }
      
      .breadcrumb-item {
        font-size: 13px;
      }
    }
  `]
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.generateBreadcrumbs();
      });
  }

  private generateBreadcrumbs(): void {
    const url = this.router.url;
    const segments = url.split('/').filter(segment => segment);
    
    this.breadcrumbs = [
      { label: 'Início', url: '/', active: segments.length === 0 }
    ];

    let currentUrl = '';
    
    segments.forEach((segment, index) => {
      currentUrl += `/${segment}`;
      const label = this.getBreadcrumbLabel(segment);
      const isLast = index === segments.length - 1;
      
      this.breadcrumbs.push({
        label,
        url: currentUrl,
        active: isLast
      });
    });
  }

  private getBreadcrumbLabel(segment: string): string {
    const labels: { [key: string]: string } = {
      'registrar': 'Cadastro',
      'login': 'Login',
      'demo': 'Demonstração',
      'planos': 'Planos',
      'sobre': 'Sobre Nós',
      'contato': 'Contato',
      'faq': 'Perguntas Frequentes',
      'privacidade': 'Política de Privacidade',
      'termos': 'Termos de Uso',
      'cookies': 'Política de Cookies',
      'gerenciar-cookies': 'Gerenciar Cookies',
      'suporte': 'Suporte',
      'blog': 'Blog',
      'recursos': 'Recursos',
      'seguranca': 'Segurança',
      'dashboard': 'Painel',
      'perfil': 'Perfil',
      'upload-csv': 'Upload CSV',
      'dados-preenchimento': 'Dados de Preenchimento',
      'upgrade': 'Upgrade',
      'sucesso': 'Sucesso',
      'login-sucesso': 'Login Realizado',
      'verificar-codigo': 'Verificar Código'
    };

    return labels[segment] || this.capitalizeFirstLetter(segment);
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
  }
} 
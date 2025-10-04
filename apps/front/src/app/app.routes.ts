import { Routes } from '@angular/router';
import { RegistrarComponent } from './components/registrar/registrar.component';
import { LoginComponent } from './components/login/login.component';
import { VerificarCodigoComponent } from './components/verificar-codigo/verificar-codigo.component';
import { DemoComponent } from './components/demo/demo.component';
import { HomeComponent } from './components/home/home.component';
import { SucessoComponent } from './components/sucesso/sucesso.component';
import { TermsComponent } from './components/terms/terms.component';
import { PrivacyComponent } from './components/privacity/privacity.component';
import { CookiesComponent } from './components/cookies/cookies.component';
import { CookieManagerComponent } from './components/cookie-manager/cookie-manager.component';
import { ContatoComponent } from './components/contato/contato.component';
import { FaqComponent } from './components/faq/faq.component';
import { SecurityDemoComponent } from './components/security-demo/security-demo.component';
import { DebugPlanoComponent } from './components/debug-plano/debug-plano.component';
import { TrelloComponent } from './components/trello/trello.component';
import { TrelloLoginComponent } from './components/trello-login/trello-login.component';
import { TrelloRegisterComponent } from './components/trello-register/trello-register.component';
import { UpgradeComponent } from './components/upgrade/upgrade.component';
import { UploadCsvComponent } from './components/upload-csv/upload-csv.component';

import { AuthGuard } from './guards/auth.guard';
import { CancelarAssinaturaComponent } from './components/cancelar-assinatura/cancelar-assinatura.component';
import { DebugComponent } from './components/debug/debug.component';

export const routes: Routes = [
  { path: 'debug', component: DebugComponent }, // 🧪 ROTA TEMPORÁRIA PARA DEBUG
  { path: '', component: TrelloComponent },
  { path: 'registrar', component: RegistrarComponent },
  { path: 'login', component: TrelloLoginComponent },
  { path: 'verificar-codigo', component: VerificarCodigoComponent },
  { path: 'demo', component: DemoComponent },
  { path: 'sucesso', component: SucessoComponent }, // ✅ ROTA PÚBLICA - Permite auto-login
  { path: 'termos', component: TermsComponent },
  { path: 'privacidade', component: PrivacyComponent },
  { path: 'cookies', component: CookiesComponent },
  { path: 'gerenciar-cookies', component: CookieManagerComponent },
  { path: 'contato', component: ContatoComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'security-demo', component: SecurityDemoComponent },
  { path: 'debug-plano', component: DebugPlanoComponent },
  { path: 'trello', component: TrelloComponent },
  { path: 'trello-login', component: TrelloLoginComponent },
  { path: 'trello-register', component: TrelloRegisterComponent },
  { path: 'upload-csv', component: UploadCsvComponent },

  // Rotas protegidas com Lazy Loading
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        data: { preload: true } // Dashboard é acessado frequentemente
      },
      {
        path: 'formularios',
        loadChildren: () => import('./features/forms/forms.routes').then(m => m.FORMS_ROUTES),
        data: { preload: true } // Formulários são acessados frequentemente
      },
      {
        path: 'perfil',
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES),
        data: { preload: false } // Perfil é acessado ocasionalmente
      },
      {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES),
        data: { preload: false } // Analytics é acessado ocasionalmente
      },
      {
        path: 'upgrade',
        component: UpgradeComponent
      },
      {
        path: 'cancelar-assinatura',
        component: CancelarAssinaturaComponent
      }
    ]
  },
];

import { Routes } from '@angular/router';
import { PerfilComponent } from '../../components/perfil/perfil.component';
import { UpgradeComponent } from '../../components/upgrade/upgrade.component';
import { CancelarAssinaturaComponent } from '../../components/cancelar-assinatura/cancelar-assinatura.component';
import { ConfiguracaoNotificacoesComponent } from '../../components/configuracao-notificacoes/configuracao-notificacoes.component';
import { ListaNotificacoesComponent } from '../../components/lista-notificacoes/lista-notificacoes.component';
import { PrivacyManagerComponent } from '../../components/privacy-manager/privacy-manager.component';

export const USER_ROUTES: Routes = [
  { path: '', component: PerfilComponent },
  { path: 'upgrade', component: UpgradeComponent },
  { path: 'cancelar-assinatura', component: CancelarAssinaturaComponent },
  { path: 'configurar-notificacoes', component: ConfiguracaoNotificacoesComponent },
  { path: 'notificacoes', component: ListaNotificacoesComponent },
  { path: 'privacidade', component: PrivacyManagerComponent }
];

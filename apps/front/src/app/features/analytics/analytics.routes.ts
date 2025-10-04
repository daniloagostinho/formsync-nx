import { Routes } from '@angular/router';
import { AnalyticsComponent } from '../../components/analytics/analytics.component';
import { SecurityDashboardComponent } from '../../components/security-dashboard/security-dashboard.component';
import { PlanCalculatorPageComponent } from '../../components/plan-calculator-page/plan-calculator-page.component';

export const ANALYTICS_ROUTES: Routes = [
  { path: '', component: AnalyticsComponent },
  { path: 'security-dashboard', component: SecurityDashboardComponent },
  { path: 'calculadora-planos', component: PlanCalculatorPageComponent }
];

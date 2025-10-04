import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';


interface AdminDashboard {
  totalAssinaturas: number;
  assinaturasAtivas: number;
  assinaturasCanceladas: number;
  reembolsosPendentes: number;
  reembolsosProcessados: number;
  valorTotalReembolsos: number;
  cancelamentosUltimos30Dias: number;
}

interface AssinaturaAdmin {
  id: number;
  usuarioId: number;
  plano: string;
  status: string;
  dataInicio: string;
  dataFim?: string;
  refundId?: string;
  refundStatus?: string;
  refundAmount?: number;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    RouterModule,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  dashboard: AdminDashboard | null = null;
  assinaturas: AssinaturaAdmin[] = [];
  reembolsos: AssinaturaAdmin[] = [];

  carregando = true;
  filtroStatus = '';
  filtroPlano = '';

  ngOnInit() {
    this.carregarDashboard();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarDashboard() {
    this.carregando = true;

    // Simular dados para demonstração
    setTimeout(() => {
      this.dashboard = {
        totalAssinaturas: 150,
        assinaturasAtivas: 120,
        assinaturasCanceladas: 30,
        reembolsosPendentes: 5,
        reembolsosProcessados: 25,
        valorTotalReembolsos: 1250.50,
        cancelamentosUltimos30Dias: 8
      };

      this.carregarAssinaturas();
      this.carregarReembolsos();
      this.carregando = false;
    }, 1000);
  }

  carregarAssinaturas() {
    this.assinaturas = [
      {
        id: 1,
        usuarioId: 1,
        plano: 'PROFISSIONAL',
        status: 'ATIVA',
        dataInicio: '2025-01-15T10:00:00',
        createdAt: '2025-01-15T10:00:00'
      },
      {
        id: 2,
        usuarioId: 2,
        plano: 'EMPRESARIAL',
        status: 'CANCELADA',
        dataInicio: '2025-01-10T14:30:00',
        dataFim: '2025-01-18T14:30:00',
        cancelledAt: '2025-01-18T14:30:00',
        createdAt: '2025-01-10T14:30:00'
      }
    ];
  }

  carregarReembolsos() {
    this.reembolsos = [
      {
        id: 2,
        usuarioId: 2,
        plano: 'EMPRESARIAL',
        status: 'CANCELADA',
        dataInicio: '2025-01-10T14:30:00',
        refundId: 're_test123',
        refundStatus: 'succeeded',
        refundAmount: 99.90,
        cancelledAt: '2025-01-18T14:30:00',
        createdAt: '2025-01-10T14:30:00'
      }
    ];
  }

  aplicarFiltros() {
    this.carregarAssinaturas();
  }

  getNomePlano(plano: string): string {
    const nomes: Record<string, string> = {
      'FREE': 'Gratuito',
      'PESSOAL': 'Pessoal',
      'PROFISSIONAL': 'Profissional',
      'EMPRESARIAL': 'Empresarial'
    };
    return nomes[plano] || plano;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'ATIVA': 'bg-green-100 text-green-800',
      'CANCELADA': 'bg-red-100 text-red-800',
      'INADIMPLENTE': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  getRefundStatusClass(status?: string): string {
    const classes: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'succeeded': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return classes[status || ''] || 'bg-gray-100 text-gray-800';
  }

  formatarData(data?: string): string {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calcularTaxaCancelamento(): number {
    if (!this.dashboard) return 0;
    const total = this.dashboard.totalAssinaturas;
    const cancelados = this.dashboard.assinaturasCanceladas;
    return total > 0 ? Math.round((cancelados / total) * 100) : 0;
  }
}
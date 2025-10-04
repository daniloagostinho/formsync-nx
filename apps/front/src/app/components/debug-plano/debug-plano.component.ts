import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-debug-plano',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatSnackBarModule
    ],
    template: `
    <div class="debug-container p-6">
      <h1 class="text-2xl font-bold mb-6">🔍 Debug do Plano do Usuário</h1>
      
      <!-- Status Atual -->
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title>Status Atual do Plano</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <strong>Plano no localStorage:</strong>
              <p class="text-lg">{{ planoLocalStorage || 'NÃO DEFINIDO' }}</p>
            </div>
            <div>
              <strong>Plano detectado:</strong>
              <p class="text-lg">{{ planoDetectado }}</p>
            </div>
          </div>
          
          <div class="mt-4">
            <strong>Pode acessar Upload CSV:</strong>
            <p class="text-lg" [class.text-green-600]="podeAcessarUploadCsv" [class.text-red-600]="!podeAcessarUploadCsv">
              {{ podeAcessarUploadCsv ? '✅ SIM' : '❌ NÃO' }}
            </p>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Ações de Debug -->
      <mat-card class="mb-6">
        <mat-card-header>
          <mat-card-title>Ações de Debug</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="space-y-4">
            <!-- Definir Plano Manualmente -->
            <div>
              <h3 class="font-semibold mb-2">Definir Plano Manualmente</h3>
              <div class="flex gap-2">
                <mat-form-field>
                  <mat-label>Selecione o Plano</mat-label>
                  <mat-select [(ngModel)]="planoSelecionado">
                    <mat-option value="EMPRESARIAL">EMPRESARIAL</mat-option>
                    <mat-option value="PROFISSIONAL_VITALICIO">PROFISSIONAL VITALÍCIO</mat-option>
                    <mat-option value="PROFISSIONAL_MENSAL">PROFISSIONAL MENSAL</mat-option>
                    <mat-option value="PROFISSIONAL">PROFISSIONAL</mat-option>
                    <mat-option value="PESSOAL">PESSOAL</mat-option>
                  </mat-select>
                </mat-form-field>
                <button mat-raised-button color="primary" (click)="definirPlano()">
                  Definir Plano
                </button>
              </div>
            </div>

            <!-- Limpar localStorage -->
            <div>
              <h3 class="font-semibold mb-2">Limpar localStorage</h3>
              <button mat-raised-button color="warn" (click)="limparPlano()">
                Limpar Plano
              </button>
            </div>

            <!-- Recarregar Página -->
            <div>
              <h3 class="font-semibold mb-2">Recarregar Página</h3>
              <button mat-raised-button color="accent" (click)="recarregarPagina()">
                Recarregar
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Logs de Debug -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Logs de Debug</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="bg-gray-100 p-4 rounded">
            <pre class="text-sm">{{ logs.join('\n') }}</pre>
          </div>
          <button mat-button class="mt-2" (click)="limparLogs()">
            Limpar Logs
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .debug-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  `]
})
export class DebugPlanoComponent implements OnInit {

    planoLocalStorage: string | null = null;
    planoDetectado: string = 'NÃO DETECTADO';
    podeAcessarUploadCsv: boolean = false;
    planoSelecionado: string = 'EMPRESARIAL';
    logs: string[] = [];

    ngOnInit() {
        this.atualizarStatus();
        this.adicionarLog('🔍 Componente de debug inicializado');
    }

    atualizarStatus() {
        this.planoLocalStorage = localStorage.getItem('plano');
        this.planoDetectado = this.detectarPlano(this.planoLocalStorage);
        this.podeAcessarUploadCsv = this.verificarAcessoUploadCsv(this.planoDetectado);

        this.adicionarLog(`📊 Status atualizado - Plano: ${this.planoDetectado}, Upload CSV: ${this.podeAcessarUploadCsv ? 'SIM' : 'NÃO'}`);
    }

    detectarPlano(plano: string | null): string {
        if (!plano) return 'NÃO DEFINIDO';

        const planoUpper = plano.toUpperCase();

        if (planoUpper === 'EMPRESARIAL' || planoUpper.includes('EMPRESARIAL')) {
            return 'EMPRESARIAL';
        } else if (planoUpper === 'PROFISSIONAL_VITALICIO' || planoUpper.includes('VITALICIO')) {
            return 'PROFISSIONAL_VITALICIO';
        } else if (planoUpper === 'PROFISSIONAL_MENSAL' || planoUpper.includes('MENSAL')) {
            return 'PROFISSIONAL_MENSAL';
        } else if (planoUpper.includes('PROFISSIONAL')) {
            return 'PROFISSIONAL';
        } else {
            return 'PESSOAL';
        }
    }

    verificarAcessoUploadCsv(plano: string): boolean {
        return plano === 'EMPRESARIAL' ||
            plano === 'PROFISSIONAL_MENSAL' ||
            plano === 'PROFISSIONAL_VITALICIO';
    }

    definirPlano() {
        localStorage.setItem('plano', this.planoSelecionado);
        this.adicionarLog(`✅ Plano definido como: ${this.planoSelecionado}`);
        this.atualizarStatus();

        // Disparar evento para notificar outros componentes
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'plano',
            newValue: this.planoSelecionado
        }));
    }

    limparPlano() {
        localStorage.removeItem('plano');
        this.adicionarLog('🗑️ Plano removido do localStorage');
        this.atualizarStatus();
    }

    recarregarPagina() {
        this.adicionarLog('🔄 Recarregando página...');
        window.location.reload();
    }

    limparLogs() {
        this.logs = [];
        this.adicionarLog('🧹 Logs limpos');
    }

    private adicionarLog(mensagem: string) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.unshift(`[${timestamp}] ${mensagem}`);

        // Manter apenas os últimos 50 logs
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(0, 50);
        }
    }
}

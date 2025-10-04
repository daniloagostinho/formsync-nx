import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

import { SecurityService } from '../../services/security.service';
import { NotificationService } from '../../services/notification.service';
import { FooterComponent } from '../footer/footer.component';

interface SecurityStatus {
    fileSecurityEnabled: boolean;
    malwareScanEnabled: boolean;
    quarantineEnabled: boolean;
    maxFileSize: string;
    allowedExtensions: string;
    blockedExtensions: string;
    scannerVersion: string;
    lastUpdate: string;
    quarantinedFilesCount: number;
}

interface QuarantinedFile {
    fileName: string;
    quarantinePath: string;
    timestamp: string;
    reason: string;
}

@Component({
    selector: 'app-security-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatChipsModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatDialogModule,
        MatExpansionModule,
        MatDividerModule,
        MatListModule,
        MatTooltipModule,
        MatBadgeModule,
        FooterComponent
    ],
    templateUrl: './security-dashboard.component.html',
    styleUrls: ['./security-dashboard.component.css']
})
export class SecurityDashboardComponent implements OnInit {

    securityStatus: SecurityStatus | null = null;
    quarantinedFiles: QuarantinedFile[] = [];
    loading = true;
    refreshing = false;

    // Colunas da tabela de arquivos em quarentena
    displayedColumns: string[] = ['fileName', 'timestamp', 'reason', 'actions'];

    // Dados de segurança
    securityMetrics = {
        totalFilesScanned: 0,
        filesRejected: 0,
        filesQuarantined: 0,
        malwareDetected: 0,
        lastScan: new Date()
    };

    // Timestamps para os logs de segurança
    currentTime = new Date();
    fiveMinutesAgo = new Date(Date.now() - 300000); // 5 minutos atrás
    tenMinutesAgo = new Date(Date.now() - 600000);  // 10 minutos atrás

    constructor(
        private securityService: SecurityService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadSecurityDashboard();
    }

    async loadSecurityDashboard() {
        this.loading = true;

        try {
            // Carregar status de segurança
            await this.loadSecurityStatus();

            // Carregar arquivos em quarentena
            await this.loadQuarantinedFiles();

            // Carregar métricas de segurança
            await this.loadSecurityMetrics();

        } catch (error) {
            console.error('Erro ao carregar dashboard de segurança:', error);
            this.notificationService.showError('Erro ao carregar dashboard de segurança');
        } finally {
            this.loading = false;
        }
    }

    async loadSecurityStatus() {
        try {
            const response = await fetch('/api/v1/security/files/status');
            if (response.ok) {
                this.securityStatus = await response.json();
            } else {
                throw new Error('Falha ao carregar status de segurança');
            }
        } catch (error) {
            console.error('Erro ao carregar status:', error);
            throw error;
        }
    }

    async loadQuarantinedFiles() {
        try {
            const response = await fetch('/api/v1/security/files/quarantine');
            if (response.ok) {
                const data = await response.json();
                this.quarantinedFiles = data.quarantinedFiles.map((fileName: string) => ({
                    fileName: fileName.replace('QUARANTINE_', ''),
                    quarantinePath: fileName,
                    timestamp: this.extractTimestamp(fileName),
                    reason: 'Arquivo suspeito detectado'
                }));
            } else {
                throw new Error('Falha ao carregar arquivos em quarentena');
            }
        } catch (error) {
            console.error('Erro ao carregar arquivos em quarentena:', error);
            // Em caso de erro, usar dados simulados para demonstração
            this.quarantinedFiles = [];
        }
    }

    async loadSecurityMetrics() {
        // Em produção, buscar métricas reais da API
        // Por enquanto, usar dados simulados
        this.securityMetrics = {
            totalFilesScanned: 1250,
            filesRejected: 23,
            filesQuarantined: 5,
            malwareDetected: 2,
            lastScan: new Date()
        };
    }

    async refreshDashboard() {
        this.refreshing = true;

        try {
            await this.loadSecurityDashboard();
            this.notificationService.showSuccess('Dashboard atualizado com sucesso');
        } catch (error) {
            this.notificationService.showError('Erro ao atualizar dashboard');
        } finally {
            this.refreshing = false;
        }
    }

    async releaseFromQuarantine(fileName: string) {
        try {
            const response = await fetch(`/api/v1/security/files/quarantine/${fileName}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.notificationService.showSuccess('Arquivo liberado da quarentena com sucesso');
                // Recarregar lista
                await this.loadQuarantinedFiles();
            } else {
                throw new Error('Falha ao liberar arquivo da quarentena');
            }
        } catch (error) {
            console.error('Erro ao liberar arquivo:', error);
            this.notificationService.showError('Erro ao liberar arquivo da quarentena');
        }
    }

    async testSecuritySystem() {
        try {
            const response = await fetch('/api/v1/security/files/test', {
                method: 'POST'
            });

            if (response.ok) {
                const result = await response.json();
                this.notificationService.showSuccess('Teste de segurança executado com sucesso');
                console.log('Resultado do teste:', result);
            } else {
                throw new Error('Falha no teste de segurança');
            }
        } catch (error) {
            console.error('Erro no teste de segurança:', error);
            this.notificationService.showError('Erro no teste de segurança');
        }
    }

    private extractTimestamp(fileName: string): string {
        // Extrair timestamp do nome do arquivo em quarentena
        const match = fileName.match(/QUARANTINE_(\d{8}_\d{6})_/);
        if (match) {
            const timestamp = match[1];
            const year = timestamp.substring(0, 4);
            const month = timestamp.substring(4, 6);
            const day = timestamp.substring(6, 8);
            const hour = timestamp.substring(9, 11);
            const minute = timestamp.substring(11, 13);
            const second = timestamp.substring(13, 15);

            return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
        }

        return 'Data desconhecida';
    }

    getSecurityStatusColor(status: boolean): string {
        return status ? 'accent' : 'warn';
    }

    getSecurityStatusIcon(status: boolean): string {
        return status ? 'security' : 'security_update_warning';
    }

    getFileTypeIcon(fileName: string): string {
        if (fileName.toLowerCase().endsWith('.csv')) {
            return 'table_chart';
        } else if (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')) {
            return 'grid_on';
        }
        return 'insert_drive_file';
    }
}

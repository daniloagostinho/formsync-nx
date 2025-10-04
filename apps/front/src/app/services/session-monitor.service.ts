import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SessionMonitorService {
    private API_URL = environment.apiUrl;
    private sessionCheckInterval: any;
    private sessionStatusSubject = new BehaviorSubject<boolean>(true);

    public sessionStatus$ = this.sessionStatusSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    /**
     * Inicia o monitoramento da sessão
     */
    startMonitoring(token: string) {
        if (this.sessionCheckInterval) {
            this.stopMonitoring();
        }

        // Verificar status da sessão a cada 10 segundos (mais responsivo)
        this.sessionCheckInterval = interval(10000).subscribe(() => {
            this.checkSessionStatus(token);
        });

        console.log('🔍 Monitoramento de sessão iniciado');
    }

    /**
     * Para o monitoramento da sessão
     */
    stopMonitoring() {
        if (this.sessionCheckInterval) {
            this.sessionCheckInterval.unsubscribe();
            this.sessionCheckInterval = null;
            console.log('🔍 Monitoramento de sessão parado');
        }
    }

    /**
     * Verifica o status da sessão no backend
     */
    private checkSessionStatus(token: string) {
        if (!token) {
            return;
        }

        this.http.get<{ authenticated: boolean; status: string; reason?: string }>(`${this.API_URL}/auth/session-status`, {
            headers: { Authorization: `Bearer ${token}` }
        }).subscribe({
            next: (response) => {
                if (!response.authenticated || response.status !== 'ACTIVE') {
                    console.warn('⚠️ Sessão inválida detectada:', response.reason || 'Sessão inativa');
                    this.handleSessionInvalid();
                } else {
                    this.sessionStatusSubject.next(true);
                }
            },
            error: (error) => {
                console.error('❌ Erro ao verificar status da sessão:', error);

                // Se for erro 401, 500 com JWT expirado, ou qualquer erro de autenticação
                if (error.status === 401 ||
                    (error.status === 500 && error.error?.reason === 'Erro interno') ||
                    (error.status === 500 && error.error?.status === 'ERROR')) {
                    console.warn('🚨 Sessão inválida detectada - Limpando dados locais');
                    this.handleSessionInvalid();
                }
            }
        });
    }

    /**
     * Trata sessão inválida
     */
    private handleSessionInvalid() {
        this.sessionStatusSubject.next(false);

        // Parar monitoramento
        this.stopMonitoring();

        // Limpar dados locais
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('plano');

        console.warn('🚨 Sessão invalidada - Redirecionando para login');

        // Redirecionar para login
        this.router.navigate(['/login']);
    }

    /**
     * Verifica se a sessão está ativa
     */
    isSessionActive(): boolean {
        return this.sessionStatusSubject.value;
    }

    /**
     * Força verificação imediata do status da sessão
     */
    forceCheckSession(token: string) {
        this.checkSessionStatus(token);
    }

    /**
     * Obtém estatísticas da sessão (para debug)
     */
    getSessionStats(token: string): Observable<any> {
        return this.http.get(`${this.API_URL}/auth/session-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });
    }
}

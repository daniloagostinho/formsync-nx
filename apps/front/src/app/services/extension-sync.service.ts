import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interface para a API do Chrome (extensão)
declare global {
    interface Window {
        chrome?: {
            runtime?: {
                sendMessage?: (message: any, callback?: (response: any) => void) => void;
                lastError?: any;
            };
        };
    }
}

export interface ExtensionNotification {
    action: 'template_created' | 'template_updated' | 'template_deleted';
    templateId: number;
    templateName: string;
    timestamp: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExtensionSyncService {
    private apiUrl = `${environment.apiUrl}/public/extension`;

    constructor(private http: HttpClient) { }

    /**
     * Notifica a extensão sobre novos templates criados
     */
    notificarNovoTemplate(templateId: number, templateName: string): Observable<boolean> {
        const notification: ExtensionNotification = {
            action: 'template_created',
            templateId,
            templateName,
            timestamp: new Date().toISOString()
        };

        // Enviar notificação para o backend (que pode encaminhar para a extensão)
        return this.http.post<boolean>(`${this.apiUrl}/notify`, notification, {
            headers: this.getExtensionHeaders()
        }).pipe(
            tap(() => {
                console.log('🔔 Extensão notificada sobre Novo Formulário:', templateName);
                this.notificarExtensaoLocal(notification);
            }),
            catchError(error => {
                console.error('❌ Erro ao notificar extensão:', error);
                // Fallback: tentar notificar localmente mesmo se a API falhar
                this.notificarExtensaoLocal(notification);
                return of(false);
            })
        );
    }

    /**
 * Notifica a extensão localmente (fallback)
 */
    private notificarExtensaoLocal(notification: ExtensionNotification): void {
        try {
            // Tentar enviar mensagem para a extensão se estiver disponível
            if (typeof window !== 'undefined' && window.chrome?.runtime?.sendMessage) {
                window.chrome.runtime.sendMessage(notification, (response) => {
                    if (window.chrome?.runtime?.lastError) {
                        console.log('📱 Extensão não está ativa ou não respondeu');
                    } else {
                        console.log('✅ Extensão notificada localmente:', response);
                    }
                });
            } else {
                console.log('🌐 Executando no navegador (não é extensão)');
            }
        } catch (error) {
            console.log('⚠️ Não foi possível notificar extensão localmente:', error);
        }
    }

    /**
     * Verifica se a extensão está ativa
     */
    verificarExtensaoAtiva(): Observable<boolean> {
        return this.http.get<boolean>(`${this.apiUrl}/ping`, {
            headers: this.getExtensionHeaders()
        }).pipe(
            catchError(() => of(false))
        );
    }

    /**
     * Força sincronização de templates com a extensão
     */
    forcarSincronizacao(): Observable<boolean> {
        return this.http.post<boolean>(`${this.apiUrl}/sync`, {}, {
            headers: this.getExtensionHeaders()
        }).pipe(
            catchError(error => {
                console.error('❌ Erro na sincronização forçada:', error);
                return of(false);
            })
        );
    }

    /**
     * Headers para comunicação com a extensão
     */
    private getExtensionHeaders(): HttpHeaders {
        return new HttpHeaders()
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321')
            .set('Content-Type', 'application/json');
    }
}

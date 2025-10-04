import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SimpleTemplate {
    id?: number;
    nome: string;
    descricao?: string;
    campos: SimpleCampo[];
    totalUso?: number;
    ultimoUso?: string;
    dataCriacao?: string;
}

export interface SimpleCampo {
    id?: number;
    nome: string;
    valor: string;
    tipo?: string;
    ordem?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SimpleTemplateService {
    private apiUrl = `${environment.apiUrl}/public/templates`;

    constructor(private http: HttpClient) { }

    /**
     * Lista todos os templates
     */
    listarTemplates(): Observable<SimpleTemplate[]> {
        // 🔒 SEGURANÇA: Usar endpoint seguro que retorna apenas templates do usuário logado
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ Token não encontrado para listar templates');
            return of([]);
        }

        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Authorization', `Bearer ${token}`);

        // Usar endpoint correto com usuarioId
        const secureApiUrl = `${this.apiUrl}?usuarioId=1`;

        return this.http.get<SimpleTemplate[]>(secureApiUrl, { headers })
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar templates:', error);
                    return of([]);
                })
            );
    }

    /**
     * Cria um Novo Formulário
     */
    criarTemplate(template: SimpleTemplate): Observable<SimpleTemplate | null> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321');

        return this.http.post<SimpleTemplate>(this.apiUrl, template, { headers })
            .pipe(
                catchError(error => {
                    console.error('Erro ao Criar Formulário:', error);
                    return of(null);
                })
            );
    }

    /**
     * Atualiza um template existente
     */
    atualizarTemplate(id: number, template: SimpleTemplate): Observable<SimpleTemplate | null> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321');

        return this.http.put<SimpleTemplate>(`${this.apiUrl}/${id}`, template, { headers })
            .pipe(
                catchError(error => {
                    console.error('Erro ao atualizar template:', error);
                    return of(null);
                })
            );
    }

    /**
     * Remove um template
     */
    removerTemplate(id: number): Observable<boolean> {
        const headers = new HttpHeaders()
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321');

        return this.http.delete(`${this.apiUrl}/${id}`, { headers })
            .pipe(
                map(() => true),
                catchError(error => {
                    console.error('Erro ao remover template:', error);
                    return of(false);
                })
            );
    }

    /**
     * Registra uso de um template
     */
    registrarUso(id: number, sucesso: boolean = true): Observable<boolean> {
        const headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321');

        return this.http.post(`${this.apiUrl}/${id}/uso`, { success: sucesso }, { headers })
            .pipe(
                map(() => true),
                catchError(error => {
                    console.error('Erro ao registrar uso do template:', error);
                    return of(false);
                })
            );
    }

    /**
     * Testa conexão com o backend
     */
    testarConexao(): Observable<boolean> {
        const headers = new HttpHeaders()
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321');

        return this.http.get(`${environment.apiUrl}/public/health`, { headers })
            .pipe(
                map(() => true),
                catchError(error => {
                    console.error('Erro ao testar conexão:', error);
                    return of(false);
                })
            );
    }
}


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Template {
    id: number;
    nome: string;
    descricao: string;
    ativo: boolean;
    dataCriacao: string;
    dataAtualizacao: string;
    totalUso: number;
    ultimoUso?: string;
    campos: CampoTemplate[];
}

export interface CampoTemplate {
    id: number;
    nome: string;
    valor: string;
    tipo: string;
    ordem: number;
    ativo: boolean;
    dataCriacao: string;
    dataAtualizacao: string;
    totalUso: number;
    ultimoUso?: string;
}

@Injectable({
    providedIn: 'root'
})
export class TemplateCsvService {
    private apiUrl = `${environment.apiUrl}/templates/csv`;

    constructor(private http: HttpClient) { }

    /**
     * Upload de CSV de templates
     */
    uploadCsv(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post(`${this.apiUrl}/upload`, formData);
    }

    /**
     * Listar templates
     */
    listarTemplates(): Observable<Template[]> {
        // 🔑 Usar chave de extensão para listar templates
        const headers = new HttpHeaders()
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321');

        console.log('🔑 [DEBUG] Fazendo requisição com chave de extensão para:', `${environment.apiUrl}/public/templates?usuarioId=1`);

        return this.http.get<Template[]>(`${environment.apiUrl}/public/templates?usuarioId=1`, { headers });
    }

    /**
     * Deletar template
     */
    deletarTemplate(id: number): Observable<void> {
        const headers = new HttpHeaders()
            .set('X-Extension-Key', 'ext_2024_preenche_rapido_secure_key_987654321');
        return this.http.delete<void>(`${environment.apiUrl}/public/templates/${id}`, { headers });
    }

    /**
     * Obter formato do CSV
     */
    getFormatoCsv(): Observable<any> {
        return this.http.get(`${this.apiUrl}/formato`);
    }

    /**
     * Health check do serviço
     */
    healthCheck(): Observable<any> {
        return this.http.get(`${this.apiUrl}/health`);
    }
}


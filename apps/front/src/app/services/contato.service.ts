import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContatoRequest {
    nome: string;
    email: string;
    assunto: string;
    mensagem: string;
}

export interface ContatoResponse {
    status: string;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContatoService {
    private apiUrl = `${environment.apiUrl}/contato`;

    constructor(private http: HttpClient) { }

    enviarMensagem(contato: ContatoRequest): Observable<ContatoResponse> {
        return this.http.post<ContatoResponse>(this.apiUrl, contato);
    }
}

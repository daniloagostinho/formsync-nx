import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private chaveStorage = 'usuarioLogado';

  constructor(private http: HttpClient) {
    if (!localStorage.getItem(this.chaveStorage)) {
      const mock: Usuario = {
        nome: 'Usuário Teste',
        email: 'teste@formsync.com',
        foto: ''
      };
      this.salvarUsuario(mock);
    }
  }

  obterUsuario(): Usuario {
    const json = localStorage.getItem(this.chaveStorage);
    return json ? JSON.parse(json) : { nome: '', email: '' };
  }

  salvarUsuario(usuario: Usuario): void {
    localStorage.setItem(this.chaveStorage, JSON.stringify(usuario));
  }

  logout(): void {
    localStorage.removeItem(this.chaveStorage);
  }

  cadastrar(usuario: Usuario): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  obterUsuarioBackend(): Observable<Usuario> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<Usuario>(`${this.apiUrl}/me`, { headers });
  }

  atualizarUsuario(usuario: Usuario): Observable<Usuario> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const updateData = {
      nome: usuario.nome,
      email: usuario.email
    };

    return this.http.put<Usuario>(`${this.apiUrl}/me`, updateData, { headers });
  }

  alterarSenha(senhaAtual: string, novaSenha: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const changePasswordData = {
      senhaAtual: senhaAtual,
      novaSenha: novaSenha
    };

    return this.http.patch(`${this.apiUrl}/me/senha`, changePasswordData, { headers });
  }

  // Métodos para funcionalidades LGPD

  /**
   * Exclui permanentemente a conta do usuário
   */
  excluirConta(dadosExclusao: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.delete(`${this.apiUrl}/me`, {
      headers,
      body: dadosExclusao
    });
  }

  /**
   * Baixa todos os dados pessoais do usuário em formato JSON
   */
  baixarDadosPessoais(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/me/dados`, { headers });
  }

  /**
   * Obtém as preferências de consentimento LGPD do usuário
   */
  obterConsentimento(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get(`${this.apiUrl}/me/consentimento`, { headers });
  }

  /**
   * Atualiza as preferências de consentimento LGPD do usuário
   */
  atualizarConsentimento(consentimento: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.patch(`${this.apiUrl}/me/consentimento`, consentimento, { headers });
  }
} 
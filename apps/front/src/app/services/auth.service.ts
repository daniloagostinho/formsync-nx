import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { SessionMonitorService } from './session-monitor.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API_URL = environment.apiUrl;
  private tokenKey = 'token';
  private usuarioSubject = new BehaviorSubject<string | null>(localStorage.getItem('nome'));
  usuario$ = this.usuarioSubject.asObservable();

  // Novo: plano reativo
  private planoSubject = new BehaviorSubject<string | null>(localStorage.getItem('plano'));
  plano$ = this.planoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private sessionMonitorService: SessionMonitorService
  ) {
    // Se já existe um token, iniciar monitoramento
    const existingToken = this.obterToken();
    if (existingToken) {
      this.sessionMonitorService.startMonitoring(existingToken);
    }
  }

  login(email: string, senha: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<{ token: string; nome: string }>(
      `${this.API_URL}/login`,
      { email, senha },
      { headers }
    ).pipe(
      tap((res) => {
        localStorage.setItem('nome', res.nome); // 👈 salvar o nome
      })
    );
  }

  enviarCodigo(email: string) {
    return this.http.post(`${this.API_URL}/login`, { email });
  }

  verificarCodigo(email: string, codigo: string) {
    return this.http.post<{ token: string }>(
      `${this.API_URL}/login/verificar`,
      { email, codigo }
    );
  }

  salvarToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
    // Iniciar monitoramento de sessão após salvar o token
    this.sessionMonitorService.startMonitoring(token);
  }

  salvarNomeUsuario(nome: string) {
    localStorage.setItem('nome', nome);
    this.usuarioSubject.next(nome);
  }

  // Novo: método para salvar plano reativamente
  salvarPlano(plano: string) {
    localStorage.setItem('plano', plano);
    this.planoSubject.next(plano);
  }

  obterToken() {
    return localStorage.getItem(this.tokenKey);
  }

  logout() {
    console.log('🔐 Fazendo logout...');

    // Chamar endpoint de logout no backend para revogar o token
    const token = this.obterToken();
    if (token) {
      this.http.post(`${this.API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => {
          console.log('✅ Logout realizado com sucesso no backend');
        },
        error: (error) => {
          console.warn('⚠️ Erro ao fazer logout no backend:', error);
        },
        complete: () => {
          this.fazerLogoutLocal();
        }
      });
    } else {
      this.fazerLogoutLocal();
    }
  }

  private fazerLogoutLocal() {
    // Parar monitoramento de sessão
    this.sessionMonitorService.stopMonitoring();

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('nome');
    localStorage.removeItem('plano');
    this.usuarioSubject.next(null);
    this.planoSubject.next(null);
    this.router.navigate(['/login']);
  }

  estaAutenticado(): boolean {
    return !!this.obterToken();
  }
} 
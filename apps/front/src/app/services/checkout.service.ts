import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface CriarCheckoutDTO {
  plano: string;
  email: string;
  nome?: string;
}

export interface AutoLoginResponse {
  token: string;
  nome: string;
  email: string;
  plano: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  criarCheckout(dto: CriarCheckoutDTO): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.API_URL}/checkout`, dto);
  }

  // Método para auto-login após pagamento
  autoLoginAposPagamento(email: string): Observable<AutoLoginResponse> {
    return this.http.post<AutoLoginResponse>(`${this.API_URL}/checkout/auto-login`, { email });
  }

  // Método antigo para fazer login automático após pagamento (mantido para compatibilidade)
  loginAposPagamento(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, { email });
  }

  // Método para verificar código e fazer login
  verificarCodigoELogar(email: string, codigo: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.API_URL}/login/verificar`, { email, codigo });
  }

  // Método para tentar login automático após pagamento (atualizado)
  async tentarLoginAutomatico(email: string): Promise<boolean> {
    try {
      console.log('🔔 Tentando auto-login para:', email);
      
      // Aguardar um pouco para o webhook ser processado
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Usar o novo endpoint de auto-login
      const response = await firstValueFrom(this.autoLoginAposPagamento(email));
      
      if (response) {
        // Salvar dados de autenticação
        localStorage.setItem('token', response.token);
        localStorage.setItem('nomeUsuario', response.nome);
        localStorage.setItem('plano', response.plano);
        
        console.log('✅ Auto-login realizado com sucesso!');
        console.log('   - Nome:', response.nome);
        console.log('   - Email:', response.email);
        console.log('   - Plano:', response.plano);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erro no auto-login:', error);
      return false;
    }
  }

  // Método para redirecionar para dashboard após login bem-sucedido
  redirecionarParaDashboard() {
    this.router.navigate(['/dashboard']);
  }
} 
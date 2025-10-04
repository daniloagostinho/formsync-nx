import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError, switchMap } from 'rxjs';
import { Campo } from '../models/campo.model';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CampoService {
  private apiUrl = `${environment.apiUrl}/campos`;
  private publicApiUrl = `${environment.apiUrl}/public/campos`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    
    // Se não há token ou token expirado, usar chave da extensão
    if (!this.isAuthenticated()) {
      console.log('🔑 Usando chave da extensão (não autenticado)');
      return new HttpHeaders({
        'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
      });
    }
    
    // Se autenticado, usar token JWT
    console.log('🔐 Usando token JWT (autenticado)');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  private isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  listarCampos(): Observable<Campo[]> {
    // Por enquanto, sempre usar endpoint público para garantir funcionamento
    console.log('🔄 Usando endpoint público para listar campos');
    return this.listarCamposPublicos();
    
    // Código original comentado para debug
    /*
    if (this.isAuthenticated()) {
      // Usar endpoint privado se autenticado
      return this.http.get<PaginatedResponse<Campo>>(this.apiUrl, {
        headers: this.getAuthHeaders()
      }).pipe(
        map(response => response.content),
        catchError(error => {
          console.warn('Erro no endpoint privado, tentando público:', error);
          return this.listarCamposPublicos();
        })
      );
    } else {
      // Usar endpoint público se não autenticado
      return this.listarCamposPublicos();
    }
    */
  }

  private listarCamposPublicos(): Observable<Campo[]> {
    console.log('🔄 Chamando endpoint público com format=frontend');
    
    // Sempre usar chave da extensão para endpoint público
    const headers = new HttpHeaders({
      'X-Extension-Key': 'ext_2024_preenche_rapido_secure_key_987654321'
    });
    
    console.log('🔑 Headers enviados:', headers);
    
    return this.http.get<any[]>(`${this.publicApiUrl}?format=frontend`, {
      headers: headers
    }).pipe(
      map(campos => {
        console.log('📦 Resposta recebida:', campos);
        const camposMapeados = campos.map(c => ({
          id: c.id ? parseInt(c.id) : undefined,
          nome: c.nome || '',
          valor: c.valor || '',
          site: c.site || '',
          tipo: c.tipo || 'text',
          descricao: c.descricao || null,
          obrigatorio: c.obrigatorio === 'true',
          valorPadrao: c.valorPadrao || c.valor || ''
        }));
        console.log('🔄 Campos mapeados:', camposMapeados);
        return camposMapeados;
      }),
      catchError(error => {
        console.error('❌ Erro ao listar campos públicos:', error);
        return of([]);
      })
    );
  }

  listarCamposPaginado(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'nome',
    sortDir: string = 'asc'
  ): Observable<PaginatedResponse<Campo>> {
    // Por enquanto, sempre usar endpoint público para garantir funcionamento
    console.log('🔄 Usando endpoint público para listagem paginada');
    
    return this.listarCamposPublicos().pipe(
      map(campos => {
        const totalElements = campos.length;
        const totalPages = Math.ceil(totalElements / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = campos.slice(startIndex, endIndex);
        
        return {
          content,
          page,
          size,
          totalElements,
          totalPages,
          hasNext: page < totalPages - 1,
          hasPrevious: page > 0,
          first: page === 0,
          last: page === totalPages - 1 || totalPages === 0
        };
      })
    );
    
    // Código original comentado para debug
    /*
    if (this.isAuthenticated()) {
      const params = {
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir
      };
      
      return this.http.get<PaginatedResponse<Campo>>(this.apiUrl, { 
        params,
        headers: this.getAuthHeaders()
      }).pipe(
        catchError(error => {
          console.warn('Erro no endpoint privado, retornando lista vazia:', error);
          return of({
            content: [],
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
          });
        })
      );
    } else {
      // Para usuários não autenticados, retornar lista vazia paginada
      return of({
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      });
    }
    */
  }

  salvarCampo(campo: Campo): Observable<Campo> {
    if (!this.isAuthenticated()) {
      return of(campo); // Retornar campo sem salvar se não autenticado
    }

    const dto: any = {
      nome: campo.nome,
      tipo: 'text',
      descricao: null,
      obrigatorio: false,
      valorPadrao: campo.valor,
      valor: campo.valor,
      site: campo.site || null
    };

    if (campo.id) {
      return this.http.put<Campo>(`${this.apiUrl}/${campo.id}`, dto, {
        headers: this.getAuthHeaders()
      });
    } else {
      return this.http.post<Campo>(this.apiUrl, dto, {
        headers: this.getAuthHeaders()
      });
    }
  }

  excluirCampo(id: number): Observable<void> {
    if (!this.isAuthenticated()) {
      return of(void 0); // Retornar sucesso sem deletar se não autenticado
    }

    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  obterCampo(id: number): Observable<Campo> {
    if (!this.isAuthenticated()) {
      return of(null as any); // Retornar null se não autenticado
    }

    return this.http.get<Campo>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  contarCampos(): Observable<{quantidade: number, mensagem: string}> {
    if (!this.isAuthenticated()) {
      return of({ quantidade: 0, mensagem: 'Usuário não autenticado' });
    }

    return this.http.get<{quantidade: number, mensagem: string}>(`${this.apiUrl}/contar`, {
      headers: this.getAuthHeaders()
    });
  }

  listarCamposCSV(): Observable<any[]> {
    if (!this.isAuthenticated()) {
      return of([]);
    }

    return this.http.get<any[]>(`${this.apiUrl}/csv`, {
      headers: this.getAuthHeaders()
    });
  }

  contarCamposCSV(): Observable<number> {
    return this.listarCamposCSV().pipe(
      map(campos => campos.length)
    );
  }

  buscar(query: string): Observable<Campo[]> {
    if (!this.isAuthenticated()) {
      // Usar endpoint público para busca
      return this.http.get<any[]>(`${this.publicApiUrl}?format=extension&q=${encodeURIComponent(query)}`, {
        headers: this.getAuthHeaders()
      }).pipe(
        map(campos => campos.map(c => ({
          id: c.id ? parseInt(c.id) : undefined,
          nome: c.username || '',
          valor: c.password || '',
          site: c.website || '',
          tipo: 'text',
          descricao: null,
          obrigatorio: false,
          valorPadrao: c.password || ''
        }))),
        catchError(error => {
          console.error('Erro na busca pública:', error);
          return of([]);
        })
      );
    }

    const params = { q: query };
    return this.http.get<Campo[]>(`${this.apiUrl}/search`, { 
      params,
      headers: this.getAuthHeaders()
    });
  }
} 
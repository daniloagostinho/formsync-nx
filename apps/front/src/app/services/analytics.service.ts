import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AnalyticsData {
  totalPreenchimentos: number;
  tempoEconomizado: string;
  sitesUnicos: number;
  taxaSucesso: number;
  periodo: string;
}

export interface PreenchimentoAnalytics {
  data: Date;
  quantidade: number;
  site?: string;
  campoId?: number;
}

export interface CampoAnalytics {
  campoTemplateId: number;
  nomeCampo: string;
  nomeTemplate: string;
  quantidadeUsos: number;
  ultimoUso: Date;
}

export interface SiteAnalytics {
  dominio: string;
  quantidadePreenchimentos: number;
  tempoMedio: number;
}

export interface InsightAnalytics {
  titulo: string;
  descricao: string;
  tipo: 'positive' | 'info' | 'warning';
  icone: string;
}

export interface HeatmapData {
  hora: number;
  dia: number;
  quantidade: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('token');
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Obtém dados gerais de analytics
   */
  getAnalyticsData(periodo: string = '30'): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/dados`, {
      params: { periodo },
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Erro ao carregar analytics:', error);
        // Retornar dados vazios em caso de erro
        return of({
          totalPreenchimentos: 0,
          tempoEconomizado: '0h',
          sitesUnicos: 0,
          taxaSucesso: 0,
          periodo: periodo
        }).pipe(delay(1000));
      })
    );
  }

  /**
   * Obtém dados de preenchimentos por período
   */
  getPreenchimentosPorPeriodo(periodo: string): Observable<PreenchimentoAnalytics[]> {
    return this.http.get<PreenchimentoAnalytics[]>(`${this.apiUrl}/preenchimentos`, {
      params: { periodo },
      headers: this.getAuthHeaders()
    }).pipe(
      map(data => {
        // Converter strings de data para objetos Date
        return data.map(item => ({
          ...item,
          data: new Date(item.data)
        }));
      }),
      catchError(error => {
        console.error('❌ Erro ao carregar preenchimentos:', error);
        // Retornar array vazio em caso de erro
        return of([]).pipe(delay(800));
      })
    );
  }

  /**
   * Obtém campos de template mais utilizados
   */
  getCamposMaisUtilizados(): Observable<CampoAnalytics[]> {
    return this.http.get<CampoAnalytics[]>(`${this.apiUrl}/campos`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(data => {
        // Converter strings de data para objetos Date
        return data.map(item => ({
          ...item,
          ultimoUso: new Date(item.ultimoUso)
        }));
      }),
      catchError(error => {
        console.error('❌ Erro ao carregar campos de template:', error);
        // Retornar array vazio em caso de erro
        return of([]).pipe(delay(600));
      })
    );
  }

  /**
   * Obtém sites mais acessados
   */
  getSitesMaisAcessados(): Observable<SiteAnalytics[]> {
    return this.http.get<SiteAnalytics[]>(`${this.apiUrl}/sites`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Erro ao carregar sites:', error);
        // Retornar array vazio em caso de erro
        return of([]).pipe(delay(600));
      })
    );
  }

  /**
   * Obtém insights e recomendações
   */
  getInsights(): Observable<InsightAnalytics[]> {
    return this.http.get<InsightAnalytics[]>(`${this.apiUrl}/insights`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Erro ao carregar insights:', error);
        // Retornar array vazio em caso de erro
        return of([]).pipe(delay(500));
      })
    );
  }

  /**
   * Rastreia um novo preenchimento
   */
  trackPreenchimento(site: string, campoTemplateId?: number): Observable<void> {
    const params: any = { site };
    if (campoTemplateId) params.campoTemplateId = campoTemplateId;

    return this.http.post<void>(`${this.apiUrl}/track`, null, { params }).pipe(
      catchError(error => {
        console.error('❌ Erro ao rastrear preenchimento:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Rastreia tempo economizado
   */
  trackTempoEconomizado(tempoSegundos: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/track-tempo`, null, {
      params: { tempoSegundos: tempoSegundos.toString() }
    }).pipe(
      catchError(error => {
        console.error('❌ Erro ao rastrear tempo:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Obtém dados para heatmap de horários
   */
  getHeatmapData(periodo: string = '30'): Observable<HeatmapData[]> {
    return this.http.get<HeatmapData[]>(`${this.apiUrl}/heatmap`, {
      params: { periodo },
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(error => {
        console.error('❌ Erro ao carregar dados de heatmap:', error);
        // Retornar dados vazios em caso de erro
        return of([]).pipe(delay(600));
      })
    );
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ConsentimentoLGPD {
  tipoDado: 'LGPD' | 'MARKETING' | 'ANALYTICS';
  consentimento: boolean;
}

export interface DadosPessoais {
  id: number;
  nome: string;
  email: string;
  plano: string;
  dataCriacao: string;
  dataAtualizacao: string;
  consentimentoLGPD: boolean;
  consentimentoMarketing: boolean;
  consentimentoAnalytics: boolean;
  dataConsentimento: string;
  statusExclusao: string;
}

export interface StatusConsentimento {
  consentimentoLGPD: boolean;
  consentimentoMarketing: boolean;
  consentimentoAnalytics: boolean;
  dataConsentimento: string;
  statusExclusao: string;
  dataExclusao: string;
}

export interface DadosExportados {
  dadosPessoais: DadosPessoais;
  templates: any[];
  campos: any[];
  historicoPreenchimentos: any[];
  metadados: {
    dataExportacao: string;
    versaoLGPD: string;
    totalTemplates: number;
    totalCampos: number;
    totalPreenchimentos: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PrivacyService {
  private API_URL = environment.apiUrl;
  private consentimentoSubject = new BehaviorSubject<StatusConsentimento | null>(null);
  public consentimento$ = this.consentimentoSubject.asObservable();

  constructor(private http: HttpClient) {
    this.carregarStatusConsentimento();
  }

  /**
   * Registra consentimento LGPD
   */
  registrarConsentimento(consentimento: ConsentimentoLGPD): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.API_URL}/privacy/consentimento`, consentimento, { headers })
      .pipe(
        tap(() => {
          // Recarregar status após registrar consentimento
          this.carregarStatusConsentimento();
        })
      );
  }

  /**
   * Obtém dados pessoais do usuário
   */
  obterDadosPessoais(): Observable<any> {
    return this.http.get(`${this.API_URL}/privacy/dados-pessoais`);
  }

  /**
   * Exporta todos os dados do usuário
   */
  exportarDados(): Observable<DadosExportados> {
    return this.http.get<DadosExportados>(`${this.API_URL}/privacy/exportar-dados`);
  }

  /**
   * Solicita exclusão de dados
   */
  solicitarExclusao(): Observable<any> {
    return this.http.post(`${this.API_URL}/privacy/solicitar-exclusao`, {});
  }

  /**
   * Confirma exclusão de dados
   */
  confirmarExclusao(usuarioId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/privacy/confirmar-exclusao/${usuarioId}`, {});
  }

  /**
   * Obtém status de consentimento
   */
  obterStatusConsentimento(): Observable<StatusConsentimento> {
    return this.http.get<StatusConsentimento>(`${this.API_URL}/privacy/status-consentimento`);
  }

  /**
   * Gera relatório de dados pessoais
   */
  gerarRelatorioDados(): Observable<any> {
    return this.http.get(`${this.API_URL}/privacy/relatorio-dados`);
  }

  /**
   * Carrega status de consentimento automaticamente
   */
  private carregarStatusConsentimento(): void {
    this.obterStatusConsentimento().subscribe({
      next: (status) => {
        this.consentimentoSubject.next(status);
      },
      error: (error) => {
        console.warn('Erro ao carregar status de consentimento:', error);
        // Não falha silenciosamente, apenas loga o erro
      }
    });
  }

  /**
   * Obtém status atual de consentimento
   */
  getStatusConsentimento(): StatusConsentimento | null {
    return this.consentimentoSubject.value;
  }

  /**
   * Verifica se tem consentimento LGPD
   */
  temConsentimentoLGPD(): boolean {
    const status = this.getStatusConsentimento();
    return status?.consentimentoLGPD === true;
  }

  /**
   * Verifica se tem consentimento de marketing
   */
  temConsentimentoMarketing(): boolean {
    const status = this.getStatusConsentimento();
    return status?.consentimentoMarketing === true;
  }

  /**
   * Verifica se tem consentimento de analytics
   */
  temConsentimentoAnalytics(): boolean {
    const status = this.getStatusConsentimento();
    return status?.consentimentoAnalytics === true;
  }

  /**
   * Verifica se está em processo de exclusão
   */
  estaEmProcessoExclusao(): boolean {
    const status = this.getStatusConsentimento();
    return status?.statusExclusao === 'PENDENTE_EXCLUSAO' || status?.statusExclusao === 'EXCLUIDO';
  }

  /**
   * Baixa dados exportados como arquivo JSON
   */
  baixarDadosExportados(): void {
    this.exportarDados().subscribe({
      next: (dados) => {
        const dataStr = JSON.stringify(dados, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meus-dados-formsync-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erro ao exportar dados:', error);
        alert('Erro ao exportar dados. Tente novamente.');
      }
    });
  }

  /**
   * Atualiza status de consentimento localmente
   */
  atualizarStatusLocal(status: StatusConsentimento): void {
    this.consentimentoSubject.next(status);
  }
}

// Import necessário para o tap operator
import { tap } from 'rxjs/operators';




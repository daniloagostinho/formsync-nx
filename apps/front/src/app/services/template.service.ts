import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TemplateFormulario {
  id: number;
  nome: string;
  tipoFormulario: string;
  urlPattern: string;
  seletorForm?: string;
  versao: string;
  ativo: boolean;
  testadoEm?: string;
  taxaSucesso: number;
  observacoes?: string;
  areaId: number;
  areaCodigo: string;
  areaNome: string;
  siteId?: number;
  siteNome?: string;
  mapeamentos?: MapeamentoCampo[];
  totalMapeamentos?: number;
  mapeamentosObrigatorios?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MapeamentoCampo {
  id: number;
  campoNome: string;
  campoTipo: string;
  seletorCss: string;
  seletorXpath?: string;
  atributoTarget?: string;
  obrigatorio: boolean;
  valorPadrao?: string;
  transformacao?: string;
  validacaoRegex?: string;
  dependenciaCampo?: string;
  ordemPreenchimento: number;
  ativo: boolean;
  observacoes?: string;
  templateId: number;
  templateNome: string;
  siteId?: number;
  siteNome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResultadoBuscaTemplate {
  templateEncontrado: boolean;
  template?: TemplateFormulario;
  temAcesso: boolean;
  codigoArea?: string;
  tipoPreenchimento: 'ESPECIALIZADO' | 'HIBRIDO' | 'GENERICO';
  taxaSucesso: number;
  garantido: boolean;
  mapeamentos?: MapeamentoCampo[];
  mensagem?: string;
}

export interface ResultadoTeste {
  sucesso: boolean;
  template?: TemplateFormulario;
  camposObrigatorios: number;
  camposPreenchidos: number;
  porcentagemSucesso: number;
  recomendacao: string;
  erro?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private apiUrl = `${environment.apiUrl}/templates`;

  constructor(private http: HttpClient) {}

  /**
   * Busca template por URL (usado pela extensão)
   */
  buscarTemplatePorUrl(url: string): Observable<ResultadoBuscaTemplate | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = { url };

    return this.http.post<ResultadoBuscaTemplate>(`${this.apiUrl}/buscar-por-url`, body, { headers })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar template por URL:', error);
          return of(null);
        })
      );
  }

  /**
   * Lista templates por área
   */
  listarTemplatesPorArea(codigoArea: string): Observable<TemplateFormulario[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of([]);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<TemplateFormulario[]>(`${this.apiUrl}/area/${codigoArea}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao listar templates da área ${codigoArea}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Busca template específico com mapeamentos
   */
  buscarTemplate(templateId: number): Observable<TemplateFormulario | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<TemplateFormulario>(`${this.apiUrl}/${templateId}`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao buscar template ${templateId}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Lista mapeamentos de um template
   */
  listarMapeamentos(templateId: number): Observable<MapeamentoCampo[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of([]);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<MapeamentoCampo[]>(`${this.apiUrl}/${templateId}/mapeamentos`, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao listar mapeamentos do template ${templateId}:`, error);
          return of([]);
        })
      );
  }

  /**
   * Testa template com dados
   */
  testarTemplate(templateId: number, dadosTeste: any): Observable<ResultadoTeste | null> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<ResultadoTeste>(`${this.apiUrl}/${templateId}/testar`, dadosTeste, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao testar template ${templateId}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Reporta problema com template
   */
  reportarProblema(templateId: number, relatorio: any): Observable<any> {
    const token = localStorage.getItem('token');
    if (!token) {
      return of(null);
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(`${this.apiUrl}/${templateId}/reportar-problema`, relatorio, { headers })
      .pipe(
        catchError(error => {
          console.error(`Erro ao reportar problema no template ${templateId}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Converte tipo de campo para input HTML
   */
  getInputType(campoTipo: string): string {
    const tipoMap: { [key: string]: string } = {
      'TEXT': 'text',
      'EMAIL': 'email',
      'NUMBER': 'number',
      'PHONE': 'tel',
      'URL': 'url',
      'PASSWORD': 'password',
      'DATE': 'date',
      'TEXTAREA': 'textarea',
      'SELECT': 'select',
      'CHECKBOX': 'checkbox',
      'RADIO': 'radio'
    };

    return tipoMap[campoTipo] || 'text';
  }

  /**
   * Valida se campo é obrigatório
   */
  isCampoObrigatorio(mapeamento: MapeamentoCampo): boolean {
    return mapeamento.obrigatorio === true;
  }

  /**
   * Obtém valor padrão do campo
   */
  getValorPadrao(mapeamento: MapeamentoCampo): string {
    return mapeamento.valorPadrao || '';
  }

  /**
   * Aplica transformação no valor
   */
  aplicarTransformacao(valor: string, transformacao?: string): string {
    if (!transformacao) return valor;

    switch (transformacao.toUpperCase()) {
      case 'UPPERCASE':
        return valor.toUpperCase();
      case 'LOWERCASE':
        return valor.toLowerCase();
      case 'TRIM':
        return valor.trim();
      case 'REMOVE_SPACES':
        return valor.replace(/\s/g, '');
      case 'PHONE_FORMAT':
        return this.formatarTelefone(valor);
      case 'CPF_FORMAT':
        return this.formatarCPF(valor);
      case 'CNPJ_FORMAT':
        return this.formatarCNPJ(valor);
      default:
        return valor;
    }
  }

  /**
   * Valida valor com regex
   */
  validarComRegex(valor: string, regex?: string): boolean {
    if (!regex) return true;
    
    try {
      const regexObj = new RegExp(regex);
      return regexObj.test(valor);
    } catch (error) {
      console.error('Erro na validação regex:', error);
      return true;
    }
  }

  /**
   * Utilitários de formatação
   */
  private formatarTelefone(valor: string): string {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return valor;
  }

  private formatarCPF(valor: string): string {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    }
    return valor;
  }

  private formatarCNPJ(valor: string): string {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length === 14) {
      return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
    }
    return valor;
  }
}

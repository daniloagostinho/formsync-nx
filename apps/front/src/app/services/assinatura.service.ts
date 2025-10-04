import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AssinaturaResponseDTO {
  id: number;
  usuarioId: number;
  plano: string;
  status: string;
  dataInicio: string;
  dataProximaCobranca: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CriarAssinaturaDTO {
  usuarioId: number;
  plano: string;
}

export interface VerificarAssinaturaDTO {
  usuarioId: number;
}

export interface AtualizarStatusAssinaturaDTO {
  status: string;
}

export interface MensagemResponseDTO {
  mensagem: string;
}

export interface CancelarAssinaturaDTO {
  motivo: string;
  dataCancelamento?: string;
  solicitarReembolso?: boolean;
}

export interface CancelamentoResponseDTO {
  assinaturaId: number;
  status: string;
  motivo: string;
  dataCancelamento: string;
  dataFim: string;
  reembolsoSolicitado: boolean;
  tipoReembolso: string;
  valorReembolso: number;
  dentroDoArrependimento: boolean;
  mensagem: string;
  processadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class AssinaturaService {
  private baseUrl = `${environment.apiUrl}/assinaturas`;

  constructor(private http: HttpClient) { }

  criarAssinatura(usuarioId: number, plano: string): Observable<AssinaturaResponseDTO> {
    const dto: CriarAssinaturaDTO = { usuarioId, plano };
    return this.http.post<AssinaturaResponseDTO>(`${this.baseUrl}`, dto);
  }

  criarAssinaturaTeste(usuarioId: number, plano: string): Observable<AssinaturaResponseDTO> {
    const dto: CriarAssinaturaDTO = { usuarioId, plano };
    return this.http.post<AssinaturaResponseDTO>(`${this.baseUrl}/assinatura/teste`, dto);
  }

  atualizarStatus(id: number, status: string): Observable<void> {
    const dto: AtualizarStatusAssinaturaDTO = { status };
    return this.http.put<void>(`${this.baseUrl}/${id}/status`, dto);
  }

  verificarValidade(usuarioId: number): Observable<boolean> {
    const dto: VerificarAssinaturaDTO = { usuarioId };
    return this.http.post<boolean>(`${this.baseUrl}/valida`, dto);
  }

  consultarAssinatura(id: number): Observable<AssinaturaResponseDTO> {
    return this.http.get<AssinaturaResponseDTO>(`${this.baseUrl}/assinatura/${id}`);
  }

  // Método para consultar a assinatura do usuário logado usando o ID correto
  consultarAssinaturaUsuarioLogado(): Observable<AssinaturaResponseDTO> {
    // Debug: Vamos usar o mesmo userId que é usado para criar assinatura
    const userId = this.getUserIdFromLocalStorage();
    console.log(`🔍 consultarAssinaturaUsuarioLogado: usando userId ${userId}`);

    if (userId) {
      // Usar o novo endpoint que retorna assinatura mais recente (ativa ou cancelada)
      return this.http.get<AssinaturaResponseDTO>(`${this.baseUrl}/assinatura/recente?usuarioId=${userId}`);
    } else {
      // Fallback para o endpoint baseado em token
      return this.http.get<AssinaturaResponseDTO>(`${this.baseUrl}/assinatura/recente`);
    }
  }

  private getUserIdFromLocalStorage(): number | null {
    try {
      // Usar a mesma lógica de getUserId do componente upgrade
      const userId = localStorage.getItem('userId');
      if (userId && !isNaN(Number(userId))) {
        return Number(userId);
      }

      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.id && !isNaN(Number(payload.id))) {
          return Number(payload.id);
        }
      }

      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id && !isNaN(Number(user.id))) {
          return Number(user.id);
        }
      }

      return null;
    } catch (error) {
      console.error('Erro ao obter userId:', error);
      return null;
    }
  }

  rodarScheduler(): Observable<MensagemResponseDTO> {
    return this.http.post<MensagemResponseDTO>(`${this.baseUrl}/assinatura/scheduler`, {});
  }

  cancelarAssinatura(id: number, dto: CancelarAssinaturaDTO): Observable<CancelamentoResponseDTO> {
    return this.http.post<CancelamentoResponseDTO>(`${this.baseUrl}/${id}/cancelar`, dto);
  }
} 
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  /**
   * Extrai mensagem amigável do erro do backend
   */
  getErrorMessage(error: any): string {
    // Se é um HttpErrorResponse
    if (error instanceof HttpErrorResponse) {
      return this.extractMessageFromHttpError(error);
    }

    // Se é um erro simples
    if (error?.message) {
      return this.translateBackendMessage(error.message);
    }

    // Se é uma string
    if (typeof error === 'string') {
      return this.translateBackendMessage(error);
    }

    // Erro desconhecido
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }

  /**
   * Extrai mensagem de HttpErrorResponse
   */
  private extractMessageFromHttpError(error: HttpErrorResponse): string {
    console.log('🔍 [ERROR_HANDLER] Processando erro HTTP:', error);
    console.log('   - Status:', error.status);
    console.log('   - Error object:', error.error);
    console.log('   - Error type:', typeof error.error);

    // Verificar se tem mensagem no body da resposta
    if (error.error?.message) {
      console.log('   - Mensagem encontrada no body:', error.error.message);
      return this.translateBackendMessage(error.error.message);
    }

    // Verificar se tem mensagem no campo 'mensagem'
    if (error.error?.mensagem) {
      console.log('   - Mensagem encontrada no campo mensagem:', error.error.mensagem);
      return this.translateBackendMessage(error.error.mensagem);
    }

    console.log('   - Nenhuma mensagem encontrada no body, usando status HTTP');

    // Verificar status HTTP
    switch (error.status) {
      case 400:
        return 'Dados inválidos. Verifique as informações e tente novamente.';
      case 401:
        return 'Email ou senha incorretos.';
      case 403:
        return 'Acesso negado. Sua sessão pode ter expirado. Faça login novamente.';
      case 404:
        return 'Recurso não encontrado.';
      case 409:
        return 'Este email já está cadastrado. Use outro email ou faça login.';
      case 500:
        return 'Erro interno do servidor. Tente novamente em alguns instantes.';
      default:
        return 'Ocorreu um erro inesperado. Tente novamente.';
    }
  }

  /**
   * Traduz mensagens do backend para português amigável
   */
  private translateBackendMessage(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Mapeamento de mensagens do backend
    const messageMap: { [key: string]: string } = {
      'usuario com e-mail': 'Usuário não encontrado',
      'nao foi encontrado': 'Usuário não encontrado',
      'usuario não foi encontrado': 'Usuário não encontrado',
      'user not found': 'Usuário não encontrado',
      'email ou senha incorretos': 'Email ou senha incorretos',
      'credenciais inválidas': 'Email ou senha incorretos',
      'invalid credentials': 'Email ou senha incorretos',
      'token expirado': 'Sessão expirada. Faça login novamente.',
      'token inválido': 'Sessão expirada. Faça login novamente.',
      'token expired': 'Sessão expirada. Faça login novamente.',
      'invalid token': 'Sessão expirada. Faça login novamente.',
      'limite de campos atingido': 'Limite de campos atingido para seu plano',
      'campo limit': 'Limite de campos atingido para seu plano',
      'field limit': 'Limite de campos atingido para seu plano',
      'limite de templates atingido': 'Limite de templates atingido para seu plano',
      'template limit': 'Limite de templates atingido para seu plano',
      'faça upgrade para continuar': 'Faça upgrade do seu plano para continuar criando templates e campos',
      'upgrade to continue': 'Faça upgrade do seu plano para continuar criando templates e campos',
      'assinatura expirada': 'Sua assinatura expirou. Renove para continuar.',
      'subscription expired': 'Sua assinatura expirou. Renove para continuar.',
      'código inválido': 'Código de verificação inválido',
      'invalid code': 'Código de verificação inválido',
      'código expirado': 'Código de verificação expirado',
      'code expired': 'Código de verificação expirado',
      'email já cadastrado': 'Este email já está cadastrado',
      'email already exists': 'Este email já está cadastrado',
      'email já existe': 'Este email já está cadastrado',
      'campo obrigatório': 'Este campo é obrigatório',
      'required field': 'Este campo é obrigatório',
      'dados inválidos': 'Dados inválidos. Verifique as informações.',
      'invalid data': 'Dados inválidos. Verifique as informações.',
      'erro interno do servidor': 'Erro interno do servidor. Tente novamente.',
      'internal server error': 'Erro interno do servidor. Tente novamente.'
    };

    // Procurar por mensagens específicas
    for (const [key, translation] of Object.entries(messageMap)) {
      if (lowerMessage.includes(key)) {
        return translation;
      }
    }

    // Se não encontrou tradução específica, retornar a mensagem original
    return message;
  }

  /**
   * Verifica se o erro é de usuário não encontrado
   */
  isUserNotFoundError(error: any): boolean {
    const message = this.getErrorMessage(error).toLowerCase();
    return message.includes('usuário não encontrado') ||
      message.includes('user not found');
  }

  /**
   * Verifica se o erro é de credenciais inválidas
   */
  isInvalidCredentialsError(error: any): boolean {
    const message = this.getErrorMessage(error).toLowerCase();
    return message.includes('email ou senha incorretos') ||
      message.includes('credenciais inválidas') ||
      message.includes('invalid credentials');
  }

  /**
   * Verifica se o erro é de token expirado
   */
  isTokenExpiredError(error: any): boolean {
    const message = this.getErrorMessage(error).toLowerCase();
    return message.includes('sessão expirada') ||
      message.includes('token expirado') ||
      message.includes('token expired');
  }

  /**
   * Verifica se o erro é de acesso negado (403)
   */
  isAccessDeniedError(error: any): boolean {
    return error.status === 403;
  }

  /**
   * Verifica se o erro requer logout automático
   */
  requiresLogout(error: any): boolean {
    return error.status === 401 || error.status === 403;
  }
} 
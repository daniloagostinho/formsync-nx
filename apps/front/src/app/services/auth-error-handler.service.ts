import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({ providedIn: 'root' })
export class AuthErrorHandlerService {

    constructor(
        private authService: AuthService,
        private router: Router,
        private errorHandler: ErrorHandlerService
    ) { }

    /**
     * Trata erros de autenticação e faz logout automático quando necessário
     */
    handleAuthError(error: any, context?: string): void {
        console.log(`🔐 [${context || 'AuthErrorHandler'}] Tratando erro:`, error);

        // Verificar se é erro que requer logout
        if (this.errorHandler.requiresLogout(error)) {
            console.log(`🔐 [${context || 'AuthErrorHandler'}] Erro de autenticação detectado, fazendo logout automático...`);

            // Fazer logout
            this.authService.logout();

            // Mostrar mensagem amigável
            const message = this.errorHandler.getErrorMessage(error);
            console.log(`📝 Mensagem para o usuário: ${message}`);

            return;
        }

        // Para outros tipos de erro, apenas logar
        console.log(`⚠️ [${context || 'AuthErrorHandler'}] Erro não relacionado à autenticação:`, error);
    }

    /**
     * Verifica se um erro é de autenticação
     */
    isAuthError(error: any): boolean {
        return this.errorHandler.requiresLogout(error);
    }

    /**
     * Verifica se um erro é de acesso negado (403)
     */
    isAccessDeniedError(error: any): boolean {
        return this.errorHandler.isAccessDeniedError(error);
    }

    /**
     * Verifica se um erro é de token expirado (401)
     */
    isTokenExpiredError(error: any): boolean {
        return this.errorHandler.isTokenExpiredError(error);
    }

    /**
     * Trata erro específico de acesso negado
     */
    handleAccessDeniedError(error: any, context?: string): void {
        if (this.isAccessDeniedError(error)) {
            console.log(`🚫 [${context || 'AuthErrorHandler'}] Acesso negado detectado, fazendo logout...`);
            this.authService.logout();
        }
    }

    /**
     * Trata erro específico de token expirado
     */
    handleTokenExpiredError(error: any, context?: string): void {
        if (this.isTokenExpiredError(error)) {
            console.log(`⏰ [${context || 'AuthErrorHandler'}] Token expirado detectado, fazendo logout...`);
            this.authService.logout();
        }
    }
}


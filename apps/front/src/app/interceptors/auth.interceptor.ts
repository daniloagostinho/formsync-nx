import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, tap } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // NÃO interceptar requisições para endpoints públicos
  // ⚠️ IMPORTANTE: /usuarios/me NÃO é público - precisa de autenticação
  // 🔧 FORÇAR DEPLOY NETLIFY - v1.3 - Resolver problema de build travado
  if (req.url.includes('/public/') ||
    (req.url.includes('/usuarios') && !req.url.includes('/usuarios/me'))) {
    console.log('🔓 [AUTH_INTERCEPTOR] Endpoint público detectado, não interceptando:', req.url);
    return next(req);
  }

  // Obter token do localStorage
  const token = localStorage.getItem('token');

  // Se há token, adicionar no header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('🔐 [AUTH_INTERCEPTOR] Token adicionado ao header para:', req.url);
  } else {
    console.log('⚠️ [AUTH_INTERCEPTOR] Nenhum token encontrado para:', req.url);
  }

  return next(req).pipe(
    tap((event: any) => {
      // Verificar se é uma resposta HTTP e se contém header de sessão revogada
      if (event && event.headers) {
        const sessionRevoked = event.headers.get('X-Session-Revoked');
        if (sessionRevoked === 'true') {
          console.log('🚫 [AUTH_INTERCEPTOR] Sessão revogada detectada');
          localStorage.removeItem('token');
          localStorage.removeItem('nome');
          localStorage.removeItem('plano');
          router.navigate(['/login']);
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      // NÃO interceptar requisições de login/registro
      if (req.url.includes('/login') || req.url.includes('/registrar')) {
        return throwError(() => error);
      }

      // Verificar se é erro de usuário não encontrado
      if (error.status === 500 && error.error?.message) {
        const errorMessage = error.error.message.toLowerCase();

        // Detectar erros de usuário não encontrado
        if (errorMessage.includes('usuario com e-mail') &&
          errorMessage.includes('nao foi encontrado') ||
          errorMessage.includes('usuario não foi encontrado') ||
          errorMessage.includes('user not found')) {

          console.log('🚨 Usuário não encontrado no banco. Fazendo logout automático...');

          // Fazer logout automático
          localStorage.removeItem('token');
          localStorage.removeItem('nome');
          localStorage.removeItem('plano');
          router.navigate(['/login']);

          // Retornar erro para que o componente possa tratar se necessário
          return throwError(() => new Error('USUARIO_NAO_ENCONTRADO'));
        }
      }

      // Verificar erros de autenticação (401) ou permissão negada (403)
      if (error.status === 401 || error.status === 403) {
        console.log(`🔐 ${error.status === 401 ? 'Token expirado' : 'Acesso negado'}. Fazendo logout automático...`);

        // Limpar dados locais
        localStorage.removeItem('token');
        localStorage.removeItem('nome');
        localStorage.removeItem('plano');

        // Redirecionar para login
        router.navigate(['/login']);

        // Retornar erro específico
        const errorMessage = error.status === 401 ? 'TOKEN_EXPIRADO' : 'ACESSO_NEGADO';
        return throwError(() => new Error(errorMessage));
      }

      // Para outros erros, apenas repassar
      return throwError(() => error);
    })
  );
}; 
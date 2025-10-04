import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SecurityService } from '../services/security.service';

export const SecurityInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const securityService = inject(SecurityService);

  // Verificar se o ambiente é seguro
  if (environment.production && !securityService.isSecureEnvironment()) {
    console.warn('🔒 Tentativa de requisição HTTP em ambiente de produção. Redirecionando para HTTPS.');
    // Em produção, redirecionar para HTTPS
    const httpsUrl = req.url.replace('http:', 'https:');
    req = req.clone({ url: httpsUrl });
  }

  // Adicionar headers de segurança
  req = req.clone({
    setHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': environment.production ? 'max-age=31536000; includeSubDomains' : '',
      'Content-Security-Policy': environment.production ? 
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; frame-src 'self' https://js.stripe.com;" : '',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'X-CSRF-Token': securityService.generateCSRFToken()
    }
  });

  // Log de segurança para desenvolvimento
  if (!environment.production) {
    console.log('🔒 [SECURITY_INTERCEPTOR] Headers de segurança adicionados:', req.headers);
  }

  return next(req);
};

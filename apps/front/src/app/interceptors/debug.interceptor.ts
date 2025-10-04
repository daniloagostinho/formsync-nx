import { HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export function debugInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Log todas as requisições HTTP
  console.log('🌐 [HTTP_INTERCEPTOR] Requisição HTTP detectada:');
  console.log('   - Method:', req.method);
  console.log('   - URL:', req.url);
  console.log('   - Headers:', req.headers.keys().map(key => `${key}: ${req.headers.get(key)}`));
  
  // Detectar chamadas para api.stripe.com
  if (req.url.includes('api.stripe.com')) {
    console.log('🚨 [HTTP_INTERCEPTOR] CHAMADA PARA STRIPE API DETECTADA!');
    console.log('   - URL completa:', req.url);
    console.log('   - Método:', req.method);
    console.log('   - Body:', req.body);
    console.log('   - Authorization header:', req.headers.get('Authorization'));
  }

  return next(req).pipe(
    tap(event => {
      if (req.url.includes('api.stripe.com')) {
        console.log('✅ [HTTP_INTERCEPTOR] Resposta da Stripe API:', event);
      }
    }),
    catchError(error => {
      if (req.url.includes('api.stripe.com')) {
        console.error('❌ [HTTP_INTERCEPTOR] Erro na Stripe API:', error);
        console.error('   - Status:', error.status);
        console.error('   - Message:', error.message);
        console.error('   - Error details:', error.error);
      }
      return throwError(() => error);
    })
  );
}

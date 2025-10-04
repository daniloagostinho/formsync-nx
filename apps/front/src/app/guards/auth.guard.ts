import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {

    const rota = state.url.split('?')[0]; // Remove query string
    const publicRoutes = [
      '/login',
      '/registrar',
      '/verificar-codigo',
    ];

    if (publicRoutes.includes(rota)) {
      return true;
    }

    if (!this.auth.estaAutenticado()) {
      console.log('❌ Usuário não autenticado, redirecionando para login...');
      this.router.navigate(['/login']);
      return false;
    }

    console.log('✅ Usuário autenticado, permitindo acesso à rota:', rota);
    return true;
  }
} 
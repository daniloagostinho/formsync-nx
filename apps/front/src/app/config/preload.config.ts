import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload apenas rotas que são frequentemente acessadas
    if (route.data && route.data['preload'] === true) {
      return load();
    }
    
    // Para desenvolvimento, preload tudo
    if (route.data && route.data['preload'] === 'dev') {
      return load();
    }
    
    return of(null);
  }
}

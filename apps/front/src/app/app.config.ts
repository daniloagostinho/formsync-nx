import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideNativeDateAdapter } from '@angular/material/core';

import { provideNgxMask } from 'ngx-mask';

import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { debugInterceptor } from './interceptors/debug.interceptor';
import { SecurityInterceptor } from './interceptors/security.interceptor';
import { CustomPreloadStrategy } from './config/preload.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({
      eventCoalescing: true
    }),
    provideRouter(routes, withPreloading(CustomPreloadStrategy)),
    provideAnimations(),
    provideHttpClient(withInterceptors([SecurityInterceptor, AuthInterceptor, debugInterceptor])),
    provideNativeDateAdapter(),
    provideNgxMask(),
  ]
};

import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OAuthModule } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
  // provide modern HttpClient with `fetch` support for better SSR behavior
  provideHttpClient(withFetch()),
    // provide ToastrModule globally with sane defaults
    importProvidersFrom(ToastrModule.forRoot({
      positionClass: 'toast-top-right',
      closeButton: true,
      timeOut: 4000,
      preventDuplicates: true
    }))
    ,
    // Provide angular-oauth2-oidc providers so OAuthService is available
    importProvidersFrom(OAuthModule.forRoot())
  ]
};

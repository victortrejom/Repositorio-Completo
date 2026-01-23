import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { routes } from './app.routes';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
    provideHttpClient(),

    importProvidersFrom(
      NgHcaptchaModule.forRoot({
        siteKey: '296ccb74-b9f8-4f7a-8f8e-8eaed73a0c14',
        languageCode: 'es'
      })
    )
  ]
};

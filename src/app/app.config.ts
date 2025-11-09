import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withDisabledInitialNavigation, withEnabledBlockingInitialNavigation } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserUtils } from '@azure/msal-browser';
import {
  MsalGuard, MsalInterceptor, MsalBroadcastService, MsalInterceptorConfiguration, MsalModule, MsalService,
  MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalGuardConfiguration, ProtectedResourceScopes
} from '@azure/msal-angular';

import { routes } from './app.routes';
import { msalConfig, loginRequest, protectedResources } from './auth-config';

/**
 * MSAL Instance Factory
 */
export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

/**
 * MSAL Initialization Factory
 */
export function MSALInitializeFactory(msalInstance: IPublicClientApplication): () => Promise<void> {
  return () => msalInstance.initialize();
}

/**
 * MSAL Interceptor Config Factory
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string | ProtectedResourceScopes> | null>();

  protectedResourceMap.set(protectedResources.chatAPI.endpoint, [
    {
      httpMethod: 'GET',
      scopes: [...protectedResources.chatAPI.scopes.read]
    },
    {
      httpMethod: 'POST',
      scopes: [...protectedResources.chatAPI.scopes.write]
    },
    {
      httpMethod: 'PUT',
      scopes: [...protectedResources.chatAPI.scopes.write]
    },
    {
      httpMethod: 'DELETE',
      scopes: [...protectedResources.chatAPI.scopes.write]
    }
  ]);

  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}

/**
 * MSAL Guard Config Factory
 */
export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: loginRequest
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(
      routes,
      !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup() 
        ? withEnabledBlockingInitialNavigation() 
        : withDisabledInitialNavigation()
    ),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MsalModule),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: APP_INITIALIZER,
      useFactory: MSALInitializeFactory,
      deps: [MSAL_INSTANCE],
      multi: true
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};

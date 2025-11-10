## Purpose

Help AI coding agents be productive in this repository by highlighting architecture, developer workflows, and project-specific conventions.

## Quick start (commands you will need)

- Install deps: run `npm install`.
- Start dev server: `ng serve` (development config binds to 0.0.0.0:4200 per `angular.json`).
- Build: `ng build` (production uses `angular.json` production config).
- Watch build: `npm run watch` (uses `ng build --watch --configuration development`).
- Tests: `ng test` (Karma).

Files with these commands: `package.json`, `angular.json`.

## Big-picture architecture (what to know)

- This is an Angular 20 single-page app using the standalone component API (no NgModule).
  - App bootstrap: `src/main.ts` calls `bootstrapApplication(AppComponent, appConfig)`.
  - Global providers and routing are in `src/app/app.config.ts` (MSAL setup, http client, router providers).
- Authentication/integration with Microsoft Entra (MSAL) is central:
  - `src/app/auth-config.ts` contains `msalConfig`, `loginRequest`, and `protectedResources` used by the MSAL factories.
  - `app.config.ts` defines MSAL factories (MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG) and registers `MsalInterceptor` as an HTTP interceptor.
  - **CRITICAL**: MSAL initialization happens via `APP_INITIALIZER` to ensure MSAL is ready before any API calls.
  - **CRITICAL**: Uses popup interaction mode consistently (both guard and interceptor set to `InteractionType.Popup`).
  - Protected resource mapping is implemented in `MSALInterceptorConfigFactory()` — update both `protectedResources` and that map when adding new backends.
- Chat feature:
  - UI component: `src/app/chat/chat.ts` (component class). Template is `src/app/chat/chat.html` and styles `chat.css`.
  - Service: `src/app/services/chat.ts` handles API calls to `https://localhost:7119/api/chat` (see `apiUrl` constant).
  - Data models: `src/app/models/chat.model.ts` (ChatRequest, ChatResponse, ChatMessage).

## Project-specific conventions and patterns

- File naming: components use paired files like `chat.ts` / `chat.html` / `chat.css` (not the Angular CLI `*.component.ts` pattern). Follow existing names and imports.
- Standalone components: components declare `imports: [...]` inside `@Component` metadata (see `chat.ts`). Prefer adding dependencies via the component `imports` array rather than creating NgModules.
- Providers & bootstrapping: global providers live in `app.config.ts`. When adding app-wide providers (HTTP interceptors, MSAL services), register them here.
- HTTP & auth:
  - Use `HttpClient` and return Observables (see `ChatService.sendMessage()` returning `Observable<ChatResponse>`).
  - For new API endpoints, add the endpoint and scopes to `protectedResources` in `auth-config.ts` and ensure the `protectedResourceMap` in `app.config.ts` includes the new endpoint with the correct HTTP methods and scopes.
  - MSAL uses popup interaction mode - avoid redirect-based flows.
  - Always use `takeUntil()` with a destroy subject in components that subscribe to MSAL events.
- Dev assets: static assets are in the `public/` folder (configured in `angular.json`).

## Integration points and external dependencies

- MSAL / Azure: `@azure/msal-browser` and `@azure/msal-angular` — core files are `src/app/auth-config.ts` and `src/app/app.config.ts`.
- Backend chat API: configured at `https://localhost:7119/api/chat` inside `src/app/services/chat.ts`.
- Angular CLI build system: `@angular/build`, Angular v20.x, TypeScript ~5.9. See `package.json` for exact versions.

## How to make common changes (examples)

- Add a new backend endpoint and secure it with MSAL:
  1. Add endpoint URL and scopes to `protectedResources` in `src/app/auth-config.ts`.
  2. Add entries for that endpoint in the `protectedResourceMap` inside `MSALInterceptorConfigFactory()` in `src/app/app.config.ts` (match HTTP methods to scopes).
  3. Use `HttpClient` in a service (e.g., add a service under `src/app/services/`) and return Observables.
  4. **IMPORTANT**: Ensure MSAL is initialized via `APP_INITIALIZER` before any protected API calls.

- Modify the Chat API URL for local testing: update `private apiUrl` in `src/app/services/chat.ts`.

## Safety & secrets

- `src/app/auth-config.ts` contains MSAL placeholders (clientId, authority, tenant). Treat these as sensitive; do not commit real secrets or client secrets into the repo. Confirm with maintainers before changing.

## Tests & verification

- Unit tests run with `ng test` (Karma). The project includes `tsconfig.spec.json` and Karma config via the Angular build system.

## Notes for AI agents

- Preserve file naming and the standalone component pattern — do not rename files to `*.component.ts` or add NgModules unless the change is deliberate and coordinated.
- When changing auth or HTTP behavior, update both `auth-config.ts` and the MSAL factories in `app.config.ts`.
- Prefer minimal, local changes that follow existing code style. Example: to add a chat-related feature, add a service under `src/app/services/` and a component under `src/app/chat/` following the existing trio of `.ts/.html/.css` files.

If any part of this file is unclear or you want me to include more examples (route changes, how to add MsalGuard to a route, or unit test sample), tell me which section to expand.

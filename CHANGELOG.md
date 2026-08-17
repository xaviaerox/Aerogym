# Changelog

All notable changes to this project will be documented in this file.

## [3.1.0 Enterprise Refactor & Social Leaderboards] - 2026-08-17

### Added
- **Gamificación Social & Leaderboard (DOTS)**: Creación de `leaderboardEngine.ts` y del modal interactivo `LeaderboardModal.tsx` con ranking de Fuerza Relativa (DOTS), volumen semanal y racha.
- **Notificaciones Push PWA Nativas (1.3)**: Notificaciones de Readiness diario, recordatorios de entrenamiento agendados en PWA y patrones de vibración hápicos en descansos (`notificationService.ts`).
- **Widget de Control de Nutrición**: Componente `NutritionTrackerWidget.tsx` integrado en el `Dashboard.tsx` con cálculo adaptativo de calorías y macronutrientes.
- **Generador de Tarjetas para Redes Sociales**: Modal `SocialShareModal.tsx` con Canvas 2D interactivo para exportar e imágenes PNG de récords personales (PRs) e historias.
- **Layout Adaptativo Desktop Responsive**: Implementación de `Sidebar.tsx` lateral en monitores de escritorio (`md:flex-row max-w-7xl mx-auto`).
- **Subcomponentes Modulares de Analíticas**: Descomposición de `Analytics.tsx` en `VolumeChart.tsx`, `MuscleDistributionChart.tsx` y `E1RMProgressChart.tsx`.
- **Streaming SSE en Groq Proxy & IA**: Soporte para `stream: true` en la Edge Function `groq-proxy` y renderizado de respuestas token a token en `aiService.ts`.

### Security & Hardening
- **Unificación de Configuración Supabase**: Módulo `src/config.ts` validado con Zod schema. Eliminados todos los fallbacks de URL y Anon Key hardcodeados.
- **Seguridad en CI/CD**: Adición del paso `npm audit --audit-level=high` en `.github/workflows/deploy.yml`.

### Performance & Clean Architecture
- **Carga Dinámica de Ejercicios MuscleWiki**: Carga asíncrona desde `public/data/exercises-local.json` reduciendo el tamaño del chunk JavaScript principal.
- **Refactorización de Repositorio en Zustand**: Canalización estricta de escrituras de salud en `useHealthStore.ts` a través de `SupabaseHealthRepository.ts`.
- **Escrituras Masivas en IndexedDB**: Añadida la función `bulkSetIndexedDB<T>()` en `storageIndexedDB.ts`.

## [3.0.0 Ultimate Enterprise] - 2026-08-02

### Added
- **Inyección de Dependencias Pura (DDD)**: Creación de `RepositoryContext.tsx` para inyectar abstraídas las capas de datos en componentes y stores.
- **Persistencia de Almacenamiento OS**: Integración de `persistentStorageService.ts` utilizando `navigator.storage.persist()` para evitar purgas en navegadores móviles.
- **Accesibilidad Universal WCAG 2.1 AA**: Atributos `aria-label`, foco interactivo y navegabilidad por teclado (`Enter`, `Space`) en mapa anatómico SVG y temporizadores.
- **Failover IA Multiproveedor**: Fallback automático Groq $\rightarrow$ Google Gemini API en `groq-proxy`.
- **Motor de Visión por Computador Biomecánico**: Módulo `computerVisionEngine.ts` para estimación postural en vivo.
- **Dictado de Voz NL**: Parser de lenguaje natural `voiceParserEngine.ts` para registro de series por comandos hablados.

## [2.1.0 Enterprise Evolution] - 2026-07-31

### Added
- **Diseño Adaptativo Responsive (Desktop & Tablet)**: App shell adaptable en `App.tsx` con Sidebar de navegación colapsable para pantallas de escritorio ($>768\text{px}$) y grid multi-columna `max-w-7xl`.
- **Paginación e Ingesta Incremental**: Carga de historiales de entrenamiento por bloques de fechas (60 días / 100 registros) en `SupabaseWorkoutRepository.ts` e `useWorkoutStore.ts`.
- **Registro Aditivo de Evolución**: Documentación incremental de versiones en `docs/changelog/` y migración SQL acumulativa `20260731000000_v2_1_enterprise_hardening.sql`.
- **Virtualización de Listas**: Renderizado con `@tanstack/react-virtual` en `MuscleWikiExplorer.tsx`.
- **Widgets Desacoplados**: Modulación de componentes monolíticos (`QuickActionsWidget`, `ReadinessSummaryWidget`, `VolumeTrendsWidget`).

### Security
- **Sal Dinámica CSPRNG por Usuario**: Sustitución de `SECRET_SALT` estática en `cryptoStorage.ts` por sales criptográficas aleatorias únicas guardadas en perfil/IndexedDB, manteniendo retrocompatibilidad.
- **SQL RPC Hardening**: Fijado `SET search_path = public` en `match_rag_documents` para prevenir secuestro de esquemas.

### Improved
- **Proxy Groq & IA**: Configuración de `response_format: { type: "json_object" }` en `groq-proxy/index.ts` para validación segura de respuestas con Zod.
- **SyncEngine Refactoring**: Reemplazo de tipos `any` por tipos discriminados en `SyncEngine.ts`.
- **CI/CD Pipeline**: Integración de verificaciones obligatorias de linting y tests en `.github/workflows/deploy.yml`.

## [2026-04-27]


### Added
- **Integración Universal de Salud**: Soporte completo para **Google Takeout (Google Fit)** unificado con el sistema de Xiaomi.
- **Visualización de Métricas de Salud**: Nuevas gráficas de "Tendencias de Salud" en el apartado de Analytics (Pasos y Horas de Sueño).
- **Sabiduría de Aero Holística**: El coach de IA ahora cruza datos de entrenamiento con métricas de salud (descanso, pasos) para dar consejos más precisos.
- **Restructuración de Espacio de Trabajo**: Implementación de `local_data/` y protección estricta de privacidad en `.gitignore`.
- **Clean Architecture (Salud)**: Refactorización de la lógica de salud en módulos desacoplados (`importers`, `factory`, `engine`).

### Fixed
- **Seguridad**: Eliminación de datos personales del árbol de archivos principal para prevenir fugas en GitHub.
- **Gobernanza**: Organización de archivos temporales y scripts de análisis en directorios ignorados.

## [Unreleased]

### Fixed
- **AI Coach**: Fixed response truncation by increasing `maxOutputTokens` from 500 to 1024.
- **AI Coach**: Resolved persona issues by correctly integrating `systemInstruction` with user profile and session data.
- **Safety Settings**: Configured `BLOCK_NONE` thresholds for fitness categories to prevent accidental AI blocks on exercise advice.
- **TypeScript**: Fixed missing `vite/client` types in `tsconfig.json` and corrected `HarmCategory` enums in `CoachView.tsx`.
- **Dependencies**: Re-installed missing `vite-plugin-pwa` to enable successful local server startup.

### Added
- **Generador de Rutinas IA**: Nueva funcionalidad que crea rutinas personalizadas basadas en el perfil del usuario (objetivo, nivel) y ejercicios disponibles.
- **Sabiduría de Aero**: Sistema de asesoramiento estoico en estadísticas y nutrición.
- **Sugerencias de Carga IA**: Recomendaciones de peso discretas en tiempo real durante el entrenamiento.
- **Alertas de Récord (PR)**: Notificaciones sonoras especiales al batir récords estimados.
- **Infraestructura de Testing**: Configuración de Vitest y tests unitarios para la lógica del motor de cálculos.
- **Servicio IA Centralizado**: Implementación de `aiService.ts` para gestionar llamadas a Gemini de forma reutilizable.
- **Environment**: Created `.env.local` template for `VITE_GEMINI_API_KEY`.
- **Infrastructure**: Configured development server to run on port 3001 to avoid conflicts with other local projects.

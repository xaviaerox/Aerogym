# Changelog

All notable changes to this project will be documented in this file.

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

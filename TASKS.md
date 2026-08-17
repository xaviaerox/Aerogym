# 📋 AeroGym Tasks & Execution Board

Estado y seguimiento de tareas del proyecto AeroGym (Versión actual: **3.1.0 Enterprise**).

---

## ✅ Tareas Completadas (v3.1.0 — 17 de Agosto de 2026)

### ⚡ Quick Wins
- [x] **Configuración Centralizada con Zod**: Creado `src/config.ts` y eliminadas claves/fallbacks hardcodeados en `vite.config.ts`, `client.ts` y `aiService.ts`.
- [x] **Carga Dinámica de Ejercicios MuscleWiki**: Carga asíncrona desde `public/data/exercises-local.json` reduciendo el paquete JS principal.
- [x] **Escrituras Masivas IndexedDB**: Añadida la función `bulkSetIndexedDB<T>()` en `storageIndexedDB.ts`.
- [x] **Script Supabase DB Types**: Añadido `"db:types"` a `package.json`.

### 🏃 Sprint 1: Arquitectura & Desktop Layout
- [x] **Layout Adaptativo Responsive Desktop**: Creado `Sidebar.tsx` e integrado layout `max-w-7xl` con conmutación móvil/escritorio en `App.tsx`.
- [x] **Desacoplamiento de Repositorio en Zustand**: Refactorizado `useHealthStore.ts` canalizado a través de `SupabaseHealthRepository.ts`.
- [x] **Seguridad en CI/CD**: Añadido el paso `npm audit --audit-level=high` en `.github/workflows/deploy.yml`.

### 🚀 Sprint 2: Refactor UI, Performance & Streaming IA
- [x] **Descomposición de Analíticas**: Creados `VolumeChart.tsx`, `MuscleDistributionChart.tsx` y `E1RMProgressChart.tsx` dentro de `src/views/Analytics.tsx`.
- [x] **Streaming SSE en Groq Proxy & IA**: Habilitado `stream: true` en la Edge Function `groq-proxy` y `streamGroqProxy` en `aiService.ts`.

### 🎯 Sprint 3: QA & Nuevas Funcionalidades
- [x] **Generador de Tarjetas para Redes Sociales**: Creado `SocialShareModal.tsx` con Canvas 2D interactivo para imágenes PNG.
- [x] **Widget de Control de Nutrición**: Creado `NutritionTrackerWidget.tsx` e integrado en `Dashboard.tsx`.
- [x] **Pruebas Unitarias UI**: Creada suite de tests para `RestTimer.test.tsx` (102 tests pasados en total).

### 🏆 Características v2.0 Avanzadas
- [x] **Notificaciones Push PWA Nativas (1.3)**: Implementadas en `notificationService.ts` y modal `WorkoutReminderModal.tsx`.
- [x] **Gamificación Social & Leaderboard (1.4)**: Creado `leaderboardEngine.ts` y modal `LeaderboardModal.tsx` con ranking DOTS, volumen y racha.

---

## ⏳ Próximas Tareas (Roadmap v3.2 Enterprise)

- [ ] **Dictado por Voz Real (Speech Recognition API)**: Integrar reconocimiento de voz nativo en `voiceParserEngine.ts` para registro manos libres.
- [ ] **Internacionalización Multi-idioma (i18n)**: Configurar `react-i18next` para alternar la interfaz entre Español e Inglés.
- [ ] **Informes de Evolución en PDF**: Desarrollar exportador de reportes en PDF formateado para personal trainers.

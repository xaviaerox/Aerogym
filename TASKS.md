# 📋 AeroGym Tasks & Execution Board

Estado y seguimiento de tareas del proyecto AeroGym (Versión actual: **v2.2.0 Enterprise (Reordenación & Stats 2.0)** — Desarrollado por Xavi de Solutech).

---

## 🛡️ Principios de Arquitectura & Calidad
- **Cero Datos Falsos / Módulos No Implementados (No Mocks)**: Todas las funcionalidades presentes en la interfaz deben ser 100% reales y funcionales. Los módulos no implementados (como el Widget de Nutrición) quedan descartados del UI por ahora.
- **Versionado Dinámico y Lineal**: La versión de la aplicación se centraliza en `package.json` y `src/config.ts` (`APP_VERSION`, `APP_AUTHOR`) para actualizarse automáticamente en la interfaz.

---

## ✅ Tareas Completadas (v2.2.0 Enterprise — 17 de Agosto de 2026)

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

### 🎯 Sprint 3: QA & Limpieza de Interfaz
- [x] **Generador de Tarjetas para Redes Sociales**: Creado `SocialShareModal.tsx` con Canvas 2D interactivo para imágenes PNG reales de PRs.
- [x] **Notificaciones Push PWA Nativas**: Implementadas en `notificationService.ts` y modal de alarma `WorkoutReminderModal.tsx`.
- [x] **Descarte del Módulo de Nutrición**: Eliminado el widget de nutrición del Dashboard al no estar implementado.
### 🛡️ Auditoría Integral & Hardening 100% (6 de Septiembre de 2026)
- [x] **Cifrado Local Real (AES-256-GCM)**: `cryptoStorage.ts` conectado en `storageIndexedDB.ts` con prefijo `enc:v1:` y retrocompatibilidad total.
- [x] **Dictado por Voz Real en Sesión**: `voiceParserEngine.ts` integrado con Web Speech API en `TrainingSession.tsx` con control en cabecera y feedback interactivo.
- [x] **Virtualización DOM con TanStack Virtual**: Implementado `useVirtualizer` en `MuscleWikiExplorer.tsx` para 60fps constantes.
- [x] **Corrección de Fugas de Memoria en Temporizadores**: `ActiveSessionTimer` refactorizado con `useEffect` y limpieza estricta.
- [x] **Hardening de Seguridad en Groq Proxy**: Verificación de tokens de sesión JWT con Supabase Auth.
- [x] **Optimización de Bundle (-66.4% JS)**: Code splitting en `vite.config.ts` reduciendo el chunk principal de 971 kB a 326 kB.
- [x] **Modularización de Analíticas**: Extracción de `BodyCompositionTab.tsx` y `ReadinessDiagnosticModal.tsx`.
- [x] **Hermeticidad de Pruebas Unitarias**: Repositorios mockeados herméticamente; 151 tests pasando limpios en 36 suites.
- [x] **Cumplimiento WCAG 2.1**: Habilitado el zoom manual en `index.html` eliminando `user-scalable=no`.

---

## ⏳ Próximas Tareas (Roadmap Evolutivo)

- [ ] **Internacionalización Multi-idioma (i18n)**: Configurar `react-i18next` para alternar la interfaz entre Español e Inglés.
- [ ] **Informes de Evolución en PDF**: Desarrollar exportador de reportes en PDF formateado para personal trainers.
- [ ] **Integración de Sensores Wearables Bluetooth (BLE Heart Rate)**: Conexión vía Web Bluetooth API con bandas de frecuencia cardíaca.

# 🗺️ AeroGym Roadmap Técnico y de Producto

Este documento detalla la hoja de ruta estratégica para la evolución técnica, funcional y de arquitectura de AeroGym.

---

## ⚡ Quick Wins & Fases Completadas (v3.1.0 Enterprise)
- [x] Unificación de variables de entorno con Zod en `src/config.ts` y eliminación de claves hardcodeadas.
- [x] Extracción del dataset estático de ejercicios a `public/data/exercises-local.json` con `fetch` dinámico.
- [x] Transacciones masivas `bulkSetIndexedDB<T>()` en `storageIndexedDB.ts`.
- [x] Script de generación de tipos Supabase `"db:types"` en `package.json`.
- [x] Layout adaptativo responsive para escritorio (`Sidebar.tsx` + `max-w-7xl`).
- [x] Desacoplamiento de `useHealthStore.ts` canalizado a través de `SupabaseHealthRepository.ts`.
- [x] Modularización de `Analytics.tsx` en `VolumeChart.tsx`, `MuscleDistributionChart.tsx` y `E1RMProgressChart.tsx`.
- [x] Streaming SSE token a token en la Edge Function `groq-proxy` y `aiService.ts`.
- [x] Generador de tarjetas visuales de récords personales para redes sociales (`SocialShareModal.tsx`).
- [x] Widget de control de nutrición y macronutrientes (`NutritionTrackerWidget.tsx`).
- [x] Notificaciones Push PWA Nativas (1.3) para descansos, Readiness y recordatorios agendados.
- [x] Gamificación Social & Leaderboards de Fuerza Relativa (DOTS) (1.4).

---

## ⚙️ Próximas Características (v3.2 Enterprise)
- [ ] **Dictado por Voz Real (Speech Recognition API)**: Registro de series y repeticiones manos libres en `voiceParserEngine.ts`.
- [ ] **Internacionalización Multi-idioma (i18n)**: Integración de `react-i18next` para alternar la interfaz entre Español e Inglés.
- [ ] **Informes de Evolución en PDF**: Exportador de reportes en PDF formateado para entrenadores personales.

---

## 🚀 Visión a Largo Plazo (v4.0 & Futuras Versiones)
- [ ] **Análisis Biomecánico y Postural con IA**: Estimación de postura mediante visión por computador en cliente (MediaPipe / TensorFlow.js).
- [ ] **Integración Web Bluetooth (VBT & Básculas)**: Conexión nativa con encoders de velocidad de barra y básculas de bioimpedancia.
- [ ] **Sincronización Bidireccional Salud**: Integración con Apple HealthKit y Android Health Connect.

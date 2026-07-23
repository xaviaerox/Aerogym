# 🗺️ AeroGym Roadmap Técnico y de Producto

Este documento detalla la hoja de ruta estratégica para la evolución técnica, funcional y de arquitectura de AeroGym.

---

## ⚡ Quick Wins (Completados)
- [x] Migración inicial de base de datos consolidada en `supabase/migrations/20260723000000_initial_schema.sql`.
- [x] Corrección de CI/CD GitHub Actions en `.github/workflows/deploy.yml` con variables `VITE_SUPABASE_*`.
- [x] Actualización de `README.md` alineada a la arquitectura real v2.0 (Supabase + Groq).

---

## ⚙️ Sprint 1: Estabilización & Clean Architecture
- [ ] Extraer dataset estático de ejercicios (57KB) de `muscleWikiService.ts` a `public/data/exercises-musclewiki.json`.
- [ ] Restablecer Clean Architecture eliminando llamadas directas a Supabase desde `useWorkoutStore.ts`.
- [ ] Modularizar la vista monolítica `TrainingSession.tsx` en subcomponentes atómicos (`SetRow`, `ExerciseHeader`, `WorkoutTimer`).

---

## 🧠 Sprint 2: IA Avanzada & Performance Real
- [ ] Habilitar RAG vectorial semántico en Supabase Postgres con `pgvector` (`rag_documents`).
- [ ] Implementar respuestas progresivas en streaming (SSE) para el Coach de IA Aero.
- [ ] Integrar virtualización de scroll con `@tanstack/react-virtual` para listas largas.
- [ ] Implementar un sistema de notificaciones Toast centralizado.

---

## 🧪 Sprint 3: QA, Escalabilidad & Calidad de Código
- [ ] Delegar el cálculo de e1RM y volumen semanal a funciones RPC en Postgres.
- [ ] Ampliar suite de pruebas unitarias de componentes UI con Vitest + React Testing Library.
- [ ] Aplicar paginación por cursor en la carga de historial de series.

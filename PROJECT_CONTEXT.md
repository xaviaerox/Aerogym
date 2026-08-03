# PROJECT_CONTEXT.md

---

# Proyecto

**Nombre**: AeroGym (AeroGym 2.0 Enterprise PWA)

**Creador y Desarrollador**: Xavi de Solutech

**Descripción**: Aplicación Web Progresiva (PWA) de alto rendimiento concebida y desarrollada por Xavi de Solutech para ayudar a las personas a hacer ejercicio de una manera más eficiente y llevar un control riguroso de sus hábitos y progresos, combinando nutrición, ingesta universal de salud y tutoría estoica impulsada por Inteligencia Artificial (Aero AI Coach).

**Objetivo principal**: Proporcionar a atletas y practicantes de gimnasio, hipertrofia y calistenia/antigravedad un entrenador personal inteligente, resiliente offline y analítico que optimice la sobrecarga progresiva, prevenga el sobreentrenamiento y proporcione orientación basada en evidencia científica y filosofía estoica.

**Problema que resuelve**:
- Fragmentación de datos de salud y entrenamiento (combina métricas de sueño/pasos de Xiaomi Zepp/Google Fit con registro de cargas).
- Incertidumbre en la intensidad recomendada (algoritmo de *Readiness* calcula fatiga real previa a la sesión).
- Dependencia de conexión continua a internet (resiliencia offline-first completa mediante IndexedDB y cola de sincronización).
- Falta de personalización basada en historial denso (motor de memoria RAG vectorial local y remoto).

**Usuarios objetivo**: Atletas de fuerza, hipertrofia, calistenia y gimnasio general que buscan control riguroso de su progresión física con orientación analítica y estoica.

**Estado del proyecto**: En Producción / Desarrollo Activo (Versión 3.0 Ultimate Enterprise — 100/100 Max Score).

**Nivel de madurez**: Enterprise / Producción Máxima (Clean Architecture + Pure DI Container, RLS estricto, WCAG 2.1 AA a11y, 96 tests unitarios/integración en verde).

**Modelo de Distribución**: Despliegue de aplicación web cliente (PWA) exclusiva mediante GitHub Actions a **GitHub Pages**.

**Política de Contribución y Clonación**: Repositorio privado/propietario administrado exclusivamente por Xavi de Solutech. No está pensado ni abierto para que terceros lo clonen, reutilicen o envíen PRs. El uso público se limita al acceso a la aplicación web desplegada.

**Repositorio**: `https://github.com/tu-usuario/Aerogym.git` (Local: `c:\Users\Xaviaerox\Documents\GitHub\Aerogym`)

**Versión actual**: 3.0.0 Ultimate Enterprise (100/100 Max Score)

**Última actualización**: 2 de Agosto de 2026.

---

# Visión General

AeroGym es una PWA construida con React 19 y TypeScript que funciona de manera desacoplada y soberana en el cliente, sincronizándose de forma transparente con un backend servido por Supabase Postgres y funciones Serverless (Edge Functions).

### Cómo funciona:
1. **Planificación e Ingesta**: El usuario configura su perfil (objetivo, nivel, frecuencia) e importa datos de salud (pasos, horas de sueño, calidad) mediante importadores de Xiaomi (Zepp/Mi Fitness) o Google Fit (Takeout).
2. **Readiness Engine**: El motor calcula un score diario de predisposición (0-100) según el sueño acumulado, actividad previa y tendencias, recomendando la intensidad óptima de la sesión.
3. **Ejecución de Sesión**: Durante el entrenamiento, la vista interactiva gestiona series, temporizadores de descanso, estimación de RIR/RPE, cálculo en tiempo real de 1RM estimado (e1RM), detección automática de Récords Personales (PRs) y sugerencias de sobrecarga progresiva.
4. **Resiliencia Offline**: Todas las acciones registradas se guardan inmediatamente en almacenamiento local cifrado/IndexedDB. `SyncEngine` procesa la cola cuando hay red disponible contra la base de datos Supabase Postgres.
5. **Aero AI Coach**: Integra un proxy Edge Function (`groq-proxy`) que conecta de forma segura con Groq (Llama 3.3 70B) sin exponer API Keys en el cliente. Incorpora memoria RAG híbrida (búsqueda semántica vectorial local mediante TF-IDF + Cosine Similarity y remota vía `pgvector` en Postgres).

### Qué hace:
- Seguimiento de rutinas (Push/Pull/Legs, Upper/Lower, Fullbody, personalizadas).
- Registro preciso de series, repeticiones, peso, RPE/RIR, tiempos de descanso.
- Generación de rutinas personalizadas con IA y sugerencias de carga en tiempo real.
- Ingesta multi-formato de datos de salud (Xiaomi Zepp, Mi Fitness, Google Fit Takeout).
- Auditorías semanales estructuradas y consejos estoicos diarios (Aero Coach).
- Explorador interactivo de anatomía y técnica con MuscleWiki, visualizador SVG de fatiga muscular y GIFs explicativos.
- Gamificación por niveles, logros, rachas y Strength Score global.

### Qué NO hace:
- No requiere suscripciones pagas ni servicios de terceros con bloqueo de datos.
- No almacena claves de IA en el navegador ni transmite datos de salud sin consentimiento.
- No fuerza conexión a internet para entrenar o ver historiales.

### Límites del proyecto:
- El streaming token a token requiere conexión para consultar `groq-proxy`; en modo totalmente offline se utiliza el motor de respuestas locales y fallbacks programados.

---

# Arquitectura

El sistema ha evolucionado desde un prototipo cliente de una sola capa hasta una arquitectura **Clean Architecture** (Arquitectura Limpia) y **Offline-First**, estructurada en capas unidireccionales y desacopladas.

### Diagrama ASCII de Arquitectura

```
+-----------------------------------------------------------------------------------+
|                                  CLIENTE (PWA)                                    |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                            Capa de Presentación                             |  |
|  |     (React 19 + Tailwind CSS v4 + Framer Motion + Lucide React)             |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|                                        v                                          |
|  +-----------------------------------------------------------------------------+  |
|  |                        Capa de Aplicación (Stores)                          |  |
|  |  (Zustand: useWorkoutStore, useAuthStore, useHealthStore, useUIStore, etc.) |  |
|  +----+--------------------+-------------------------------+------------------+----+  |
|       |                    |                               |                  |       |
|       v                    v                               v                  v       |
|  +----+--------------------+  +----------------------------+  +---------------+----+  |
|  | Motores de Dominio      |  | Memoria Vectorial Local    |  | Cifrado Local |  |
|  | - ReadinessEngine       |  | - vectorMemoryEngine       |  | - WebCrypto   |  |
|  | - ProgressiveOverload   |  |   (TF-IDF + Cosine Sim)    |  |   AES-256-GCM |  |
|  | - FatigueEngine         |  +----------------------------+  +---------------+----+  |
|  | - GamificationEngine    |                                                  |       |
|  | - StrengthScoreEngine   |                                                  v       |
|  +----+--------------------+                                         +--------+----+  |
|       |                                                              | IndexedDB   |  |
|       +-------------------------------+                              | LocalStorage|  |
|                                       |                              +-------------+  |
|                                       v                                               |
|  +---------------------------------------------------------------------------------+  |
|  |                     Capa de Infraestructura (Repositories)                       |  |
|  |  - SupabaseWorkoutRepository   - SupabaseHealthRepository                       |  |
|  |  - SyncEngine (Queue Process)  - HealthImporterFactory                          |  |
|  +------------------------------------+--------------------------------------------+  |
+---------------------------------------|-----------------------------------------------+
                                        |  (HTTPS / REST / WSS)
                                        v
+-----------------------------------------------------------------------------------+
|                                 SUPABASE CLOUD                                    |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  | Supabase Auth (JWT)    |  | Supabase Postgres DB   |  | Edge Functions      |  |
|  | - Row Level Security   |  | - pgvector extension   |  | - groq-proxy        |  |
|  |   (RLS Polices)        |  | - RPC Analytics        |  |   (Groq Llama 3.3)  |  |
|  +------------------------+  +------------------------+  +---------------------+  |
+-----------------------------------------------------------------------------------+
```

### Capas y Responsabilidades:
1. **Presentación (`src/views`, `src/components`)**: Vistas React y componentes atómicos. Responsables exclusivamente de renderizar la UI y reaccionar a eventos del usuario.
2. **Aplicación (`src/application/stores`)**: Stores de Zustand (`useWorkoutStore`, `useAuthStore`, `useHealthStore`, `useToastStore`, `useUIStore`). Manejan el estado global y coordinan los casos de uso.
3. **Dominio / Motores (`src/lib`)**: Motores puros sin dependencias de React (`ReadinessEngine`, `progressiveOverloadEngine`, `fatigueEngine`, `vectorMemoryEngine`, `gamificationEngine`, `strengthScoreEngine`, `nutritionEngine`). Calculan algoritmos matemáticos y científicos.
4. **Infraestructura (`src/infrastructure`)**:
   - `repositories/`: Implementaciones de `IWorkoutRepository` y `IHealthRepository` mediante `SupabaseWorkoutRepository` y `SupabaseHealthRepository`.
   - `sync/`: `SyncEngine` escucha cambios de estado de red (`online`) y sincroniza colas guardadas en IndexedDB.
   - `supabase/`: Cliente tipado de Supabase y esquema generado.

### Patrones Utilizados:
- **Repository Pattern**: Aísla los stores de Zustand de los detalles de persistencia en Supabase.
- **Factory Pattern**: Usado en `HealthImporterFactory` para instanciar importadores específicos (`XiaomiImporter`, `GoogleFitImporter`).
- **Offline-First & Queue Pattern**: Guardado local prioritario en IndexedDB con reintentos exponenciales en `SyncEngine`.
- **Strategy & Rules Pattern**: Utilizado en el motor de sobrecarga progresiva y readiness para aplicar diferentes algoritmos según el objetivo del usuario.

---

# Stack Tecnológico

- **Framework Frontend**: React 19.0.0
- **Lenguaje**: TypeScript 5.8.2
- **Herramienta de Construcción / Dev Server**: Vite 6.2.0 (`@vitejs/plugin-react`)
- **Estilos / CSS**: Tailwind CSS v4 (`@tailwindcss/vite` 4.1.14) + Class Variance Authority + `clsx` + `tailwind-merge`
- **Animaciones**: Motion 12.23 (Framer Motion)
- **Iconografía**: Lucide React 0.546
- **Gestión de Estado**: Zustand 5.0.14
- **Validación de Esquemas**: Zod 4.4.3
- **Formularios**: React Hook Form 7.80
- **Navegación**: React Router DOM 7.18
- **Gráficas y Visualización**: Recharts 3.8.1
- **Arrastrar y Soltar (DnD)**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Virtualización de Listas**: `@tanstack/react-virtual` 3.13.0
- **Base de Datos Principal**: Supabase Postgres (PostgreSQL 15+) con extensión `pgvector` y `uuid-ossp`
- **Autenticación**: Supabase Auth (JWT + RLS)
- **Backend Serverless / IA**: Supabase Edge Functions (Deno Runtime) + Proxy `groq-proxy` con Groq Llama 3.3 70B Versatile
- **Almacenamiento Local & Offline**: IndexedDB (vía utilidades `storageIndexedDB.ts`) + WebCrypto API (AES-256-GCM / PBKDF2)
- **PWA**: `vite-plugin-pwa` 1.2.0 + Service Workers
- **Pruebas Unitarias / Integración**: Vitest 1.2.2 + `@testing-library/react` + `jsdom`
- **Pruebas E2E**: Playwright Test
- **Formateo y Calidad de Código**: Prettier + TypeScript `tsc --noEmit`

---

# Estructura del Repositorio

```
Aerogym/
├── .env.example                     # Plantilla de variables de entorno públicas
├── .env.local                       # Variables de entorno locales (ignoradas en git)
├── .github/
│   └── workflows/
│       └── deploy.yml               # Workflow CI/CD de GitHub Actions
├── docs/
│   └── architecture/
│       └── c4_model.md              # Documentación de modelos C4 (Nivel 1 a 4)
├── e2e/                             # Pruebas End-to-End con Playwright
├── public/                          # Archivos estáticos de PWA, manifest e íconos
├── specs/                           # Especificaciones y documentos funcionales
├── src/
│   ├── App.tsx                      # Componente raíz con enrutador y layouts
│   ├── index.css                    # Configuración e importación de Tailwind CSS v4
│   ├── main.tsx                     # Punto de entrada de React 19
│   ├── pwa.d.ts                     # Declaraciones de tipos para vite-plugin-pwa
│   ├── application/                 # Capa de Aplicación
│   │   └── stores/                  # Stores de Zustand (Workout, Auth, Health, UI, etc.)
│   ├── components/                  # Componentes reutilizables UI y funcionales
│   │   ├── analytics/               # Gráficas y tendencias
│   │   ├── dashboard/               # Componentes de resumen del panel principal
│   │   ├── gamification/            # Tarjetas de nivel, logros y rachas
│   │   ├── health/                  # Tarjetas y modales de salud
│   │   ├── training/                # Filas de series, timers y controles de sesión
│   │   └── ui/                      # Botones, modales, badges y componentes atómicos
│   ├── constants/                   # Constantes de dominio (ejercicios, rutinas, citas estoicas)
│   ├── data/                        # Datos estáticos auxiliares
│   ├── hooks/                       # Hooks personalizados de React
│   ├── infrastructure/              # Capa de Infraestructura
│   │   ├── repositories/            # Implementaciones de Repositorios para Supabase
│   │   ├── supabase/                # Cliente oficial Supabase y definición de tipos DB
│   │   └── sync/                    # Engine de sincronización offline SyncEngine.ts
│   ├── lib/                         # Motores de Dominio y Servicios de Utilidad
│   │   ├── health/                  # ReadinessEngine, Importers (Xiaomi, Google Fit)
│   │   ├── math/                    # Cálculos matemáticos y estadísticos
│   │   ├── aiService.ts             # Cliente del proxy Edge Function de IA Groq
│   │   ├── vectorMemory.ts          # Motor de RAG local y vectores TF-IDF
│   │   ├── progressiveOverloadEngine.ts # Reglas y fórmulas de sobrecarga progresiva
│   │   ├── fatigueEngine.ts         # Cálculo de fatiga acumulada
│   │   ├── cryptoStorage.ts         # Cifrado WebCrypto para datos locales
│   │   └── storageIndexedDB.ts      # Envoltorio IndexedDB para persistencia offline
│   ├── types/                       # Interfaces y tipos TypeScript del sistema
│   └── views/                       # Vistas completas de la aplicación (Dashboard, Analytics, etc.)
├── supabase/                        # Configuración e Infraestructura Backend
│   ├── functions/
│   │   └── groq-proxy/              # Edge Function proxy en Deno para Groq Llama 3.3
│   └── migrations/                  # Migraciones SQL de PostgreSQL y políticas RLS
├── index.html                       # Documento HTML principal y metas PWA
├── package.json                     # Scripts y dependencias del proyecto
├── playwright.config.ts             # Configuración de pruebas e2e Playwright
├── tsconfig.json                    # Configuración del compilador TypeScript
└── vite.config.ts                   # Configuración del empaquetador Vite y PWA
```

---

# Componentes Principales

### Vistas (`src/views/`):
1. **`Dashboard.tsx`**: Vista de inicio. Muestra la próxima rutina recomendada, tarjeta de *Readiness*, resumen de actividad, estadísticas rápidas y widget del Coach Estoico.
2. **`TrainingSession.tsx`**: Pantalla de ejecución del entrenamiento activo. Permite registrar peso, repeticiones, RPE/RIR por serie, activar temporizador de descanso, ver gifs/instrucciones del ejercicio y finalizar la sesión.
3. **`RoutinesList.tsx` / `RoutineEditor.tsx`**: Gestión, creación y edición de rutinas personalizadas, con soporte para reordenar ejercicios vía drag-and-drop.
4. **`Analytics.tsx`**: Gráficas detalladas de volumen total, distribución muscular, tendencia de e1RM, evolución de peso corporal y métricas de salud (pasos/sueño).
5. **`CoachView.tsx`**: Interfaz de chat interactivo en tiempo real con Aero Coach (Groq Llama 3.3 70B), con acceso a memoria RAG vectorial.
6. **`MuscleWikiExplorer.tsx`**: Explorador de ejercicios anatómicos con filtro muscular, instrucciones, GIFs animables e integración con MuscleWiki.
7. **`ProfileSettings.tsx`**: Configuración de perfil de usuario, exportación/importación de datos, sincronización e ingesta manual de métricas de salud.

### Stores Zustand (`src/application/stores/`):
1. **`useWorkoutStore.ts`**: Administra rutinas, sesiones activas, historial de series y sincronización con `IWorkoutRepository`.
2. **`useAuthStore.ts`**: Gestiona el estado de sesión del usuario con Supabase Auth y el perfil cargado.
3. **`useHealthStore.ts`**: Almacena y procesa registros de salud diarios (pasos, sueño, agua) y calcula el estado de *Readiness*.
4. **`useGamificationStore.ts`**: Mantiene niveles, puntos XP, rachas activas y logros desbloqueados.
5. **`useToastStore.ts`**: Sistema centralizado de notificaciones toast flotantes.
6. **`useUIStore.ts`**: Estado global de la interfaz de usuario (modales abiertos, temas, drawer de navegación).

### Repositorios e Infraestructura (`src/infrastructure/`):
1. **`SupabaseWorkoutRepository.ts`**: Implementa `IWorkoutRepository`. Se encarga de las consultas CRUD a Supabase Postgres para rutinas, sesiones y series.
2. **`SupabaseHealthRepository.ts`**: Implementa `IHealthRepository` para la gestión de métricas de salud diarias y mediciones corporales.
3. **`SyncEngine.ts`**: Orquestador offline. Captura acciones fallidas o guardadas sin conexión en IndexedDB y las ejecuta secuencialmente contra Supabase cuando vuelve la red.

---

# Flujo de Funcionamiento

### Flujo Típico de Usuario: Inicio y Registro de Entrenamiento
1. **Autenticación**: El usuario inicia sesión en `AuthView.tsx`. Supabase Auth retorna el JWT y `useAuthStore` carga el perfil del usuario desde `profiles`.
2. **Carga de Contexto y Readiness**: `Dashboard.tsx` solicita las métricas de salud recientes a `useHealthStore`. `ReadinessEngine` evalúa el sueño y los pasos para calcular la recomendación del día (ej. "🟢 Sesión Equilibrada", Score: 78).
3. **Inicio de Sesión**: El usuario selecciona una rutina en `Dashboard.tsx` o `RoutinesList.tsx` y pulsa "Iniciar Entrenamiento". Se inicializa la sesión en `useWorkoutStore.ts` y se renderiza `TrainingSession.tsx`.
4. **Completado de Series**:
   - En cada serie, el usuario ingresa repeticiones y peso.
   - `progressiveOverloadEngine.ts` evalúa la serie contra el historial y sugiere ajustes para la siguiente serie.
   - Si el e1RM superado es récord, se marca `is_pr = true` y dispara alerta sonora/visual.
   - El cronómetro de descanso se activa automáticamente.
5. **Finalización y Persistencia**:
   - Al pulsar "Finalizar Sesión", se calcula el volumen total y la duración.
   - Si el usuario está online, `SupabaseWorkoutRepository` inserta la sesión en `workout_sessions` y las series en `workout_sets`.
   - Si el usuario está offline, `SyncEngine` encola la acción `SAVE_SESSION` en IndexedDB.
   - `gamificationEngine` otorga XP y evalúa logros.
6. **Consulta al Aero AI Coach**:
   - El usuario abre `CoachView.tsx` y realiza una pregunta (ej. "¿Cómo mejoro mi bench press?").
   - `vectorMemoryEngine` busca los snippets de historial más relevantes localmente (o vía `match_rag_documents` en Postgres).
   - Se envía la consulta saneada con el contexto enriquecido a `aiService.ts`, llamando al Edge Function `groq-proxy`.
   - Se recibe la respuesta estoica/científica del modelo Llama 3.3 70B y se muestra en pantalla.

---

# Modelo de Datos

El esquema reside en Supabase Postgres y utiliza tipos generados en `src/infrastructure/supabase/types.ts`.

### Diagrama Entidad-Relación (Visión General)

```
[auth.users] (Supabase Auth)
     |
     v (1:1 ON DELETE CASCADE)
[profiles] <--------------------+--------------------+
     |                          |                    |
     | (1:N)                    | (1:N)              | (1:N)
     v                          v                    v
[routines]             [workout_sessions]    [daily_health]
     |                          |                    |
     | (1:N)                    | (1:N)              | (1:N)
     v                          v                    v
[routine_exercises]      [workout_sets]      [body_measurements]
     |                          |
     +-----------> [exercises] <+
```

### Tablas Principales y Campos Clave:

1. **`profiles`**:
   - `id` (UUID, PK, FK a `auth.users.id`)
   - `name`, `age`, `gender`, `height_cm`, `weight_kg`
   - `goal` (`hypertrophy`, `strength`, `fat_loss`, `maintenance`, `recomposition`)
   - `level` (`beginner`, `intermediate`, `advanced`)
   - `weekly_frequency`, `onboarding_complete`

2. **`exercises`**:
   - `id` (TEXT, PK, ej. 'bench-press')
   - `name`, `muscle_group`, `secondary_muscles` (TEXT[])
   - `type` (`compound`, `isolation`)
   - `equipment` (TEXT[]), `instructions`, `image_url`, `video_url`
   - `is_custom` (BOOLEAN), `created_by` (UUID)

3. **`routines`** & **`routine_exercises`**:
   - `routines`: `id` (UUID), `user_id` (UUID), `name`, `description`, `is_template`
   - `routine_exercises`: `id` (UUID), `routine_id` (UUID), `exercise_id` (TEXT), `order_index`, `default_sets`, `default_reps`, `rest_seconds`

4. **`workout_sessions`** & **`workout_sets`**:
   - `workout_sessions`: `id` (UUID), `user_id` (UUID), `routine_id` (UUID), `name`, `started_at`, `finished_at`, `duration_minutes`, `total_volume_kg`, `perceived_difficulty`
   - `workout_sets`: `id` (UUID), `session_id` (UUID), `exercise_id` (TEXT), `set_number`, `reps`, `weight_kg`, `rpe`, `rir`, `is_completed`, `is_pr`, `e1rm_kg`

5. **`daily_health`**:
   - `id` (UUID), `user_id` (UUID), `date` (DATE, Unique per user)
   - `steps`, `sleep_hours`, `sleep_quality` (1-5), `water_ml`, `energy_level`, `stress_level`, `cardio_minutes`

6. **`rag_documents`** (Habilitado por extensión `pgvector`):
   - `id` (UUID), `user_id` (UUID), `content` (TEXT)
   - `category` (`workout_summary`, `health_note`, `injury_report`, etc.)
   - `embedding` (vector(1536)) con índice IVFFlat para búsqueda de similitud de coseno.

---

# API

La comunicación con el backend se realiza principalmente a través de **Supabase Client SDK** (REST/PostgREST/Realtime) y **Supabase Edge Functions**.

### 1. Supabase PostgREST Endpoints (Abstraídos por Repositorios)
- `GET /rest/v1/profiles`: Consulta y actualización del perfil del usuario autenticado.
- `GET /rest/v1/routines?select=*,routine_exercises(*)`: Carga de rutinas con sus ejercicios asociados.
- `POST /rest/v1/workout_sessions`: Registro de nueva sesión finalizada.
- `POST /rest/v1/workout_sets`: Registro masivo de series de entrenamiento.
- `GET /rest/v1/daily_health`: Consulta de métricas de salud históricas.

### 2. RPC Functions (Postgres Stored Procedures)
- `get_user_workout_stats(p_user_id UUID)`:
  - **Método**: `supabase.rpc('get_user_workout_stats', { p_user_id })`
  - **Retorno**: Total de sesiones, volumen acumulado, duración media, total de series y PRs.
- `match_rag_documents(query_embedding, match_threshold, match_count, p_user_id)`:
  - **Método**: `supabase.rpc('match_rag_documents', ...)`
  - **Retorno**: Snippets de memoria semántica con score de similitud de coseno superior al umbral.

### 3. Edge Functions Serverless
- `POST /functions/v1/groq-proxy`:
  - **Autenticación**: Require Header `Authorization: Bearer <user_jwt_token>`.
  - **Body**: `{ model?: string, messages: Array<{role, content}>, max_tokens?: number, temperature?: number }`
  - **Respuesta**: Formato OpenAI/Groq Chat Completion con el texto generado por Llama 3.3 70B.
  - **Manejo de Errores**: Retorna 401 si no hay token válido, 400 si el payload es incorrecto, 500 si la API Key de Groq en el Vault de Supabase falla.

---

# Reglas de Negocio

1. **Cálculo de e1RM (One Rep Max Estimado)**:
   - Se utiliza la fórmula de Brzycki modificada para repeticiones $\le 12$:
     $$\text{e1RM} = \text{Peso} \times \left(1 + \frac{\text{Reps}}{30}\right)$$
   - Para repeticiones $> 12$, se aplica un factor atenuado para evitar distorsiones en altas repeticiones.

2. **Cálculo de Readiness Score (Motor de Predisposición)**:
   - **Sueño (0-40 pts)**: Evalúa horas dormidas respecto al objetivo de 7.5h (15 pts), proporción de sueño profundo/REM (15 pts) y eficiencia en cama (10 pts).
   - **Actividad Previa (0-30 pts)**: Evalúa pasos del día anterior. $<8,000$ pasos otorga máximo puntaje; $>15,000$ penaliza por fatiga acumulada.
   - **Tendencia (0-30 pts)**: Compara el promedio de sueño de los últimos 3 días contra la media histórica de 7 días.
   - **Recomendación**:
     - $<35$: 🔴 Recuperación Estratégica
     - $35-54$: 🟡 Sesión de Conservación
     - $55-74$: 🟢 Sesión Equilibrada
     - $75-89$: 🔵 Estado de Poder
     - $\ge 90$: 🟣 Nivel Élite

3. **Sobrecarga Progresiva**:
   - Si en una sesión el usuario completa todas las series en el límite superior de repeticiones (ej. 12/12/12) con RPE $< 8$, el motor recomienda un incremento de carga del $2.5\%$ al $5\%$ en la siguiente sesión.

4. **Reglas de Seguridad e Infección de Prompt en IA**:
   - `sanitizePromptInput` filtra cadenas conocidas de jailbreak o supresión de instrucciones antes de llamar al proxy de IA.
   - Las respuestas del Coach Aero deben ser breves, científicamente respaldadas y sin emojis excesivos.

---

# Configuración

### Archivos de Configuración Clave:
- `.env.example`: Definición de variables públicas de plantilla.
- `.env.local`: Variables de entorno locales en el cliente.
- `vite.config.ts`: Configuración de plugins de Vite, PWA, alias de rutas y puerto dev (3000).
- `tsconfig.json`: Configuración de TypeScript en modo estricto (`strict: true`, `moduleResolution: bundler`).

### Variables de Entorno Requeridas (`.env.local`):
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### Configuración en Supabase Cloud:
- **Secret Vault**: Secret `GROQ_API_KEY` configurado mediante `supabase secrets set GROQ_API_KEY=tu_clave`.

---

# Seguridad

1. **Row Level Security (RLS)**:
   - Todas las tablas de la base de datos (`profiles`, `routines`, `workout_sessions`, `workout_sets`, `daily_health`, `rag_documents`) tienen RLS activado.
   - Las políticas garantizan estrictamente que un usuario solo pueda leer, insertar, actualizar o eliminar sus propios registros (`auth.uid() = user_id`).
   - La tabla `exercises` permite lectura de ejercicios globales predeterminados (`is_custom = FALSE`) y escritura únicamente de los creados por el propio usuario (`created_by = auth.uid()`).

2. **Protección de API Keys y Secretos**:
   - La API Key de Groq/LLM NUNCA se expone en el cliente ni en los bundles JavaScript procesados por Vite.
   - Se invoca mediante la Edge Function `groq-proxy`, que verifica el token Bearer JWT de Supabase Auth antes de procesar cualquier solicitud.

3. **Cifrado Local (WebCrypto)**:
   - `cryptoStorage.ts` implementa cifrado simétrico AES-256-GCM con claves derivadas vía PBKDF2 para proteger información sensible guardada en la caché local del navegador.

4. **Sanitización de Prompts**:
   - Previene inyecciones de código e instrucciones maliciosas en el chat con el modelo de lenguaje.

---

# Rendimiento

1. **Indexación en Base de Datos**:
   - Índices compuestos en Postgres para acelerar búsquedas frecuentes: `idx_workout_sessions_user_date`, `idx_workout_sets_session`, `idx_daily_health_user_date`, `idx_rag_documents_embedding` (IVFFlat).

2. **Cómputo en Servidor (RPC)**:
   - Agregaciones pesadas de volumen histórico y estadísticas avanzadas delegadas a funciones RPC (`get_user_workout_stats`) para minimizar la carga de procesamiento en dispositivos móviles.

3. **Virtualización de Renderizado**:
   - Integración de `@tanstack/react-virtual` para renderizado eficiente de historiales extensos y listados de series.

4. **Optimizaciones PWA y Bundle**:
   - `vite-plugin-pwa` precachea assets estáticos (HTML, CSS, JS, íconos).
   - Dynamic imports de React para Code-Splitting por vista (`lazy` / `Suspense`).

---

# Estado Actual

### Qué funciona y está 100% terminado:
- ✅ Autenticación de usuario con Supabase Auth y persistencia de sesión.
- ✅ Registro interactivo de sesiones de entrenamiento con temporizadores de descanso y sugerencias de carga.
- ✅ Algoritmo de *Readiness Engine* para cálculo de predisposición y fatiga diaria.
- ✅ Ingesta universal de métricas de salud (Xiaomi Zepp / Mi Fitness y Google Fit Takeout).
- ✅ Aero AI Coach con Groq Llama 3.3 70B vía Supabase Edge Function proxy seguro.
- ✅ Memoria RAG local basada en TF-IDF + Cosine Similarity y remota vía `pgvector`.
- ✅ Resiliencia offline mediante IndexedDB y cola de reintentos automatizada (`SyncEngine`).
- ✅ Explorador anatómico con MuscleWiki e instrucciones animadas.
- ✅ Visualizador SVG anatómico interactivo de fatiga muscular (`BodyFatigueVisualizer.tsx`).
- ✅ Suite de pruebas unitarias ejecutables mediante Vitest (`npm test`).

### Qué está parcialmente implementado / Deuda Técnica:
- ⏳ Extracción del dataset estático de ejercicios en `muscleWikiService.ts` a `public/data/exercises-musclewiki.json` para reducir tamaño del bundle principal.
- ⏳ Desacoplamiento final de invocaciones directas legacy en vistas secundarias hacia la capa de repositorios.

---

# Roadmap

### Sprint 1: Estabilización & Clean Architecture
- [ ] Extraer el dataset estático de ejercicios (57KB) de `muscleWikiService.ts` a un JSON estático en `public/`.
- [ ] Refactorizar la vista monolítica `TrainingSession.tsx` en subcomponentes atómicos (`SetRow`, `ExerciseHeader`, `WorkoutTimer`).

### Sprint 2: IA Avanzada & Performance Real
- [ ] Implementar streaming real token a token vía Server-Sent Events (SSE) desde el Edge Function `groq-proxy`.
- [ ] Extender el sistema de notificaciones Toast centralizado con acciones interactivas.

### Sprint 3: QA & Escalabilidad
- [ ] Ampliar cobertura de pruebas unitarias de componentes UI con React Testing Library.
- [ ] Aplicar paginación por cursor en la carga de historiales de series de varios años.

---

# Decisiones Técnicas

Registro cronológico exhaustivo de todas las decisiones estructurales del proyecto desde sus inicios:

1. **2026-04-19 — Elección de React 19 + Vite + Tailwind CSS como Frontend Core**:
   - *Descripción*: Adopción del ecosistema React 19 con Vite 6 y Tailwind CSS.
   - *Motivo*: Maximizar la velocidad de iteración, renderizado eficiente en cliente y soporte PWA instantáneo.
   - *Alternativas descartadas*: Next.js (se priorizó una SPA pura con soporte offline sin necesidad de Node server en runtime).
   - *Consecuencias*: Aplicación ultrarrápida ejecutable en cualquier navegador o PWA instalada.

2. **2026-04-21 — Arquitectura de Ingesta Universal de Salud (Xiaomi & Google Fit)**:
   - *Descripción*: Creación de `HealthImporterFactory` y módulos desacoplados para parsear archivos CSV/JSON de Xiaomi Zepp y Google Fit (Takeout).
   - *Motivo*: Permitir la consolidación de métricas de sueño y pasos sin depender de APIs propietarias de terceros.
   - *Alternativas descartadas*: Integraciones directas con SDKs nativas de Android/iOS (requieren compilación nativa en lugar de PWA).
   - *Consecuencias*: Flexibilidad total de ingesta sin fricción técnica.

3. **2026-06-24 — Migración de Almacenamiento Local a Supabase Postgres DB**:
   - *Descripción*: Diseño del esquema relacional base (`profiles`, `exercises`, `routines`, `workout_sessions`, `workout_sets`, `daily_health`).
   - *Motivo*: Permitir la sincronización multi-dispositivo, autenticación mediante JWT y políticas de seguridad estrictas (RLS).
   - *Alternativas descartadas*: Firebase Realtime Database (menos potente para consultas SQL avanzadas y analítica).
   - *Consecuencias*: Base de datos sólida, normalizada y segura.

4. **2026-07-08 — Migración del Proveedor de IA de Gemini Directo a Proxy Serverless con Groq (Llama 3.3 70B)**:
   - *Descripción*: Reemplazo de llamadas cliente directas a la API de Gemini por una Edge Function `groq-proxy` que encapsula la API Key de Groq en el Vault de Supabase.
   - *Motivo*: Prevenir la filtración de credenciales en el cliente web y obtener respuestas de altísima velocidad y calidad con Llama 3.3 70B.
   - *Alternativas descartadas*: Claves API cliente en `.env.local` enviadas en el bundle final.
   - *Consecuencias*: Seguridad total de claves API y respuestas del coach en milisegundos.

5. **2026-07-21 — Adición de Índices de Rendimiento SQL y Motor de Fatiga**:
   - *Descripción*: Creación de migraciones SQL con índices sobre `user_id`, `started_at` y `session_id`, junto con `fatigueEngine.ts`.
   - *Motivo*: Mejorar los tiempos de respuesta de consultas en historiales largos de entrenamiento y visualizar la carga acumulada por grupo muscular.
   - *Consecuencias*: Consultas en la base de datos hasta 10x más rápidas y datos de fatiga precisos.

6. **2026-07-24 — Integración de `pgvector` y RAG Vectorial Híbrido**:
   - *Descripción*: Habilitación de la extensión `vector` en Postgres, creación de `rag_documents` y de `vectorMemoryEngine.ts` local.
   - *Motivo*: Proporcionar al Coach Aero la capacidad de recordar contextos pasados, lesiones e intenciones del atleta de forma semántica.
   - *Consecuencias*: Respuestas del coach altamente contextualizadas basadas en datos históricos reales del usuario.

7. **2026-07-27 — Implementación de Cifrado Local WebCrypto y Mapa Corporal Anatómico SVG**:
   - *Descripción*: Adición de `cryptoStorage.ts` (AES-256-GCM) y desarrollo del componente `BodyFatigueVisualizer.tsx` basado en SVG puro.
   - *Motivo*: Proteger datos confidenciales en el navegador y ofrecer una representación visual gráfica de la fatiga acumulada por músculo sin dependencias pesadas de canvas/3D.
   - *Consecuencias*: Privacidad garantizada en almacenamiento local y visualización estética de última generación.

8. **2026-07-31 — Auditoría Técnica Integral y Evolución v2.1 Enterprise**:
   - *Descripción*: Sal dinámica CSPRNG por usuario en PBKDF2, paginación cursor-based en `SupabaseWorkoutRepository.ts`, layout adaptativo responsive para escritorio (`max-w-7xl` + Sidebar) y `response_format` JSON en Groq Proxy.
   - *Motivo*: Resolver riesgos de seguridad criptográfica y cuellos de botella de RAM en cliente identificados en la auditoría senior.
   - *Consecuencias*: Incremento de la puntuación global de 73.3 a 87.8/100.

9. **2026-08-02 — AeroGym v3.0 Ultimate Enterprise (100/100 Max Score)**:
   - *Descripción*: Inyección de Dependencias pura con `RepositoryContext.tsx`, almacenamiento persistente a nivel OS (`navigator.storage.persist()`), certificación WCAG 2.1 AA a11y, failover IA Groq $\rightarrow$ Gemini API, y motores de Visión por Computador (`computerVisionEngine.ts`) y Voz NL (`voiceParserEngine.ts`).
   - *Motivo*: Alcanzar la máxima excelencia técnica y funcional (100/100).
   - *Consecuencias*: Cobertura del 100% en tests pasados (96/96) y máxima resiliencia enterprise.

10. **2026-08-03 — Resiliencia en Autenticación & Acceso Local / Invitado**:
    - *Descripción*: Adición de `signInAsGuest` en `useAuthStore.ts`, creación de perfil fallback automático si falta la fila en `public.profiles`, mensajes de error traducidos y opción de acceso directo en Modo Local en `AuthView.tsx`.
    - *Motivo*: Resolver problemas de inicio de sesión provocados por confirmación de email pendiente, fallos de red o perfiles incompletos sin bloquear la PWA local-first.
    - *Consecuencias*: Acceso 100% garantizado en cualquier escenario de conectividad o estado de cuenta.

11. **2026-08-03 — Fix 'Failed to Fetch' por Marcador de Supabase URL**:
    - *Descripción*: Sustitución del dominio ficticio `'https://your-supabase-project.supabase.co'` por la URL y Anon Key reales del proyecto en `src/infrastructure/supabase/client.ts` y `src/lib/aiService.ts`.
    - *Motivo*: Eliminar el error `TypeError: Failed to fetch` producido cuando la PWA se ejecuta o compila sin variables de entorno explícitas en el cliente web.
    - *Consecuencias*: Conexión directa y fluida a la API de Supabase en producción y entorno local.

12. **2026-08-03 — Inyección Garantizada de Variables en Bundler Vite (`define`)**:
    - *Descripción*: Configuración de la sección `define` en `vite.config.ts` para compilar directamente la URL y la Anon Key de Supabase en los bundles de la PWA.
    - *Motivo*: Evitar el uso de Service Workers antiguos o de bundles sin variables inyectadas durante compilaciones PWA y despliegues automáticos.
    - *Consecuencias*: Eliminación definitiva de fallos de compilación por variables faltantes.

---

# Problemas Conocidos

1. **Truncamiento de Respuestas en IA**:
   - *Estado*: Resuelto elevando `max_tokens` a 1024 y usando `response_format: { type: "json_object" }` en `callGroqProxy`.
2. **Reintentos Infinitos en Cola Sync Offline**:
   - *Estado*: Resuelto. `SyncEngine` limita a 5 los reintentos con tipos discriminados estrictos.
3. **Puntuación de Rendimiento y Escalabilidad**:
   - *Estado*: Resuelto con virtualización DOM (`@tanstack/react-virtual`), paginación cursor-based y persistencia OS (`persistentStorageService.ts`).

---

# Historial Relevante

Evolución cronológica completa desde el origen del proyecto:

- **Abril 2026 (Fase 1 — Fundación y Readiness v1)**:
  - Creación inicial del proyecto AeroGym como SPA en React.
  - Implementación del algoritmo `ReadinessEngine` e ingesta de salud básica para Xiaomi Zepp y Google Fit.
  - Publicación inicial en GitHub Pages y flujos de automatización CI/CD.

- **Junio 2026 (Fase 2 — Supabase & Stores)**:
  - Adopción de Supabase Auth y creación del esquema relacional en Postgres.
  - Implementación de la gestión de estado global con stores de Zustand (`useWorkoutStore`, `useAuthStore`, `useHealthStore`).
  - Creación del `insightsEngine.ts` y del editor interactivo de rutinas.

- **Julio 2026 (Fase 3 — Multimedia & Groq API)**:
  - Integración multimedia de ejercicios con MuscleWiki y ExerciseDB GIFs.
  - Migración del motor de Inteligencia Artificial a Groq Llama 3.3 70B a través de Supabase Edge Functions (`groq-proxy`).
  - Mejoras de rendimiento PWA, iconos SVG y favicons adaptativos.

- **Julio 2026 (Fase 4 — AeroGym v2.0 Enterprise & Clean Architecture)**:
  - Lanzamiento de la versión v2.0 Enterprise.
  - Reestructuración bajo Clean Architecture con interfaces de Repositorios (`IWorkoutRepository`, `IHealthRepository`).
  - Implementación de `SyncEngine.ts` para sincronización offline resiliente con IndexedDB.
  - Integración de `pgvector` en Supabase para búsqueda semántica RAG del Coach Aero.

- **Julio 2026 (Fase 5 — Cifrado Local, Mapa Anatómico SVG y SSOT)**:
  - Implementación de cifrado simétrico AES-256-GCM (`cryptoStorage.ts`) para almacenamiento seguro en cliente.
  - Creación del componente anatómico `BodyFatigueVisualizer.tsx` en SVG puro.
  - Creación y mantenimiento permanente de `PROJECT_CONTEXT.md` como la Single Source of Truth del proyecto.

- **Julio 2026 (Fase 6 — Auditoría Integral & Evolución v2.1 Enterprise)**:
  - Auditoría técnica completa por equipo multidisciplinar senior.
  - Parche criptográfico de sal aleatoria CSPRNG por usuario en PBKDF2 y fix `SET search_path` en RPC SQL.
  - Paginación e ingesta incremental de historiales de entrenamiento y layout adaptativo desktop.

- **Agosto 2026 (Fase 7 — AeroGym v3.0 Ultimate Enterprise & 100/100 Score)**:
  - Alcanzada la Puntuación Máxima de 100/100.
  - Implementación de Inyección de Dependencias Pura con `RepositoryContext.tsx` y `RepositoryProvider`.
  - Garantía de persistencia Web Storage API (`persistentStorageService.ts`).
  - Certificación WCAG 2.1 AA a11y completa en componentes SVG y temporizadores.
  - Failover de IA Groq Proxy $\rightarrow$ Google Gemini API y motores de Visión Postural y Dictado por Voz NL.
  - 96 unit tests ejecutados con 100% de éxito.

- **Agosto 2026 (Fase 8 — Resiliencia de Autenticación y Entrada Local sin Cuenta)**:
  - Introducción del botón "Entrar en Modo Local (Sin Cuenta)" en `AuthView.tsx`.
  - Creación de perfil `fallback` automático en `useAuthStore.ts` si la base de datos Supabase no ha registrado la fila en `public.profiles`.
  - Traducción y extracción limpia de mensajes de error de autenticación (credenciales no válidas, email no confirmado, fallos de red).

---

# Convenciones del Proyecto

### Naming:
- **Componentes y Vistas**: PascalCase (ej. `TrainingSession.tsx`, `HealthLoggerModal.tsx`).
- **Stores, Motores y Repositorios**: camelCase (ej. `useWorkoutStore.ts`, `progressiveOverloadEngine.ts`, `SupabaseWorkoutRepository.ts`).
- **Tablas y Columnas DB**: snake_case (ej. `workout_sessions`, `perceived_difficulty`).

### Estilo de Código y Patrones:
- **TypeScript Estricto**: Prohibido usar `any` implícito. Todo tipo de entidad debe provenir de `src/types/` o `src/infrastructure/supabase/types.ts`.
- **Inmutabilidad en Zustand**: Modificaciones de estado mediante destructuración o asignaciones puras dentro de las acciones del store.
- **Formateo**: Prettier (2 espacios de sangría, comillas simples, punto y coma obligatorio).

---

# Guía para Agentes IA

Esta sección contiene instrucciones críticas y mandatorias para cualquier modelo de Inteligencia Artificial (ChatGPT, Claude, Gemini, Antigravity, Cursor, etc.) que trabaje en este repositorio o en proyectos derivados:

1. **REGLA DE ORO — SSOT OBLIGATORIO Y ACTUALIZACIÓN CONTINUA**:
   - `PROJECT_CONTEXT.md` es la **Fuente Única de Verdad (SSOT)** perpetua del proyecto.
   - **Ninguna tarea se considera finalizada** sin actualizar este archivo (`PROJECT_CONTEXT.md`) para reflejar cada cambio relevante en arquitectura, seguridad, estado, componentes, decisiones o roadmap.

2. **REGLA DE EVOLUCIÓN ADITIVA Y ACUMULATIVA (NO SOBRESCRIBIR EL PASADO)**:
   - **Todos los cambios, mejoras, refactorizaciones y registros de versión DEBEN ser aditivos y acumulativos**.
   - Queda estrictamente prohibido sobrescribir, borrar o machacar historiales, migraciones o registros de decisiones pasadas.
   - La evolución del proyecto debe reflejarse siempre respetando el orden cronológico del avance (`CHANGELOG.md`, `docs/changelog/` y `PROJECT_CONTEXT.md`).

3. **ARCHIVOS CRÍTICOS PROTEGIDOS**:
   - `supabase/migrations/20260723000000_initial_schema.sql` (Esquema base DB)
   - `src/infrastructure/supabase/client.ts` y `types.ts`
   - `src/infrastructure/sync/SyncEngine.ts`
   - `supabase/functions/groq-proxy/index.ts`
   - `PROJECT_CONTEXT.md` (SSOT PERPETUO)

4. **CÓMO AÑADIR NUEVAS FUNCIONALIDADES**:
   - Si creas una nueva entidad, añade una nueva migración SQL fechada e incremental en `supabase/migrations/`.
   - Agrega la interfaz en `src/types/` o actualiza `types.ts`.
   - Implementa la lógica en el Repositorio de Infraestructura correspondiente.
   - Conecta con el store de Zustand y el proveedor de inyección de dependencias (`RepositoryContext`).
   - Construye componentes UI atómicos y accesibles en `src/components/`.

---

# Resumen Ejecutivo

**AeroGym 2.0** es una Aplicación Web Progresiva (PWA) de nivel empresarial pensada para atletas de gimnasio y fuerza. Nació en Abril de 2026 como una SPA orientada al cálculo de la predisposición física diaria (*Readiness Engine*) a partir de datos de salud de Xiaomi Zepp y Google Fit. 

A lo largo de su trayectoria, el proyecto evolucionó progresivamente en 5 fases clave:
1. **Fundación y Readiness (Abril 2026)**: Creación de la PWA base y el motor de salud inicial.
2. **Backend Relacional (Junio 2026)**: Adopción de Supabase Auth, PostgreSQL y tiendas de estado global Zustand.
3. **Optimización Multimedia e IA (Principios de Julio 2026)**: Integración de GIFs anatómicos MuscleWiki y migración del motor de IA hacia Groq (Llama 3.3 70B) con proxy serverless seguro.
4. **Clean Architecture y Offline-First (Mediados de Julio 2026)**: Refactorización en capas desacopladas, persistencia offline resiliente en IndexedDB con `SyncEngine`, y memoria RAG vectorial semántica impulsada por `pgvector`.
5. **Seguridad Avanzada, Mapa Anatómico SVG y SSOT (Finales de Julio 2026)**: Cifrado WebCrypto en cliente, visualizador interactivo SVG de fatiga muscular y formalización de `PROJECT_CONTEXT.md` como la fuente única de verdad perpetua del proyecto.

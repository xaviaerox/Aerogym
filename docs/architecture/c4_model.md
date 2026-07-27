# Documentación de Arquitectura — Modelo C4 AeroGym 2.0 / 3.0

**Versión**: 2.0.0 Enterprise  
**Fecha**: Julio 2026  
**Estatus**: Producción  

---

## Level 1: System Context Diagram (Contexto del Sistema)

El siguiente diagrama ilustra la interacción del usuario final con AeroGym, las bases de datos externas de la comunidad y los servicios de Inteligencia Artificial (Gemini API, DeepSeek) y sincronización con Supabase Cloud.

```mermaid
graph TD
    User["🏋️ Atleta / Usuario Final"]
    
    subgraph AeroGym ["App AeroGym (PWA / Web)"]
        ClientApp["AeroGym Single Page App (Vite + React 19 + PWA)"]
    end
    
    Supabase["☁️ Supabase Cloud (Auth + Postgres DB + Realtime)"]
    ExerciseDB["📚 ExerciseDB OSS / MuscleWiki (Imágenes y GIFs)"]
    AICloud["🤖 Cloud AI Services (Google Gemini / DeepSeek API)"]

    User -->|Interactúa con la UI| ClientApp
    ClientApp -->|Sincronización Offline-First / JWT| Supabase
    ClientApp -->|Fallbacks de animaciones e imágenes| ExerciseDB
    ClientApp -->|Consultas de Coaching de IA en la Nube| AICloud
```

---

## Level 2: Container Diagram (Diagrama de Contenedores)

Muestra la arquitectura interna de la PWA del cliente, el almacenamiento local cifrado en navegador y las capas de soporte.

```mermaid
graph TB
    subgraph Client ["Cliente Navegador / PWA"]
        UI["Capa de Presentación (React 19 + Tailwind v4 + Framer Motion)"]
        Store["Gestión de Estado (Zustand Stores: Workout, Auth, Health, Gamification, UI)"]
        Engines["Motores de Dominio (Fatigue, Progressive Overload, DOTS, Readiness)"]
        VectorMem["Memoria Vectorial Local (Tf-Idf / Cosine Embeddings)"]
        CryptoLayer["Capa de Seguridad Local (WebCrypto AES-256-GCM / PBKDF2)"]
        Storage["Almacenamiento Local (IndexedDB / LocalStorage)"]
    end

    subgraph External ["Servicios Externos"]
        SupabaseDB["Supabase Postgres DB"]
        GeminiAPI["Google Gemini AI API"]
    end

    UI --> Store
    Store --> Engines
    Engines --> VectorMem
    Store --> CryptoLayer
    CryptoLayer --> Storage
    Store -->|Sync Engine| SupabaseDB
    Engines -->|AI Service| GeminiAPI
```

---

## Level 3: Component Diagram (Diagrama de Componentes - Entrenamiento)

Detalle de los componentes que orquestan una sesión de entrenamiento activa y la persistencia local/remota.

```mermaid
graph LR
    TrainingSession["TrainingSession.tsx (Vista Principal)"]
    RestTimer["RestTimer.tsx (TimerFlotante)"]
    ExerciseBlock["ExerciseBlock.tsx (Bloque de Ejercicio)"]
    VoiceBtn["VoiceInputBtn.tsx (Reconocimiento Voz)"]
    UseWorkoutStore["useWorkoutStore.ts (Tienda Zustand)"]
    SyncEngine["SyncEngine.ts (Sincronizador Supabase)"]

    TrainingSession --> RestTimer
    TrainingSession --> ExerciseBlock
    ExerciseBlock --> VoiceBtn
    ExerciseBlock --> UseWorkoutStore
    TrainingSession --> UseWorkoutStore
    UseWorkoutStore --> SyncEngine
```

---

## Level 4: Code Level Patterns & SOLID Guidelines

- **Single Responsibility Principle (SRP)**:
  - Vistas (`views/`) se encargan exclusivamente de la orquestación y navegación.
  - Motores (`lib/*Engine.ts`) son funciones puras o clases sin dependencias del DOM ni de React.
  - Componentes (`components/`) renderizan fragmentos UI reutilizables.
- **Open/Closed Principle (OCP)**:
  - Los motores de sobrecarga progresiva (`progressiveOverloadEngine.ts`) y fatiga (`fatigueEngine.ts`) permiten añadir nuevas estrategias de cálculo sin alterar la interfaz de consumo.
- **Dependency Inversion Principle (DIP)**:
  - `SyncEngine.ts` implementa la abstracción de persistencia remota sobre la base de datos Supabase Postgres.

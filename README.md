# 🏋️ AeroGym v2.0: Tu Entrenador Personal Inteligente & Estoico

AeroGym es una Aplicación Web Progresiva (PWA) de alto rendimiento diseñada para optimizar el rendimiento físico mediante el seguimiento de entrenamientos, nutrición, ingesta de métricas de salud (Xiaomi Zepp / Mi Fitness / Google Fit) y tutoría con Inteligencia Artificial (Aero Coach respaldado por Groq Llama 3.3).

---

## ✨ Características Principales

- **🔄 Rotación Inteligente PPL**: Gestión automática de sesiones de Empuje (Push), Tracción (Pull) y Piernas (Legs) para un progreso equilibrado.
- **📊 Ingesta de Salud Universal**: Importación de datos acumulativos de Xiaomi (Zepp / Mi Fitness) y Google Fit.
- **🧠 Readiness Engine**: Algoritmo que evalúa la calidad de sueño y actividad diaria para recomendar la intensidad óptima de la próxima sesión.
- **🤖 Aero AI Coach**: Consejos personalizados, análisis de progresión y tutoría estoica impulsados por modelos de lenguaje Llama 3.3 (vía Supabase Edge Functions con la API Key en el Secrets Vault).
- **💾 Motor Offline Sync**: Sincronización transparente con IndexedDB cuando el dispositivo recupera la conectividad.

---

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior

### Pasos de Instalación

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/Aerogym.git
   cd Aerogym
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (`.env.local`):**
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend Core**: React 19 + TypeScript 5.8 + Vite 6
- **Estilos**: Tailwind CSS v4 + Framer Motion + Lucide Icons
- **Gestión de Estado**: Zustand 5
- **Backend / BD**: Supabase Postgres + Row Level Security (RLS)
- **IA Engine**: Groq Llama 3.3 70B vía Supabase Edge Function Proxy (`groq-proxy`)
- **PWA & Offline**: Vite PWA Plugin + Service Workers + IndexedDB

---

## 🧪 Comandos Principales

- `npm run dev`: Inicia el servidor local en el puerto 3000.
- `npm run build`: Compila la versión de producción optimizada en `dist/`.
- `npm run lint`: Valida los tipos TypeScript (`tsc --noEmit`).
- `npm test`: Ejecuta la suite de pruebas unitarias con Vitest.

---
*Desarrollado con foco en la disciplina, el rendimiento y la ingeniería de precisión.*

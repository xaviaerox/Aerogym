# 🏋️ AeroGym v2.0 Enterprise

**AeroGym** es un producto concebido y desarrollado en exclusiva por **Xavi de Solutech** para ayudar a las personas a entrenar de una manera más eficiente, científica y llevar un control riguroso de sus hábitos, salud y progresos.

> [!NOTE]
> **Aviso de Uso y Distribución**: Este repositorio contiene el código fuente oficial de AeroGym. **No se aceptan contribuciones externas ni está destinado a ser clonado, reutilizado o redistribuido**. Los usuarios pueden utilizar y disfrutar libremente de la aplicación web desplegada a través de **GitHub Pages**.

---

## 🌐 Aplicación Web (PWA)

La aplicación está disponible directamente desde el navegador como una Aplicación Web Progresiva (PWA):
- **Web App**: Desplegada automáticamente mediante GitHub Actions en GitHub Pages.
- **Modo Instalable**: Se puede añadir a la pantalla de inicio en dispositivos iOS, Android y escritorio.
- **Privacidad y Datos**: Todos los datos se procesan prioritariamente en el dispositivo del usuario (Local-First).

---

## ✨ Características Principales

- **🔄 Rotación Inteligente PPL & Personalizada**: Gestión de sesiones de Empuje (Push), Tracción (Pull) y Piernas (Legs) u otras rutinas para un progreso equilibrado.
- **📊 Ingesta de Salud Universal**: Importación de datos acumulativos de Xiaomi (Zepp / Mi Fitness) y Google Fit (Takeout).
- **🧠 Readiness Engine**: Algoritmo que evalúa la calidad de sueño y actividad diaria para recomendar la intensidad óptima de la próxima sesión (evita sobreentrenamiento).
- **🤖 Aero AI Coach**: Consejos personalizados, análisis de progresión y tutoría estoica impulsados por modelos de lenguaje Llama 3.3 70B (vía Supabase Edge Function Proxy seguro `groq-proxy`).
- **🧠 Memoria RAG Vectorial**: Búsqueda semántica de historiales pasados (local con TF-IDF y remota con `pgvector`).
- **💾 Motor Offline Sync Resiliente**: Persistencia en IndexedDB y sincronización transparente cuando el dispositivo recupera conectividad.
- **🗺️ Visualizador Anatómico SVG**: Mapa corporal interactivo en 2D SVG que refleja la fatiga muscular acumulada en tiempo real.

---

## 🛠️ Tecnologías

- **Frontend Core**: React 19 + TypeScript 5.8 + Vite 6
- **Estilos**: Tailwind CSS v4 + Motion (Framer Motion) + Lucide Icons
- **Gestión de Estado**: Zustand 5
- **Backend / BD**: Supabase Postgres + Row Level Security (RLS) + extensiones `pgvector` y `uuid-ossp`
- **IA Engine**: Groq Llama 3.3 70B vía Supabase Edge Function Proxy (`groq-proxy`)
- **PWA & Offline**: Vite PWA Plugin + Service Workers + IndexedDB + WebCrypto AES-256-GCM
- **Despliegue CI/CD**: GitHub Actions $\rightarrow$ GitHub Pages

---

## 👤 Creador y Propiedad

**AeroGym** es una propiedad intelectual de **Xavi de Solutech**.

Todos los derechos reservados. El código fuente se mantiene de forma centralizada para el despliegue de la plataforma oficial.

---
*Desarrollado por Xavi de Solutech con foco en la disciplina, el rendimiento deportivo y la ingeniería de precisión.*

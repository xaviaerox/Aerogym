# Guía de Contribución — AeroGym

¡Gracias por tu interés en contribuir a **AeroGym**! Seguir estas directrices asegura un proceso fluido de colaboración y mantiene la calidad del código en un estándar elevado.

---

## 🛠️ Entorno de Desarrollo

### Requisitos Previos

- **Node.js**: v18+ (se recomienda v22)
- **npm**: v9+

### Pasos de Inicio

1. Clona el repositorio e instala las dependencias:
   ```bash
   git clone https://github.com/tu-usuario/Aerogym.git
   cd Aerogym
   npm install
   ```
2. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Ejecuta la suite de verificación antes de crear una Pull Request:
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

---

## 📐 Convenciones de Código

- **Clean Architecture & Separation of Concerns**:
  - `src/views`: Capa de presentación (páginas y rutas principales).
  - `src/components`: Componentes UI reutilizables y modulares.
  - `src/application/stores`: Estado global con Zustand.
  - `src/infrastructure`: Repositorios e integraciones externas (Supabase).
  - `src/lib`: Motores de cálculo, utilidades y servicios de IA.
- **Componentes React**: Usar componentes funcionales con TypeScript estricto. Evitar archivos monolíticos (>300 líneas).
- **TypeScript**: No utilizar `any` explícito ni implícito.

---

## 🔀 Flujo de Git & Pull Requests

1. Crea una rama descriptiva para tu funcionalidad o bugfix:
   - `feature/nombre-de-feature`
   - `fix/descripcion-del-bug`
   - `refactor/area-modificada`
2. Escribe commits claros y atómicos siguiendo el estándar **Conventional Commits**:
   - `feat: añadir soporte para exportación JSON`
   - `fix: corregir cálculo de racha cuando hay días saltados`
   - `refactor: extraer subcomponentes de Dashboard`
3. Abre una Pull Request asegurando que todos los tests y el linter pasen correctamente.

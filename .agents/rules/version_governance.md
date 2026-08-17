# INSTRUCCIÓN PERMANENTE — GOBERNANZA DE VERSIONADO Y RELEASE

## ROL
Actúa permanentemente como la capa de gobernanza de versiones, builds y releases del proyecto.

Esta instrucción se aplica a todas las sesiones de desarrollo, independientemente de si estás:
- implementando funcionalidades;
- corrigiendo errores;
- refactorizando;
- modificando la interfaz;
- cambiando la arquitectura;
- actualizando dependencias;
- modificando una PWA;
- modificando el Service Worker;
- cambiando esquemas o estructuras de datos;
- realizando mantenimiento;
- preparando una release;
- trabajando sobre código creado por otro agente.

Tu responsabilidad es garantizar que la versión, identidad del build, estado de release y mecanismos de actualización de la aplicación permanezcan siempre coherentes, trazables y verificables.

No trates el versionado como información meramente estética o documental.
En una PWA, la coherencia de versiones forma parte de la corrección técnica de la aplicación.

---

## 1. PRINCIPIO FUNDAMENTAL
El proyecto debe tener siempre una única versión canónica de aplicación.
Nunca mantengas diferentes versiones editables manualmente en múltiples archivos.

Antes de realizar cambios relevantes, inspecciona el repositorio y determina:
- cuál es la fuente canónica de la versión;
- cuál es la versión actual;
- cuál es el estado de Git;
- cuál es el último tag/release;
- cuál es la identidad del build actual;
- cómo se gestiona la versión de la PWA;
- cómo se versiona el Service Worker;
- cómo se gestionan las cachés;
- cuál es la versión del esquema/base de datos;
- cuál es el estado actual del ciclo de vida del proyecto;
- cómo se refleja todo esto en PROJECT_CONTEXT.md.

No presupongas que estos mecanismos existen. Primero descubre cómo funciona el proyecto.
Si ya existe un sistema de versionado válido, respétalo y mejóralo únicamente cuando sea necesario. No sustituyas arbitrariamente la arquitectura existente.

---

## 2. FUENTE DE VERDAD DE LA VERSIÓN
Debe existir una única fuente técnica de verdad para la versión de la aplicación.
Utiliza la fuente canónica propia del stack tecnológico del proyecto (`package.json`).

No crees fuentes de versión independientes como:
- VERSION.txt
- version.txt
- APP_VERSION
- constantes duplicadas;
- versiones escritas manualmente en múltiples archivos.

Si el proyecto necesita valores derivados en otros archivos, estos deben generarse automáticamente siempre que sea posible.

---

## 3. PROJECT_CONTEXT.md NO ES LA FUENTE TÉCNICA DE LA VERSIÓN
PROJECT_CONTEXT.md es el SSOT de contexto del proyecto, pero no debe convertirse en la fuente técnica de verdad de la versión.
Puede contener información como `Versión actual: 2.4.0`, pero esa información debe corresponder con la fuente técnica real.
Nunca modifiques PROJECT_CONTEXT.md simplemente para ocultar una inconsistencia.

---

## 4. INSPECCIÓN OBLIGATORIA DEL ESTADO
Antes de realizar cambios importantes, determina internamente:
- Versión actual:
- Estado de Git:
- Rama actual:
- Último tag:
- Estado de release:
- Identidad del build:
- Versión del esquema:
- Estado de la PWA:
- Estado del Service Worker:
- Estado de PROJECT_CONTEXT.md:
- Impacto previsto sobre la versión:

Debe utilizarse como línea base para trabajar correctamente.

---

## 5. VERSIONADO SEMÁNTICO
Cuando el proyecto utilice Semantic Versioning (`MAJOR.MINOR.PATCH`):
- **PATCH**: Correcciones de bugs, mejoras visuales pequeñas, refactorizaciones internas sin cambio de contrato (ej. 1.4.2 -> 1.4.3).
- **MINOR**: Nuevas funcionalidades compatibles con la API/usuario (ej. 1.4.3 -> 1.5.0).
- **MAJOR**: Breaking changes o incompatibilidades de datos/API/configuración (ej. 1.5.0 -> 2.0.0).

---

## 6. NO INVENTES VERSIONES
Nunca decidas arbitrariamente números de versión sin analizar el impacto real.
Cuando un cambio tenga impacto sobre la versión:
1. identifica la versión actual;
2. clasifica el cambio como MAJOR, MINOR o PATCH;
3. determina la siguiente versión;
4. aplica el incremento únicamente en la fuente canónica (`package.json`);
5. sincroniza los valores derivados;
6. valida la consistencia final.

---

## 7. NUNCA REDUZCAS UNA VERSIÓN
Una versión no debe retroceder durante el desarrollo normal.
Si encuentras una versión inferior a una release ya existente: `ERROR DE INTEGRIDAD DE VERSIONADO`.
No la sobrescribas silenciosamente. Investiga historial, tags, commits, etc.

---

## 8. DIFERENCIA ENTRE VERSIONES
Nunca confundas: VERSIÓN DE LA APLICACIÓN, VERSIÓN DEL BUILD, COMMIT SHA, VERSIÓN DEL ESQUEMA, VERSIÓN DEL SERVICE WORKER, VERSIÓN DE LAS CACHÉS.
Son conceptos diferentes.

---

## 9. IDENTIDAD DEL BUILD
Cada build desplegable debe identificarse con: Versión, Build ID, Commit y Entorno.

---

## 10. CONTROL ESPECÍFICO DE PWA
Verificar la cadena:
VERSIÓN DE APLICACIÓN -> BUILD -> SERVICE WORKER -> CACHÉS -> ACTUALIZACIÓN DEL CLIENTE
Garantizar la correcta invalidación de cachés y actualización offline.

---

## 11. VERSIONADO DE CACHÉS
Utilizar identificadores deterministas para cachés (ej. `app-static-v2.2.0-8f31a2c`).

---

## 12. METADATOS GENERADOS
Los valores derivados (build ID, commit SHA, versión SW) deben generarse automáticamente en el build.

---

## 13. COMPROBACIÓN DE CONSISTENCIA
Disponer de un mecanismo automatizado que compruebe la alineación de la fuente canónica, git tags, build metadata, manifest, SW, schema, CHANGELOG y PROJECT_CONTEXT.md.

---

## 14. UNA INCONSISTENCIA DE VERSIONES ES UN ERROR
Si se detectan inconsistencias entre fuentes, declarar `ERROR DE INTEGRIDAD DE VERSIONADO`, diagnosticar la causa raíz y resolverla antes de continuar.

---

## 15. SINCRONIZACIÓN DE PROJECT_CONTEXT.md
Mantener PROJECT_CONTEXT.md sincronizado tras cambios relevantes de forma quirúrgica.

---

## 16. CHANGELOG
`CHANGELOG.md` debe mantenerse alineado con las releases reales. No inventar historial.

---

## 17. GIT TAGS
Los tags de Git representan releases (ej. `v2.2.0`). Deber corresponder a estados validados.

---

## 18. DESARROLLO Y RELEASE SON COSAS DIFERENTES
Diferenciar entre versión publicada y siguiente versión en desarrollo. No incrementar versión en cada commit.

---

## 19. TRABAJO ENTRE MÚLTIPLES AGENTES
Asumir que otros agentes pueden haber trabajado en la base de código. Comprobar siempre la coherencia del estado antes de hacer cambios.

---

## 20. NO PERMITAS VERSIONES CONTRADICTORIAS
Garantizar consistencia total entre `package.json`, interfaz de usuario, Service Worker, documentación y Git tags.

---

## 21. PROTOCOLO ANTES DE UNA RELEASE
Verificar checklist completo de versión, SemVer, git state, build metadata, PWA/SW sync, schema, CHANGELOG, tests y build pasados.

---

## 22. TODA MODIFICACIÓN DE VERSIÓN DEBE SER TRAZABLE
Cada cambio de versión debe documentar impacto, decisión y validación.

---

## 23. NO SOBREDISEÑES EL SISTEMA
Adaptar la gobernanza al tamaño real del proyecto sin introducir sobreingeniería innecesaria.

---

## 24. ORDEN DE AUTORIDAD
1. Estado real del repositorio
2. Fuente técnica canónica (`package.json`)
3. Historial de releases/tags de Git
4. Metadatos de build
5. Metadatos generados/runtime
6. PWA / Service Worker
7. CHANGELOG
8. PROJECT_CONTEXT.md
9. README y documentación general

---

## 25. COMPORTAMIENTO OBLIGATORIO DEL AGENTE
Evaluar automáticamente el impacto sobre versionado ante cualquier modificación funcional o de infraestructura.

---

## 26. CONDICIÓN DE CIERRE
Ninguna tarea se da por concluida si deja una inconsistencia de versionado (`VERSION INTEGRITY CHECK`).

---

## 27. PRINCIPIO FINAL
El repositorio debe responder de forma autónoma y fiable sobre su identidad, versión, build, commit, schema, Service Worker y estado de release.

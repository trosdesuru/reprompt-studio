# 🚀 Roadmap V3: Core Seguro, i18n y Escalamiento

---

## 🏗️ Fase 1: Cimientos de Datos, Seguridad y Almacenamiento (Semanas 1-2)

> **Objetivo:** Preparar la base de datos para usuarios reales y aislar los archivos binarios (imágenes) del servidor principal para evitar cuellos de botella y vulnerabilidades de seguridad.

### Tareas

- [x] **1.1. Esquema de Base de Datos Base (SQLModel):**
  - [ ] Añadir soporte para `User` (email, Google Auth, tier pro), `Collection` e `ImagePrompt`.
  - [ ] Preparar los campos `slug` en las colecciones (ej. validando que un usuario no tenga dos slugs idénticos).
  - [ ] Incluir `is_private` y `share_token` para el futuro muro de pago.
- [ ] **1.2. Integración Object Storage (S3 / R2):**
  - [ ] Configurar el backend (FastAPI) para que al recibir una imagen, la envíe a Cloudflare R2 y solo guarde la URL segura (`https://storage.reprompt.com/...`) en PostgreSQL.

💡 **Explicación:** Sin esto, la base de datos crecería de forma descontrolada y el servidor colapsaría al primer intento de ataque.

⚠️ **Dificultades:** - Configurar correctamente las políticas de CORS y permisos públicos de lectura en el bucket de R2 para que las imágenes carguen en el frontend sin errores.

- Crear migraciones seguras con Alembic para no romper tu base de datos actual.

---

## 🌍 Fase 2: Identidad (Google Auth) e Internacionalización (i18n) (Semanas 3-4)

> **Objetivo:** Implementar la barrera de entrada segura (Auth + Invitaciones) y preparar toda la estructura del frontend para soportar Múltiples Idiomas (ES/EN).

### Tareas

- [ ] **2.1. Internacionalización en Next.js (App Router):**
  - [ ] Mover todo el código frontend actual dentro de una carpeta dinámica `app/[lang]/`.
  - [ ] Crear diccionarios JSON (`es.json`, `en.json`).
  - [ ] Reemplazar textos "harcodeados" por funciones de traducción (ej. `t('login.button')`).
  - [ ] Implementar _Middleware_ para detectar el idioma del navegador y servir la versión correcta automáticamente.
- [ ] **2.2. Flujo Híbrido de Google Auth:**
  - [ ] Crear el endpoint `POST /api/auth/google` en FastAPI.
  - [ ] Implementar la intercepción en el Frontend: Google Auth -> Validar si es nuevo -> Pedir Código de Invitación.

💡 **Explicación:** La retención de usuarios depende de una experiencia de inicio de sesión sin fricción y en su idioma nativo.

⚠️ **Dificultades:**

- **En i18n:** Asegurar que los componentes de Servidor (RSC) y los componentes de Cliente (`"use client"`) de Next.js se comuniquen bien con los diccionarios sin causar errores de hidratación.
- **En Auth:** Manejar la "condición de carrera" si un usuario recarga la página justo cuando está metiendo el código de invitación tras loguearse con Google.

---

## 🎨 Fase 3: "Reprompt Studio", Extracción y Rutas Dinámicas (Semanas 5-6)

> **Objetivo:** El "Core Business". Que el usuario pueda subir su imagen, que la herramienta lea la "receta" (metadata) y se publique en su perfil usando Slugs.

### Tareas

- [ ] **3.1. Extractor y Subida Segura:**
  - [ ] Integrar lógica de extracción de A1111/ComfyUI en el frontend.
  - [ ] Configurar el backend para recibir el JSON + imagen, verificando los _Magic Bytes_ (seguridad contra malware) antes de guardar.
- [ ] **3.2. Enrutamiento Dinámico con Slugs:**
  - [ ] Crear rutas de perfil: `app/[lang]/[username]/page.tsx`
  - [ ] Crear rutas de colección: `app/[lang]/[username]/[collection_slug]/page.tsx`
- [ ] **3.3. Dashboard "Mi Estudio":** - [ ] UI para crear colecciones.
  - [ ] Lógica para generar _slugs_ automáticamente a partir del título (ej. "Mi Arte" -> `mi-arte`).
  - [ ] Interfaz de gestión de imágenes.

💡 **Explicación:** Aquí es donde pasas de ser una web estática a un SaaS funcional.

⚠️ **Dificultades:**

- Generar _Slugs_ únicos de forma concurrente: Si un usuario crea dos colecciones llamadas "Cyberpunk", la base de datos debe asignar inteligentemente `cyberpunk` y `cyberpunk-1` sin fallar.
- Leer metadatos complejos de IA en el frontend sin bloquear el hilo principal del navegador.

---

## 📦 Fase 4: Descargas Masivas y Motor de Descubrimiento (Semanas 7-8)

> **Objetivo:** Implementar la capacidad de recuperar tu trabajo (Descargas) y la capa social (Home Feed).

### Tareas

- [ ] **4.1. Generación de Descargas (Archivado):**
  - [ ] Refactorizar el `downloader.py` actual.
  - [ ] Lógica backend: Tomar URLs de S3, descargar en memoria, empaquetar imágenes junto con un archivo `prompts.json` y enviar el `.zip` al usuario.
- [ ] **4.2. El Nuevo Home Feed (Masonry):**
  - [ ] Desarrollar la portada escalonada (_Lazy loading_ / _Infinite scroll_) para mostrar imágenes públicas.

💡 **Explicación:** Se pospone hasta aquí porque primero necesitábamos asegurarnos de que el almacenamiento (Fase 1) y los perfiles de usuario (Fase 2) existían para saber _qué_ estamos descargando y _de quién_ es.

⚠️ **Dificultades:**

- **Descargas ZIP:** Si una colección tiene 200 imágenes en 4K, crear el ZIP en el servidor puede consumir toda la memoria RAM. Habrá que implementarlo usando compresión en flujo (_streaming_ de bytes) para no colapsar el backend.

---

## 🛡️ Fase 5: Blindaje Final, Anti-DDoS y Lanzamiento MVP (Semanas 9-10)

> **Objetivo:** Evitar que los primeros usuarios (o bots maliciosos) rompan la plataforma.

### Tareas

- [ ] **5.1. Rate Limiting Agresivo con Redis:**
  - [ ] Limitar las llamadas a la API (Ej: "Máximo 10 subidas de imágenes por minuto por IP").
- [ ] **5.2. Muro de Privacidad Físico:**
  - [ ] Configurar middleware/validación para rechazar peticiones a colecciones con `is_private == True` si el usuario no es el dueño, evitando accesos directos por URL.
- [ ] **5.3. Saneamiento de Git y Despliegue:**
  - [ ] Destruir el historial de secretos en Git.
  - [ ] Abrir el registro inicial a 50 invitaciones.

💡 **Explicación:** Es la última capa de defensa antes de chocar con la realidad.

⚠️ **Dificultades:**

- Eliminar los secretos antiguos del historial de Git puede corromper ramas si no se hace con cuidado.
- Afinar el Rate Limiter: Si es muy estricto, bloquearás a usuarios legítimos; si es muy laxo, un bot agotará tu capa gratuita de base de datos en 30 minutos.

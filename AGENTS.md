# Guía y Normas de Desarrollo - 593 Cycling Studio

Este documento establece las directrices técnicas, arquitectónicas y de convenciones para el desarrollo en este repositorio.

## 🛠️ Stack Tecnológico & Convenciones

1. **Framework & UI:**
   - **Next.js (App Router):** Uso estricto de componentes de servidor (`page.tsx`) y cliente (`*Client.tsx` o directiva `'use client'`).
   - **React 19 & TypeScript:** Tipado estricto obligatorio (`interface`/`type`). Sin `any` ni supresiones de tipos.
   - **Estilos:** Tailwind CSS v4 con variables CSS (`src/app/globals.css`).

2. **Estructura del Proyecto:**
   - `src/app/(interno)/`: Módulos protegidos de la aplicación (Dashboard, Clientes, Bicicletas, Mantenimientos, Finanzas, etc.).
   - `src/app/(publico)/`: Landing page del taller, donde se encuentra la información para los clientes sobre el taller (Dirección, horario, servicios, contacto, etc.) y un botón para ingresar al sistema.
   - `src/componentes/(interno)/`: Componentes reutilizables organizados por dominio y componentes base en `src/componentes/ui/`.
   - `src/componentes/(publico)/`: Componentes reutilizables organizados por las diferentes secciones de la landing page.
   - `src/componentes/ui/`: Componentes base reutilizables de los diferentes elementos ui.
   - `src/lib/`: Lógica de negocio, utilidades y servicios.
   - `src/utils/supabase/`: Clientes de Supabase para Servidor, Middleware y Cliente.

3. **Formularios & Validación:**
   - Uso de **React Hook Form** combinados con **Zod** para validación de esquemas.

4. **Base de Datos & Migraciones:**
   - Supabase (PostgreSQL). Las modificaciones de esquema deben documentarse o aplicarse mediante migraciones en `supabase/migrations/` o scripts en `supabase/snippets/`.

## Comandos
- 

## Convenciones
- Texto de la interfaz en español
- Variables, funciones, clases y nombres de archivos en ingles.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.
- Comentario en español para la funciones que no sean triviales. Explicar qué hacen, qué parámetros reciben y qué devuelven.

## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.

## Memoria
- Al empezar, lee [MEMORY.md](MEMORY.md) para conocer el estado actual del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualizalo: estado actual, decisiones importantes (con su porqué) y errores a evitar.
- Mantenlo breve (máximo 50 lineas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a [AGENTS.md](AGENTS.md) en lugar de memoria.


## Límites
- Siempre: respetar las reglas de este archivo, mantener los textos en español, no modifiques archivos o carpetas que no estén relacionados con la tarea actual.
- Siempre: actualizar [MEMORY.md](MEMORY.md) al terminar cada tarea
- Pregunta antes: crear archivos nuevos, cambiar alguna parte del codigo ya implementado, modificar las migraciones de la base de datos
- Nunca: añadir dependencias o frameworks sin antes consultar, no crear codigo duplicado
 
## Verficación
- Verifica con un `npm run build` si el codigo es correcto y si no hay ningun error.

## Planificación y Referencias
- Ver [PLAN.md](./PLAN.md) para los detalles y tareas específicas del **Creación de componentes para no repetir código**.
- Ver [MEMORY.md](./MEMORY.md) para conocer el estado actual del proyecto y las decisiones tomadas.
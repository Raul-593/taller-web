# Guía y Normas de Desarrollo - 593 Cycling Studio

Este documento establece las directrices técnicas, arquitectónicas y de convenciones para el desarrollo en este repositorio.

---

## 🛠️ Stack Tecnológico & Convenciones

1. **Framework & UI:**
   - **Next.js (App Router):** Uso estricto de componentes de servidor (`page.tsx`) y cliente (`*Client.tsx` o directiva `'use client'`).
   - **React 19 & TypeScript:** Tipado estricto obligatorio (`interface`/`type`). Sin `any` ni supresiones de tipos.
   - **Estilos:** Tailwind CSS v4 con variables CSS (`src/app/globals.css`).

2. **Estructura del Proyecto:**
   - `src/app/(interno)/`: Módulos protegidos de la aplicación (Dashboard, Clientes, Bicicletas, Mantenimientos, Finanzas, etc.).
   - `src/app/(publico)/`: Landing page del taller, donde se encuentra la información para los clientes sobre el taller (Dirección, horario, servicios, contacto, etc.) y un botón para ingresar al sistema.
   - `src/componentes/`: Componentes reutilizables organizados por dominio y componentes base en `src/componentes/ui/`.
   - `src/lib/`: Lógica de negocio, utilidades y servicios.
   - `src/utils/supabase/`: Clientes de Supabase para Servidor, Middleware y Cliente.

3. **Formularios & Validación:**
   - Uso de **React Hook Form** combinados con **Zod** para validación de esquemas.

4. **Base de Datos & Migraciones:**
   - Supabase (PostgreSQL). Las modificaciones de esquema deben documentarse o aplicarse mediante migraciones en `supabase/migrations/` o scripts en `supabase/snippets/`.

---

## 📋 Planificación & Referencias

- Ver [PLAN.md](./PLAN.md) para los detalles y tareas específicas del **Landing Page**.

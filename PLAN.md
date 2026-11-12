# Plan: Sección Interactiva "Explora tu Bicicleta"

## Objetivo
Agregar una sección a la landing pública de 593 Cycling Studio donde el usuario vea una imagen de una bicicleta con puntos de acceso (hotspots) clickeables. Cada punto muestra la información del servicio de mantenimiento que el taller ofrece para esa parte de la bicicleta.

## Contexto del proyecto (no asumir otra convención)
- Stack: Next.js (App Router) + TypeScript + Tailwind + Supabase.
- Carpeta de componentes: `src/componentes/` (en español, NO `components/`). Alias de import: `@/componentes/...`, `@/lib/...`.
- Utilidad de clases condicionales: `cn()` en `src/lib/utils.ts`.
- La landing pública vive en el route group `(publico)` dentro de `src/app/`.
- Esta tarea es 100% frontend/estático: no toca tablas, RLS ni lógica de Supabase.

## Características
1. Imagen de una bicicleta como fondo de la sección (foto o ilustración).
2. 6 puntos de acceso (hotspots) posicionados en porcentaje sobre la imagen:
   - Frenos
   - Cambio / Tensor
   - Pedales
   - Freno y Cambio (controles del manubrio)
   - Ruedas
   - Dropout
3. Al hacer clic en un punto se muestra un panel con título + descripción del servicio correspondiente.
4. Responsive: en desktop el panel va al lado de la imagen; en mobile va debajo.
5. Accesible: botones con `aria-label` descriptivo, tamaño táctil mínimo 44x44px, no depender solo de `:hover`.

## Fases y pasos

### Fase 0 — Assets
1. usa la iamgen `public/bicicleta-service.svg`.
2. Viendo la imagen ya colocada, anotar manualmente las coordenadas aproximadas en `%` (top/left) de cada uno de los 6 puntos listados arriba.

### Fase 1 — Datos
1. Crear `src/lib/landing/bike-hotspots.ts`.
2. Definir el tipo:
   ```ts
   export type BikeHotspot = {
     id: string
     label: string
     top: string   // ej. "38%"
     left: string  // ej. "20%"
     title: string
     description: string
   }
   ```
3. Exportar `export const BIKE_HOTSPOTS: BikeHotspot[]` con los 6 servicios y sus coordenadas de la Fase 0.
4. Redactar la descripción real de cada servicio (2-3 líneas, tono taller de bicicletas, igual de estilo al resto de la app en español).

### Fase 2 — Componente
1. Crear `src/componentes/landing/BicicletaInteractiva.tsx` como client component (`"use client"`).
2. Contenedor de la imagen: `div` con `relative w-full aspect-[4/3]` (ajustar el aspect-ratio real de la imagen final) + `next/image` con `fill` y `object-contain`.
3. Renderizar un `<button>` por cada hotspot de `BIKE_HOTSPOTS`:
   - `style={{ top: h.top, left: h.left }}`.
   - Clases: `absolute -translate-x-1/2 -translate-y-1/2`, círculo pequeño con borde blanco, `animate-pulse` cuando no está activo.
   - `onClick` alterna un estado `activeId` (useState) entre el id del hotspot y `null`.
   - `aria-label={h.label}`.
4. Panel de detalle al lado del botón (layout `grid md:grid-cols-2 gap-8 items-center`):
   - Si hay `activeId`, mostrar `title` y `description` del hotspot activo.
   - Si no hay ninguno seleccionado, mostrar un texto de ayuda tipo "Haz clic en un punto de la bicicleta para ver el servicio".

### Fase 3 — Integración en la landing
1. En la página de la landing pública (sección de servicios dentro de `src/app/(publico)/`), agregar un encabezado de sección (ej. "Conoce nuestros servicios") y un párrafo corto de introducción.
2. Importar y renderizar `<BicicletaInteractiva />` despues de `Service` y antes de `Contacto`.
3. Si el route group `(publico)` todavía no existe en el repo, detenerse y preguntar antes de crear estructura nueva en `src/app/`.

### Fase 4 — Pulido
1. Probar en viewport angosto (mobile) que los 6 puntos no se encimen ni queden fuera de la imagen.
2. Confirmar que el punto activo se distingue visualmente del resto (color o escala distinta).
3. Verificar contraste de texto y tamaño táctil (mínimo 44x44px) de cada botón.

### Fase 5 — Verificación final
1. `npm run lint` sin errores nuevos.
2. `npm run build` exitoso.
3. Prueba manual: los 6 clics muestran la descripción correcta, tanto en desktop como en modo responsive (DevTools).

## Criterio de aceptación
La sección está lista cuando: la imagen se ve completa y centrada en cualquier ancho de pantalla, los 6 puntos están en la posición correcta sobre la bicicleta, cada clic muestra el servicio correcto en el panel, y el build pasa sin errores ni warnings nuevos.
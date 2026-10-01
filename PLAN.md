# Plan de Desarrollo: Landing Page

Este documento detalla la estructura, flujos y tareas pendientes para la **Landing Page** de 593 Cycling Studio.

---

## 📊 1. Objetivos de la Landing Page
- Ofrecer una presencia web profesional, moderna y atractiva para los clientes del taller de bicicletas.
- Mostrar información clara sobre la ubicación, horarios de atención, servicios ofrecidos y formas de contacto.
- Proporcionar un acceso rápido e intuitivo al sistema interno de gestión para el personal mediante un botón destacado de ingreso.

---

## 🗂️ 2. Componentes Principales

### 📁 Componentes de la Página (`src/app/(publico)/page.tsx`)
- Integrar todos los componentes de la sección en una sola página (Single Page Landing Page) con navegación fluida.

### 📁 Componentes UI (`src/componentes/landing/`)
Para mantener el código organizado, se crearán los siguientes componentes dentro de un subdirectorio dedicado:
- `Navbar.tsx`: Barra de navegación fija (sticky) con enlaces de anclaje (Home, Sobre Nosotros, Servicios, Contacto) y botón de "Ingresar al Sistema".
- `Hero.tsx`: Sección principal con el título del taller, descripción llamativa, logo oficial de "593 Cycling Studio" y llamada a la acción (CTA) principal.
- `About.tsx`: Sección de información sobre el taller, destacando la pasión, precisión y profesionalismo.
- `Services.tsx`: Cuadrícula de servicios ofrecidos (mantenimiento básico, avanzado, suspensiones, lavado detallado, etc.) con iconos atractivos.
- `Contact.tsx`: Sección con la dirección física, horario de atención, enlace a mapa, números de teléfono y un botón directo a WhatsApp.
- `Footer.tsx`: Pie de página con copyright, enlaces rápidos y redes sociales.

---

## 📝 3. Tareas y Próximos Pasos (Checklist)

### Fase 1: Estructura e Infraestructura de Componentes
- [ ] Crear la carpeta `src/componentes/landing/` para mantener la modularidad.
- [ ] Implementar el componente `Navbar.tsx` con soporte para responsive/móvil (menú hamburguesa) y transiciones suaves de scroll.
- [ ] Implementar el componente `Hero.tsx` con un diseño moderno (background degradado o imagen de ciclismo oscurecida con overlay).
- [ ] Implementar el componente `About.tsx` detallando la historia, valores y el compromiso de calidad de 593 Cycling Studio.
- [ ] Implementar el componente `Services.tsx` utilizando componentes de tarjetas (`src/componentes/ui/cards.tsx`) para listar los servicios con iconos de `lucide-react`.
- [ ] Implementar el componente `Contact.tsx` con horarios del taller, ubicación interactiva (o enlace de Google Maps) y contacto directo por WhatsApp.
- [ ] Implementar el componente `Footer.tsx` para cerrar la página con profesionalismo.

### Fase 2: Integración y Maquetación
- [ ] Actualizar `src/app/(publico)/page.tsx` para importar y organizar todos los componentes de la Landing Page.
- [ ] Asegurar que la Landing Page no rompa los estilos globales en `src/app/globals.css` y que se integre perfectamente con Tailwind CSS v4.
- [ ] Verificar el comportamiento responsive en dispositivos móviles, tablets y desktops.
- [ ] Asegurar el soporte correcto de temas claro/oscuro (modo dark/light de forma consistente).

### Fase 3: Pruebas y Ajustes Finales
- [ ] Probar la navegación por anclajes (smooth scroll).
- [ ] Verificar que todos los botones de "Ingresar al sistema" redirijan correctamente a la ruta `/login` (o `/dashboard` según corresponda si ya está autenticado).
- [ ] Validar que los enlaces externos (Google Maps, WhatsApp, Redes Sociales) se abran en una nueva pestaña con seguridad (`target="_blank" rel="noopener noreferrer"`).
- [ ] Realizar una auditoría de rendimiento y accesibilidad básica (contraste de colores, etiquetas aria-label).

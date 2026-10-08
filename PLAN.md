# Plan de Desarrollo: Componentes Reutilizables

Este documento detalla las tareas para extraer código repetido en componentes reutilizables, reduciendo duplicación y mejorando la mantenibilidad.

---

## 1. Objetivo

Reducir la duplicación de código en los módulos internos extrayendo componentes reutilizables de alta prioridad. Sin crear una arquitectura innecesariamente compleja.

---

## 2. Fase 1: Componentes Base de Alta Prioridad

Componentes pequeños, sin dependencias complejas, que eliminan mucha duplicación inmediata.

### 2.1 `<BadgeEstado>`
- **Ubicación propuesta:** `src/componentes/ui/BadgeEstado.tsx`
- **Qué reemplaza:** Badges de estado hardcodeados en 10+ archivos (clientes, proveedores, cuentas, deudas, movimientos, nota-crédito, dashboard, mantenimientos)
- **Props:**
  - `estado: string` — Valor del estado
  - `variant?: 'activo' | 'inactivo' | 'estado' | 'custom'` — Variante de color
  - `customClass?: string` — Clases personalizadas
  - `label?: string` — Texto a mostrar (si es diferente al estado)
- **Beneficio:** Consistencia visual, centralización de colores de estado

### 2.2 `<SelectCuenta>`
- **Ubicación propuesta:** `src/componentes/(interno)/finanzas/SelectCuenta.tsx`
- **Qué reemplaza:** Select de cuentas repetido 6 veces en formularios de finanzas
- **Props:**
  - `cuentas: { id: string; name: string }[]` — Lista de cuentas
  - `value: string` — Valor seleccionado
  - `onChange: (id: string) => void` — Callback de cambio
  - `label?: string` — Label del select
  - `required?: boolean` — Si es requerido
  - `disabled?: boolean` — Si está deshabilitado
- **Beneficio:** Reutilización, consistencia visual, validación centralizada

### 2.3 `<TarjetaKPI>`
- **Ubicación propuesta:** `src/componentes/ui/TarjetaKPI.tsx`
- **Qué reemplaza:** Tarjetas KPI con Card > CardHeader > CardContent repetidas en 4 archivos
- **Props:**
  - `titulo: string` — Título de la tarjeta
  - `descripcion?: string` — Descripción
  - `valor: string | number` — Valor a mostrar
  - `color?: 'default' | 'green' | 'red' | 'amber' | 'blue'` — Color del valor
  - `icono?: React.ReactNode` — Icono opcional
- **Beneficio:** Consistencia visual, reutilización, mantenimiento

### 2.4 `<EstadoVacio>`
- **Ubicación propuesta:** `src/componentes/ui/EstadoVacio.tsx`
- **Qué reemplaza:** Mensajes de estado vacío con el mismo estilo en 10+ archivos
- **Props:**
  - `mensaje: string` — Mensaje a mostrar
  - `icono?: React.ReactNode` — Icono opcional
- **Beneficio:** Consistencia visual, reutilización

---

## 3. Fase 2: Componentes Complejos de Alta Prioridad

Componentes más complejos pero con alto impacto.

### 3.1 `<TablaConBusqueda>`
- **Ubicación propuesta:** `src/componentes/ui/TablaConBusqueda.tsx`
- **Qué reemplaza:** Card + CardHeader + CardContent + Table con búsqueda en 7+ archivos
- **Props:**
  - `items: T[]` — Lista de datos
  - `columns: Columna<T>[]` — Definición de columnas
  - `searchKeys: (keyof T)[]` — Campos a buscar
  - `searchPlaceholder: string` — Placeholder de búsqueda
  - `emptyMessage: string` — Mensaje cuando no hay datos
  - `title: string` — Título de la tarjeta
  - `description?: string` — Descripción de la tarjeta
- **Beneficio:** Reutilización, consistencia visual, mantenimiento centralizado de búsqueda

### 3.2 `<FormularioAbono>`
- **Ubicación propuesta:** `src/componentes/(interno)/finanzas/FormularioAbono.tsx`
- **Qué reemplaza:** Tres formularios de abono casi idénticos (venta, deuda, mantenimiento)
- **Props:**
  - `titulo: string` — Título del diálogo
  - `descripcion: string` — Descripción del diálogo
  - `cuentas: { id: string; name: string }[]` — Lista de cuentas activas
  - `onSubmit: (data) => Promise<void>` — Función de envío
  - `saldoPendiente?: number` — Saldo pendiente a mostrar
  - `submitLabel?: string` — Texto del botón submit
- **Beneficio:** Reutilización, consistencia en formularios de abono, validación centralizada

### 3.3 `<TablaDetalleFinanciero>`
- **Ubicación propuesta:** `src/componentes/(interno)/finanzas/TablaDetalleFinanciero.tsx`
- **Qué reemplaza:** Tablas de historial de pagos en 3 archivos (venta, deuda, mantenimiento)
- **Props:**
  - `titulo: string` — Título de la sección
  - `items: PagoDetalle[]` — Lista de pagos
  - `emptyMessage?: string` — Mensaje cuando no hay datos
  - `mostrarBotonAgregar?: boolean` — Mostrar botón de agregar
  - `onAgregar?: () => void` — Callback de agregar
- **Beneficio:** Reutilización, consistencia visual, mantenimiento

### 3.4 `<FormularioItemProducto>`
- **Ubicación propuesta:** `src/componentes/(interno)/finanzas/FormularioItemProducto.tsx`
- **Qué reemplaza:** Formularios de items de producto/servicio en 5 archivos
- **Props:**
  - `items: ItemProducto[]` — Lista de items
  - `onChange: (items: ItemProducto[]) => void` — Callback de cambio
  - `mostrarPrecio?: boolean` — Mostrar campo de precio
  - `mostrarTipo?: boolean` — Mostrar selector de tipo
- **Beneficio:** Reutilización, consistencia en formularios de items, validación centralizada

---

## 4. Fase 3: Componentes de Media Prioridad

| Componente | Archivos | Beneficio | Estado |
|-----------|----------|-----------|--------|
| `<FiltroEstadoTabs>` | 3 archivos (mantenimientos, deudas, nota-crédito) | Reutilización, consistencia visual | Hecho |
| `<GraficoBarrasFinanzas>` | 2 archivos (dashboard, finanzas) | Reutilización, consistencia en gráficos | Hecho |
| `<DialogoConfirmacion>` | 8+ archivos (diálogos agregar/editar) | — | Descartado: los diálogos ya usan `FormDialog`, otro envoltorio sería redundante |
| `<FormularioBasico>` | 4 archivos (ClienteForm, ProvedorForm, CuentaForm, CategoriaForm) | — | Descartado: los formularios tienen campos distintos; un formulario por configuración sería sobre-arquitectura |

---

## 5. Tareas de la Fase 1 (Checklist)

- [x] Crear `src/componentes/ui/BadgeEstado.tsx`
- [x] Crear `src/componentes/(interno)/finanzas/SelectCuenta.tsx`
- [x] Crear `src/componentes/ui/TarjetaKPI.tsx`
- [x] Crear `src/componentes/ui/EstadoVacio.tsx`
- [x] Reemplazar usos de badges hardcodeados por `<BadgeEstado>` en los archivos afectados
- [x] Reemplazar selects de cuenta repetidos por `<SelectCuenta>` en los formularios de finanzas
- [x] Reemplazar tarjetas KPI repetidas por `<TarjetaKPI>` en dashboard y finanzas
- [x] Reemplazar mensajes de estado vacío por `<EstadoVacio>` en los archivos afectados
- [x] Ejecutar `npm run build` para verificar que no haya errores
- [x] Actualizar `MEMORY.md` con el estado actual y decisiones tomadas

---

## 6. Tareas de la Fase 2 (Checklist)

- [x] Crear `src/componentes/ui/TablaConBusqueda.tsx`
- [x] Crear `src/componentes/(interno)/finanzas/FormularioAbono.tsx`
- [x] Crear `src/componentes/(interno)/finanzas/TablaDetalleFinanciero.tsx`
- [x] Crear `src/componentes/(interno)/finanzas/FormularioItemProducto.tsx`
- [x] Migrar los 3 formularios de abono (venta, deuda, mantenimiento) a `<FormularioAbono>`
- [x] Migrar los 3 historiales de pagos (venta, deuda, mantenimiento) a `<TablaDetalleFinanciero>`
- [x] Migrar clientes, proveedores y transferencias a `<TablaConBusqueda>`
- [x] Migrar la sección de ítems de `AgregarGasto` a `<FormularioItemProducto>`
- [x] Migrar cuentas, movimientos, deudas y nota-crédito a `<TablaConBusqueda>` (filtros por pestañas/selects quedan fuera de la tarjeta; deudas y nota-crédito usan `alClicFila` para el detalle)
- [x] Migrar las secciones de ítems de `AgregarIngreso`, `AgregarNotaCredito`, `AgregarMantenimiento` y `EditarMantenimiento` a `<FormularioItemProducto>`
- [x] Ejecutar `npm run build` para verificar que no haya errores
- [x] Actualizar `MEMORY.md` con el estado actual y decisiones tomadas

---

## 7. Tareas de la Fase 3 (Checklist)

- [x] Crear `src/componentes/ui/FiltroEstadoTabs.tsx`
- [x] Crear `src/componentes/ui/GraficoBarrasFinanzas.tsx`
- [x] Migrar pestañas de filtro en `DeudasClient`, `NotaCreditoClient` y `MantenimientoClient` (este último con conteos por estado)
- [x] Migrar gráficos en `DashboardChartClient` y `FinanzasClient` (finanzas conserva `Legend`; sin `Tooltip` en ambos, como antes)
- [x] Descartar `<DialogoConfirmacion>` (`FormDialog` ya cubre los 8 diálogos) y `<FormularioBasico>` (campos heterogéneos; por configuración sería sobre-arquitectura)
- [x] Ejecutar `npm run build` para verificar que no haya errores
- [x] Actualizar `MEMORY.md` con el estado actual y decisiones tomadas

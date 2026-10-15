# 593 Cycling Studio
Memoria del proyecto entre sesiones. Máximo 50 líneas: resume o elimina lo que ya no aporte.

## Estado actual
- v1 funcionando: registrar clientes, bicicletas, mantenimientos, ingresos, egresos.
- Landing page: en construcción.
- Fases 1 y 2 completadas. Fase 3 completada (alcance reducido: tabs y gráfico).

## Decisiones
- Se usa Supabase como base de datos.
- Se usa App Router en Next.js v16.
- Se usan React Hooks para el manejo de estados.
- Componentes reutilizables en `src/componentes/ui/` para genéricos y `src/componentes/(interno)/` para dominio.
- Fase 2 evita sobre-arquitectura: los componentes nuevos son presentacionales o con estado local mínimo; la lógica de Supabase queda en cada caso de uso.

## Componentes creados (Fase 2)
- `<TablaConBusqueda>`: tarjeta con tabla genérica y búsqueda interna opcional; usa `SearchBar` y `EstadoVacio`.
- `<FormularioAbono>`: diálogo de abono con validación básica y reseteo automático de estado al cerrarse; usa `FormDialog` y `SelectCuenta`; el padre persiste en Supabase vía `onSubmit`.
- `<TablaDetalleFinanciero>`: sección de historial de pagos/créditos; el padre mapea sus datos a `{ id, descripcion, monto, tono }`.
- `<FormularioItemProducto>`: sección de ítems con `ProductSelect`; el padre adapta precio (`cost` vs `price`) y forma del ítem vacío. El listado tiene scroll interno (`max-h-100`) para que la tarjeta no crezca al agregar ítems.

## Archivos migrados (Fase 2)
- Abonos: RegistroAbonoVenta, RegsitroAbonoMantenimiento, RegistrarAbonoDeuda (quedaron como capas finas de persistencia).
- Historiales: VistaVenta, VistaDeuda, VistaMantenimiento.
- Tablas: ClientesClient, ProvedoresClient, TransferenciaClient, CuentasClient, MovimientoClient, DeudasClient, NotaCreditoClient.
- Ítems: AgregarGasto (incluye botón AgregarRepuesto vía `accionExtraProducto`), AgregarIngreso, AgregarNotaCredito, AgregarMantenimiento, EditarMantenimiento.

## Estado Fase 2
- Fase 2 completada: los 4 componentes creados y todas las migraciones previstas hechas.
- Tablas con filtros propios (deudas, nota-crédito, movimientos) conservan sus filtros fuera de la tarjeta; deudas y nota-crédito usan `alClicFila` para abrir el detalle; movimientos conserva su scroll con `claseContenido`.
- Los badges de estado con `getStatusClasses` (deudas, nota-crédito, movimientos) se conservan tal cual; `<BadgeEstado>` solo cubre activo/inactivo.

## Aprendizaje y errores a evitar
- La tabla `customers` no tiene columna `email` (genera error 42703 al consultarla con PostgREST).
- Mantener limpios los archivos huérfanos al reorganizar rutas a `(interno)` (ej. `src/componentes/shell.tsx`).
- Sincronizar el estado local `setMantenimientos` en los callbacks de edición para reflejar cambios al instante.

## Próximos pasos
- Fase 4 (baja prioridad): `<BotonEditar>`, `<HeaderPagina>`.
- Mejorar landing page.

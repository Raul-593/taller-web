  -- =============================================================================
  -- CATEGORIAS
  -- ============================================================================
  -- Ingreso
  -- Categoria Padre
  INSERT INTO public.categories(id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000000', 'Ventas', 'ingreso', 'Ventas de Productos o Servicios');

  -- Categorias Hijo
  INSERT INTO public.categories(name, category_type, description)
  VALUES
    ('Otros', 'ingreso', 'Ingresos que no porviene de una venta directa');
  INSERT INTO public.categories(parent_id, name, category_type, description)
  VALUES
    ('10000000-0000-0000-0000-000000000000','Cobros a Clientes', 'ingreso', 'Venta de alguna producto o servicio a clientes');

  -- Gasto
  -- Nomina
  -- Categoria Padre
  INSERT INTO public.categories (id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000001', 'Nomina', 'gasto','Pagos al personal');
  -- Categoria Hijo
  INSERT INTO public.categories (parent_id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000001', 'Sueldos', 'gasto', 'Sueldo de personal'),
    ('10000000-0000-0000-0000-000000000001', 'Aportes IESS', 'gasto', 'Aportes patronales, decimos, utilidades'),
    ('10000000-0000-0000-0000-000000000001', 'Bonos y Comisiones', 'gasto', 'Bonos e incentivos al personal');

  -- Servicios Basicos
  -- Categoria Padre
  INSERT INTO public.categories(id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000002', 'Servicios Basicos', 'gasto', 'Servicios fijos de operacion');
  -- Categoria Hijo
  INSERT INTO public.categories(parent_id, name, category_type, description)
  VALUES
    ('10000000-0000-0000-0000-000000000002', 'Agua', 'gasto', 'Planilla de Agua'),
    ('10000000-0000-0000-0000-000000000002', 'Luz', 'gasto', 'Planilla de Luz'),
    ('10000000-0000-0000-0000-000000000002', 'Internet', 'gasto', 'Servicio de Internet'),
    ('10000000-0000-0000-0000-000000000002', 'Telefono', 'gasto', 'Servicio de Internet Celular'),
    ('10000000-0000-0000-0000-000000000002', 'Arriendo', 'gasto', 'Arriendo del local');

  -- Compras / Inventario
  INSERT INTO public.categories(id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000003', 'Compras', 'gasto', 'Adquisicion de Mercancia para el taller');

  INSERT INTO public.categories(parent_id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000003', 'Compra de Repuestos', 'gasto', 'Compras de Repustos para bicicletas');

  -- Financiamento
  INSERT INTO public.categories(id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000004', 'Financiamiento', 'gasto', 'Deudas e intereses');

  INSERT INTO public.categories(parent_id, name, category_type, description)
  VALUES 
    ('10000000-0000-0000-0000-000000000004', 'Pago de Deudas', 'gasto', 'Abonos a deudas registradas'),
    ('10000000-0000-0000-0000-000000000004', 'Interes y Comision', 'gasto', 'Interes de prestamos y comisiones');

  -- Otros
  INSERT INTO public.categories(name, category_type, description)
  VALUES 
    ('Impuesto y Tasa', 'gasto', 'SRI, impuesto municipales, patentes'),
    ('Mantenimiento de Taller', 'gasto', 'Reparacion del Local'),
    ('Nuevos Negocios', 'gasto', 'Otros negocios con relacion al taller'),
    ('Otros', 'gasto', 'Gasto que no encajan en ninguna otra');
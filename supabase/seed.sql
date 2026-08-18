-- ========================================================
-- Seed de datos QA para desarrollo/pruebas locales
-- Se ejecuta automáticamente con: supabase start / supabase db reset
-- Fuente original: taller-web-test/datos_pruebas_qa.sql
-- (se removieron los CREATE TABLE/TYPE porque ya los crean las migraciones)
-- ========================================================

-- Customers
INSERT INTO customers (id, name, phone, address, active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'QA TEST Cliente Uno', 999000001, 'Av. de Prueba 100', true),
    ('11111111-1111-1111-1111-111111111112', 'QA TEST Cliente Dos', 999000002, 'Av. de Prueba 200', true),
    ('11111111-1111-1111-1111-111111111113', 'QA TEST Cliente Inactivo', 999000003, 'Av. de Prueba 300', false);

-- Suppliers
INSERT INTO suppliers (id, name, phone, address, observacion, active) VALUES
    ('22222222-2222-2222-2222-222222222221', 'QA TEST Proveedor Repuestos', 998000001, 'Zona Industrial 1', 'Proveedor de prueba', true),
    ('22222222-2222-2222-2222-222222222222', 'QA TEST Proveedor Accesorios', 998000002, 'Zona Industrial 2', 'Proveedor de prueba', true);
	

-- Products
INSERT INTO products (id, name, description, category, stock, stock_min, price, cost, active) VALUES
    ('33333333-3333-3333-3333-333333333331', 'QA TEST Cadena', 'Cadena de bicicleta estándar', 'Repuestos', 20, 5, 15.00, 8.00, true),
    ('33333333-3333-3333-3333-333333333332', 'QA TEST Llanta 26"', 'Llanta rin 26', 'Repuestos', 10, 2, 50.00, 30.00, true),
    ('33333333-3333-3333-3333-333333333333', 'QA TEST Casco', 'Casco de seguridad', 'Accesorios', 8, 2, 30.00, 18.00, true);

-- Bicycles
INSERT INTO bicycles (id, customer_id, brand, model, serial_number, observacion) VALUES
    ('44444444-4444-4444-4444-444444444441', '11111111-1111-1111-1111-111111111111', 'QA TEST Trek', 'Marlin 7', 'SN-QA-0001', 'Bici de prueba'),
    ('44444444-4444-4444-4444-444444444442', '11111111-1111-1111-1111-111111111112', 'QA TEST Giant', 'Talon 3', 'SN-QA-0002', 'Bici de prueba');

-- Sales
INSERT INTO sales (id, sales_date, customer_id, sales_type, sub_total, discount, total, payment_method, status, observacion) VALUES
    ('55555555-5555-5555-5555-555555555551', CURRENT_DATE, '11111111-1111-1111-1111-111111111111', 'retail', 40.00, 0, 40.00, 'efectivo', 'completado', 'Venta de prueba');

-- Sale items
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, discount, total) VALUES
    ('66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', 1, 15.00, 0, 15.00),
    ('66666666-6666-6666-6666-666666666662', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333333', 1, 30.00, 5.00, 25.00);

-- Purchases
INSERT INTO purchases (id, supplier_id, purchase_date, description, sub_total, total, payment_method, status, observacion) VALUES
    ('77777777-7777-7777-7777-777777777771', '22222222-2222-2222-2222-222222222221', CURRENT_DATE, 'Compra de prueba de repuestos', 80.00, 80.00, 'transferencia', 'completado', 'Compra QA');

-- Purchase items
INSERT INTO purchase_items (id, purchase_id, product_id, quantity, unit_cost, total) VALUES
    ('88888888-8888-8888-8888-888888888881', '77777777-7777-7777-7777-777777777771', '33333333-3333-3333-3333-333333333331', 10, 8.00, 80.00);

-- Maintenance records
INSERT INTO maintenance_records (id, bicycle_id, sale_id, service_date, delivery_date, description, observation, cost, status) VALUES
    ('99999999-9999-9999-9999-999999999991', '44444444-4444-4444-4444-444444444441', NULL, CURRENT_DATE, CURRENT_DATE + 2, 'Mantenimiento preventivo QA', 'Registro de prueba', 25.00, 'recibido'),
    ('99999999-9999-9999-9999-999999999992', '44444444-4444-4444-4444-444444444442', NULL, CURRENT_DATE - 5, CURRENT_DATE - 1, 'Cambio de llanta QA', 'Registro de prueba entregado', 50.00, 'entregado');

-- Maintenance Items
INSERT INTO maintenance_items (id, maintenance_id, product_id, item_type, description, quantity, unit_price, total_price) VALUES
    ('99999999-9999-9999-9999-999999999993', '99999999-9999-9999-9999-999999999991','33333333-3333-3333-3333-333333333331', 'retail', 'Cambio de Cadena QA', '1', 15.00, 15.00),
    ('99999999-9999-9999-9999-999999999994', '99999999-9999-9999-9999-999999999992','33333333-3333-3333-3333-333333333332', 'retail', 'Cambio de Llantas QA', '2', 50.00, 100.00);

    
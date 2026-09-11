-- ==============================================
-- Tablas
-- ==============================================
-- ENUMS  
-- ==============================================
create type estado_pago as enum('pendiente', 'completado', 'cancelado');

create type mantenimiento_estado as ENUM(
  'recibido',
  'en_proceso',
  'completado',
  'entregado',
  'cancelado'
);

create type metodo_pago as ENUM('efectivo', 'transferencia', 'tarjeta');

create type sales_type as enum('retail', 'service', 'mixed');

create type credit_note_type as enum('devolucion', 'descuento');

create type customer_credit_type as enum('nota_credito', 'adelanto', 'aplicado', 'ajuste');

-- ==========================================================
-- Tablas
-- ==========================================================
-- PROFILES
create table if not exists public.profiles (
  id uuid references auth.users (id) primary key,
  role text not null default 'user',
  create_at timestamp without time zone default "now" () not null,
  updated_at timestamp with time zone default "now" () not null
);

-- CORE
create table if not exists public.customers (
  id UUID primary key default uuid_generate_v4 (),
  name text not null,
  phone integer,
  address text,
  active boolean default true not null,
  created_at timestamp without time zone default "now" () not null,
  updated_at timestamp with time zone default "now" () not null
);

-- BICICLETAS
create table if not exists public.bicycles (
  id UUID primary key default uuid_generate_v4 (),
  customer_id uuid not null references public.customers (id) on delete restrict,
  brand text,
  model text,
  serial_number text,
  observacion text,
  created_at timestamp not null default now(),
  updated_at timestamp with time zone default now() not null
);

-- MANTENIMIENTO
create table if not exists public.maintenance_records (
  id uuid default uuid_generate_v4 () not null,
  bicycle_id uuid not null references public.bicycles (id) delete restrict,
  sale_id uuid not null references public.sales (id) on delete restrict,
  service_date date default CURRENT_DATE not null,
  delivery_date date,
  description text not null,
  observation text,
  cost numeric(12, 2) default 0 not null,
  status mantenimiento_estado not null default 'recibido',
  created_at timestamp without time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.maintenance_items (
  id uuid not null default uuid_generate_v4 (),
  maintenance_id uuid not null references public.maintenance_records (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  item_type text not null check (item_type in ('retail', 'service')),
  description text,
  quantity interger default 1 not null check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price > 0),
  total_price numeric(12, 2) generated always as (quantity * unit_price) stored,
  created_at timestamp without time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
);

-- ======================================================================================
-- FINANZAS BASICO
-- =====================================================================================
-- SALES
create table if not exists public.sales (
  id uuid not null default uuid_generate_v4 (),
  customer_id uuid not null references public.customers (id),
  sales_date date default current_date not null,
  sales_types text not null default 'retail' check (sales_type in ('retail', 'service', 'mixed')),
  sub_total numeric(12, 2) default 0 not null,
  discount numeric(12, 2) default 0 not null,
  total numeric(12, 2) default 0 not null,
  payment_method metodo_pago default 'efectivo',
  status estado_pago default 'pendiente',
  observacion text,
  created_at timestamp without time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table if not exists public.sale_items (
  id uuid not null default uuid_generate_v4 () not null,
  sale_id uuid not null references public.sales (id) on delete cascade,
  product_id uuid not null reference public.products (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  discount numeric(12, 2) default 0 not null,
  total numeric(12, 2) not null,
  created_at timestamp without time zone default now() not null,
);

-- PURCHASES
create table if not exists public.purchases (
  id uuid not null default uuid_generate_v4 (),
  supplier_id uuid not null references public.suppliers (id),
  purchase_date date default current_date not null,
  description text,
  sub_total numeric(12, 2) default 0 not null,
  total numeric(12, 2) default 0 not null,
  payment_method metodo_pago default 'efectivo',
  status estado_pago default 'pendiente' observacion text,
  created_at timestamp without time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
);

alter table public.purchases
    add column if not exists category_id uuid references public.categories(id) on delete restrict;

create table if not exists public.purchase_items (
  id uuid not null default uuid_generate_v4 (),
  purchase_id uuid not null references public.purchases (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete restrict,
  quantity interger not null check (quantity < 0),
  unit_cost numeric(12, 2) not null,
  total numeric(12, 2) not null,
  created_at timestamp without time zone default now() not null,
);

-- SUPPLIERS
create table if not exists public.suppliers (
  id UUID primary key default uuid_generate_v4 (),
  name text not null,
  phone integer,
  address text,
  notes text,
  active boolean not null default true,
  created_at timestamp not null default now(),
  update_at timestamp not null default now()
);

-- PRODUCTS
create table if not exists public.products (
  id UUID primary key default uuid_generate_v4 (),
  name text not null,
  description text,
  category text,
  stock integer not null default 0 check (stock >= 0),
  stock_min integer not null default 0,
  price numeric(12, 2) not null default 0 check (price >= 0),
  cost numeric(12, 2) not null default 0 check (cost >= 0),
  active boolean not null default true,
  created_at timestamp not null default now(),
  update_at timestamp not null default now()
);
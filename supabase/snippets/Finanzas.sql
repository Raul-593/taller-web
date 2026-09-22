-- ========================================================================================
-- Modulo de Finanzas
-- =======================================================================================
-- Accounts
create table if not exists public.accounts (
  id                                UUID not null PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                              text unique not null,
  type                              text not null check( type in ('efectivo', 'banco', 'tarjeta', 'billetera_digital')),
  initial_balance                   numeric(12,2) not null default 0,
  initial_balance_date              date not null default current_date,
  is_active                         boolean not null default true,
  created_at                        timestamp without time zone not null default now(),
  updated_at                        timestamp with time zone not null default now()
);

-- Categorias
create table if not exists public.categories (
  id                              UUID not null primary key default uuid_generate_v4(),
  parent_id                       uuid references public.categories(id),
  name                            text not null,
  category_type                   text not null check (category_type in ('ingreso', 'gasto')),
  description                     text,
  is_active                       boolean default true not null,
  created_at                      timestamp without time zone default now() not null,
  updated_at                      timestamp with time zone default now() not null,

  constraint categories_type_name_key unique(category_type, name)
);

-- Movimientos
create table if not exists public.movimientos (
  id                            UUID primary key default uuid_generate_v4() not null,
  account_id                    uuid not null references public.accounts(id) on delete restrict,
  category_id                   uuid not null references public.categories(id) on delete restrict,
  
  amount                        numeric(12,2) not null check (amount > 0),
  movement_date                 date not null default current_date,
  description                   text,

  -- Referencia hacia la tabla 'sale', 'purchases', 'payments'
  reference_type                text,
  -- Referencia hacia el id de las tablas
  reference_id                  uuid,
  
  created_by                    uuid not null references public.profiles(id) on delete restrict,
  created_at                    timestamp without time zone default now() not null,
  updated_at                     timestamp with time zone default now() not null,
  
  -- Revisa que si una referencia es null la otra tambien debe ser null
  constraint movimiento_reference_pair_check
    check ((reference_type is null) = (reference_id is null))
);

create table if not exists public.transferencias(
  id                           uuid primary key default uuid_generate_v4() not null,
  from_account                 uuid not null references public.accounts(id) on delete restrict,
  to_account                   uuid not null references public.accounts(id) on delete restrict,
  amount                       numeric(12,2) not null check(amount > 0),
  transfer_date                date default current_date not null,
  description                  text,
  created_by                   uuid not null references public.profiles(id),
  created_at                   timestamp without time zone default now() not null,
  updated_at                   timestamp with time zone default now() not null,
  
  -- Confirmar que las cuentas sean diferentes  
  constraint financial_transfers_diferent_account_check
    check (from_account <> to_account)
);

-- deudas
create table if not exists public.deudas(
  id                        uuid primary key default uuid_generate_v4() not null,
  creditor                  text not null,
  description               text,
  total_amount              numeric(12,2) not null check(total_amount > 0),
  due_date                  date,
  status                    public.estado_pago not null default 'pendiente',
  
  purchase_id               uuid references public.purchases(id) on delete set null,
  
  created_at                timestamp without time zone not null default now(),
  updated_at                timestamp with time zone not null default now()
);

-- creditor
create table if not exists public.credit_note_items(
  id                              uuid not null primary key default uuid_generate_v4(),
  credit_note_id                  uuid not null references public.credit_notes(id) on delete cascade,
  product_id                      uuid not null references public.products(id) on delete restrict,
  quantity                        integer not null check (quantity > 0),
  unit_price                      numeric(12,2) check (unit_price >=0),
  total                           numeric(12,2) generated always as (quantity * unit_price) stored,
  created_at                      timestamp without time zone not null default now()
);

alter table public.movimientos
    alter column created_by set default auth.uid();

alter table public.transferencias
    alter column created_by set default auth.uid();

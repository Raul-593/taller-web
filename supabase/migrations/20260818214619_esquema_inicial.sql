set local check_function_bodies = off;

create extension "pg_net" schema "extensions";

create table "public"."bicycles" (
  "id"            uuid                        not null default extensions.uuid_generate_v4(),
  "customer_id"   uuid                        not null,
  "brand"         text,
  "model"         text,
  "serial_number" text,
  "observacion"   text,
  "created_at"    timestamp without time zone not null default now(),
  "updated_at"    timestamp with time zone    not null default now(),
  constraint "bicycles_pkey" primary key (id)
);

alter table "public"."bicycles"
  enable row level security;

create table "public"."customers" (
  "id"         uuid                        not null default extensions.uuid_generate_v4(),
  "name"       text                        not null,
  "phone"      integer,
  "address"    text,
  "active"     boolean                     not null default true,
  "created_at" timestamp without time zone not null default now(),
  "updated_at" timestamp with time zone    not null default now(),
  constraint "customers_pkey" primary key (id)
);

alter table "public"."customers"
  enable row level security;

create table "public"."maintenance_items" (
  "id"             uuid                        not null default extensions.uuid_generate_v4(),
  "maintenance_id" uuid,
  "product_id"     uuid,
  "item_type"      text                        not null,
  "description"    text,
  "quantity"       integer                     not null default 1,
  "unit_price"     numeric                     not null default 0,
  "total_price"    numeric,
  "created_at"     timestamp without time zone not null default now(),
  "updated_at"     timestamp with time zone    not null default now(),
  constraint "maintenance_items_pkey" primary key (id)
);

alter table "public"."maintenance_items"
  enable row level security;

create table "public"."maintenance_records" (
  "id"            uuid                        not null default extensions.uuid_generate_v4(),
  "bicycle_id"    uuid                        not null,
  "sale_id"       uuid,
  "service_date"  date                        not null default CURRENT_DATE,
  "delivery_date" date,
  "description"   text                        not null,
  "observation"   text,
  "cost"          numeric                     not null default 0,
  "created_at"    timestamp without time zone not null default now(),
  "updated_at"    timestamp with time zone    not null default now(),
  constraint "maintenance_records_pkey" primary key (id)
);

alter table "public"."maintenance_records"
  enable row level security;

create table "public"."products" (
  "id"          uuid                        not null default extensions.uuid_generate_v4(),
  "name"        text                        not null,
  "description" text,
  "category"    text,
  "stock"       integer                     not null default 0,
  "stock_min"   integer                     not null default 0,
  "price"       numeric                     not null default 0,
  "cost"        numeric                     not null default 0,
  "active"      boolean                     not null default true,
  "created_at"  timestamp without time zone not null default now(),
  "updated_at"  timestamp with time zone    not null default now(),
  constraint "products_pkey" primary key (id)
);

alter table "public"."products"
  enable row level security;

create table "public"."purchase_items" (
  "id"          uuid                        not null default extensions.uuid_generate_v4(),
  "purchase_id" uuid                        not null,
  "product_id"  uuid                        not null,
  "quantity"    integer                     not null,
  "unit_cost"   numeric                     not null,
  "total"       numeric                     not null,
  "created_at"  timestamp without time zone not null default now(),
  constraint "purchase_items_pkey" primary key (id)
);

alter table "public"."purchase_items"
  enable row level security;

create table "public"."purchases" (
  "id"            uuid                        not null default extensions.uuid_generate_v4(),
  "supplier_id"   uuid                        not null,
  "purchase_date" date                        not null default CURRENT_DATE,
  "description"   text,
  "sub_total"     numeric                     not null default 0,
  "total"         numeric                     not null default 0,
  "observacion"   text,
  "created_at"    timestamp without time zone not null default now(),
  "updated_at"    timestamp with time zone    not null default now(),
  constraint "purchases_pkey" primary key (id)
);

alter table "public"."purchases"
  enable row level security;

create table "public"."sale_items" (
  "id"         uuid                        not null default extensions.uuid_generate_v4(),
  "sale_id"    uuid                        not null,
  "product_id" uuid                        not null,
  "quantity"   integer                     not null,
  "unit_price" numeric                     not null,
  "discount"   numeric                     not null default 0,
  "total"      numeric                     not null,
  "created_at" timestamp without time zone not null default now(),
  constraint "sale_items_pkey" primary key (id)
);

alter table "public"."sale_items"
  enable row level security;

create table "public"."sales" (
  "id"          uuid                        not null default extensions.uuid_generate_v4(),
  "sales_date"  date                        not null default CURRENT_DATE,
  "customer_id" uuid,
  "sales_type"  text                        not null default 'retail'::text,
  "sub_total"   numeric                     not null default 0,
  "discount"    numeric                     not null default 0,
  "total"       numeric                     not null default 0,
  "observacion" text,
  "created_at"  timestamp without time zone not null default now(),
  "updated_at"  timestamp with time zone    not null default now(),
  constraint "sales_pkey" primary key (id)
);

alter table "public"."sales"
  enable row level security;

create table "public"."suppliers" (
  "id"          uuid                        not null default extensions.uuid_generate_v4(),
  "name"        text                        not null,
  "phone"       integer,
  "address"     text,
  "observacion" text,
  "active"      boolean                     not null default true,
  "created_at"  timestamp without time zone not null default now(),
  "updated_at"  timestamp with time zone    not null default now(),
  constraint "suppliers_pkey" primary key (id)
);

alter table "public"."suppliers"
  enable row level security;

create type "public"."estado_pago" as enum (
  'pendiente',
  'completado',
  'cancelado'
);

alter table "public"."purchases"
  add column "status" public.estado_pago default 'pendiente'::public.estado_pago;

alter table "public"."sales"
  add column "status" public.estado_pago default 'pendiente'::public.estado_pago;

create type "public"."mantenimiento_estado" as enum (
  'recibido',
  'en_proceso',
  'completado',
  'entregado',
  'cancelado'
);

alter table "public"."maintenance_records"
  add column "status" public.mantenimiento_estado not null default 'recibido'::public.mantenimiento_estado;

create type "public"."metodo_pago" as enum (
  'efectivo',
  'transferencia',
  'tarjeta'
);

alter table "public"."purchases"
  add column "payment_method" public.metodo_pago default 'transferencia'::public.metodo_pago;

alter table "public"."sales"
  add column "payment_method" public.metodo_pago default 'transferencia'::public.metodo_pago;

alter table "public"."bicycles"
  add constraint "bicycles_customer_id_fkey" foreign key (customer_id) references public.customers(id);

alter table "public"."maintenance_records"
  add constraint "maintenance_records_bicycle_id_fkey" foreign key (bicycle_id) references public.bicycles(id);

alter table "public"."maintenance_items"
  add constraint "maintenance_items_maintenance_id_fkey" foreign key (maintenance_id) references public.maintenance_records(id);

alter table "public"."maintenance_items"
  add constraint "maintenance_items_product_id_fkey" foreign key (product_id) references public.products(id);

alter table "public"."purchase_items"
  add constraint "purchase_items_product_id_fkey" foreign key (product_id) references public.products(id);

alter table "public"."purchase_items"
  add constraint "purchase_items_purchase_id_fkey" foreign key (purchase_id) references public.purchases(id);

alter table "public"."sale_items"
  add constraint "sale_items_product_id_fkey" foreign key (product_id) references public.products(id);

alter table "public"."sales"
  add constraint "sales_customer_id_fkey" foreign key (customer_id) references public.customers(id);

alter table "public"."maintenance_records"
  add constraint "maintenance_records_sale_id_fkey" foreign key (sale_id) references public.sales(id);

alter table "public"."sale_items"
  add constraint "sale_items_sale_id_fkey" foreign key (sale_id) references public.sales(id);

alter table "public"."purchases"
  add constraint "purchases_supplier_id_fkey" foreign key (supplier_id) references public.suppliers(id);

create policy "pruebas_all_bicycles" on "public"."bicycles"
  for all
  to PUBLIC
  using (true);

create policy "pruebas_all_customers" on "public"."customers"
  for all
  to PUBLIC
  using (true);

create policy "pruebas_all_maintenance_items" on "public"."maintenance_items"
  for all
  to PUBLIC
  using (true);

create policy "pruebas_all_maintenance_recors" on "public"."maintenance_records"
  for all
  to PUBLIC
  using (true);

create policy "pruebas_all_products" on "public"."products"
  for all
  to PUBLIC
  using (true);

create policy "pruebas_all_purches_items" on "public"."purchase_items"
  for all
  to PUBLIC
  using (true);

create policy "pruebas_all_purchases" on "public"."purchases"
  for all
  to PUBLIC
  using (true);

create policy "pruebas_all_sale_items" on "public"."sale_items"
  for all
  to "authenticated"
  using (true);

create policy "pruebas_all_sales" on "public"."sales"
  for all
  to "authenticated"
  using (true);

create policy "pruebas_all_suppliers" on "public"."suppliers"
  for all
  to PUBLIC
  using (true);

comment on extension "pg_net" is 'Async HTTP';

grant maintain, references, trigger, truncate on table "public"."bicycles" to "anon";

grant maintain, references, select, trigger, truncate on table "public"."bicycles" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."bicycles" to "postgres";

grant maintain, references, trigger, truncate on table "public"."bicycles" to "service_role";

grant maintain, references, trigger, truncate on table "public"."customers" to "anon";

grant insert, maintain, references, select, trigger, truncate on table "public"."customers" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."customers" to "postgres";

grant maintain, references, trigger, truncate on table "public"."customers" to "service_role";

grant maintain, references, trigger, truncate on table "public"."maintenance_items" to "anon";

grant maintain, references, select, trigger, truncate on table "public"."maintenance_items" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."maintenance_items" to "postgres";

grant maintain, references, trigger, truncate on table "public"."maintenance_items" to "service_role";

grant maintain, references, trigger, truncate on table "public"."maintenance_records" to "anon";

grant maintain, references, select, trigger, truncate on table "public"."maintenance_records" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."maintenance_records" to "postgres";

grant maintain, references, trigger, truncate on table "public"."maintenance_records" to "service_role";

grant maintain, references, trigger, truncate on table "public"."products" to "anon";

grant maintain, references, select, trigger, truncate on table "public"."products" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."products" to "postgres";

grant maintain, references, trigger, truncate on table "public"."products" to "service_role";

grant maintain, references, trigger, truncate on table "public"."purchase_items" to "anon", "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."purchase_items" to "postgres";

grant maintain, references, trigger, truncate on table "public"."purchase_items" to "service_role";

grant maintain, references, trigger, truncate on table "public"."purchases" to "anon";

grant maintain, references, select, trigger, truncate on table "public"."purchases" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."purchases" to "postgres";

grant maintain, references, trigger, truncate on table "public"."purchases" to "service_role";

grant maintain, references, trigger, truncate on table "public"."sale_items" to "anon", "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."sale_items" to "postgres";

grant maintain, references, trigger, truncate on table "public"."sale_items" to "service_role";

grant maintain, references, trigger, truncate on table "public"."sales" to "anon";

grant maintain, references, select, trigger, truncate on table "public"."sales" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."sales" to "postgres";

grant maintain, references, trigger, truncate on table "public"."sales" to "service_role";

grant maintain, references, trigger, truncate on table "public"."suppliers" to "anon";

grant maintain, references, select, trigger, truncate on table "public"."suppliers" to "authenticated";

grant delete, insert, maintain, references, select, trigger, truncate, update on table "public"."suppliers" to "postgres";

grant maintain, references, trigger, truncate on table "public"."suppliers" to "service_role";

grant usage on type "public"."estado_pago" to "postgres";

grant usage on type "public"."mantenimiento_estado" to "postgres";

grant usage on type "public"."metodo_pago" to "postgres";

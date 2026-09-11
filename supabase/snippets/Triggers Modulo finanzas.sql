-- =====================================================
-- Triggers
-- =====================================================
-- LIMPIEZA DE TRIGGERS Y FUNCIONES
drop function if exists public.fn_create_sale_from_maintenance ();

drop function if exists public.update_purchase_status_on_payment ();

drop function if exists public.restore_stock_on_credit_note ();

drop function if exists public.fn_maintenance_to_sale () cascade;

-- Columnas Nuevas
alter table public.maintenance_payments
add column if not exists account_id uuid not null references public.accounts (id) on delete restrict;

alter table public.payments
add column if not exists account_id uuid not null references public.accounts (id) on delete restrict,
add column if not exists source text not null default 'manual' check (source in ('manual', 'maintenance_transfer'));

alter table public.maintenance_records
add column if not exists sales_type text default 'mixed' check (sales_type in ('retail', 'service', 'mixed')),
add column if not exists payment_method public.metodo_pago default 'pendiente';

-- Replazar funciones
create or replace function public.fn_maintenance_to_sale()
returns trigger
language plpgsql
as $$
declare
    v_sale_id            uuid;
    v_customer_id        uuid;
    v_subtotal           numeric(12,2);
    v_total              numeric(12,2);
    v_paid_maintenance   numeric(12,2);
    v_credit_maintenance numeric(12,2);
begin
    if NEW.status = 'entregado'
       and OLD.status != 'entregado'
       and NEW.sale_id is null then

        if NEW.sales_type is null or NEW.payment_method is null then
            raise exception 'El tipo de venta y metodo de pago deben de estar marcados';
        end if;

        select customer_id into v_customer_id
        from public.bicycles where id = NEW.bicycle_id;

        select
            coalesce(sum(quantity * unit_price), 0),
            coalesce(sum(total_price), 0)
        into v_subtotal, v_total
        from public.maintenance_items
        where maintenance_id = NEW.id;

        select coalesce(sum(amount), 0) into v_paid_maintenance
        from public.maintenance_payments
        where maintenance_id = NEW.id;

        select coalesce(sum(abs(amount)), 0) into v_credit_maintenance
        from public.customer_credit
        where maintenance_id = NEW.id and credit_type = 'aplicado';

        insert into public.sales (
            sales_date, customer_id, sales_type, sub_total,
            discount, total, status, observacion, payment_method
        ) values (
            current_date, v_customer_id, NEW.sales_type, v_subtotal,
            v_subtotal - v_total, v_total,
            case
                when (v_paid_maintenance + v_credit_maintenance) >= v_total
                    then 'completado'::estado_pago
                else 'pendiente'::estado_pago
            end,
            NEW.description, NEW.payment_method
        ) returning id into v_sale_id;

        insert into public.sale_items (
            sale_id, product_id, quantity, unit_price, discount, total
        )
        select v_sale_id, product_id, quantity, unit_price, 0, total_price
        from public.maintenance_items
        where maintenance_id = NEW.id;

        insert into public.payments (
            sale_id, amount, payment_date, payment_method,
            reference, notes, account_id, source
        )
        select
            v_sale_id, amount, payment_date, payment_method,
            reference, coalesce(notes, 'Adelanto de mantenimiento'),
            account_id, 'maintenance_transfer'
        from public.maintenance_payments
        where maintenance_id = NEW.id;

        NEW.sale_id := v_sale_id;

        update public.sales
        set status = case
                when (v_paid_maintenance + v_credit_maintenance) >= v_total
                    then 'completado'::estado_pago
                else 'pendiente'::estado_pago
            end
        where id = v_sale_id;

    end if;
    return NEW;
end;
$$;

create
or replace trigger trg_maintenance_to_sale before
update on public.maintenance_records for each row
execute function public.fn_maintenance_to_sale ();

-- ==========================================================================================
-- payments -> cambia de estado a completado cuando el pago se ha completado
-- ==========================================================================================
create or replace function public.update_sale_status_on_payment () returns trigger language plpgsql as $$
declare
  v_total_venta numeric(12,2);
  v_total_pagado numeric(12,2);
  v_total_creditos numeric(12,2);
  v_sale_id uuid;
begin
  v_sale_id := coalesce(NEW.sale_id, old.sale_id);
  
  if v_sale_id is null then
    return coalesce(NEW, old);
  end if;

  select total into v_total_venta
  from public.sales
  where id = v_sale_id;

  select coalesce(sum(amount), 0) into v_total_pagado
  from public.payments
  where sale_id = v_sale_id;

  -- creditos aplicados directo a la venta
  select coalesce(sum(abs(amount)), 0) into v_total_creditos
  from public.customer_credit
  where credit_type = 'aplicado' and (
    sale_id = v_sale_id or maintenance_id in (
      select id 
      from public.maintenance_records 
      where sale_id = v_sale_id
    )
  );

  update public.sales set 
    status = case
      when (v_total_pagado + v_total_creditos) >= v_total_venta
        then 'completado'::estado_pago
      else 'pendiente'::estado_pago
    end,
    updated_at = now()
  where id = v_sale_id;

  return coalesce(NEW, old);
end;
$$;

create
or replace trigger trg_update_sale_status_on_payment
after insert on public.payments for each row
execute function public.update_sale_status_on_payment ();

create
or replace trigger trg_update_sale_status_on_credit_insert
after insert on public.customer_credit for each row
execute function public.update_sale_status_on_payment ();

--===========================================================================================
-- maintenance_payments -> movimientos
-- ==========================================================================================
create or replace function public.fn_maintenance_payment_to_movimiento () returns trigger language plpgsql as $$
declare
  v_category_id uuid;
begin
  select id into v_category_id
  from public.categories
  where name = 'Cobros a Clientes' and category_type = 'ingreso'
  limit 1;

  insert into public.movimientos (
    account_id, category_id, amount, movement_date, description, reference_type, reference_id,
    created_by
  ) values(
    NEW.account_id, v_category_id, NEW.amount, NEW.payment_date, 
    coalesce(NEW.notes, 'Adelante de mantenimiento'), 'maintenance_payment', NEW.id, auth.uid()
  );
  return NEW;
end;
$$;

create
or replace trigger trg_maintenance_payment_to_movimiento
after insert on public.maintenance_payments for each row
execute function public.fn_maintenance_payment_to_movimiento ();

-- ============================================================================
-- payments -> movimientos
-- Solo se dispara si source = 'manual'
-- =============================================================================
create or replace function public.fn_sale_payment_to_movimiento () returns trigger language plpgsql as $$
declare
  v_category_id uuid;
begin
  if NEW.source = 'manual' then
    select id into v_category_id
    from public.categories
    where name = 'Cobros a Clientes'and category_type = 'ingreso'
    limit 1;

    insert into public.movimientos(
      account_id, category_id, amount, movement_date,
      description, reference_type, reference_id, created_by
    ) values(
      NEW.account_id, v_category_id, NEW.amount, NEW.payment_date,
      coalesce(NEW.notes, 'Abono a venta'), 'payment', NEW.id, auth.uid()
    );
  end if;
  return NEW;
end;
$$;

create
or replace trigger trg_sale_payment_to_movimiento
after insert on public.payments for each row
execute function public.fn_sale_payment_to_movimiento ();

-- ========================================================================
-- Modificar para que purchases solo obligatoria si se paga completo
-- Se agrega la columna account_id
-- ========================================================================
alter table public.purchases
add column if not exists account_id uuid references public.accounts (id) on delete restrict,
add constraint purchase_accounts_required_if_paid check (
  status <> 'completado'
  or account_id is not null
);

-- Compra -> movimiento (si el pago es completo)
-- Compra -> deudas (si el pago es parcial)
create or replace function public.fn_purchase_to_movimiento_or_debt () returns trigger language plpgsql as $$
declare
  v_category_id uuid;
  v_supplier_name text;
begin
  if NEW.status = 'completado' then

    select id into v_category_id
    from public.categories
    where name = 'Compra de Repuestos' and category_type = 'gasto'
    limit 1;

    insert into public.movimientos(
      account_id, category_id, amount, movement_date, description, reference_type,
      reference_id, created_by
    ) values(
      NEW.account_id, NEW.category_id, NEW.total, NEW.purchase_date,
      coalesce(NEW.description, 'Compra de repuestos'),
      'purchase', NEW.id, auth.uid()
    );
  
  elsif NEW.status = 'pendiente' then
    select name into v_supplier_name
    from public.suppliers
    where id = NEW.supplier_id;

    insert into public.deudas(
      creditor, description, total_amount, status, purchase_id
    ) values (
      v_supplier_name,
      coalesce(NEW.description, 'Compra pendiente de pago'),
      NEW.total, 'pendiente', NEW.id
    );
  end if;
  return NEW;
end;
$$;

create trigger trg_purchase_to_movimiento_or_debts
after insert on public.purchases for each row
execute function public.fn_purchase_to_movimiento_or_debt ();

-- Cierre de deudas automatica
create or replace function public.fn_close_debt_on_payment () returns trigger language plpgsql as $$
declare
  v_debt record;
  v_total_paid numeric(12,2);
begin
  if NEW.reference_type = 'debt_payment' then
    
    select * into v_debt
    from public.deudas
    where id = NEW.reference_id;

    select coalesce(sum(amount), 0) into v_total_paid
    from public.movimientos
    where reference_type = 'debt_payment' and reference_id = v_debt.id;

    if v_total_paid >= v_debt.total_amount and v_debt.status <> 'completado' then

      update public.deudas
      set status = 'completado'
      where id = v_debt.id;

      if v_debt.purchase_id is not null then
        update public.purchases
        set status = 'completado'
        where id = v_debt.purchase_id;
      end if;

    end if;
  end if;
  return NEW;
end;
$$;

create trigger trg_close_debt_on_payment
after insert on public.movimientos for each row
execute function public.fn_close_debt_on_payment ();

-- ================================================================================================
-- credit_note_items
-- ================================================================================================
create or replace function public.recalculate_credit_note_total()
returns trigger
language plpgsql
as $$
declare
  v_total numeric(12,2);
  v_credit_note_id uuid;
begin
  v_credit_note_id := coalesce(NEW.credit_note_id, old.credit_note_id);

  select coalesce(sum(total), 0)
  into v_total
  from public.credit_note_items
  where credit_note_id = v_credit_note_id;

  update public.credit_notes
  set total = v_total
  where id = v_credit_note_id;

  return coalesce(NEW, old);
end;
$$;

create trigger trg_recalculate_credit_note_total
  after insert or delete or update on public.credit_note_items
  for each row execute function public.recalculate_credit_note_total();

-- Conectar los triggers
create or replace function public.restore_stock_on_credit_note()
returns trigger
language plpgsql
as $$
begin
  if NEW.status = 'completado'
    and OLD.status != 'completado'
    and NEW.credit_type = 'devolucion' then

      update public.products p
      set stock = p.stock + cni.quantity
      from public.credit_note_items cni 
      where cni.credit_note_id = NEW.id and cni.product_id = p.id;
  
  end if;
  return new;
end;
$$;

create or replace function public.credit_note_to_wallet()
returns trigger
language plpgsql
as $$
begin
  if NEW.status = 'completado' and OLD.status != 'completado' then

    insert into public.customer_credit(
      customer_id, amount, credit_type, reason, sale_id, credit_note_id
    ) values (
      NEW.customer_id, NEW.total, 'nota_credito', 'Nota de credito aporbado: ' || NEW.reason,
      NEW.sale_id, NEW.id
    );
  end if;
  return NEW;
end;
$$;

-- Prefijo numerico para qeu el orden de ejecucion sea explicito
create or replace trigger trg_credit_note_1_restore_stock
  after update on public.credit_notes
  for each row execute function public.restore_stock_on_credit_note();

create or replace trigger trg_credit_note_2_to_wallet
  after update on public.credit_notes
  for each row execute function public.credit_note_to_wallet();
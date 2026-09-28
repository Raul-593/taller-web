-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

REVOKE ADMIN OPTION FOR supabase_privileged_role FROM postgres;

DROP FUNCTION public.fn_create_sale_from_maintenance();

DROP FUNCTION public.update_purchase_status_on_payment();

ALTER TABLE public.bicycles
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.bicycles
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.credit_notes
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.credit_notes
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.credit_notes
  ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE public.credit_notes
  ALTER COLUMN updated_at TYPE timestamp with time zone USING updated_at::timestamp WITH time zone;

ALTER TABLE public.customer_credit
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.customer_credit
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.customers
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.customers
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.maintenance_items
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.maintenance_items
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.maintenance_items
  ALTER COLUMN updated_at DROP DEFAULT;

ALTER TABLE public.maintenance_items
  ALTER COLUMN updated_at TYPE timestamp with time zone USING updated_at::timestamp WITH time zone;

ALTER TABLE public.maintenance_payments
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.maintenance_payments
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.maintenance_records
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.maintenance_records
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.payments
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.payments
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.products
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.products
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.products
  ALTER COLUMN stock DROP DEFAULT;

ALTER TABLE public.products
  ALTER COLUMN stock_min DROP DEFAULT;

ALTER TABLE public.purchase_items
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.purchase_items
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.purchases
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.purchases
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.sale_items
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.sale_items
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.sales
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.sales
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

ALTER TABLE public.suppliers
  ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.suppliers
  ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp WITH time zone;

DROP POLICY bicycles ON public.bicycles;

DROP POLICY credit_notes_all ON public.credit_notes;

DROP POLICY customer_credit_all ON public.customer_credit;

DROP POLICY clientes_select ON public.customers;

DROP POLICY customers_insert ON public.customers;

DROP POLICY customers_update ON public.customers;

DROP POLICY "maintenance_items all" ON public.maintenance_items;

DROP POLICY maintenance_payments_all ON public.maintenance_payments;

DROP POLICY maintenance_record_all ON public.maintenance_records;

DROP POLICY payments_all ON public.payments;

DROP POLICY products_all ON public.products;

DROP POLICY purches_items_all ON public.purchase_items;

DROP POLICY purches_insert ON public.purchases;

DROP POLICY purcheses_select ON public.purchases;

DROP POLICY sale_select ON public.sales;

DROP POLICY sales_insert ON public.sales;

DROP POLICY sales_update ON public.sales;

DROP POLICY suppliers_all ON public.suppliers;

CREATE OR REPLACE FUNCTION public.credit_note_to_wallet()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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
$function$;

CREATE FUNCTION public.fn_close_debt_on_payment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
  v_debt record;
  v_total_paid numeric(12,2);
begin
  if NEW.reference_type = 'debt_payment' then
    
    select * into v_debt
    from public.debts
    where id = NEW.reference_id;

    select coalesce(sum(amount), 0) into v_total_paid
    from public.movimientos
    where reference_type = 'debt_payment' and reference_id = v_debt.id;

    if v_total_paid >= v_debt.total_amount and v_debt.status <> 'completado' then

      update public.debts
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
$function$;

GRANT ALL ON FUNCTION public.fn_close_debt_on_payment() TO anon;

GRANT ALL ON FUNCTION public.fn_close_debt_on_payment() TO authenticated;

GRANT ALL ON FUNCTION public.fn_close_debt_on_payment() TO service_role;

CREATE FUNCTION public.fn_maintenance_payment_to_movimiento()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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
    coalesce(NEW.notes, 'Adelanto de mantenimiento'), 'maintenance_payment', NEW.id, auth.uid()
  );
  return NEW;
end;
$function$;

GRANT ALL ON FUNCTION public.fn_maintenance_payment_to_movimiento() TO anon;

GRANT ALL ON FUNCTION public.fn_maintenance_payment_to_movimiento() TO authenticated;

GRANT ALL ON FUNCTION public.fn_maintenance_payment_to_movimiento() TO service_role;

CREATE OR REPLACE FUNCTION public.fn_maintenance_to_sale()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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
$function$;

CREATE FUNCTION public.fn_purchase_to_movimiento_or_debt()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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

    insert into public.debts(
      creditor, description, total_amount, status, purchase_id
    ) values (
      v_supplier_name,
      coalesce(NEW.description, 'Compra pendiente de pago'),
      NEW.total, 'pendiente', NEW.id
    );
  end if;
  return NEW;
end;
$function$;

GRANT ALL ON FUNCTION public.fn_purchase_to_movimiento_or_debt() TO anon;

GRANT ALL ON FUNCTION public.fn_purchase_to_movimiento_or_debt() TO authenticated;

GRANT ALL ON FUNCTION public.fn_purchase_to_movimiento_or_debt() TO service_role;

CREATE FUNCTION public.fn_sale_payment_to_movimiento()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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
      NEW.notes, 'payment', NEW.id, auth.uid()
    );
  end if;
  return NEW;
end;
$function$;

GRANT ALL ON FUNCTION public.fn_sale_payment_to_movimiento() TO anon;

GRANT ALL ON FUNCTION public.fn_sale_payment_to_movimiento() TO authenticated;

GRANT ALL ON FUNCTION public.fn_sale_payment_to_movimiento() TO service_role;

CREATE OR REPLACE FUNCTION public.increase_stock_on_purchase()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
    update public.products
    set stock = stock + new.quantity,
        cost  = new.unit_cost
    where id = new.product_id;
    return new;
end;
$function$;

CREATE FUNCTION public.is_superadmin()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO 'public'
  AS $function$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'superadmin'
  );
$function$;

GRANT ALL ON FUNCTION public.is_superadmin() TO anon;

GRANT ALL ON FUNCTION public.is_superadmin() TO authenticated;

GRANT ALL ON FUNCTION public.is_superadmin() TO service_role;

CREATE FUNCTION public.recalculate_credit_note_total()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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
$function$;

GRANT ALL ON FUNCTION public.recalculate_credit_note_total() TO anon;

GRANT ALL ON FUNCTION public.recalculate_credit_note_total() TO authenticated;

GRANT ALL ON FUNCTION public.recalculate_credit_note_total() TO service_role;

CREATE OR REPLACE FUNCTION public.restore_stock_on_credit_note()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_sale_status_on_payment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
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
$function$;

ALTER TABLE public.bicycles
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.credit_notes
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.credit_notes
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.customer_credit
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.customers
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.maintenance_items
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.maintenance_items
  ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.maintenance_payments
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.maintenance_records
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.payments
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.products
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.products
  ALTER COLUMN stock DROP NOT NULL;

ALTER TABLE public.products
  ALTER COLUMN stock_min DROP NOT NULL;

ALTER TABLE public.purchase_items
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.purchases
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.sale_items
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.sales
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE public.suppliers
  ALTER COLUMN created_at SET DEFAULT now();

CREATE TABLE public.accounts (
  id                   uuid                     DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name                 text                     NOT NULL,
  type                 text                     NOT NULL,
  initial_balance      numeric(12,2)            DEFAULT 0 NOT NULL,
  initial_balance_date date                     DEFAULT CURRENT_DATE NOT NULL,
  is_active            boolean                  DEFAULT true NOT NULL,
  created_at           timestamp with time zone DEFAULT now() NOT NULL,
  updated_at           timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.accounts
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_name_key UNIQUE (name);

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);

ALTER TABLE public.accounts
  ADD CONSTRAINT accounts_type_check CHECK (type = ANY (ARRAY['efectivo'::text, 'banco'::text, 'tarjeta'::text, 'billetera_digital'::text]));

GRANT ALL ON public.accounts TO anon;

GRANT ALL ON public.accounts TO authenticated;

GRANT ALL ON public.accounts TO service_role;

CREATE POLICY account_select ON public.accounts
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY accounts_insert ON public.accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY accounts_update ON public.accounts
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY bicicycle_delete ON public.bicycles
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

CREATE POLICY bicycles_insert ON public.bicycles
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY bicycles_select ON public.bicycles
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY bicycles_update ON public.bicycles
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE TABLE public.categories (
  id            uuid                     DEFAULT extensions.uuid_generate_v4() NOT NULL,
  parent_id     uuid,
  name          text                     NOT NULL,
  category_type text                     NOT NULL,
  description   text,
  is_active     boolean                  DEFAULT true NOT NULL,
  created_at    timestamp with time zone DEFAULT now() NOT NULL,
  updated_at    timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.categories
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_category_type_check CHECK (category_type = ANY (ARRAY['ingreso'::text, 'gasto'::text]));

ALTER TABLE public.categories
  ADD CONSTRAINT categories_pkey PRIMARY KEY (id);

ALTER TABLE public.categories
  ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);

ALTER TABLE public.categories
  ADD CONSTRAINT categories_type_name_key UNIQUE (category_type, name);

GRANT ALL ON public.categories TO anon;

GRANT ALL ON public.categories TO authenticated;

GRANT ALL ON public.categories TO service_role;

CREATE POLICY categories_insert ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY categories_select ON public.categories
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY categories_update ON public.categories
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE TABLE public.credit_note_items (
  id             uuid                     DEFAULT extensions.uuid_generate_v4() NOT NULL,
  credit_note_id uuid                     NOT NULL,
  product_id     uuid                     NOT NULL,
  quantity       integer                  NOT NULL,
  unit_price     numeric(12,2),
  total          numeric(12,2)            GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED,
  created_at     timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.credit_note_items
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.credit_note_items
  ADD CONSTRAINT credit_note_items_credit_note_id_fkey FOREIGN KEY (credit_note_id) REFERENCES public.credit_notes(id) ON DELETE CASCADE;

ALTER TABLE public.credit_note_items
  ADD CONSTRAINT credit_note_items_pkey PRIMARY KEY (id);

ALTER TABLE public.credit_note_items
  ADD CONSTRAINT credit_note_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE public.credit_note_items
  ADD CONSTRAINT credit_note_items_quantity_check CHECK (quantity > 0);

ALTER TABLE public.credit_note_items
  ADD CONSTRAINT credit_note_items_unit_price_check CHECK (unit_price >= 0::numeric);

GRANT ALL ON public.credit_note_items TO anon;

GRANT ALL ON public.credit_note_items TO authenticated;

GRANT ALL ON public.credit_note_items TO service_role;

CREATE TRIGGER trg_recalculate_credit_note_total
  AFTER INSERT OR DELETE OR UPDATE ON public.credit_note_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_credit_note_total();

CREATE POLICY credit_note_insert ON public.credit_note_items
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY credit_note_item_delete ON public.credit_note_items
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

CREATE POLICY credit_note_items_update ON public.credit_note_items
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY credit_note_select ON public.credit_note_items
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE TRIGGER trg_credit_note_1_restore_stock
  AFTER UPDATE ON public.credit_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.restore_stock_on_credit_note();

CREATE TRIGGER trg_credit_note_2_to_wallet
  AFTER UPDATE ON public.credit_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.credit_note_to_wallet();

CREATE POLICY credit_note_delete ON public.credit_notes
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

CREATE POLICY credit_note_insert ON public.credit_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY credit_note_select ON public.credit_notes
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY credit_note_update ON public.credit_notes
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE TRIGGER trg_update_sale_status_on_credit_insert
  AFTER INSERT ON public.customer_credit
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sale_status_on_payment();

CREATE POLICY customer_credit_insert ON public.customer_credit
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY customer_credit_select ON public.customer_credit
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY customer_credit_update ON public.customer_credit
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY customer_select ON public.customers
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY customers_insert ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY customers_update ON public.customers
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE TABLE public.debts (
  id           uuid                     DEFAULT extensions.uuid_generate_v4() NOT NULL,
  creditor     text                     NOT NULL,
  description  text,
  total_amount numeric(12,2)            NOT NULL,
  due_date     date,
  status       public.estado_pago       DEFAULT 'pendiente'::public.estado_pago NOT NULL,
  purchase_id  uuid,
  created_at   timestamp with time zone DEFAULT now() NOT NULL,
  updated_at   timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.debts
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.debts
  ADD CONSTRAINT debts_pkey PRIMARY KEY (id);

ALTER TABLE public.debts
  ADD CONSTRAINT debts_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE SET NULL;

ALTER TABLE public.debts
  ADD CONSTRAINT debts_total_amount_check CHECK (total_amount > 0::numeric);

GRANT ALL ON public.debts TO anon;

GRANT ALL ON public.debts TO authenticated;

GRANT ALL ON public.debts TO service_role;

CREATE POLICY debts_delete ON public.debts
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

CREATE POLICY debts_insert ON public.debts
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY debts_select ON public.debts
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY debts_update ON public.debts
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY maintenance_items_insert ON public.maintenance_items
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY maintenance_items_select ON public.maintenance_items
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY maintenance_items_update ON public.maintenance_items
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

ALTER TABLE public.maintenance_payments
  ADD COLUMN account_id uuid NOT NULL;

ALTER TABLE public.maintenance_payments
  ADD CONSTRAINT maintenance_payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;

CREATE TRIGGER trg_maintenance_payment_to_movimiento
  AFTER INSERT ON public.maintenance_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_maintenance_payment_to_movimiento();

CREATE POLICY maintenance_payments_insert ON public.maintenance_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY maintenance_payments_select ON public.maintenance_payments
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY maintenance_payments_update ON public.maintenance_payments
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

ALTER TABLE public.maintenance_records
  ADD COLUMN sales_type text DEFAULT 'mixed'::text;

ALTER TABLE public.maintenance_records
  ADD CONSTRAINT maintenance_records_sales_type_check CHECK (sales_type = ANY (ARRAY['retail'::text, 'service'::text, 'mixed'::text]));

ALTER TABLE public.maintenance_records
  ADD COLUMN payment_method public.metodo_pago;

CREATE POLICY maintenance_records_insert ON public.maintenance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY maintenance_records_select ON public.maintenance_records
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY maintenance_records_update ON public.maintenance_records
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE TABLE public.movimientos (
  id             uuid                     DEFAULT extensions.uuid_generate_v4() NOT NULL,
  account_id     uuid                     NOT NULL,
  category_id    uuid                     NOT NULL,
  amount         numeric(12,2)            NOT NULL,
  movement_date  date                     DEFAULT CURRENT_DATE NOT NULL,
  description    text,
  reference_type text,
  reference_id   uuid,
  created_by     uuid                     DEFAULT auth.uid() NOT NULL,
  created_at     timestamp with time zone DEFAULT now() NOT NULL,
  updated_at     timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.movimientos
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.movimientos
  ADD CONSTRAINT movimiento_reference_pair_check CHECK ((reference_type IS NULL) = (reference_id IS NULL));

ALTER TABLE public.movimientos
  ADD CONSTRAINT movimientos_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;

ALTER TABLE public.movimientos
  ADD CONSTRAINT movimientos_amount_check CHECK (amount > 0::numeric);

ALTER TABLE public.movimientos
  ADD CONSTRAINT movimientos_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

ALTER TABLE public.movimientos
  ADD CONSTRAINT movimientos_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;

ALTER TABLE public.movimientos
  ADD CONSTRAINT movimientos_pkey PRIMARY KEY (id);

GRANT ALL ON public.movimientos TO anon;

GRANT ALL ON public.movimientos TO authenticated;

GRANT ALL ON public.movimientos TO service_role;

CREATE TRIGGER trg_close_debt_on_payment
  AFTER INSERT ON public.movimientos
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_close_debt_on_payment();

CREATE POLICY movimiento_insert ON public.movimientos
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY movimientos_select ON public.movimientos
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY movimientos_update ON public.movimientos
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

ALTER TABLE public.payments
  ADD COLUMN account_id uuid NOT NULL;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;

ALTER TABLE public.payments
  ADD COLUMN source text DEFAULT 'manual'::text NOT NULL;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_source_check CHECK (source = ANY (ARRAY['manual'::text, 'maintenance_transfer'::text]));

CREATE TRIGGER trg_sale_payment_to_movimiento
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_sale_payment_to_movimiento();

CREATE TRIGGER trg_update_sale_status_on_payment
  AFTER INSERT ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sale_status_on_payment();

CREATE POLICY payments_insert ON public.payments
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY payments_select ON public.payments
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY payments_update ON public.payments
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

ALTER TABLE public.products
  ADD COLUMN category_id uuid;

ALTER TABLE public.products
  ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.products
  ADD COLUMN type text NOT NULL;

ALTER TABLE public.products
  ADD CONSTRAINT products_type_check CHECK (type = ANY (ARRAY['servicio'::text, 'product'::text]));

ALTER TABLE public.products
  ADD CONSTRAINT products_type_stock_check CHECK (type = 'product'::text AND stock IS NOT NULL AND stock_min IS
    NOT NULL OR type = 'servicio'::text AND stock IS NULL AND stock_min IS NULL);

CREATE POLICY product_delete ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_superadmin());

CREATE POLICY products_insert ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY products_select ON public.products
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY products_update ON public.products
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY purchase_item_select ON public.purchase_items
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY purchase_item_update ON public.purchase_items
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY purchase_items_insert ON public.purchase_items
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

ALTER TABLE public.purchases
  ADD COLUMN account_id uuid;

ALTER TABLE public.purchases
  ADD CONSTRAINT purchase_accounts_required_if_paid CHECK (status <> 'completado'::public.estado_pago OR account_id IS NOT NULL);

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;

ALTER TABLE public.purchases
  ADD COLUMN category_id uuid;

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;

CREATE TRIGGER trg_purchase_to_movimiento_or_debts
  AFTER INSERT ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_purchase_to_movimiento_or_debt();

CREATE POLICY purchase_update ON public.purchases
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY purches_insert ON public.purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY purcheses_select ON public.purchases
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY sale_item_update ON public.sale_items
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY sale_items_insert ON public.sale_items
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY sale_select ON public.sales
  FOR SELECT
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY sales_insert ON public.sales
  FOR INSERT
  TO authenticated
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY sales_update ON public.sales
  FOR UPDATE
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE POLICY suppliers_all ON public.suppliers
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()))
  WITH CHECK (((id = auth.uid()) OR public.is_superadmin()));

CREATE TABLE public.transferencias (
  id            uuid                     DEFAULT extensions.uuid_generate_v4() NOT NULL,
  from_account  uuid                     NOT NULL,
  to_account    uuid                     NOT NULL,
  amount        numeric(12,2)            NOT NULL,
  transfer_date date                     DEFAULT CURRENT_DATE NOT NULL,
  description   text,
  created_by    uuid                     DEFAULT auth.uid() NOT NULL,
  created_at    timestamp with time zone DEFAULT now() NOT NULL,
  updated_at    timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.transferencias
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.transferencias
  ADD CONSTRAINT financial_transfers_diferent_account_check CHECK (from_account <> to_account);

ALTER TABLE public.transferencias
  ADD CONSTRAINT transferencias_amount_check CHECK (amount > 0::numeric);

ALTER TABLE public.transferencias
  ADD CONSTRAINT transferencias_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.transferencias
  ADD CONSTRAINT transferencias_from_account_fkey FOREIGN KEY (from_account) REFERENCES public.accounts(id) ON DELETE RESTRICT;

ALTER TABLE public.transferencias
  ADD CONSTRAINT transferencias_pkey PRIMARY KEY (id);

ALTER TABLE public.transferencias
  ADD CONSTRAINT transferencias_to_account_fkey FOREIGN KEY (to_account) REFERENCES public.accounts(id) ON DELETE RESTRICT;

GRANT ALL ON public.transferencias TO anon;

GRANT ALL ON public.transferencias TO authenticated;

GRANT ALL ON public.transferencias TO service_role;

CREATE POLICY transferencias_all ON public.transferencias
  TO authenticated
  USING (((id = auth.uid()) OR public.is_superadmin()));

CREATE OR REPLACE TRIGGER trg_validate_maintenance_delivery
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_maintenance_delivery();

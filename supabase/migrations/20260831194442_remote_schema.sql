-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

DROP EXTENSION pg_graphql;

CREATE ROLE supabase_privileged_role;

GRANT supabase_privileged_role TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE TYPE public.credit_note_type AS ENUM (
  'devolucion',
  'descuento'
);

CREATE TYPE public.customer_credit_type AS ENUM (
  'nota_credito',
  'adelanto',
  'aplicado',
  'ajuste'
);

CREATE TYPE public.estado_pago AS ENUM (
  'pendiente',
  'completado',
  'cancelado'
);

CREATE TYPE public.mantenimiento_estado AS ENUM (
  'recibido',
  'en_proceso',
  'completado',
  'entregado',
  'cancelado'
);

CREATE TYPE public.metodo_pago AS ENUM (
  'efectivo',
  'transferencia',
  'tarjeta'
);

CREATE FUNCTION public.credit_note_to_wallet()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
    if NEW.status = 'completado'
       and OLD.status != 'completado' then

        insert into public.customer_credit (
            customer_id,
            amount,
            credit_type,
            reason,
            sale_id,
            credit_note_id
        ) values (
            NEW.customer_id,
            NEW.total,                    -- positivo = a favor
            'nota_credito',
            'Nota de crédito aprobada: ' || NEW.reason,
            NEW.sale_id,
            NEW.id
        );

    end if;
    return new;
end;
$function$;

GRANT ALL ON FUNCTION public.credit_note_to_wallet() TO anon;

GRANT ALL ON FUNCTION public.credit_note_to_wallet() TO authenticated;

GRANT ALL ON FUNCTION public.credit_note_to_wallet() TO service_role;

CREATE FUNCTION public.decrease_stock_on_sale()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
    update public.products
    set stock = stock - new.quantity
    where id = new.product_id
      and stock > 0;

    if (select stock from public.products where id = new.product_id) < 0 then
        raise exception 'Stock insuficiente para el producto id=%', new.product_id;
    end if;

    return new;
end;
$function$;

GRANT ALL ON FUNCTION public.decrease_stock_on_sale() TO anon;

GRANT ALL ON FUNCTION public.decrease_stock_on_sale() TO authenticated;

GRANT ALL ON FUNCTION public.decrease_stock_on_sale() TO service_role;

CREATE FUNCTION public.fn_create_sale_from_maintenance()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
DECLARE
  v_sale_id uuid;
  v_customer_id uuid;
  v_subtotal numeric;
  v_total numeric;
BEGIN
    -- Solo actuar cuando cambia a 'entregado' y no tenía venta
    IF NEW.status = 'entregado' AND OLD.status != 'entregado' AND NEW.sale_id IS NULL THEN
        
        -- Obtener customer_id desde la bicicleta
        SELECT customer_id INTO v_customer_id
        FROM bicycles WHERE id = NEW.bicycle_id;

        -- Calcular totales desde maintenance_items
        SELECT 
          SUM(quantity * unit_price),
          SUM(total_price)
        INTO v_subtotal, v_total
        FROM maintenance_items
        WHERE maintenance_id = NEW.id;

        -- Si no hay ítems, el total será 0
        v_subtotal := COALESCE(v_subtotal, 0);
        v_total := COALESCE(v_total, 0);

        -- Crear la venta
        INSERT INTO sales (
            sales_date, customer_id, sales_type, 
            sub_total, discount, total, status, observacion, payment_method
        ) VALUES (
            CURRENT_DATE, v_customer_id, 'service', 
            v_subtotal, v_subtotal - v_total, v_total,
            'completado', NEW.description, 'transferencia' 
        ) RETURNING id INTO v_sale_id;

        -- Copiar ítems
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, total)
        SELECT v_sale_id, product_id, quantity, unit_price, 0, total_price
        FROM maintenance_items
        WHERE maintenance_id = NEW.id;

        -- Vincular sale al mantenimiento
        NEW.sale_id := v_sale_id;
    END IF;
    RETURN NEW;
END;
$function$;

GRANT ALL ON FUNCTION public.fn_create_sale_from_maintenance() TO anon;

GRANT ALL ON FUNCTION public.fn_create_sale_from_maintenance() TO authenticated;

GRANT ALL ON FUNCTION public.fn_create_sale_from_maintenance() TO service_role;

CREATE FUNCTION public.fn_maintenance_to_sale()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
    v_sale_id     uuid;
    v_customer_id uuid;
    v_subtotal    numeric(12,2);
    v_total       numeric(12,2);
begin
    if NEW.status = 'entregado'
       and OLD.status != 'entregado'
       and NEW.sale_id is null then

        -- Obtener customer_id desde la bicicleta
        select customer_id into v_customer_id
        from public.bicycles
        where id = NEW.bicycle_id;

        -- Calcular totales desde maintenance_items
        select
            coalesce(sum(quantity * unit_price), 0),
            coalesce(sum(total_price), 0)
        into v_subtotal, v_total
        from public.maintenance_items
        where maintenance_id = NEW.id;

        -- Crear la venta
        insert into public.sales (
            sales_date, customer_id, sales_type,
            sub_total, discount, total,
            status, observacion, payment_method
        ) values (
            current_date,
            v_customer_id,
            'service',
            v_subtotal,
            v_subtotal - v_total,
            v_total,
            'completado',
            NEW.description,
            'transferencia'
        ) returning id into v_sale_id;

        -- Copiar ítems
        insert into public.sale_items (
            sale_id, product_id, quantity,
            unit_price, discount, total
        )
        select
            v_sale_id, product_id, quantity,
            unit_price, 0, total_price
        from public.maintenance_items
        where maintenance_id = NEW.id;

        -- Copiar adelantos del mantenimiento a payments de la venta
        insert into public.payments (
            sale_id, amount, payment_date,
            payment_method, reference, notes
        )
        select
            v_sale_id, amount, payment_date,
            payment_method, reference,
            coalesce(notes, 'Adelanto de mantenimiento')
        from public.maintenance_payments
        where maintenance_id = NEW.id;

        -- Reasignar créditos aplicados al mantenimiento → a la venta
        update public.customer_credit
        set sale_id = v_sale_id,
            maintenance_id = NULL
        where maintenance_id = NEW.id
          and credit_type = 'aplicado';

        -- Vincular la venta al mantenimiento
        NEW.sale_id := v_sale_id;

    end if;
    return NEW;
end;
$function$;

GRANT ALL ON FUNCTION public.fn_maintenance_to_sale() TO anon;

GRANT ALL ON FUNCTION public.fn_maintenance_to_sale() TO authenticated;

GRANT ALL ON FUNCTION public.fn_maintenance_to_sale() TO service_role;

CREATE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user');
  return new;
end;
$function$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;

GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;

GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;

CREATE FUNCTION public.increase_stock_on_purchase()
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

GRANT ALL ON FUNCTION public.increase_stock_on_purchase() TO anon;

GRANT ALL ON FUNCTION public.increase_stock_on_purchase() TO authenticated;

GRANT ALL ON FUNCTION public.increase_stock_on_purchase() TO service_role;

CREATE FUNCTION public.recalculate_purchase_total()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
    v_total       numeric(12,2);
    v_purchase_id uuid;
begin
    v_purchase_id := coalesce(new.purchase_id, old.purchase_id);

    select coalesce(sum(total), 0)
    into v_total
    from public.purchase_items
    where purchase_id = v_purchase_id;

    update public.purchases
    set sub_total = v_total,
        total     = v_total
    where id = v_purchase_id;

    return coalesce(new, old);
end;
$function$;

GRANT ALL ON FUNCTION public.recalculate_purchase_total() TO anon;

GRANT ALL ON FUNCTION public.recalculate_purchase_total() TO authenticated;

GRANT ALL ON FUNCTION public.recalculate_purchase_total() TO service_role;

CREATE FUNCTION public.recalculate_sale_total()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
    v_subtotal numeric(12,2);
    v_discount numeric(12,2);
    v_sale_id  uuid;
begin
    v_sale_id := coalesce(new.sale_id, old.sale_id);

    select coalesce(sum(total), 0),
           coalesce(sum(discount), 0)
    into v_subtotal, v_discount
    from public.sale_items
    where sale_id = v_sale_id;

    update public.sales
    set sub_total = v_subtotal + v_discount,
        discount  = v_discount,
        total     = v_subtotal
    where id = v_sale_id;

    return coalesce(new, old);
end;
$function$;

GRANT ALL ON FUNCTION public.recalculate_sale_total() TO anon;

GRANT ALL ON FUNCTION public.recalculate_sale_total() TO authenticated;

GRANT ALL ON FUNCTION public.recalculate_sale_total() TO service_role;

CREATE FUNCTION public.restore_stock_on_credit_note()
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
        where cni.credit_note_id = NEW.id
          and cni.product_id = p.id;

    end if;
    return new;
end;
$function$;

GRANT ALL ON FUNCTION public.restore_stock_on_credit_note() TO anon;

GRANT ALL ON FUNCTION public.restore_stock_on_credit_note() TO authenticated;

GRANT ALL ON FUNCTION public.restore_stock_on_credit_note() TO service_role;

CREATE FUNCTION public.set_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
begin
    new.updated_at = now();
    return new;
end;
$function$;

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;

GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;

GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;

CREATE FUNCTION public.update_purchase_status_on_payment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
    v_total_compra numeric(12,2);
    v_total_pagado numeric(12,2);
    v_purchase_id  uuid;
begin
    v_purchase_id := coalesce(new.purchase_id, old.purchase_id);

    select total into v_total_compra
    from public.purchases where id = v_purchase_id;

    select coalesce(sum(amount), 0) into v_total_pagado
    from public.purchase_payments where purchase_id = v_purchase_id;

    update public.purchases set
        status = case
            when v_total_pagado >= v_total_compra
                then 'completado'::estado_pago
            else 'pendiente'::estado_pago
        end,
        updated_at = now()
    where id = v_purchase_id;

    return coalesce(new, old);
end;
$function$;

GRANT ALL ON FUNCTION public.update_purchase_status_on_payment() TO anon;

GRANT ALL ON FUNCTION public.update_purchase_status_on_payment() TO authenticated;

GRANT ALL ON FUNCTION public.update_purchase_status_on_payment() TO service_role;

CREATE FUNCTION public.update_sale_status_on_payment()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
    v_total_venta    numeric(12,2);
    v_total_pagado   numeric(12,2);
    v_total_creditos numeric(12,2);
    v_sale_id        uuid;
begin
    v_sale_id := coalesce(new.sale_id, old.sale_id);

    select total into v_total_venta
    from public.sales where id = v_sale_id;

    -- Suma de pagos directos
    select coalesce(sum(amount), 0) into v_total_pagado
    from public.payments where sale_id = v_sale_id;

    -- Suma de créditos aplicados a esta venta
    select coalesce(sum(abs(amount)), 0) into v_total_creditos
    from public.customer_credit
    where sale_id = v_sale_id
      and credit_type = 'aplicado';

    update public.sales set
        status = case
            when (v_total_pagado + v_total_creditos) >= v_total_venta
                then 'completado'::estado_pago
            else 'pendiente'::estado_pago
        end,
        updated_at = now()
    where id = v_sale_id;

    return coalesce(new, old);
end;
$function$;

GRANT ALL ON FUNCTION public.update_sale_status_on_payment() TO anon;

GRANT ALL ON FUNCTION public.update_sale_status_on_payment() TO authenticated;

GRANT ALL ON FUNCTION public.update_sale_status_on_payment() TO service_role;

CREATE FUNCTION public.validate_maintenance_delivery()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$
declare
    v_total_pagado numeric(12,2);
    v_credito_aplicado numeric(12,2);
begin
    if NEW.status = 'entregado' and OLD.status != 'entregado' then

        -- Pagos directos al mantenimiento
        select coalesce(sum(amount), 0) into v_total_pagado
        from public.maintenance_payments
        where maintenance_id = NEW.id;

        -- Crédito aplicado al mantenimiento
        select coalesce(sum(abs(amount)), 0) into v_credito_aplicado
        from public.customer_credit
        where maintenance_id = NEW.id
          and credit_type = 'aplicado';

        if NEW.cost > 0
           and (v_total_pagado + v_credito_aplicado) < NEW.cost then
            raise exception
                'Pago incompleto. Saldo pendiente: $%',
                (NEW.cost - v_total_pagado - v_credito_aplicado)::text;
        end if;

    end if;
    return NEW;
end;
$function$;

GRANT ALL ON FUNCTION public.validate_maintenance_delivery() TO anon;

GRANT ALL ON FUNCTION public.validate_maintenance_delivery() TO authenticated;

GRANT ALL ON FUNCTION public.validate_maintenance_delivery() TO service_role;

CREATE TABLE public.bicycles (
  id            uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  customer_id   uuid                        NOT NULL,
  brand         text,
  model         text,
  serial_number text,
  observacion   text,
  created_at    timestamp without time zone DEFAULT now() NOT NULL,
  updated_at    timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.bicycles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.bicycles
  ADD CONSTRAINT bicycles_pkey PRIMARY KEY (id);

GRANT ALL ON public.bicycles TO anon;

GRANT ALL ON public.bicycles TO authenticated;

GRANT ALL ON public.bicycles TO service_role;

CREATE INDEX idx_bicycles_customer ON public.bicycles (customer_id);

CREATE TRIGGER trg_bicycles_updated_at
  BEFORE UPDATE ON public.bicycles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY bicycles ON public.bicycles
  USING (true);

CREATE TABLE public.credit_notes (
  id          uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  sale_id     uuid                        NOT NULL,
  customer_id uuid                        NOT NULL,
  credit_date date                        DEFAULT CURRENT_DATE NOT NULL,
  credit_type public.credit_note_type     DEFAULT 'descuento'::public.credit_note_type NOT NULL,
  reason      text                        NOT NULL,
  total       numeric(12,2)               DEFAULT 0 NOT NULL,
  status      public.estado_pago          DEFAULT 'pendiente'::public.estado_pago NOT NULL,
  created_at  timestamp without time zone DEFAULT now() NOT NULL,
  updated_at  timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.credit_notes
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.credit_notes
  ADD CONSTRAINT credit_notes_pkey PRIMARY KEY (id);

ALTER TABLE public.credit_notes
  ADD CONSTRAINT credit_notes_total_check CHECK (total >= 0::numeric);

GRANT ALL ON public.credit_notes TO anon;

GRANT ALL ON public.credit_notes TO authenticated;

GRANT ALL ON public.credit_notes TO service_role;

CREATE POLICY credit_notes_all ON public.credit_notes
  USING (true);

CREATE TABLE public.customer_credit (
  id             uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  customer_id    uuid                        NOT NULL,
  amount         numeric(12,2)               NOT NULL,
  credit_type    public.customer_credit_type NOT NULL,
  reason         text                        NOT NULL,
  sale_id        uuid,
  maintenance_id uuid,
  credit_note_id uuid,
  created_at     timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.customer_credit
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.customer_credit
  ADD CONSTRAINT customer_credit_credit_note_id_fkey FOREIGN KEY (credit_note_id) REFERENCES public.credit_notes(id) ON DELETE SET NULL;

ALTER TABLE public.customer_credit
  ADD CONSTRAINT customer_credit_pkey PRIMARY KEY (id);

GRANT ALL ON public.customer_credit TO anon;

GRANT ALL ON public.customer_credit TO authenticated;

GRANT ALL ON public.customer_credit TO service_role;

CREATE POLICY customer_credit_all ON public.customer_credit
  USING (true);

CREATE TABLE public.customers (
  id         uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name       text                        NOT NULL,
  phone      integer,
  address    text,
  active     boolean                     DEFAULT true NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.customers
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_pkey PRIMARY KEY (id);

ALTER TABLE public.bicycles
  ADD CONSTRAINT bicycles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;

ALTER TABLE public.credit_notes
  ADD CONSTRAINT credit_notes_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;

ALTER TABLE public.customer_credit
  ADD CONSTRAINT customer_credit_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;

GRANT ALL ON public.customers TO anon;

GRANT ALL ON public.customers TO authenticated;

GRANT ALL ON public.customers TO service_role;

CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY clientes_select ON public.customers
  FOR SELECT
  USING (true);

CREATE POLICY customers_insert ON public.customers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY customers_update ON public.customers
  FOR UPDATE
  USING (true);

CREATE TABLE public.maintenance_items (
  id             uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  maintenance_id uuid                        NOT NULL,
  product_id     uuid                        NOT NULL,
  item_type      text                        NOT NULL,
  description    text,
  quantity       integer                     DEFAULT 1 NOT NULL,
  unit_price     numeric(12,2)               DEFAULT 0 NOT NULL,
  total_price    numeric(12,2)               GENERATED ALWAYS AS (((quantity)::numeric * unit_price)) STORED,
  created_at     timestamp without time zone DEFAULT now() NOT NULL,
  updated_at     timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.maintenance_items
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_item_type_check CHECK (item_type = ANY (ARRAY['retail'::text, 'service'::text]));

ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_pkey PRIMARY KEY (id);

ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_quantity_check CHECK (quantity > 0);

ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_unit_price_check CHECK (unit_price >= 0::numeric);

GRANT ALL ON public.maintenance_items TO anon;

GRANT ALL ON public.maintenance_items TO authenticated;

GRANT ALL ON public.maintenance_items TO service_role;

CREATE POLICY "maintenance_items all" ON public.maintenance_items
  USING (true);

CREATE TABLE public.maintenance_payments (
  id             uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  maintenance_id uuid                        NOT NULL,
  amount         numeric(12,2)               NOT NULL,
  payment_date   date                        DEFAULT CURRENT_DATE NOT NULL,
  payment_method public.metodo_pago          DEFAULT 'efectivo'::public.metodo_pago NOT NULL,
  reference      text,
  notes          text,
  created_at     timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.maintenance_payments
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.maintenance_payments
  ADD CONSTRAINT maintenance_payments_amount_check CHECK (amount > 0::numeric);

ALTER TABLE public.maintenance_payments
  ADD CONSTRAINT maintenance_payments_pkey PRIMARY KEY (id);

GRANT ALL ON public.maintenance_payments TO anon;

GRANT ALL ON public.maintenance_payments TO authenticated;

GRANT ALL ON public.maintenance_payments TO service_role;

CREATE POLICY maintenance_payments_all ON public.maintenance_payments
  USING (true);

CREATE TABLE public.maintenance_records (
  id            uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  bicycle_id    uuid                        NOT NULL,
  sale_id       uuid,
  service_date  date                        DEFAULT CURRENT_DATE NOT NULL,
  delivery_date date,
  description   text                        NOT NULL,
  observation   text,
  cost          numeric(12,2)               DEFAULT 0 NOT NULL,
  status        public.mantenimiento_estado DEFAULT 'recibido'::public.mantenimiento_estado NOT NULL,
  created_at    timestamp without time zone DEFAULT now() NOT NULL,
  updated_at    timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.maintenance_records
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.maintenance_records
  ADD CONSTRAINT maintenance_records_bicycle_id_fkey FOREIGN KEY (bicycle_id) REFERENCES public.bicycles(id) ON DELETE RESTRICT;

ALTER TABLE public.maintenance_records
  ADD CONSTRAINT maintenance_records_pkey PRIMARY KEY (id);

ALTER TABLE public.customer_credit
  ADD CONSTRAINT customer_credit_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_records(id) ON DELETE SET NULL;

ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_records(id) ON DELETE CASCADE;

ALTER TABLE public.maintenance_payments
  ADD CONSTRAINT maintenance_payments_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenance_records(id) ON DELETE RESTRICT;

GRANT ALL ON public.maintenance_records TO anon;

GRANT ALL ON public.maintenance_records TO authenticated;

GRANT ALL ON public.maintenance_records TO service_role;

CREATE INDEX idx_maintenance_status ON public.maintenance_records (status);

CREATE INDEX idx_maintenance_sale ON public.maintenance_records (sale_id);

CREATE INDEX idx_maintenance_bicycle ON public.maintenance_records (bicycle_id);

CREATE TRIGGER trg_maintenance_to_sale
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_maintenance_to_sale();

CREATE TRIGGER trg_maintenance_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_validate_maintenance_delivery
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_maintenance_delivery();

CREATE POLICY maintenance_record_all ON public.maintenance_records
  TO authenticated
  USING (true);

CREATE TABLE public.payments (
  id             uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  sale_id        uuid                        NOT NULL,
  amount         numeric(12,2)               NOT NULL,
  payment_date   date                        DEFAULT CURRENT_DATE NOT NULL,
  payment_method public.metodo_pago          DEFAULT 'efectivo'::public.metodo_pago NOT NULL,
  reference      text,
  notes          text,
  created_at     timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.payments
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_amount_check CHECK (amount > 0::numeric);

ALTER TABLE public.payments
  ADD CONSTRAINT payments_pkey PRIMARY KEY (id);

GRANT ALL ON public.payments TO anon;

GRANT ALL ON public.payments TO authenticated;

GRANT ALL ON public.payments TO service_role;

CREATE POLICY payments_all ON public.payments
  USING (true);

CREATE TABLE public.products (
  id          uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name        text                        NOT NULL,
  description text,
  category    text,
  stock       integer                     DEFAULT 0 NOT NULL,
  stock_min   integer                     DEFAULT 0 NOT NULL,
  price       numeric(12,2)               DEFAULT 0 NOT NULL,
  cost        numeric(12,2)               DEFAULT 0 NOT NULL,
  active      boolean                     DEFAULT true NOT NULL,
  created_at  timestamp without time zone DEFAULT now() NOT NULL,
  updated_at  timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.products
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products
  ADD CONSTRAINT products_cost_check CHECK (cost >= 0::numeric);

ALTER TABLE public.products
  ADD CONSTRAINT products_pkey PRIMARY KEY (id);

ALTER TABLE public.maintenance_items
  ADD CONSTRAINT maintenance_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE public.products
  ADD CONSTRAINT products_price_check CHECK (price >= 0::numeric);

ALTER TABLE public.products
  ADD CONSTRAINT products_stock_check CHECK (stock >= 0);

GRANT ALL ON public.products TO anon;

GRANT ALL ON public.products TO authenticated;

GRANT ALL ON public.products TO service_role;

CREATE INDEX idx_products_category ON public.products (category);

CREATE INDEX idx_products_active ON public.products (active);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY products_all ON public.products
  USING (true);

CREATE TABLE public.profiles (
  id         uuid                        NOT NULL,
  role       text                        DEFAULT 'user'::text NOT NULL,
  create_at  timestamp without time zone DEFAULT now() NOT NULL,
  update_at  timestamp without time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

GRANT ALL ON public.profiles TO anon;

GRANT ALL ON public.profiles TO authenticated;

GRANT ALL ON public.profiles TO service_role;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.purchase_items (
  id          uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  purchase_id uuid                        NOT NULL,
  product_id  uuid                        NOT NULL,
  quantity    integer                     NOT NULL,
  unit_cost   numeric(12,2)               NOT NULL,
  total       numeric(12,2)               NOT NULL,
  created_at  timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.purchase_items
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_pkey PRIMARY KEY (id);

ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_quantity_check CHECK (quantity > 0);

GRANT ALL ON public.purchase_items TO anon;

GRANT ALL ON public.purchase_items TO authenticated;

GRANT ALL ON public.purchase_items TO service_role;

CREATE INDEX idx_purchase_items_product ON public.purchase_items (product_id);

CREATE INDEX idx_purchase_items_purchase ON public.purchase_items (purchase_id);

CREATE TRIGGER trg_increase_stock_on_purchase
  AFTER INSERT ON public.purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION public.increase_stock_on_purchase();

CREATE TRIGGER trg_recalculate_purchase_total
  AFTER INSERT OR DELETE OR UPDATE ON public.purchase_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_purchase_total();

CREATE POLICY purches_items_all ON public.purchase_items
  USING (true);

CREATE TABLE public.purchases (
  id             uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  supplier_id    uuid                        NOT NULL,
  purchase_date  date                        DEFAULT CURRENT_DATE NOT NULL,
  description    text,
  sub_total      numeric(12,2)               DEFAULT 0 NOT NULL,
  total          numeric(12,2)               DEFAULT 0 NOT NULL,
  payment_method public.metodo_pago          DEFAULT 'efectivo'::public.metodo_pago,
  status         public.estado_pago          DEFAULT 'pendiente'::public.estado_pago,
  observacion    text,
  created_at     timestamp without time zone DEFAULT now() NOT NULL,
  updated_at     timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.purchases
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);

ALTER TABLE public.purchase_items
  ADD CONSTRAINT purchase_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES public.purchases(id) ON DELETE CASCADE;

GRANT ALL ON public.purchases TO anon;

GRANT ALL ON public.purchases TO authenticated;

GRANT ALL ON public.purchases TO service_role;

CREATE INDEX idx_purchases_date ON public.purchases (purchase_date);

CREATE INDEX idx_purchases_supplier ON public.purchases (supplier_id);

CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY purches_insert ON public.purchases
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY purcheses_select ON public.purchases
  FOR SELECT
  USING (true);

CREATE TABLE public.sale_items (
  id         uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  sale_id    uuid                        NOT NULL,
  product_id uuid                        NOT NULL,
  quantity   integer                     NOT NULL,
  unit_price numeric(12,2)               NOT NULL,
  discount   numeric(12,2)               DEFAULT 0 NOT NULL,
  total      numeric(12,2)               NOT NULL,
  created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.sale_items
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);

ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;

ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_quantity_check CHECK (quantity > 0);

GRANT ALL ON public.sale_items TO anon;

GRANT ALL ON public.sale_items TO authenticated;

GRANT ALL ON public.sale_items TO service_role;

CREATE INDEX idx_sale_items_sale ON public.sale_items (sale_id);

CREATE INDEX idx_sale_items_product ON public.sale_items (product_id);

CREATE TRIGGER trg_decrease_stock_on_sale
  AFTER INSERT ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_stock_on_sale();

CREATE TRIGGER trg_recalculate_sale_total
  AFTER INSERT OR DELETE OR UPDATE ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_sale_total();

CREATE POLICY sale_item_all ON public.sale_items
  USING (true);

CREATE TABLE public.sales (
  id             uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  sales_date     date                        DEFAULT CURRENT_DATE NOT NULL,
  customer_id    uuid,
  sales_type     text                        DEFAULT 'retail'::text NOT NULL,
  sub_total      numeric(12,2)               DEFAULT 0 NOT NULL,
  discount       numeric(12,2)               DEFAULT 0 NOT NULL,
  total          numeric(12,2)               DEFAULT 0 NOT NULL,
  payment_method public.metodo_pago          DEFAULT 'efectivo'::public.metodo_pago,
  status         public.estado_pago          DEFAULT 'pendiente'::public.estado_pago,
  observacion    text,
  created_at     timestamp without time zone DEFAULT now() NOT NULL,
  updated_at     timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.sales
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sales
  ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE RESTRICT;

ALTER TABLE public.sales
  ADD CONSTRAINT sales_pkey PRIMARY KEY (id);

ALTER TABLE public.credit_notes
  ADD CONSTRAINT credit_notes_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE RESTRICT;

ALTER TABLE public.customer_credit
  ADD CONSTRAINT customer_credit_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE SET NULL;

ALTER TABLE public.maintenance_records
  ADD CONSTRAINT maintenance_records_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE SET NULL;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE RESTRICT;

ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;

ALTER TABLE public.sales
  ADD CONSTRAINT sales_sales_type_check CHECK (sales_type = ANY (ARRAY['retail'::text, 'service'::text, 'mixed'::text]));

GRANT ALL ON public.sales TO anon;

GRANT ALL ON public.sales TO authenticated;

GRANT ALL ON public.sales TO service_role;

CREATE INDEX idx_sales_date ON public.sales (sales_date);

CREATE INDEX idx_sales_customer ON public.sales (customer_id);

CREATE INDEX idx_sales_status ON public.sales (status);

CREATE TRIGGER trg_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY sale_select ON public.sales
  FOR SELECT
  USING (true);

CREATE POLICY sales_insert ON public.sales
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY sales_update ON public.sales
  FOR UPDATE
  USING (true);

CREATE TABLE public.suppliers (
  id          uuid                        DEFAULT extensions.uuid_generate_v4() NOT NULL,
  name        text                        NOT NULL,
  phone       integer,
  address     text,
  observacion text,
  active      boolean                     DEFAULT true NOT NULL,
  created_at  timestamp without time zone DEFAULT now() NOT NULL,
  updated_at  timestamp with time zone    DEFAULT now() NOT NULL
);

ALTER TABLE public.suppliers
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.suppliers
  ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);

ALTER TABLE public.purchases
  ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;

GRANT ALL ON public.suppliers TO anon;

GRANT ALL ON public.suppliers TO authenticated;

GRANT ALL ON public.suppliers TO service_role;

CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY suppliers_all ON public.suppliers
  USING (true);

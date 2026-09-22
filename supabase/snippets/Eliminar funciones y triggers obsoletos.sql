SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_functiondef(p.oid) AS function_definition
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE t.tgname = 'trg_profiles_updated_at';

drop function if exists public.trg_validate_maintenance_delivery;

/* Trigger Eliminado
CREATE OR REPLACE FUNCTION public.validate_maintenance_delivery()
 RETURNS trigger
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
$function$
*/


SELECT trigger_name, action_timing, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'customer_credit';   

SELECT
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;
-- Qué triggers están activos sobre una tabla
select tgname, pg_get_triggerdef(oid)
from pg_trigger
where tgrelid = 'public.purchases'::regclass
  and not tgisinternal;

-- El código actual de las funciones sospechosas
select proname, prosrc
from pg_proc
where proname in ('update_sale_status_on_payment', 'fn_sale_payment_to_movimiento', 'fn_maintenance_to_sale');

select tgname, tgenabled, pg_get_triggerdef(oid)
from pg_trigger
where tgrelid = 'public.movimientos'::regclass
  and not tgisinternal;

select
    d.id,
    d.status,
    d.total_amount,
    coalesce(sum(m.amount), 0) as total_pagado
from public.deudas d
left join public.movimientos m
    on m.reference_type = 'debt_payment' and m.reference_id = d.id
where d.id = '029782f4-b4ef-411c-ba08-d449f7da51f3'
group by d.id, d.status, d.total_amount;

select proname, prosrc
from pg_proc
where proname = 'fn_close_debt_on_payment';

select p.id, p.status as estado_compra, d.status as estado_deuda, d.purchase_id
from public.purchases p
join public.deudas d on d.purchase_id = p.id
where d.id = '268387c4-0828-4932-9fb2-6a8bed890a23';

select proname, prosrc
from pg_proc
where proname = 'fn_close_debt_on_payment';

select proname, prosrc
from pg_proc
where proname = 'fn_purchase_to_movimiento_or_debt';

update public.purchases p
set status = 'completado'
from public.deudas d
where d.purchase_id = p.id
  and d.status = 'completado'
  and p.status <> 'completado';

select proname, prosrc
from pg_proc
where proname = 'fn_purchase_to_movimiento_or_debt';
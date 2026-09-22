select *
from products

alter table public.products
-- add column if not exists category_id uuid references public.products(id) on delete cascade;
-- add column if not exists type text not null default 'product' check(type in ('servicio', 'product'));
add constraint check(
  (type = 'product' and stock IS NOT NULL stock_min IS NOT NULL) or 
  (type = 'service' and stock is null and stock_min is null)
  );

UPDATE public.products
SET category_id = '77bb322e-0bbc-48f7-877b-426128d3ef53'
WHERE type = 'servicio' and category = 'Mantenimiento y Limpieza';

UPDATE public.products
SET category_id = 'dcd00b6f-ff28-477d-a7d0-4f01b2cb4a60'
WHERE type = 'servicio' and category = 'Electrica';



update public.products
set stock = null, stock_min= null
where type = 'servicio';

update public.products
set category_id = 'afbb5e5d-64e2-4d5a-a8f7-8774a5b39427'
where type = 'product' and category = 'Frenos';

update public.products
set category_id = 'e59262f7-5e81-458b-9fd7-8974525f057c'
where type = 'product' and category = 'Ruedas y Llantas';

update public.products
set category_id = 'e4acf225-5b44-4225-bdfb-9c14ccace2e3'
where type = 'product' and category = 'Rulimanes y Rodamientos';

update public.products
set category_id = '1d5c16cb-ac4c-4148-b577-4febd6c316bc'
where type = 'product' and category = 'Transmicion';

update public.products
set category_id = 'b1dc407c-8fc6-4665-8bb2-da64fa278bc0'
where type = 'product' and category = 'Accesorios';

ALTER TABLE public.products
    ALTER COLUMN stock DROP DEFAULT,
    ALTER COLUMN stock DROP NOT NULL,
    ALTER COLUMN stock_min DROP DEFAULT,
    ALTER COLUMN stock_min DROP NOT NULL;
  
ALTER TABLE public.products ALTER COLUMN type DROP DEFAULT;

UPDATE public.products
SET active = false
WHERE category = 'Finanzas';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'products'
ORDER BY ordinal_position;

alter table public.products
alter column cost drop not null;
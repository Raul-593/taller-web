create or replace function public.is_superadmin()
returns boolean
language sql
security definer
set search_path = public stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'superadmin'
  );
$$;
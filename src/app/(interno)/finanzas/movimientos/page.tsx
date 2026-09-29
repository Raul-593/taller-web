import { createClient } from "@/utils/supabase/server";
import { MovimientosClient } from "@/app/finanzas/movimientos/MovimientoClient";


export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const supabase = await createClient();
  

  // Default Mes y año
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString();
  
  // Tomar el mes y el año de los parámetros
  const yearProp = typeof resolvedParams?.year === "string" ? resolvedParams.year : currentYear;
  const monthProp = typeof resolvedParams?.month === "string" ? resolvedParams.month : currentMonth;

  // Fecha de Inicio y Fin
  let startDate = `${yearProp}-01-01`
  let endDate = `${yearProp}-12-31`

  if (monthProp !== "all"){
    const monthInt = parseInt(monthProp, 10)
    const yearInt = parseInt(yearProp, 10)
    startDate = `${yearInt}-${monthInt.toString().padStart(2, "0")}-01`
    const lastDay = new Date(yearInt, monthInt, 0).getDate()
    endDate = `${yearInt}-${monthInt.toString().padStart(2, "0")}-${lastDay}`
  }

  // Cargar movimientos
  const [
    { data: movimientos, error: movimientosError },
    { data: accounts, error: accountError },
    { data: categorias, error: categoriasError },
  ] = await Promise.all([
    supabase 
      .from("movimientos")
      .select(`
        id, account_id, category_id, amount, movement_date, description, reference_type,
        reference_type, reference_id, created_at, accounts(id, name, type)
      `)
      .gte("movement_date", startDate)
      .lte("movement_date", endDate)
      .order("movement_date", { ascending: true }),
      supabase.from("accounts").select("id, name, type, is_active").order("name", {ascending: true }),
      supabase.from("categories").select("*").order("name", {ascending: true }),
  ])
  
  // Filtrar por fecha si vienen en los parametros
  if (movimientosError) console.error("Error al obtener movimientos:", movimientosError)
  if (accountError) console.error("Error al obtener cuentas:", accountError)
  if (categoriasError) console.error("Error al obtener categorias:", categoriasError)
 
  return (
    <div className="flex flex-col gap-6">
      <MovimientosClient
        movimientos={movimientos ?? []}
        accounts={accounts ?? []}
        categorias={categorias ?? []}
        currentMonth={monthProp}
        currentYear={yearProp}
      />
    </div>
  );
}

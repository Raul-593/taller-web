import { createClient } from "@/utils/supabase/server"
import { FinanzasClient } from "./FinanzasClient"

export default async function Finanzas({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  // Valores por defecto
  const currentYear = new Date().getFullYear().toString()
  const currentMonth = (new Date().getMonth() + 1).toString()

  const yearProp = typeof resolvedParams?.year === 'string' ? resolvedParams.year : currentYear
  const monthProp = typeof resolvedParams?.month === 'string' ? resolvedParams.month : currentMonth

  let startDate = `${yearProp}-01-01`
  // Para la fecha de fin de año, agregamos 23:59:59 para cubrir cualquier timestamp de ese día
  let endDate = `${yearProp}-12-31T23:59:59.999Z`

  if (monthProp !== 'all') {
    const monthInt = parseInt(monthProp, 10)
    const yearInt = parseInt(yearProp, 10)
    // Primer día del mes
    startDate = `${yearInt}-${monthInt.toString().padStart(2, '0')}-01`
    // Último día del mes (el día 0 del mes siguiente nos da el último día del mes actual)
    const lastDay = new Date(yearInt, monthInt, 0).getDate()
    endDate = `${yearInt}-${monthInt.toString().padStart(2, '0')}-${lastDay}T23:59:59.999Z`
  }

  // Tabla Sales
  let salesQuery = supabase
    .from('sales')
    .select(`
      id, 
      sales_date,
      sales_type, 
      sub_total, 
      discount, 
      total, 
      payment_method, 
      status, 
      observacion,
      customers (name)
    `)
    .gte('sales_date', startDate)
    .lte('sales_date', endDate)
    .order('created_at', { ascending: false })

  const { data: sale, error: saleError } = await salesQuery

  if (saleError) {
    console.error('Error al obtener ventas :', saleError)
  }

  // Tabla Purchases
  let purchasesQuery = supabase
    .from('purchases')
    .select(`
      id, 
      purchase_date,
      supplier_id,
      description, 
      sub_total, 
      total, 
      payment_method, 
      status, 
      observacion,
      suppliers (name)
    `)
    .gte('purchase_date', startDate)
    .lte('purchase_date', endDate)
    .order('created_at', { ascending: false })

  const { data: purchases, error: purchasesError } = await purchasesQuery

  if (purchasesError) {
    console.error('Error al obtener compras:', purchasesError)
  }
  
  return (
    <FinanzasClient 
      sales={sale || []} 
      purchases={purchases || []} 
      currentMonth={monthProp} 
      currentYear={yearProp} 
    />
  )
}
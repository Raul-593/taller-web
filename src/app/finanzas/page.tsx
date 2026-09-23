import { createClient } from "@/utils/supabase/server"
import { getAccountsWithBalance, calcularSaldoTotal } from "@/lib/finanzas/balance"
import { getSaldosVentas } from "@/lib/finanzas/ventas"
import { getSaldosDeudas } from "@/lib/finanzas/deudas"
import { FinanzasClient } from "./FinanzasClient"

export default async function Finanzas({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedParams = await searchParams
  const supabase = await createClient()

  const currentYear = new Date().getFullYear().toString()
  const currentMonth = (new Date().getMonth() + 1).toString()

  const yearProp = typeof resolvedParams?.year === 'string' ? resolvedParams.year : currentYear
  const monthProp = typeof resolvedParams?.month === 'string' ? resolvedParams.month : currentMonth

  let startDate = `${yearProp}-01-01`
  let endDate = `${yearProp}-12-31`
  let endDateTime = `${yearProp}-12-31T23:59:59.999Z`

  if (monthProp !== 'all') {
    const monthInt = parseInt(monthProp, 10)
    const yearInt = parseInt(yearProp, 10)
    startDate = `${yearInt}-${monthInt.toString().padStart(2, '0')}-01`
    const lastDay = new Date(yearInt, monthInt, 0).getDate()
    endDate = `${yearInt}-${monthInt.toString().padStart(2, '0')}-${lastDay}`
    endDateTime = `${endDate}T23:59:59.999Z`
  }

  const [
    { data: sale, error: saleError },
    { data: purchases, error: purchasesError },
    { data: accounts, error: accountsError },
    { data: categorias, error: categoriasError },
    { data: movimientosPeriodo, error: movimientosError },
    { data: ventasPendientes, error: ventasPendientesError },
    { data: deudasPendientes, error: deudasPendientesError },
  ] = await Promise.all([
    supabase
      .from('sales')
      .select(`
        id, sales_date, sales_type, sub_total, discount, total,
        payment_method, status, observacion, customers (name)
      `)
      .gte('sales_date', startDate)
      .lte('sales_date', endDateTime)
      .order('sales_date', { ascending: false }),
    supabase
      .from('purchases')
      .select(`
        id, purchase_date, supplier_id, description, sub_total, total,
        payment_method, status, observacion, suppliers (name),
        debts (id, status, total_amount)
      `)
      .gte('purchase_date', startDate)
      .lte('purchase_date', endDateTime)
      .order('purchase_date', { ascending: false }),
    supabase.from('accounts').select('id, name, type, is_active').order('name', { ascending: true }),
    supabase.from('categories').select('id, parent_id, name, category_type').order('name', { ascending: true }),
    supabase
      .from('movimientos')
      .select(`
        id, account_id, category_id, amount, movement_date, description, created_at,
        accounts (name),
        categories (id, parent_id, name, category_type)
      `)
      .gte('movement_date', startDate)
      .lte('movement_date', endDate)
      .order('movement_date', { ascending: false })
      .order('created_at', { ascending: false }),
    // Cuentas por cobrar/pagar son una "foto del momento" -- no se
    // filtran por el periodo seleccionado, a diferencia de todo lo demás
    supabase.from('sales').select('id, total').eq('status', 'pendiente'),
    supabase.from('deudas').select('id, total_amount').eq('status', 'pendiente'),
  ])

  if (saleError) console.error('Error al obtener ventas:', saleError)
  if (purchasesError) console.error('Error al obtener compras:', purchasesError)
  if (accountsError) console.error('Error al obtener cuentas:', accountsError)
  if (categoriasError) console.error('Error al obtener categorías:', categoriasError)
  if (movimientosError) console.error('Error al obtener movimientos:', movimientosError)
  if (ventasPendientesError) console.error('Error al obtener ventas pendientes:', ventasPendientesError)
  if (deudasPendientesError) console.error('Error al obtener deudas pendientes:', deudasPendientesError)

  let cuentasConSaldo: Awaited<ReturnType<typeof getAccountsWithBalance>> = []
  let saldosVenta: Record<string, { totalPagado: number; totalCreditoAplicado: number; saldoPendiente: number }> = {}
  let totalPorCobrar = 0
  let totalPorPagar = 0

  try {
    cuentasConSaldo = await getAccountsWithBalance(supabase)
  } catch (error) {
    console.error('Error al calcular saldos de cuentas:', error)
  }

  try {
    saldosVenta = await getSaldosVentas(
      supabase,
      (sale ?? []).map((v: any) => ({ id: v.id, total: v.total }))
    )
  } catch (error) {
    console.error('Error al calcular saldos de ventas:', error)
  }

  try {
    const saldosVentasPendientes = await getSaldosVentas(
      supabase,
      (ventasPendientes ?? []).map((v: any) => ({ id: v.id, total: v.total }))
    )
    totalPorCobrar = Object.values(saldosVentasPendientes).reduce((acc, s) => acc + s.saldoPendiente, 0)
  } catch (error) {
    console.error('Error al calcular total por cobrar:', error)
  }

  try {
    const saldosDeudasPendientes = await getSaldosDeudas(
      supabase,
      (deudasPendientes ?? []).map((d: any) => ({ id: d.id, total_amount: d.total_amount }))
    )
    totalPorPagar = Object.values(saldosDeudasPendientes).reduce((acc, s) => acc + s.saldoPendiente, 0)
  } catch (error) {
    console.error('Error al calcular total por pagar:', error)
  }

  const movs = movimientosPeriodo ?? []
  const ingresosPeriodo = movs
    .filter((m: any) => m.categories?.category_type === 'ingreso')
    .reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0)
  const gastosPeriodo = movs
    .filter((m: any) => m.categories?.category_type === 'gasto')
    .reduce((acc: number, m: any) => acc + (Number(m.amount) || 0), 0)

  return (
    <FinanzasClient
      sales={sale || []}
      purchases={purchases || []}
      accounts={accounts || []}
      categorias={categorias || []}
      saldosVenta={saldosVenta}
      cuentasConSaldo={cuentasConSaldo}
      saldoTotalCuentas={calcularSaldoTotal(cuentasConSaldo)}
      totalPorCobrar={totalPorCobrar}
      totalPorPagar={totalPorPagar}
      ingresosPeriodo={ingresosPeriodo}
      gastosPeriodo={gastosPeriodo}
      ultimosMovimientos={movs.slice(0, 5)}
      movimientosPeriodo={movs}
      currentMonth={monthProp}
      currentYear={yearProp}
    />
  )
}
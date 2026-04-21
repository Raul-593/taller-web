import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { createClient } from "@/utils/supabase/server"
import { DashboardChartClient } from "./DashboardChartClient"
import { DashboardFinanzas } from "./DashboardFinanzas"
import { DashboardActividadesSummary, DashboardActividadesTable } from "./DashboardActividadesPendientes"

type Mantenimiento = {
  id: string
  service_date: string
  description: string
  observation: string
  cost: string
  status: string
  bicycles: {
    brand: string
    model: string
    customers: { name: string } | null
  }
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ month?: string, year?: string }> }) {
  const { month: selectedMonth, year: selectedYear } = await searchParams
  const year = selectedYear || new Date().getFullYear().toString()
  const month = selectedMonth || (new Date().getMonth() + 1).toString()
  const supabase = await createClient()

  // Base Queries
  let salesQuery = supabase
    .from('sales')
    .select(`
      id, 
      sales_type, 
      sub_total, 
      discount, 
      total, 
      payment_method, 
      status, 
      observacion,
      sales_date
    `)

  let purchasesQuery = supabase
    .from('purchases')
    .select(`
      id, 
      purchase_date, 
      description, 
      sub_total, 
      total, 
      payment_method, 
      status, 
      observacion
    `)

  const { data: mantenimiento, error: mantenimientoError } = await supabase
    .from('maintenance_records')
    .select(`
      id,
      service_date,
      description,
      status,
      cost,
      updated_at,
      bicycles ( 
        brand, model,
        customers (name)
      ) 
    `)


  // Apply Date Filtering
  if (month && month !== 'all') {
    const startDate = `${year}-${month.padStart(2, '0')}-01`
    const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0]
    
    salesQuery = salesQuery.gte('sales_date', `${startDate}T00:00:00`).lte('sales_date', `${endDate}T23:59:59`)
    purchasesQuery = purchasesQuery.gte('purchase_date', `${startDate}T00:00:00`).lte('purchase_date', `${endDate}T23:59:59`)
  } else {
    salesQuery = salesQuery.gte('sales_date', `${year}-01-01T00:00:00`).lte('sales_date', `${year}-12-31T23:59:59`)
    purchasesQuery = purchasesQuery.gte('purchase_date', `${year}-01-01T00:00:00`).lte('purchase_date', `${year}-12-31T23:59:59`)
  }

  // Fetch Data
  const [{ data: sale, error: saleError }, { data: purchases, error: purchasesError }] = await Promise.all([
    salesQuery,
    purchasesQuery
  ])

  if (saleError) { console.error('Error al obtener ventas:', saleError) }
  if (purchasesError) { console.error('Error al obtener compras:', purchasesError) }

  const totalSales = sale?.filter(venta => venta.status === 'completado').reduce((acc, current) => acc + (Number(current.total) || 0), 0) || 0
  const totalPurches = purchases?.filter(compra => compra.status === 'completado').reduce((acc, current) => acc + (Number(current.total) || 0), 0) || 0

  // Mantenimientos pendientes
  if (mantenimientoError) { console.error('Error al obtener mantenimientos:', mantenimientoError) }

  const pendingActivities = (mantenimiento as unknown as Mantenimiento[])?.filter(
    (m) => m.status === 'en_proceso' || m.status === 'recibido'
  ) || []
  const totalActivities = pendingActivities.length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight"> 593 Cycling Studio </h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        {/* --- Finanzas --- */}
        <DashboardFinanzas sales={sale || []} purchases={purchases || []} currentMonth={month} currentYear={year} />

        {/* --- Actividades Pendientes Summary --- */}
        <DashboardActividadesSummary total={totalActivities} />
      </div>


      <div className="grid gap-4 grid-cols-1">
        {/* --- Grafico de Barras --- */}
        <Card className="flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Ingreso vs Gasto</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardChartClient totalSales={totalSales} totalPurchases={totalPurches} month={month} year={year} />
          </CardContent>
        </Card>
      </div>

      {/* --- Listado de Actividades Pendientes --- */}
      <div className="grid gap-4 grid-cols-1">
        <DashboardActividadesTable activities={pendingActivities} />
      </div>

    </div>
  )
}
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { createClient } from "@/utils/supabase/server"
import { DashboardChartClient } from "./DashboardChartClient"


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

export default async function Dashboard() {
  const supabase = await createClient()
  
  // Ventas
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .select(`
      id, 
      sales_type, 
      sub_total, 
      discount, 
      total, 
      payment_method, 
      status, 
      observacion
    `)

  if (saleError) { console.error('Error al obtener ventas:', saleError) }

  const totalSales = sale?.reduce((acc, current) => acc + (Number(current.total) || 0), 0) || 0
  const formattedIncome = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalSales)

  // Compras
  const { data: purchases, error: purchasesError } = await supabase
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

  if (purchasesError) { console.error('Error al obtener compras:', purchasesError) }
  const totalPurches = purchases?.reduce((acc, current) => acc + (Number(current.total) || 0), 0) || 0
  const formattedExpenses = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalPurches)

  const netBalance = totalSales - totalPurches
  const formattedNetBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(netBalance)

  // Mantenimientos pendientes
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

  if (mantenimientoError) { console.error('Error al obtener mantenimientos:', mantenimientoError) }

  const pendingActivities = (mantenimiento as unknown as Mantenimiento[])?.filter(
    (m) => m.status === 'en_proceso' || m.status === 'recibido'
  ) || []
  const totalActivities = pendingActivities.length
  

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight"> 593 Cycling Studio </h1>
        <p className="text-muted-foreground mt-1">
          Dia
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {/* --- Ingresos Del Año  --- */}
        <Card className="flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Ingreso Del Año
              </CardTitle>
              <CardDescription>
                Ingresos totales del año
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-2xl text-green-500">{formattedIncome}</span>
            </div>
          </CardContent>
        </Card>
        {/* --- Gastos Del Año  --- */}
        <Card className="flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Gastos Del Año
              </CardTitle>
              <CardDescription>
                Gastos totales del año
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-2xl text-red-500">{formattedExpenses}</span>
            </div>
          </CardContent>
        </Card>
        {/* --- Saldo Neto --- */}
        <Card className="flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Saldo Neto
              </CardTitle>
              <CardDescription>
                Saldo total del año
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-2xl">{formattedNetBalance}</span>
            </div>
          </CardContent>
        </Card>
        {/* --- Actividades Pendientes --- */}
        <Card className="flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Actividades Pendientes
              </CardTitle>
              <CardDescription>
                Actividades pendientes
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <span className="text-2xl">{totalActivities}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
        
        {/* --- Grafico de Barras --- */}
        <Card className="md:col-span-3 flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle> Ingreso vs Gasto</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardChartClient totalSales={totalSales} totalPurchases={totalPurches} />
          </CardContent>
        </Card>
        
        {/* GRAFICO PIE */}
        <Card className="md:col-span-2 flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle> Diferentes Gastos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            GRAFICO PIE CON LA INFORMACION DE GASTOS QUE ESTA EN LA PAGINA DE FINANZAS
          </CardContent>
        </Card>
      </div>
      
      {/* --- Actividades Pendientes --- */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
        <Card className="md:col-span-5 flex flex-col justify-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle> Actividades Pendientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto">
            {pendingActivities.length === 0 ? (
                <p className="text-muted-foreground text-sm mt-2">No hay mantenimientos pendientes.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Bicicleta</TableHead>
                            <TableHead>Costo</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pendingActivities.map((m) => (
                            <TableRow key={m.id}>
                                <TableCell>{m.service_date}</TableCell>
                                <TableCell>{(m.bicycles as any)?.customers?.name || '-'}</TableCell>
                                <TableCell>{(m.bicycles as any)?.brand} {(m.bicycles as any)?.model}</TableCell>
                                <TableCell className="font-medium">${m.cost}</TableCell>
                                <TableCell>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${m.status === 'en_proceso' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {m.status === 'en_proceso' ? 'En Proceso' : 'Recibido'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { AgregarIngreso } from "@/componentes/finanzas/AgregarIngreso"
import { AgregarGasto } from "@/componentes/finanzas/AgregarGasto"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { DateFilter } from "@/componentes/ui/DateFilter"
import { StatusSelect } from "@/componentes/ui/StatusSelect"
import { useSyncState } from "@/hooks/useSyncState"
import { useUpdateStatus } from "@/hooks/useUpdateStatus"

const ESTADOS = [
    { value: 'completado', label: 'completado' },
    { value: 'pendiente', label: 'pendiente' },
    { value: 'cancelado', label: 'cancelado' }
]

export function FinanzasClient({ sales: initialSales, purchases: initialPurchases, currentMonth, currentYear }: { sales: any[], purchases: any[], currentMonth?: string, currentYear?: string }) {
    const router = useRouter()

    const [sales, setSales] = useSyncState(initialSales || [])
    const [purchases, setPurchases] = useSyncState(initialPurchases || [])
    
    const { loadingId: loadingSaleId, updateStatus: updateSaleStatus } = useUpdateStatus<any>('sales', undefined, () => setSales(initialSales))
    const { loadingId: loadingPurchaseId, updateStatus: updatePurchaseStatus } = useUpdateStatus<any>('purchases', undefined, () => setPurchases(initialPurchases))

    // Cálculos dinámicos de finanzas
    const totalSales = useMemo(() =>
        sales
            .filter(venta => venta.status === 'completado')
            .reduce((acc, current) => acc + (Number(current.total) || 0), 0)
        , [sales])
    const totalPurchases = useMemo(() =>
        purchases
            .filter(compra => compra.status === 'completado')
            .reduce((acc, current) => acc + (Number(current.total) || 0), 0), [purchases])
    const netBalance = totalSales - totalPurchases

    const chartData = useMemo(() => [
        {
            name: 'Resumen Mensual',
            Ingresos: totalSales,
            Gastos: totalPurchases
        }
    ], [totalSales, totalPurchases])

    const formattedIncome = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSales)
    const formattedExpenses = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPurchases)
    const formattedNetBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netBalance)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <DateFilter currentMonth={currentMonth} currentYear={currentYear} />
                <AgregarIngreso onIngresoAgregado={() => router.refresh()} />
                <AgregarGasto onGastoAgregado={() => router.refresh()} />
            </PageHeader>

            {/* --- KPIs --- */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <Card className="md:col-span-1 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Ingresos</CardTitle>
                            <CardDescription>Total Ingresos</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{formattedIncome}</div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Gastos</CardTitle>
                            <CardDescription>Total Gastos</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{formattedExpenses}</div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Saldo Neto</CardTitle>
                            <CardDescription>Saldo total calculado</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formattedNetBalance}</div>
                    </CardContent>
                </Card>

                {/* --- Graficos Placeholder --- */}
                <div className="md:col-span-4 grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="md:col-span-2 flex flex-col justify-center">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle> Ingreso vs Gasto</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pt-4">
                            {totalSales === 0 && totalPurchases === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No hay datos para el periodo seleccionado.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `$${value}`} />
                                        <Legend />
                                        <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={150} />
                                        <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={150} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-1 flex flex-col justify-center">
                        <CardHeader>
                            <div className="space-y-1">
                                <CardTitle> Diferentes Gastos</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            GRAFICO PIE CON LA INFORMACION DE GASTOS QUE ESTA EN LA PAGINA DE FINANZAS
                        </CardContent>
                    </Card>
                </div>

                {/* --- Ventas --- */}
                <Card className="md:col-span-4 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">Ventas</CardTitle>
                            <CardDescription>Registro histórico de ingresos</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto text-sm">
                        {sales.length === 0 ? (
                            <p className="text-muted-foreground">No hay ventas registradas.</p>
                        ) : (
                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[10%]">Fecha</TableHead>
                                        <TableHead className="w-[15%]">Cliente</TableHead>
                                        <TableHead className="w-[10%]">Tipo</TableHead>
                                        <TableHead className="w-[8%]">Sub</TableHead>
                                        <TableHead className="w-[8%]">Desc</TableHead>
                                        <TableHead className="w-[8%]">Total</TableHead>
                                        <TableHead className="w-[12%]">Pago</TableHead>
                                        <TableHead className="w-[13%]">Estado</TableHead>
                                        <TableHead className="w-[18%]">Observación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sales.map((venta: any) => (
                                        <TableRow key={venta.id}>
                                            <TableCell>{venta.sales_date || '-'}</TableCell>
                                            <TableCell className="font-medium capitalize">{venta.customers?.name || '-'}</TableCell>
                                            <TableCell className="font-medium capitalize">{venta.sales_type}</TableCell>
                                            <TableCell>${venta.sub_total}</TableCell>
                                            <TableCell>${venta.discount}</TableCell>
                                            <TableCell className="font-bold">${venta.total}</TableCell>
                                            <TableCell className="capitalize">{venta.payment_method}</TableCell>
                                            <TableCell className="capitalize" onClick={e => e.stopPropagation()}>
                                                <StatusSelect 
                                                    value={venta.status} 
                                                    options={ESTADOS} 
                                                    onChange={(val) => updateSaleStatus(venta.id, val, setSales, initialSales)}
                                                    disabled={loadingSaleId === venta.id}
                                                />
                                            </TableCell>

                                            <TableCell className="whitespace-normal break-words">{venta.observacion || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* --- Compras --- */}
                <Card className="md:col-span-4 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">Compras</CardTitle>
                            <CardDescription>Registro histórico de gastos</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto text-sm">
                        {purchases.length === 0 ? (
                            <p className="text-muted-foreground">No hay compras registradas.</p>
                        ) : (
                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[10%]">Fecha</TableHead>
                                        <TableHead className="w-[15%]">Proveedor</TableHead>
                                        <TableHead className="w-[20%]">Descripción</TableHead>
                                        <TableHead className="w-[10%]">Subtotal</TableHead>
                                        <TableHead className="w-[10%]">Total</TableHead>
                                        <TableHead className="w-[10%]">Método</TableHead>
                                        <TableHead className="w-[10%]">Estado</TableHead>
                                        <TableHead className="w-[15%]">Observación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchases.map((compra: any) => (
                                        <TableRow key={compra.id}>
                                            <TableCell>{compra.purchase_date}</TableCell>
                                            <TableCell>{compra.suppliers?.name || '-'}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{compra.description || '-'}</TableCell>
                                            <TableCell>${compra.sub_total}</TableCell>
                                            <TableCell className="font-bold">${compra.total}</TableCell>
                                            <TableCell className="capitalize">{compra.payment_method}</TableCell>
                                            <TableCell className="capitalize" onClick={e => e.stopPropagation()}>
                                                <StatusSelect 
                                                    value={compra.status} 
                                                    options={ESTADOS} 
                                                    onChange={(val) => updatePurchaseStatus(compra.id, val, setPurchases, initialPurchases)}
                                                    disabled={loadingPurchaseId === compra.id}
                                                />
                                            </TableCell>

                                            <TableCell className="whitespace-normal break-words">{compra.observacion || '-'}</TableCell>
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

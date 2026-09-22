"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { Button } from "@/componentes/ui/button"
import { AgregarIngreso } from "@/componentes/finanzas/AgregarIngreso"
import { AgregarGasto } from "@/componentes/finanzas/AgregarGasto"
import { VistaVenta } from "@/componentes/finanzas/VistaVenta"
import { RegistrarAbonoVenta } from "@/componentes/finanzas/RegistroAbonoVenta"
import { VistaDeuda } from "@/componentes/finanzas/deuda/VistaDeuda"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { DateFilter } from "@/componentes/ui/DateFilter"
import { getStatusClasses } from "@/utils/status-colors"
import { useSyncState } from "@/hooks/useSyncState"
import { aggregateGastosByCategoria } from "@/lib/finanzas/categorias"

export function FinanzasClient({
    sales: initialSales,
    purchases: initialPurchases,
    accounts,
    categorias,
    saldosVenta,
    cuentasConSaldo,
    saldoTotalCuentas,
    totalPorCobrar,
    totalPorPagar,
    ingresosPeriodo,
    gastosPeriodo,
    ultimosMovimientos,
    movimientosPeriodo,
    currentMonth,
    currentYear,
}: {
    sales: any[]
    purchases: any[]
    accounts: any[]
    categorias: any[]
    saldosVenta: Record<string, { totalPagado: number; totalCreditoAplicado: number; saldoPendiente: number }>
    cuentasConSaldo: any[]
    saldoTotalCuentas: number
    totalPorCobrar: number
    totalPorPagar: number
    ingresosPeriodo: number
    gastosPeriodo: number
    ultimosMovimientos: any[]
    movimientosPeriodo: any[]
    currentMonth?: string
    currentYear?: string
}) {
    const router = useRouter()

    const [sales] = useSyncState(initialSales || [])
    const [purchases] = useSyncState(initialPurchases || [])
    const [ventaVista, setVentaVista] = useState<any | null>(null)
    const [ventaParaAbono, setVentaParaAbono] = useState<any | null>(null)
    const [deudaVistaId, setDeudaVistaId] = useState<string | null>(null)

    const balanceNetoPeriodo = ingresosPeriodo - gastosPeriodo

    const chartData = useMemo(() => [
        { name: 'Resumen del Periodo', Ingresos: ingresosPeriodo, Gastos: gastosPeriodo }
    ], [ingresosPeriodo, gastosPeriodo])

    const gastosPorCategoria = useMemo(
        () => aggregateGastosByCategoria(movimientosPeriodo, categorias),
        [movimientosPeriodo, categorias]
    )

    const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                    <DateFilter currentMonth={currentMonth} currentYear={currentYear} className="w-full sm:w-auto justify-end" />
                    <div className="flex gap-2">
                        <AgregarIngreso accounts={accounts} onIngresoAgregado={() => router.refresh()} />
                        <AgregarGasto accounts={accounts} categorias={categorias} onGastoAgregado={() => router.refresh()} />
                    </div>
                </div>
            </PageHeader>

            {/* --- KPIs instantáneos: no dependen del filtro de fecha --- */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Al día de hoy</span>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="flex flex-col justify-center bg-zinc-100/70 border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle>Saldo en Cuentas</CardTitle>
                            <CardDescription>Efectivo + bancos activos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(saldoTotalCuentas)}</div>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-center flex flex-col justify-center bg-zinc-100/70 border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle>Por Cobrar</CardTitle>
                            <CardDescription>Saldo pendiente de ventas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPorCobrar)}</div>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-center bg-zinc-100/70 border-zinc-200">
                        <CardHeader className="pb-2">
                            <CardTitle>Por Pagar</CardTitle>
                            <CardDescription>Deudas pendientes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalPorPagar)}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- KPIs del periodo filtrado --- */}
            <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Periodo seleccionado</span>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="flex flex-col justify-center">
                        <CardHeader className="pb-2">
                            <CardTitle>Ingresos</CardTitle>
                            <CardDescription>Dinero que entró</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-500">{formatCurrency(ingresosPeriodo)}</div>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-center">
                        <CardHeader className="pb-2">
                            <CardTitle>Gastos</CardTitle>
                            <CardDescription>Dinero que salió</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-500">{formatCurrency(gastosPeriodo)}</div>
                        </CardContent>
                    </Card>
                    <Card className="flex flex-col justify-center">
                        <CardHeader className="pb-2">
                            <CardTitle>Balance Neto</CardTitle>
                            <CardDescription>Ingresos menos gastos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${balanceNetoPeriodo < 0 ? "text-red-600" : ""}`}>
                                {formatCurrency(balanceNetoPeriodo)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <div className="md:col-span-4 grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="md:col-span-2 flex flex-col justify-center">
                        <CardHeader>
                            <CardTitle>Ingreso vs Gasto</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] w-full pt-4">
                            {ingresosPeriodo === 0 && gastosPeriodo === 0 ? (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No hay movimientos para el periodo seleccionado.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `$${value}`} />
                                        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                                        <Legend />
                                        <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={150} />
                                        <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={150} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Últimos Movimientos</CardTitle>
                            <CardDescription>Del periodo seleccionado</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {ultimosMovimientos.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin movimientos en este periodo.</p>
                            ) : (
                                ultimosMovimientos.map((m) => {
                                    const esIngreso = m.categories?.category_type === "ingreso"
                                    return (
                                        <div key={m.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{m.categories?.name || "—"}</p>
                                                <p className="text-xs text-muted-foreground truncate">{m.accounts?.name} · {m.movement_date}</p>
                                            </div>
                                            <span className={`font-bold shrink-0 ${esIngreso ? "text-green-600" : "text-red-600"}`}>
                                                {esIngreso ? "+" : "-"}{formatCurrency(Number(m.amount))}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* --- Ventas --- */}
                <Card className="md:col-span-4 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">Ventas</CardTitle>
                            <CardDescription>Registro histórico de ingresos — clic en una fila para ver el detalle</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto text-sm">
                        {sales.length === 0 ? (
                            <p className="text-muted-foreground">No hay ventas registradas.</p>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <Table className="min-w-[1100px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[90px]">Fecha</TableHead>
                                            <TableHead className="w-[160px]">Cliente</TableHead>
                                            <TableHead className="w-[90px]">Tipo</TableHead>
                                            <TableHead className="w-[90px]">Total</TableHead>
                                            <TableHead className="w-[90px]">Pagado</TableHead>
                                            <TableHead className="w-[100px]">Saldo</TableHead>
                                            <TableHead className="w-[120px]">Estado</TableHead>
                                            <TableHead className="">Observación</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sales.map((venta: any) => {
                                            const saldo = saldosVenta[venta.id]
                                            return (
                                                <TableRow
                                                    key={venta.id}
                                                    className="cursor-pointer hover:bg-muted/50"
                                                    onClick={() => setVentaVista(venta)}
                                                >
                                                    <TableCell>{venta.sales_date || '-'}</TableCell>
                                                    <TableCell className="font-medium capitalize">{venta.customers?.name || '-'}</TableCell>
                                                    <TableCell className="font-medium capitalize">{venta.sales_type}</TableCell>
                                                    <TableCell className="font-bold">${venta.total}</TableCell>
                                                    <TableCell className="text-green-700">{formatCurrency(saldo?.totalPagado || 0)}</TableCell>
                                                    <TableCell className={saldo?.saldoPendiente ? "text-amber-700 font-bold" : "text-muted-foreground"}>
                                                        {formatCurrency(saldo?.saldoPendiente || 0)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusClasses(venta.status)}`}>
                                                            {venta.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="whitespace-normal break-words">{venta.observacion || '-'}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
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
                            <div className="overflow-x-auto w-full">
                                <Table className="min-w-[1000px]">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">Fecha</TableHead>
                                            <TableHead className="w-[180px]">Proveedor</TableHead>
                                            <TableHead className="w-[200px]">Descripción</TableHead>
                                            <TableHead className="w-[100px]">Subtotal</TableHead>
                                            <TableHead className="w-[100px]">Total</TableHead>
                                            <TableHead className="w-[100px]">Método</TableHead>
                                            <TableHead className="w-[140px]">Estado</TableHead>
                                            <TableHead className="">Observación</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {purchases.map((compra: any) => {
                                            const deudaVinculada = compra.deudas?.[0]
                                            return (
                                                <TableRow key={compra.id}>
                                                    <TableCell>{compra.purchase_date}</TableCell>
                                                    <TableCell>{compra.suppliers?.name || '-'}</TableCell>
                                                    <TableCell className="whitespace-normal break-words">{compra.description || '-'}</TableCell>
                                                    <TableCell>${compra.sub_total}</TableCell>
                                                    <TableCell className="font-bold">${compra.total}</TableCell>
                                                    <TableCell className="capitalize">{compra.payment_method}</TableCell>
                                                    <TableCell className="capitalize" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusClasses(compra.status)}`}>
                                                                {compra.status}
                                                            </span>
                                                            {deudaVinculada && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-6 text-[10px] px-2"
                                                                    onClick={() => setDeudaVistaId(deudaVinculada.id)}
                                                                >
                                                                    Ver Deuda
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="whitespace-normal break-words">{compra.observacion || '-'}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* --- Gastos por Categoría --- */}
                <Card className="md:col-span-4 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Gastos por Categoría</CardTitle>
                        <CardDescription>Desglose del periodo seleccionado</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px] w-full pt-2">
                        {gastosPorCategoria.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground">
                                No hay gastos registrados en este periodo.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={gastosPorCategoria}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                                    <Bar dataKey="total" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={28} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {ventaVista && (
                <VistaVenta
                    venta={ventaVista}
                    isOpen={!!ventaVista}
                    onOpenChange={(open) => { if (!open) setVentaVista(null) }}
                    onAbonar={() => {
                        setVentaParaAbono(ventaVista)
                        setVentaVista(null)
                    }}
                />
            )}

            {ventaParaAbono && (
                <RegistrarAbonoVenta
                    venta={ventaParaAbono}
                    accounts={accounts}
                    saldoPendiente={saldosVenta[ventaParaAbono.id]?.saldoPendiente}
                    isOpen={!!ventaParaAbono}
                    onOpenChange={(open) => { if (!open) setVentaParaAbono(null) }}
                    onAbonoRegistrado={() => {
                        setVentaParaAbono(null)
                        router.refresh()
                    }}
                />
            )}

            {deudaVistaId && (
                <VistaDeuda
                    deudaId={deudaVistaId}
                    accounts={accounts}
                    categorias={categorias}
                    isOpen={!!deudaVistaId}
                    onOpenChange={(open) => { if (!open) setDeudaVistaId(null) }}
                    onDeudaActualizada={() => router.refresh()}
                />
            )}
        </div>
    )
}
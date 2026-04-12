"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { AgregarIngreso } from "@/componentes/finanzas/AgregarIngreso"
import { AgregarGasto } from "@/componentes/finanzas/AgregarGasto"

export function FinanzasClient({ sales: initialSales, purchases: initialPurchases }: { sales: any[], purchases: any[] }) {
    const router = useRouter()
    
    const [sales, setSales] = useState(initialSales || [])
    const [purchases, setPurchases] = useState(initialPurchases || [])

    // Sincronizar el estado cliente con el servidor ante un router.refresh()
    useEffect(() => {
        setSales(initialSales || [])
        setPurchases(initialPurchases || [])
    }, [initialSales, initialPurchases])

    // Cálculos dinámicos de finanzas
    const totalSales = useMemo(() => sales.reduce((acc, current) => acc + (Number(current.total) || 0), 0), [sales])
    const totalPurchases = useMemo(() => purchases.reduce((acc, current) => acc + (Number(current.total) || 0), 0), [purchases])
    const netBalance = totalSales - totalPurchases

    const formattedIncome = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalSales)
    const formattedExpenses = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPurchases)
    const formattedNetBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netBalance)

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight"> 593 Cycling Studio </h1>
                    <p className="text-muted-foreground mt-1"> Mes Actual </p>
                </div>
                <div className="flex gap-2">
                    <AgregarIngreso onIngresoAgregado={() => router.refresh()} />
                    <AgregarGasto onGastoAgregado={() => router.refresh()} />
                </div>
            </div>

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
                                <CardTitle> Ingreso vs Gastado</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            GRAFICO DE CON LA INFORMACION DE INGRESOS Y GASTOS QUE ESTA EN LA PAGINA DE FINANZAS
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Tipo de Venta</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead>Descuento</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Método de Pago</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Observación</TableHead>
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
                                            <TableCell className="capitalize">{venta.status}</TableCell>
                                            <TableCell>{venta.observacion || '-'}</TableCell>
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Proveedor / ID</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Método de Pago</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead>Observación</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchases.map((compra: any) => (
                                        <TableRow key={compra.id}>
                                            <TableCell>{compra.purchase_date}</TableCell>
                                            <TableCell>{compra.suppliers?.name || '-'}</TableCell>
                                            <TableCell>{compra.description || '-'}</TableCell>
                                            <TableCell>${compra.sub_total}</TableCell>
                                            <TableCell className="font-bold">${compra.total}</TableCell>
                                            <TableCell className="capitalize">{compra.payment_method}</TableCell>
                                            <TableCell className="capitalize">{compra.status}</TableCell>
                                            <TableCell>{compra.observacion || '-'}</TableCell>
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

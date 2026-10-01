"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { DateFilter } from "@/componentes/ui/DateFilter"
import { useSyncState } from "@/hooks/useSyncState"

export function DashboardFinanzas({ sales: initialSales, purchases: initialPurchases, currentMonth, currentYear }: { sales: any[], purchases: any[], currentMonth?: string, currentYear?: string }) {
    const [sales] = useSyncState(initialSales || [])
    const [purchases] = useSyncState(initialPurchases || [])

    // Calculo Finanzas
    // Total de Ventas
    const totalSales = sales
        .filter(venta => venta.status === 'completado')
        .reduce((acc, current) => acc + (Number(current.total) || 0), 0)
    const formattedIncome = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(totalSales)

    // Total de Compras
    const totalPurches = purchases
        .filter(compra => compra.status === 'completado')
        .reduce((acc, current) => acc + (Number(current.total) || 0), 0)
    const formattedExpenses = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(totalPurches)

    // Balance Neto
    const netBalance = totalSales - totalPurches
    const formattedNetBalance = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(netBalance)

    return (
        <>
            <div className="md:col-span-4 flex justify-end items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground font-medium">Periodo:</span>
                <DateFilter currentMonth={currentMonth} currentYear={currentYear} size="xs" />
            </div>

            {/* Ingresos */}
            <Card className="flex flex-col justify-center">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-bold">
                            Ingresos
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <span className="text-2xl font-semibold text-green-500">{formattedIncome}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col justify-center">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-bold">
                            Gastos
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <span className="text-2xl font-semibold text-red-500">{formattedExpenses}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="flex flex-col justify-center">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle className="text-base font-bold">
                            Saldo Neto
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <span className="text-2xl font-semibold">{formattedNetBalance}</span>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
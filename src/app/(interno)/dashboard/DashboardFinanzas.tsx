"use client"

import { DateFilter } from "@/componentes/ui/DateFilter"
import { useSyncState } from "@/hooks/useSyncState"
import { TarjetaKPI } from "@/componentes/ui/TarjetaKPI"

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

            <TarjetaKPI titulo="Ingresos" valor={formattedIncome} color="green" />
            <TarjetaKPI titulo="Gastos" valor={formattedExpenses} color="red" />
            <TarjetaKPI titulo="Saldo Neto" valor={formattedNetBalance} />
        </>
    )
}
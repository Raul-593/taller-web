"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

type Props = {
    totalSales: number
    totalPurchases: number
}

export function DashboardChartClient({ totalSales, totalPurchases }: Props) {
    const chartData = useMemo(() => [
        {
            name: 'Resumen Anual',
            Ingresos: totalSales,
            Gastos: totalPurchases
        }
    ], [totalSales, totalPurchases])

    return (
        <div className="h-[300px] w-full pt-4">
            {totalSales === 0 && totalPurchases === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    No hay datos registrados.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={150} />
                        <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={150} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}

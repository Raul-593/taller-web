"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

type Props = {
    totalSales: number
    totalPurchases: number
    month?: string
    year?: string
}

export function DashboardChartClient({ totalSales, totalPurchases, month, year }: Props) {
    const months = [
        { value: 'all', label: 'Todo el año' },
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },
    ]

    const monthLabel = month ? months.find(m => m.value === month)?.label : 'Resumen'

    const chartData = useMemo(() => [
        {
            name: `${monthLabel} ${year || ''}`,
            Ingresos: totalSales,
            Gastos: totalPurchases
        }
    ], [totalSales, totalPurchases, monthLabel, year])


    return (
        <div className="h-[300px] w-full pt-4">
            {totalSales === 0 && totalPurchases === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    No hay datos registrados.
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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

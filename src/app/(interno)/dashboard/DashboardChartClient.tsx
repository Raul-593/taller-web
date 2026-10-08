"use client"

import { GraficoBarrasFinanzas } from "@/componentes/ui/GraficoBarrasFinanzas"

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

    return (
        <div className="h-[300px] w-full pt-4">
            <GraficoBarrasFinanzas
                ingresos={totalSales}
                gastos={totalPurchases}
                etiqueta={`${monthLabel} ${year || ''}`}
            />
        </div>
    )
}

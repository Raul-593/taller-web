"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/componentes/ui/cards"


export function DashboardFinanzas({ sales: initialSales, purchases: initialPurchases, currentMonth, currentYear }: { sales: any[], purchases: any[], currentMonth?: string, currentYear?: string }) {
    const router = useRouter()

    const [sales, setSales] = useState(initialSales || [])
    const [purchases, setPurchases] = useState(initialPurchases || [])

    useEffect(() => {
        setSales(initialSales || [])
        setPurchases(initialPurchases || [])
    }, [initialSales, initialPurchases])

    const handleFilterChange = (type: 'month' | 'year', value: string) => {
        const params = new URLSearchParams(window.location.search)
        if (type === 'year'){
            params.set('year', value)
            if (!params.has('month')) params.set('month', currentMonth || 'all')
        } else {
            params.set('month', value)
            if (!params.has('year')) params.set('year', currentYear || new Date().getFullYear().toString())
        }
        router.push(`/dashboard?${params.toString()}`)
    }

    const months = [
        { value: 'all', label: 'Todo el año'},
        { value: '1', label: 'Enero'},
        { value: '2', label: 'Febrero'},
        { value: '3', label: 'Marzo'},
        { value: '4', label: 'Abril'},
        { value: '5', label: 'Mayo'},
        { value: '6', label: 'Junio'},
        { value: '7', label: 'Julio'},
        { value: '8', label: 'Agosto'},
        { value: '9', label: 'Septiembre'},
        { value: '10', label: 'Octubre'},
        { value: '11', label: 'Noviembre'},
        { value: '12', label: 'Diciembre'},
    ]

    const years = Array.from({length: 10}, (_, i) => (new Date().getFullYear() + i).toString())
    
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
                <select
                    value={currentMonth || 'all'}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    className="bg-background border border-border rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <select
                    value={currentYear || new Date().getFullYear().toString()}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="bg-background border border-border rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
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
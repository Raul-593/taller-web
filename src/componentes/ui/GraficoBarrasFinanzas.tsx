"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

interface GraficoBarrasFinanzasProps {
    ingresos: number
    gastos: number
    etiqueta: string
    mensajeVacio?: string
    conLeyenda?: boolean
}

// Gráfico de barras de ingresos vs gastos compartido por el dashboard
// y la página de finanzas. El contenedor padre define la altura.
export function GraficoBarrasFinanzas({
    ingresos,
    gastos,
    etiqueta,
    mensajeVacio = "No hay datos registrados.",
    conLeyenda = false,
}: GraficoBarrasFinanzasProps) {
    if (ingresos === 0 && gastos === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                {mensajeVacio}
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={[{ name: etiqueta, Ingresos: ingresos, Gastos: gastos }]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                {conLeyenda && <Legend />}
                <Bar dataKey="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={150} />
                <Bar dataKey="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={150} />
            </BarChart>
        </ResponsiveContainer>
    )
}

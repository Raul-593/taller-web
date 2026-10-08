"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { DateFilter } from "@/componentes/ui/DateFilter"
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda"
import { AgregarMovimiento } from "@/componentes/(interno)/finanzas/movimientos/AgregarMovimiento"
import { getCategoryDisplayLabel } from "@/lib/finanzas/categorias"
import type { Category } from "@/lib/finanzas/types"
import { TarjetaKPI } from "@/componentes/ui/TarjetaKPI"

export function MovimientosClient({
    movimientos: initial,
    accounts,
    categorias,
    currentMonth,
    currentYear,
}: {
    movimientos: any[]
    accounts: any[]
    categorias: Category[]
    currentMonth?: string
    currentYear?: string
}) {
    console.log("accounts recibidas:", accounts)
    const router = useRouter()
    const movimientos = initial
    const [filtroCuenta, setFiltroCuenta] = useState("Todas")
    const [filtroCategoria, setFiltroCategoria] = useState("Todas")

    const categoriasById = useMemo(() => new Map(categorias.map((c) => [c.id, c])), [categorias])

    const filtrados = useMemo(() => {
        return movimientos.filter((m) => {
            if (filtroCuenta !== "Todas" && m.account_id !== filtroCuenta) return false
            if (filtroCategoria !== "Todas" && m.category_id !== filtroCategoria) return false
            return true
        })
    }, [movimientos, filtroCuenta, filtroCategoria])

    const { totalIngresos, totalGastos } = useMemo(() => {
        return filtrados.reduce(
            (acc, m) => {
                const categoria = categoriasById.get(m.category_id)
                if (categoria?.category_type === "ingreso") acc.totalIngresos += Number(m.amount) || 0
                else if (categoria?.category_type === "gasto") acc.totalGastos += Number(m.amount) || 0
                return acc
            },
            { totalIngresos: 0, totalGastos: 0 }
        )
    }, [filtrados, categoriasById])

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                    <DateFilter currentMonth={currentMonth} currentYear={currentYear} className="w-full sm:w-auto justify-end" />
                    <AgregarMovimiento cuentas={accounts} categorias={categorias} onMovimientoAgregado={() => router.refresh()} />
                </div>
            </PageHeader>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <TarjetaKPI
                    titulo="Ingresos del Periodo"
                    descripcion="Movimientos filtrados"
                    valor={formatCurrency(totalIngresos)}
                    color="green"
                />
                <TarjetaKPI
                    titulo="Gastos del Periodo"
                    descripcion="Movimientos filtrados"
                    valor={formatCurrency(totalGastos)}
                    color="red"
                />
            </div>

            <div className="flex flex-wrap gap-3">
                <select
                    value={filtroCuenta}
                    onChange={(e) => setFiltroCuenta(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="Todas">Todas las cuentas</option>
                    {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>

                <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="bg-background border border-border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                    <option value="Todas">Todas las categorías</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{getCategoryDisplayLabel(c.id, categoriasById)}</option>
                    ))}
                </select>
            </div>

            <TablaConBusqueda
                titulo="Movimientos"
                descripcion="Libro general de ingresos y gastos"
                items={filtrados}
                columns={[
                    { key: "fecha", header: "Fecha", className: "w-[10%]", render: (m) => m.movement_date },
                    { key: "cuenta", header: "Cuenta", className: "w-[15%]", render: (m) => m.accounts?.name || "—" },
                    {
                        key: "categoria",
                        header: "Categoría",
                        className: "w-[20%]",
                        render: (m) => getCategoryDisplayLabel(m.category_id, categoriasById),
                    },
                    {
                        key: "descripcion",
                        header: "Descripción",
                        className: "w-[25%]",
                        render: (m) => <span className="text-muted-foreground">{m.description || "—"}</span>,
                    },
                    {
                        key: "origen",
                        header: "Origen",
                        className: "w-[15%]",
                        render: (m) => (
                            m.reference_type ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter bg-zinc-100 text-zinc-600 border-zinc-200">
                                    Automático · {m.reference_type}
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter bg-blue-100 text-blue-700 border-blue-200">
                                    Manual
                                </span>
                            )
                        ),
                    },
                    {
                        key: "monto",
                        header: "Monto",
                        className: "w-[15%] text-right",
                        render: (m) => {
                            const esIngreso = categoriasById.get(m.category_id)?.category_type === "ingreso"
                            return (
                                <div className={`text-right font-bold ${esIngreso ? "text-green-600" : "text-red-600"}`}>
                                    {esIngreso ? "+" : "-"}{formatCurrency(Number(m.amount))}
                                </div>
                            )
                        },
                    },
                ]}
                mensajeVacio="No hay movimientos en este periodo."
                claseTabla="min-w-[900px]"
                claseContenido="max-h-[600px] overflow-y-auto"
            />
        </div>
    )
}
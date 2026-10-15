"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
<<<<<<< HEAD
import { PageHeader } from "@/componentes/ui/PageHeader"
import { DateFilter } from "@/componentes/ui/DateFilter"
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda"
import { AgregarMovimiento } from "@/componentes/(interno)/finanzas/movimientos/AgregarMovimiento"
import { getCategoryDisplayLabel } from "@/lib/finanzas/categorias"
import type { Category } from "@/lib/finanzas/types"
import { TarjetaKPI } from "@/componentes/ui/TarjetaKPI"
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { DateFilter } from "@/componentes/ui/DateFilter"
import { useSyncState } from "@/hooks/useSyncState"
import { AgregarMovimiento } from "@/componentes/(interno)/finanzas/movimientos/AgregarMovimiento"
import { getCategoryDisplayLabel } from "@/lib/finanzas/categorias"
import type { Category } from "@/lib/finanzas/types"
>>>>>>> cf4fd0c206cb5ece792e994eae31e387ecfc1625

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
<<<<<<< HEAD
    const movimientos = initial
=======
    const [movimientos] = useSyncState(initial)
>>>>>>> cf4fd0c206cb5ece792e994eae31e387ecfc1625
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
<<<<<<< HEAD
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
=======
                <Card className="flex flex-col justify-center">
                    <CardHeader className="pb-2">
                        <CardTitle>Ingresos del Periodo</CardTitle>
                        <CardDescription>Movimientos filtrados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIngresos)}</div>
                    </CardContent>
                </Card>
                <Card className="flex flex-col justify-center">
                    <CardHeader className="pb-2">
                        <CardTitle>Gastos del Periodo</CardTitle>
                        <CardDescription>Movimientos filtrados</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalGastos)}</div>
                    </CardContent>
                </Card>
>>>>>>> cf4fd0c206cb5ece792e994eae31e387ecfc1625
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

<<<<<<< HEAD
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
=======
            <Card className="md:col-span-4 flex flex-col">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Movimientos</CardTitle>
                    <CardDescription>Libro general de ingresos y gastos</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                    {filtrados.length === 0 ? (
                        <p className="text-muted-foreground">No hay movimientos en este periodo.</p>
                    ) : (
                        <Table className="min-w-[900px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[10%]">Fecha</TableHead>
                                    <TableHead className="w-[15%]">Cuenta</TableHead>
                                    <TableHead className="w-[20%]">Categoría</TableHead>
                                    <TableHead className="w-[25%]">Descripción</TableHead>
                                    <TableHead className="w-[15%]">Origen</TableHead>
                                    <TableHead className="w-[15%] text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtrados.map((m) => {
                                    const categoria = categoriasById.get(m.category_id)
                                    const esIngreso = categoria?.category_type === "ingreso"
                                    return (
                                        <TableRow key={m.id}>
                                            <TableCell>{m.movement_date}</TableCell>
                                            <TableCell>{m.accounts?.name || "—"}</TableCell>
                                            <TableCell className="whitespace-normal break-words">
                                                {getCategoryDisplayLabel(m.category_id, categoriasById)}
                                            </TableCell>
                                            <TableCell className="whitespace-normal break-words text-muted-foreground">
                                                {m.description || "—"}
                                            </TableCell>
                                            <TableCell>
                                                {m.reference_type ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter bg-zinc-100 text-zinc-600 border-zinc-200">
                                                        Automático · {m.reference_type}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter bg-blue-100 text-blue-700 border-blue-200">
                                                        Manual
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${esIngreso ? "text-green-600" : "text-red-600"}`}>
                                                {esIngreso ? "+" : "-"}{formatCurrency(Number(m.amount))}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
>>>>>>> cf4fd0c206cb5ece792e994eae31e387ecfc1625
        </div>
    )
}
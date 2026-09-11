"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { useSyncState } from "@/hooks/useSyncState"
import { AgregarDeuda } from "@/componentes/finanzas/deuda/AgregarDeuda"
import { VistaDeuda } from "@/componentes/finanzas/deuda/VistaDeuda"
import { getStatusClasses } from "@/utils/status-colors"

const FILTROS = [
    { value: "pendiente", label: "Pendiente" },
    { value: "completado", label: "Completado" },
    { value: "cancelado", label: "Cancelado" },
    { value: "Todas", label: "Todas" },
]

export function DeudasClient({
    deudas: initial, accounts, categorias, saldos,
}: {
    deudas: any[]; accounts: any[]; categorias: any[]
    saldos: Record<string, { totalPagado: number; saldoPendiente: number }>
}) {
    const router = useRouter()
    const [deudas] = useSyncState(initial)
    const [filtro, setFiltro] = useState("pendiente")
    const [deudaVistaId, setDeudaVistaId] = useState<string | null>(null)

    const filtradas = useMemo(() =>
        filtro === "Todas" ? deudas : deudas.filter((d) => d.status === filtro),
        [deudas, filtro]
    )

    const totalPendiente = useMemo(() =>
        deudas.filter((d) => d.status === "pendiente").reduce((acc, d) => acc + (saldos[d.id]?.saldoPendiente || 0), 0)
        , [deudas, saldos])

    const formatCurrency = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarDeuda onDeudaAgregada={() => router.refresh()} />
            </PageHeader>

            <Card className="flex flex-col justify-center max-w-sm">
                <CardHeader className="pb-2">
                    <CardTitle>Total Por Pagar</CardTitle>
                    <CardDescription>Deudas pendientes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalPendiente)}</div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
                {FILTROS.map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFiltro(f.value)}
                        className={["px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                            filtro === f.value
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                        ].join(" ")}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            <Card className="md:col-span-4 overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold">Deudas</CardTitle>
                    <CardDescription>Préstamos y compras pendientes de pago — clic en una fila para ver el detalle</CardDescription>
                </CardHeader>
                <CardContent>
                    {filtradas.length === 0 ? (
                        <p className="text-muted-foreground">No hay deudas en esta categoría.</p>
                    ) : (
                        <Table className="min-w-[850px] w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[18%]">Acreedor</TableHead>
                                    <TableHead className="w-[24%]">Descripción</TableHead>
                                    <TableHead className="w-[13%]">Total</TableHead>
                                    <TableHead className="w-[13%]">Pagado</TableHead>
                                    <TableHead className="w-[13%]">Saldo</TableHead>
                                    <TableHead className="w-[12%]">Vencimiento</TableHead>
                                    <TableHead className="w-[7%]">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtradas.map((d) => {
                                    const saldo = saldos[d.id]
                                    return (
                                        <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setDeudaVistaId(d.id)}>
                                            <TableCell className="font-medium whitespace-normal break-words">{d.creditor}</TableCell>
                                            <TableCell className="whitespace-normal break-words text-muted-foreground">
                                                {d.description || (d.purchases ? `Compra a ${d.purchases.suppliers?.name || "proveedor"}` : "—")}
                                            </TableCell>
                                            <TableCell className="font-bold">{formatCurrency(Number(d.total_amount))}</TableCell>
                                            <TableCell className="text-green-700">{formatCurrency(saldo?.totalPagado || 0)}</TableCell>
                                            <TableCell className={saldo?.saldoPendiente ? "text-amber-700 font-bold" : "text-muted-foreground"}>
                                                {formatCurrency(saldo?.saldoPendiente || 0)}
                                            </TableCell>
                                            <TableCell>{d.due_date || "—"}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusClasses(d.status)}`}>
                                                    {d.status}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {deudaVistaId && (
                <VistaDeuda
                    deudaId={deudaVistaId}
                    accounts={accounts}
                    categorias={categorias}
                    isOpen={!!deudaVistaId}
                    onOpenChange={(open) => { if (!open) setDeudaVistaId(null) }}
                    onDeudaActualizada={() => router.refresh()}
                />
            )}
        </div>
    )
}
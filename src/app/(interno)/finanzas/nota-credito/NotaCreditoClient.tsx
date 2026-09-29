"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { useSyncState } from "@/hooks/useSyncState"
import { AgregarNotaCredito } from "@/componentes/finanzas/nota-credito/AgregarNotaCredito"
import { VistaNotaCredito } from "@/componentes/finanzas/nota-credito/VistaNotaCredito"
import { getStatusClasses } from "@/utils/status-colors"
import { getCreditNoteTypeLabel } from "@/lib/finanzas/labels"

const filtros = [
    { value: "pendiente", label: "Pendiente" },
    { value: "completado", label: "Completado" },
    { value: "cancelado", label: "Cancelado" },
    { value: "Todas", label: "Todas" },
]

export function NotasCreditoClient({ notas: initial }: { notas: any[] }) {
    const router = useRouter()
    const [notas] = useSyncState(initial)
    const [filtro, setFiltro] = useState("pendiente")
    const [notaVistaId, setNotaVistaId] = useState<string | null>(null)

    const filtradas = useMemo(() =>
        filtro === "Todas" ? notas : notas.filter((n) => n.status === filtro),
        [notas, filtro]
    )

    const formatCurrency = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarNotaCredito onNotaAgregada={() => router.refresh()} />
            </PageHeader>

            <div className="flex flex-wrap gap-2">
                {filtros.map((f) => (
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
                    <CardTitle className="text-xl font-bold">Notas de Crédito</CardTitle>
                    <CardDescription>Devoluciones y descuentos — clic en una fila para ver el detalle</CardDescription>
                </CardHeader>
                <CardContent>
                    {filtradas.length === 0 ? (
                        <p className="text-muted-foreground">No hay notas de crédito en esta categoría.</p>
                    ) : (
                        <Table className="min-w-[800px] w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[15%]">Fecha</TableHead>
                                    <TableHead className="w-[20%]">Cliente</TableHead>
                                    <TableHead className="w-[12%]">Tipo</TableHead>
                                    <TableHead className="w-[28%]">Razón</TableHead>
                                    <TableHead className="w-[13%]">Total</TableHead>
                                    <TableHead className="w-[12%]">Estado</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtradas.map((n) => (
                                    <TableRow key={n.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setNotaVistaId(n.id)}>
                                        <TableCell>{n.credit_date}</TableCell>
                                        <TableCell className="font-medium">{n.customers?.name || "—"}</TableCell>
                                        <TableCell className="capitalize">{getCreditNoteTypeLabel(n.credit_type)}</TableCell>
                                        <TableCell className="whitespace-normal break-words text-muted-foreground">{n.reason}</TableCell>
                                        <TableCell className="font-bold">{formatCurrency(Number(n.total))}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusClasses(n.status)}`}>
                                                {n.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {notaVistaId && (
                <VistaNotaCredito
                    notaId={notaVistaId}
                    isOpen={!!notaVistaId}
                    onOpenChange={(open) => { if (!open) setNotaVistaId(null) }}
                    onNotaActualizada={() => router.refresh()}
                />
            )}
        </div>
    )
}
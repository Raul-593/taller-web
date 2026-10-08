"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda"
import { FiltroEstadoTabs } from "@/componentes/ui/FiltroEstadoTabs"
import { AgregarNotaCredito } from "@/componentes/(interno)/finanzas/nota-credito/AgregarNotaCredito"
import { VistaNotaCredito } from "@/componentes/(interno)/finanzas/nota-credito/VistaNotaCredito"
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
    const notas = initial
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

            <FiltroEstadoTabs opciones={filtros} valor={filtro} onChange={setFiltro} />

            <TablaConBusqueda
                titulo="Notas de Crédito"
                descripcion="Devoluciones y descuentos — clic en una fila para ver el detalle"
                items={filtradas}
                columns={[
                    { key: "fecha", header: "Fecha", className: "w-[15%]", render: (n) => n.credit_date },
                    { key: "cliente", header: "Cliente", className: "w-[20%]", render: (n) => <span className="font-medium">{n.customers?.name || "—"}</span> },
                    { key: "tipo", header: "Tipo", className: "w-[12%]", render: (n) => <span className="capitalize">{getCreditNoteTypeLabel(n.credit_type)}</span> },
                    {
                        key: "razon",
                        header: "Razón",
                        className: "w-[28%]",
                        render: (n) => <span className="text-muted-foreground">{n.reason}</span>,
                    },
                    { key: "total", header: "Total", className: "w-[13%]", render: (n) => <span className="font-bold">{formatCurrency(Number(n.total))}</span> },
                    {
                        key: "estado",
                        header: "Estado",
                        className: "w-[12%]",
                        render: (n) => (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusClasses(n.status)}`}>
                                {n.status}
                            </span>
                        ),
                    },
                ]}
                mensajeVacio="No hay notas de crédito en esta categoría."
                alClicFila={(n) => setNotaVistaId(n.id)}
                claseTabla="min-w-[800px] w-full"
            />

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
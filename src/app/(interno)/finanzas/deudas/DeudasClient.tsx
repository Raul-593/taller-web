"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda"
import { FiltroEstadoTabs } from "@/componentes/ui/FiltroEstadoTabs"
import { AgregarDeuda } from "@/componentes/(interno)/finanzas/deuda/AgregarDeuda"
import { VistaDeuda } from "@/componentes/(interno)/finanzas/deuda/VistaDeuda"
import { getStatusClasses } from "@/utils/status-colors"
import { TarjetaKPI } from "@/componentes/ui/TarjetaKPI"

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
    const deudas = initial
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

            <TarjetaKPI
                titulo="Total Por Pagar"
                descripcion="Deudas pendientes"
                valor={formatCurrency(totalPendiente)}
                color="amber"
            />

            <FiltroEstadoTabs opciones={FILTROS} valor={filtro} onChange={setFiltro} />

            <TablaConBusqueda
                titulo="Deudas"
                descripcion="Préstamos y compras pendientes de pago — clic en una fila para ver el detalle"
                items={filtradas}
                columns={[
                    { key: "acreedor", header: "Acreedor", className: "w-[18%]", render: (d) => <span className="font-medium">{d.creditor}</span> },
                    {
                        key: "descripcion",
                        header: "Descripción",
                        className: "w-[24%]",
                        render: (d) => (
                            <span className="text-muted-foreground">
                                {d.description || (d.purchases ? `Compra a ${d.purchases.suppliers?.name || "proveedor"}` : "—")}
                            </span>
                        ),
                    },
                    { key: "total", header: "Total", className: "w-[13%]", render: (d) => <span className="font-bold">{formatCurrency(Number(d.total_amount))}</span> },
                    { key: "pagado", header: "Pagado", className: "w-[13%]", render: (d) => <span className="text-green-700">{formatCurrency(saldos[d.id]?.totalPagado || 0)}</span> },
                    {
                        key: "saldo",
                        header: "Saldo",
                        className: "w-[13%]",
                        render: (d) => (
                            <span className={saldos[d.id]?.saldoPendiente ? "text-amber-700 font-bold" : "text-muted-foreground"}>
                                {formatCurrency(saldos[d.id]?.saldoPendiente || 0)}
                            </span>
                        ),
                    },
                    { key: "vencimiento", header: "Vencimiento", className: "w-[12%]", render: (d) => d.due_date || "—" },
                    {
                        key: "estado",
                        header: "Estado",
                        className: "w-[7%]",
                        render: (d) => (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusClasses(d.status)}`}>
                                {d.status}
                            </span>
                        ),
                    },
                ]}
                mensajeVacio="No hay deudas en esta categoría."
                alClicFila={(d) => setDeudaVistaId(d.id)}
                claseTabla="min-w-[850px] w-full"
            />

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
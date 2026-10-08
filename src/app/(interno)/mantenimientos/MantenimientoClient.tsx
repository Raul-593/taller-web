"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { useRouter } from "next/navigation"
import { AgregarMantenimiento } from "@/componentes/(interno)/mantenimientos/AgregarMantenimiento"
import { EditarMantenimientoDialog } from "@/componentes/(interno)/mantenimientos/EditarMantenimiento"
import { VistaMantenimiento } from "@/componentes/(interno)/mantenimientos/VistaMantenimiento"
import { RegistrarAbonoMantenimiento } from "@/componentes/(interno)/finanzas/RegsitroAbonoMantenimiento"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { FiltroEstadoTabs } from "@/componentes/ui/FiltroEstadoTabs"
import { StatusSelect } from "@/componentes/ui/StatusSelect"
import { useSyncState } from "@/hooks/useSyncState"
import { useUpdateStatus } from "@/hooks/useUpdateStatus"
import { getSalesTypesLabel, getPaymentMethodLabel } from "@/lib/finanzas/labels"


const ESTADOS = [
    { value: 'recibido', label: 'Recibido' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completado', label: 'Completado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' }
]

function CamposVentaBadge({ value, label }: { value: string | null; label: string}) {
    if (!value){
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter bg-red-50 text-red-600 border-red-200">
                Falta
            </span>
        )
    }
    return <span className="text-sm">{label}</span>
}

export function MantenimientoClient({ mantenimientos: initial, accounts }: { mantenimientos: any[]; accounts: any[] }) {
    const router = useRouter()
    const [mantenimiento, setMantenimientos] = useSyncState(initial)
    const [filtro, setFiltro] = useState("Todas")
    const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<any | null>(null)
    const [mantenimientoVista, setMantenimientoVista] = useState<any | null>(null)
    const [mantenimientoParaAbono, setMantenimientoParaAbono] = useState<any | null>(null)

    const { loadingId, updateStatus } = useUpdateStatus<any>('maintenance_records', undefined, () => setMantenimientos(initial))

    // Filtros por estado
    const filtradas = useMemo(() =>
        filtro === "Todas"
            ? mantenimiento
            : mantenimiento.filter(m => (m.status || "Sin estado") === filtro),
        [mantenimiento, filtro]
    )

    // Cantidad de mantenimientos por estado para las pestañas de filtro.
    const conteosPorEstado = useMemo(() => {
        const conteos: Record<string, number> = { Todas: mantenimiento.length }
        for (const m of mantenimiento) {
            conteos[m.status] = (conteos[m.status] || 0) + 1
        }
        return conteos
    }, [mantenimiento])

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarMantenimiento onMantenimientoAgregado={() => router.refresh()} />
            </PageHeader>

            {/* Tabs de filtro por estado */}
            <FiltroEstadoTabs
                opciones={[{ value: 'Todas', label: 'Todas' }, ...ESTADOS]}
                valor={filtro}
                onChange={setFiltro}
                conteos={conteosPorEstado}
            />
            {/* ---  Lista de Mantenimientos --- */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                <Card className="md:col-span-4 flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-base font-semibold">
                                Mantenimientos
                            </CardTitle>
                            <CardDescription>
                                Mantenimientos registrados
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filtradas.length === 0 ? (
                            <p className="text-muted-foreground">No hay mantenimientos registrados en esta categoría</p>
                        ) : (
                            <Table className="min-w-200">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[16%]">Cliente</TableHead>
                                        <TableHead className="w-[16%]">Bicicleta</TableHead>
                                        <TableHead className="w-[12%]">Fecha</TableHead>
                                        <TableHead className="w-[10%]">Costo</TableHead>
                                        <TableHead className="w-[12%]">Estado</TableHead>
                                        <TableHead className="w-[12%]">Tipo de venta</TableHead>
                                        <TableHead className="w-[15%]">Método de pago</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtradas.map((m) => (
                                        <TableRow
                                            key={m.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => setMantenimientoVista(m)} // Abre el modal de detalle
                                        >
                                            <TableCell className="whitespace-normal wrap-break-words">{(m.bicycles as any)?.customers?.name || '-'}</TableCell>
                                            <TableCell className="whitespace-normal wrap-break-words">{(m.bicycles as any)?.brand} {(m.bicycles as any)?.model}</TableCell>
                                            <TableCell>{m.service_date}</TableCell>
                                            <TableCell>${m.cost}</TableCell>
                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <StatusSelect 
                                                    value={m.status} 
                                                    options={ESTADOS} 
                                                    onChange={(val) => updateStatus(m.id, val, setMantenimientos, initial)}
                                                    disabled={loadingId === m.id}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <CamposVentaBadge value={m.sales_type} label={getSalesTypesLabel(m.sales_type)} />
                                            </TableCell>
                                            <TableCell>
                                                <CamposVentaBadge value={m.payment_method} label={getPaymentMethodLabel(m.payment_method)} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detalle Mantenimiento */}
            {mantenimientoVista && (
                <VistaMantenimiento 
                    mantenimiento={mantenimientoVista}
                    isOpen={!!mantenimientoVista}
                    onOpenChange={(open) => { if(!open) setMantenimientoVista(null) }}
                    onEdit={() => {
                        setMantenimientoSeleccionado(mantenimientoVista)
                        setMantenimientoVista(null)
                    }}
                    onAbonar={() => {
                        setMantenimientoParaAbono(mantenimientoVista)
                        setMantenimientoVista(null)
                    }}
                    onCamposVentaActualizados={(actualizado) => {
                        if (actualizado) {
                            setMantenimientos((prev) =>
                                prev.map((m) =>
                                    m.id === actualizado.id
                                        ? { ...m, ...actualizado }
                                        : m
                                )
                            )
                            setMantenimientoVista((prev: any) => prev ? { ...prev, ...actualizado } : null)
                        }
                        router.refresh()
                    }}
                />
            )}

            {/* Editar Mantenimiento */}
            {mantenimientoSeleccionado && (
                <EditarMantenimientoDialog
                    mantenimiento={mantenimientoSeleccionado}
                    isOpenOutside={!!mantenimientoSeleccionado}
                    onOpenChangeOutside={(open) => { if(!open) setMantenimientoSeleccionado(null) }}
                    onMantenimientoActualizado={(actualizado) => {
                        if (actualizado) {
                            setMantenimientos((prev) =>
                                prev.map((m) =>
                                    m.id === actualizado.id
                                        ? { ...m, ...actualizado, bicycles: actualizado.bicycles || m.bicycles }
                                        : m
                                )
                            )
                        }
                        router.refresh()
                        setMantenimientoSeleccionado(null)
                    }}
                />
            )}

            {/* Registrar Abono Mantenimiento */}
            {mantenimientoParaAbono && (
                <RegistrarAbonoMantenimiento
                    mantenimiento={mantenimientoParaAbono}
                    accounts={accounts}
                    isOpen={!!mantenimientoParaAbono}
                    onOpenChange={(open) => {if (!open) setMantenimientoParaAbono(null) }}
                    onAbonoRegistrado={() => {
                        setMantenimientoParaAbono(null)
                        router.refresh()
                    }}
                />
            )}

        </div>
    )
}
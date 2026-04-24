"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { useRouter } from "next/navigation"
import { AgregarMantenimiento } from "@/componentes/mantenimiento/AgregarMantenimiento"
import { EditarMantenimientoDialog } from "@/componentes/mantenimiento/EditarMantenimiento"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { StatusSelect } from "@/componentes/ui/StatusSelect"
import { useSyncState } from "@/hooks/useSyncState"
import { useUpdateStatus } from "@/hooks/useUpdateStatus"


const ESTADOS = [
    { value: 'recibido', label: 'Recibido' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completado', label: 'Completado' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' }
]

export function MantenimientoClient({ mantenimientos: initial }: { mantenimientos: any[] }) {
    const router = useRouter()
    const [mantenimiento, setMantenimientos] = useSyncState(initial)
    const [filtro, setFiltro] = useState("Todas")
    const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<any | null>(null)

    const { loadingId, updateStatus } = useUpdateStatus<any>('maintenance_records', undefined, () => setMantenimientos(initial))

    // Filtros por estado
    const filtradas = useMemo(() =>
        filtro === "Todas"
            ? mantenimiento
            : mantenimiento.filter(m => (m.status || "Sin estado") === filtro),
        [mantenimiento, filtro]
    )

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarMantenimiento onMantenimientoAgregado={() => router.refresh()} />
            </PageHeader>

            {/* Tabs de filtro por estado */}
            <div className="flex flex-wrap gap-2">
                {[{ value: 'Todas', label: 'Todas' }, ...ESTADOS].map(tab => {
                    const count = tab.value === 'Todas' ? mantenimiento.length : mantenimiento.filter(m => m.status === tab.value).length;

                    return (
                        <button
                            key={tab.value}
                            onClick={() => setFiltro(tab.value)}
                            className={["px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                                filtro === tab.value
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                            ].join(" ")}
                        >
                            {tab.label}
                            <span className="ml-1.5 opacity-60 text-xs">
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>
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
                            <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[20%]">Cliente</TableHead>
                                        <TableHead className="w-[20%]">Bicicleta</TableHead>
                                        <TableHead className="w-[15%]">Fecha</TableHead>
                                        <TableHead className="w-[10%]">Costo</TableHead>
                                        <TableHead className="w-[20%]">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtradas.map((m) => (
                                        <TableRow
                                            key={m.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => setMantenimientoSeleccionado(m)} // Abre el modal de edición/detalle
                                        >
                                            <TableCell className="whitespace-normal break-words">{(m.bicycles as any)?.customers?.name || '-'}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{(m.bicycles as any)?.brand} {(m.bicycles as any)?.model}</TableCell>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* --- Modal de Edición/Detalle (Controlado) --- */}
            {mantenimientoSeleccionado && (
                <EditarMantenimientoDialog 
                    mantenimiento={mantenimientoSeleccionado}
                    isOpenOutside={!!mantenimientoSeleccionado}
                    onOpenChangeOutside={(open) => { if(!open) setMantenimientoSeleccionado(null) }}
                    onMantenimientoActualizado={() => {
                        router.refresh()
                        setMantenimientoSeleccionado(null)
                    }}
                />
            )}
        </div>
    )
}
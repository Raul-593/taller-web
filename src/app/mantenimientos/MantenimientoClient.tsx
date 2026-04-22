"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { useRouter } from "next/navigation"
import { AgregarMantenimiento } from "@/componentes/mantenimiento/AgregarMantenimiento"
import { EditarMantenimientoDialog } from "@/componentes/mantenimiento/EditarMantenimiento"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/componentes/ui/sheet"
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
                            <Table className="table-fixed">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[20%]">Cliente</TableHead>
                                        <TableHead className="w-[20%]">Bicicleta</TableHead>
                                        <TableHead className="w-[15%]">Fecha</TableHead>
                                        <TableHead className="w-[10%]">Costo</TableHead>
                                        <TableHead className="w-[20%]">Estado</TableHead>
                                        <TableHead className="w-[15%]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtradas.map((m) => (
                                        <TableRow
                                            key={m.id}
                                            className="cursor-pointer"
                                            onClick={() => setMantenimientoSeleccionado(m)}  // abre el detalle
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
                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <EditarMantenimientoDialog mantenimiento={m} onMantenimientoActualizado={() => router.refresh()} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Sheet open={!!mantenimientoSeleccionado} onOpenChange={open => { if (!open) setMantenimientoSeleccionado(null) }}>
                <SheetContent className="p-6 sm:max-w-md w-full overflow-y-auto">
                    {mantenimientoSeleccionado && (
                        <div className="pl-3">
                            <SheetHeader>
                                <SheetTitle>
                                    {(mantenimientoSeleccionado.bicycles as any)?.customers?.name}
                                </SheetTitle>
                                <SheetDescription>
                                    {(mantenimientoSeleccionado.bicycles as any)?.brand} {(mantenimientoSeleccionado.bicycles as any)?.model}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="mt-8 flex flex-col gap-6">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Fecha de servicio</p>
                                    <p className="text-sm font-medium">{mantenimientoSeleccionado.service_date}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Costo</p>
                                    <p className="text-sm font-medium">${mantenimientoSeleccionado.cost}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Descripción</p>
                                    <p className="text-sm">{mantenimientoSeleccionado.description || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Observación</p>
                                    <p className="text-sm">{mantenimientoSeleccionado.observation || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Estado</p>
                                    <StatusSelect 
                                        value={mantenimientoSeleccionado.status} 
                                        options={ESTADOS} 
                                        onChange={(val) => updateStatus(mantenimientoSeleccionado.id, val, setMantenimientos, initial)}
                                        disabled={loadingId === mantenimientoSeleccionado.id}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
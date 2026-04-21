"use client"

import { useState, useMemo, useEffect } from "react"
import { createClient } from "@/utils/supabase/clients"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { useRouter } from "next/navigation"
import { AgregarMantenimiento } from "@/componentes/mantenimiento/AgregarMantenimiento"
import { EditarMantenimientoDialog } from "@/componentes/mantenimiento/EditarMantenimiento"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/componentes/ui/sheet"


const ESTADOS = [
    { value: 'recibido', label: 'Recibido', color: 'bg-blue-100 text-blue-700' },
    { value: 'en_proceso', label: 'En Proceso', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'completado', label: 'Completado', color: 'bg-purple-100 text-purple-700' },
    { value: 'entregado', label: 'Entregado', color: 'bg-green-100 text-green-700' },
    { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-700' }
]

export function MantenimientoClient({ mantenimientos: initial }: { mantenimientos: any[] }) {
    // Hook para la navegación
    const router = useRouter()

    // Estados para el manejo de la UI
    const [mantenimiento, setMantenimientos] = useState(initial)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [filtro, setFiltro] = useState("Todas")

    const [mantenimientoSeleccionado, setMantenimientoSeleccionado] = useState<any | null>(null)

    // Sincronizar estado con props iniciales provenientes del servidor
    useEffect(() => {
        setMantenimientos(initial)
    }, [initial])
    const supabase = createClient()

    // Filtros por estado
    const filtradas = useMemo(() =>
        filtro === "Todas"
            ? mantenimiento
            : mantenimiento.filter(m => (m.status || "Sin estado") === filtro),
        [mantenimiento, filtro]
    )

    // Función para cambiar el estado de un mantenimiento
    async function cambiarEstado(id: string, nuevoEstado: string) {
        setLoadingId(id)

        // Actualizar desde la UI
        setMantenimientos(prev =>
            prev.map(m => m.id === id ? { ...m, status: nuevoEstado } : m)
        )

        // Actualizar desde la base de datos
        const { error } = await supabase
            .from('maintenance_records')
            .update({ status: nuevoEstado })
            .eq('id', id)

        // Si hay error, revertir el cambio
        if (error) {
            console.error('Error al actualizar el estado:', error)
            setMantenimientos(initial)
        }

        // Limpiar el loading
        setLoadingId(null)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Header*/}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight"> 593 Cycling Studio</h1>
                </div>
                {/* Agregar Mantenimiento */}
                <div className="flex gap-2">
                    <AgregarMantenimiento onMantenimientoAgregado={() => router.refresh()} />
                </div>
            </div>

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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead>Bicicleta</TableHead>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Costo</TableHead>
                                        <TableHead>Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtradas.map((m) => (
                                        <TableRow
                                            key={m.id}
                                            className="cursor-pointer"
                                            onClick={() => setMantenimientoSeleccionado(m)}  // abre el detalle
                                        >
                                            <TableCell>{(m.bicycles as any)?.customers?.name || '-'}</TableCell>
                                            <TableCell>{(m.bicycles as any)?.brand} {(m.bicycles as any)?.model}</TableCell>
                                            <TableCell>{m.service_date}</TableCell>
                                            <TableCell>${m.cost}</TableCell>
                                            <TableCell onClick={e => e.stopPropagation()}>  {/* evita abrir detalle al cambiar estado */}
                                                <select
                                                    value={m.status}
                                                    disabled={loadingId === m.id}
                                                    onChange={e => cambiarEstado(m.id, e.target.value)}
                                                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${ESTADOS.find(e => e.value === m.status)?.color || ''}`}
                                                >
                                                    {ESTADOS.map(e => (
                                                        <option key={e.value} value={e.value}>{e.label}</option>
                                                    ))}
                                                </select>
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
                                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${ESTADOS.find(e => e.value === mantenimientoSeleccionado.status)?.color || ''}`}>
                                        {ESTADOS.find(e => e.value === mantenimientoSeleccionado.status)?.label}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )


}
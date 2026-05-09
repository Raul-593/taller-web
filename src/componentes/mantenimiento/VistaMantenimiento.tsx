"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componentes/ui/dialog"
import { Button } from "@/componentes/ui/button"
import { Label } from "@/componentes/ui/label"
import { Edit2, Package, Wrench, Calendar, User, Bike, Info, FileText, MessageCircle } from "lucide-react"
import { generateMaintenancePDF } from "@/lib/pdf-generator"
import { toast } from "sonner"

type Props = {
    mantenimiento: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onEdit: () => void
}

export function VistaMantenimiento({ mantenimiento, isOpen, onOpenChange, onEdit }: Props) {
    if (!mantenimiento) return null

    const items = mantenimiento.maintenance_items || []
    const customer = mantenimiento.bicycles?.customers
    const bicycle = mantenimiento.bicycles

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'recibido': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'en_proceso': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'completado': return 'bg-green-100 text-green-700 border-green-200'
            case 'entregado': return 'bg-zinc-100 text-zinc-700 border-zinc-200'
            case 'cancelado': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-zinc-100 text-zinc-700 border-zinc-200'
        }
    }

    const handleCopyWhatsApp = () => {
        const brand = bicycle?.brand || ""
        const model = bicycle?.model || ""
        const date = mantenimiento.service_date || "N/A"
        const desc = mantenimiento.description || "Sin descripción"
        const total = mantenimiento.cost?.toFixed(2) || "0.00"
        
        let text = `Bicicleta: ${brand} - ${model}\n`
        text += `Fecha: ${date}\n`
        text += `_Descripción:_\n ${desc}\n\n`
        
        if (items.length > 0) {
            text += `_Detalle:_\n`
            items.forEach((item: any) => {
                text += `- ${item.description} (x${item.quantity}): $${(item.quantity * item.unit_price).toFixed(2)}\n`
            })
            text += `\n`
        }
        
        text += `*Total: $${total}*`
        
        navigator.clipboard.writeText(text)
        toast.success("Información copiada para WhatsApp")
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl p-0 flex flex-col overflow-hidden max-h-[90vh]">
                <DialogHeader className="p-6 border-b bg-zinc-50/50">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-primary" />
                                Detalle de Mantenimiento
                            </DialogTitle>
                            <DialogDescription>
                                Vista detallada del registro de mantenimiento
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(mantenimiento.status)} uppercase tracking-wider`}>
                                {mantenimiento.status?.replace('_', ' ') || 'Sin estado'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleCopyWhatsApp}
                                    className="flex items-center gap-2 border-zinc-300 hover:bg-zinc-100"
                                >
                                    <MessageCircle className="h-4 w-4 text-green-600" />
                                    Copiar
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => generateMaintenancePDF(mantenimiento)}
                                    className="flex items-center gap-2 border-zinc-300 hover:bg-zinc-100"
                                >
                                    <FileText className="h-4 w-4 text-zinc-600" />
                                    Orden de Trabajo
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Columna Izquierda: Información General */}
                        <div className="space-y-6">
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Información General
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 p-3 rounded-lg border bg-zinc-50/30">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <User className="h-3 w-3" /> Cliente
                                        </Label>
                                        <p className="font-medium text-sm">{customer?.name || "No asignado"}</p>
                                    </div>
                                    <div className="space-y-1.5 p-3 rounded-lg border bg-zinc-50/30">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Bike className="h-3 w-3" /> Bicicleta
                                        </Label>
                                        <p className="font-medium text-sm">
                                            {bicycle ? `${bicycle.brand} ${bicycle.model || ""}` : "No asignada"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 p-3 rounded-lg border bg-zinc-50/30">
                                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3" /> Fecha Servicio
                                        </Label>
                                        <p className="font-medium text-sm">{mantenimiento.service_date || "N/A"}</p>
                                    </div>
                                </div>

                                <div className="space-y-1.5 p-3 rounded-lg border bg-zinc-50/30">
                                    <Label className="text-xs text-muted-foreground">Descripción</Label>
                                    <p className="text-sm">{mantenimiento.description || "Sin descripción"}</p>
                                </div>

                                {mantenimiento.observation && (
                                    <div className="space-y-1.5 p-3 rounded-lg border bg-amber-50/30 border-amber-100 text-amber-900">
                                        <Label className="text-xs text-amber-700/70">Observaciones Técnicas</Label>
                                        <p className="text-sm">{mantenimiento.observation}</p>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Columna Derecha: Ítems y Costos */}
                        <div className="space-y-6">
                            <section className="space-y-4">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Repuestos y Servicios
                                </h3>

                                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {items.length === 0 ? (
                                            <div className="p-8 text-center text-muted-foreground text-sm italic">
                                                No se registraron ítems adicionales
                                            </div>
                                        ) : (
                                            <table className="w-full text-sm">
                                                <thead className="bg-zinc-50 border-b sticky top-0">
                                                    <tr>
                                                        <th className="text-left p-3 font-medium text-zinc-500">Descripción</th>
                                                        <th className="text-center p-3 font-medium text-zinc-500">Cant.</th>
                                                        <th className="text-right p-3 font-medium text-zinc-500">Precio</th>
                                                        <th className="text-right p-3 font-medium text-zinc-500">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {items.map((item: any, idx: number) => (
                                                        <tr key={idx} className="hover:bg-zinc-50/50">
                                                            <td className="p-3">{item.description}</td>
                                                            <td className="p-3 text-center">{item.quantity}</td>
                                                            <td className="p-3 text-right">${item.unit_price?.toFixed(2)}</td>
                                                            <td className="p-3 text-right font-medium">${(item.quantity * item.unit_price)?.toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                    <div className="p-4 bg-zinc-900 text-white flex justify-between items-center">
                                        <span className="text-sm font-medium opacity-80">Costo Total Estimado</span>
                                        <span className="text-xl font-bold">${mantenimiento.cost?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t bg-zinc-50/50 gap-2 sm:gap-0">
                    <Button onClick={onEdit} className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg flex items-center gap-2">
                        <Edit2 className="h-4 w-4" />
                        Editar Registro
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-red-500 text-white hover:bg-red-700 rounded-lg flex items-center gap-2">
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
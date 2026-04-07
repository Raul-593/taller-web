"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"

type Props = {
    mantenimiento: any
    onMantenimientoActualizado: (mantenimiento: any) => void
    trigger?: React.ReactNode
}

export function EditarMantenimientoDialog({ mantenimiento, onMantenimientoActualizado, trigger}: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    //Datos del Mantenimiento
    const [bicicletas, setBicicletas] = useState<{ id: string, brand: string, model: string, customer_id: string }[]>([])
    const [bicycle_id, setBicycle_id] = useState<string | null>(null)
    const [cliente, setCliente] = useState<{ id: string, name: string }[]>([])
    const [clienteId, setClienteId] = useState<string | null>(null)
    const [serviceDate, setServiceDate] = useState("")
    const [deliveryDate, setDeliveryDate] = useState("")
    const [description, setDescription] = useState("")
    const [observacion, setObservacion] = useState("")
    const [cost, setCost] = useState("")
    const [estado, setEstado] = useState("")

    useEffect(() => {
        if (isOpen) {
            setClienteId(mantenimiento.customer_id)
            setBicycle_id(mantenimiento.bicycle_id)
            setServiceDate(mantenimiento.service_date)
            setDeliveryDate(mantenimiento.delivery_date)
            setDescription(mantenimiento.description)
            setObservacion(mantenimiento.observacion)
            setCost(mantenimiento.cost)
            setEstado(mantenimiento.status)
        }
    }, [isOpen, mantenimiento])

    function reset() {
        setBicycle_id(null)
        setClienteId(null)
        setServiceDate("")
        setDeliveryDate("")
        setDescription("")
        setObservacion("")
        setCost("")
        setEstado("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bicycle_id || !serviceDate || !description || !cost) {
            toast.error("Llenar todos los campos")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
        .from("maintenance_records")
        .update({
            service_date: serviceDate.trim(),
            delivery_date: deliveryDate.trim(),
            description: description.trim(),
            observation: observacion.trim(),
            cost: cost,
            status: estado,
            bicycle_id: bicycle_id
        })
        .eq("id", mantenimiento.id)
        .select("id, service_date, delivery_date, description, observation, cost, status, bicycle_id")
        .single()

        if(error) {
            toast.error("Error al actualizar el cliente")
            console.error(error)
        } else if (data) {
            onMantenimientoActualizado(data);
            toast.success("Bicicleta Actualizada con Éxito!")
            setIsOpen(false);
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || <Button variant="outline" size="sm"> Editar </Button>

    return (
        <FormDialog
            title="Editar Mantenimiento"
            description="Modifica los Mantenimientos"
            trigger={defaultTrigger}
            isOpen={isOpen}
            onOpenChange={(open) => { setIsOpen(open); if (!open) reset() }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Actualizar Mantenimiento"
        >
            <div className="grid gap-2">
                <Label>Cliente</Label>
                <div className="p-2 border rounded-md bg-muted/50 text-sm text-muted-foreground cursor-not-allowed">
                    {mantenimiento?.bicycles?.customers?.name || "Sin cliente"}
                </div>
            </div>
            <div className="grid gap-2">
                <Label>Bicicleta</Label>
                <div className="p-2 border rounded-md bg-muted/50 text-sm text-muted-foreground cursor-not-allowed">
                    {mantenimiento?.bicycles?.brand ? `${mantenimiento.bicycles.brand} ${mantenimiento.bicycles.model || ""}` : "Sin bicicleta"}
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-service-date-${mantenimiento.id}`}>Fecha de Servicio</Label>
                <Input id={`edit-service-date-${mantenimiento.id}`} value={serviceDate} onChange={e => setServiceDate(e.target.value)} placeholder="Ej. 2022-01-01" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-delivery-date-${mantenimiento.id}`}>Fecha de Entrega</Label>
                <Input id={`edit-delivery-date-${mantenimiento.id}`} value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} placeholder="Ej. 2022-01-01" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-description-${mantenimiento.id}`}>Descripción</Label>
                <Input id={`edit-description-${mantenimiento.id}`} value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. Mantenimiento general" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-observation-${mantenimiento.id}`}>Observación</Label>
                <Input id={`edit-observation-${mantenimiento.id}`} value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. Mantenimiento general" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-cost-${mantenimiento.id}`}>Costo</Label>
                <Input id={`edit-cost-${mantenimiento.id}`} value={cost} onChange={e => setCost(e.target.value)} placeholder="Ej. 100" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-status-${mantenimiento.id}`}>Estado</Label>
                <Input id={`edit-status-${mantenimiento.id}`} value={estado} onChange={e => setEstado(e.target.value)} placeholder="Ej. Pendiente" />
            </div>
        </FormDialog>
    )
}
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"

type Props = {
    bicicleta: any
    onBicicletaActualizada: (bicicleta: any) => void
    trigger?: React.ReactNode
}

export function EditarBicicletaDialog({ bicicleta, onBicicletaActualizada, trigger}: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const [brand, setBrand] = useState(bicicleta.brand || "")
    const [model, setModel] = useState(bicicleta.model || "")
    const [serial_number, setSerialNumber] = useState(bicicleta.serial_number || "")
    const [observacion, setObservacion] = useState(bicicleta.observacion || "")

    useEffect(() => {
        if (isOpen) {
            setBrand(bicicleta.brand || "")
            setModel(bicicleta.model || "")
            setSerialNumber(bicicleta.serial_number || "")
            setObservacion(bicicleta.observacion || "")
        }
    }, [isOpen, bicicleta])

    function reset() {
        setBrand(bicicleta.brand || "")
        setModel(bicicleta.model || "")
        setSerialNumber(bicicleta.serial_number || "")
        setObservacion(bicicleta.observacion || "")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if(!brand.trim() && !model.trim()){
            toast.error("La marca y el modelo son obligatorios")
            return
        }
        setIsSubmitting(true)

        const {data, error } = await supabase
        .from("bicycles")
        .update({
            brand: brand.trim(),
            model: model.trim(),
            serial_number: serial_number.trim(),
            observacion: observacion.trim()
        })
        .eq("id", bicicleta.id)
        .select("id, brand, model, serial_number, observacion, customers (name)")
        .single()

        if(error) {
            toast.error("Error al actualizar el cliente")
            console.error(error)
        } else if (data) {
            onBicicletaActualizada(data);
            toast.success("Bicicleta Actualizada con Éxito!")
            setIsOpen(false);
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || <Button variant="outline" size="sm"> Editar </Button>

    return(
        <FormDialog
            title="Editar Bicicleta"
            description="Modifica los datos de la Bicicleta"
            trigger={defaultTrigger}
            isOpen={isOpen}
            onOpenChange={ (open) => { setIsOpen(open); if (!open) reset() }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Actualizar Bicicleta"
        >
            <div className="grid gap-2">
                <Label>Cliente</Label>
                <div className="p-2 border rounded-md bg-muted/50 text-sm text-muted-foreground cursor-not-allowed">
                    {bicicleta?.customers?.name || "Sin cliente"}
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-brand-${bicicleta.id}`}>Marca</Label>
                <Input id={`edit-brand-${bicicleta.id}`} value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ej. Specialized" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-model-${bicicleta.id}`}>Modelo</Label>
                <Input id={`edit-model-${bicicleta.id}`} value={model} onChange={e => setModel(e.target.value)} placeholder="Ej. Epic" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-serial-${bicicleta.id}`}>Número de Serie</Label>
                <Input id={`edit-serial-${bicicleta.id}`} value={serial_number} onChange={e => setSerialNumber(e.target.value)} placeholder="Ej. SN123456" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-observacion-${bicicleta.id}`}>Observación</Label>
                <Input id={`edit-observacion-${bicicleta.id}`} value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. Suspensión delantera con fuga" />
            </div>
        </FormDialog>
    )


}


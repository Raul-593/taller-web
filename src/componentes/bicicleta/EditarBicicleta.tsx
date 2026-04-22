"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { BicicletaForm } from "./BicicletaForm"

type Props = {
    bicicleta: any
    onBicicletaActualizada: (bicicleta: any) => void
    trigger?: React.ReactNode
}

export function EditarBicicletaDialog({ bicicleta, onBicicletaActualizada, trigger}: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const handleSubmit = async (values: any) => {
        if(!values.brand.trim() && !values.model.trim()){
            toast.error("La marca y el modelo son obligatorios")
            return
        }
        setIsSubmitting(true)

        const {data, error } = await supabase
        .from("bicycles")
        .update({
            brand: values.brand.trim(),
            model: values.model.trim(),
            serial_number: values.serial_number.trim(),
            observacion: values.observacion.trim(),
            customer_id: values.customer_id
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

    return(
        <BicicletaForm
            title="Editar Bicicleta"
            description="Modifica los datos de la Bicicleta"
            submitLabel="Actualizar Bicicleta"
            trigger={trigger}
            initialData={bicicleta}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    )
}

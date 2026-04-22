"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { BicicletaForm } from "./BicicletaForm"

type Props = {
    onBicicletaAgregado: (bicicleta: any) => void
    trigger?: React.ReactNode
}

export function AgregarBicicleta({ onBicicletaAgregado, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if (!values.brand.trim() && !values.model.trim()) {
            toast.error("La marca y el modelo son obligatorios")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("bicycles")
            .insert([{
                brand: values.brand.trim(),
                model: values.model.trim(),
                serial_number: values.serial_number.trim() || null,
                observacion: values.observacion.trim() || null,
                customer_id: values.customer_id
            }])
            .select("id, brand, model, serial_number, observacion, customer_id")
            .single()

        if (error) {
            toast.error('Error al crear bicicleta'); console.error(error)
        } else if (data) {
            onBicicletaAgregado(data);
            toast.success("Bicicleta creada con exito");
            setIsOpen(false);
        }
        setIsSubmitting(false)
    }

    return (
        <BicicletaForm
            title="Agregar Bicicleta"
            description="Ingrese los datos de la nueva Bicicleta"
            submitLabel="Guardar Bicicleta"
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    )
}
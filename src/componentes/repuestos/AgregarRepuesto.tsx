"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { RepuestoForm } from "./RepuestoForm"

type Props = {
    onRepuestoNuevo: (repuesto: any) => void
    trigger?: React.ReactNode
}

export function AgregarRepuesto({ onRepuestoNuevo, trigger}: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if(!values.name || !values.category || !values.price){
            toast.error("Llenar los campos obligatorios")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("products")
            .insert([{
                name: values.name,
                description: values.description,
                category: values.category,
                stock: parseInt(values.stock) || 0,
                price: parseFloat(values.price) || 0,
                cost: parseFloat(values.cost) || 0
            }])
            .select()
            .single()
        
        if (error) {
            toast.error("Error al guardar Repuestos"); 
            console.error(error)
        } else if (data) {
            onRepuestoNuevo(data);
            toast.success("Repuesto Agregado Exitosamente!");
            setIsOpen(false);
        }
        setIsSubmitting(false)
    }

    return (
        <RepuestoForm
            title="Agregar Repuesto"
            description="Agregar nuevos repuestos"
            submitLabel="Agregar Repuesto"
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={trigger}
        />
    )
}
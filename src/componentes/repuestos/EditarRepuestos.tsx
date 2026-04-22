"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { RepuestoForm } from "./RepuestoForm"
import { Button } from "@/componentes/ui/button"

type Props = {
    repuestos: any
    onRepuestosActualizado: (respuesto: any) => void
    trigger?: React.ReactNode
}

export function EditarRepuestosDialog({ repuestos, onRepuestosActualizado, trigger}: Props){
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if (!values.name || !values.category || !values.stock || !values.price || !values.cost) {
            toast.error("Llenar todos los campos")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("products")
            .update({
                name: values.name,
                description: values.description,
                category: values.category,
                stock: parseInt(values.stock) || 0,
                price: parseFloat(values.price) || 0,
                cost: parseFloat(values.cost) || 0
            })
            .eq("id", repuestos.id)
            .select()
            .single()
            
        if (error) {
            toast.error("Error al actualizar el repuesto")
            console.error(error)
        } else if (data) {
            onRepuestosActualizado(data)
            toast.success("Repuesto Actualizado con Éxito!")
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }
    
    const defaultTrigger = trigger || <Button variant="outline" size="sm"> Editar </Button>

    return (
        <RepuestoForm
            title="Editar Repuesto"
            description="Modifica los Repuestos"
            submitLabel="Actualizar Repuesto"
            initialData={repuestos}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={defaultTrigger}
        />
    )
}
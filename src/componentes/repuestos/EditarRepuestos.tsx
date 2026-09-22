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

    const itemType = (repuestos?.type || "").toLowerCase().trim()
    const isService = itemType === "servicios" || itemType === "servicio" || itemType === "service" || (!itemType && repuestos?.category?.toLowerCase() === "servicios")

    const handleSubmit = async (values: any) => {
        if (!values.name || !values.price) {
            toast.error("Llenar los campos obligatorios")
            return
        }

        if (!isService && (values.stock === "" || values.stock === undefined)) {
            toast.error("Ingresa el stock del producto")
            return
        }

        setIsSubmitting(true)

        const updatePayload: any = {
            name: values.name,
            description: values.description,
            category: values.category,
            category_id: values.category_id || repuestos.category_id,
            price: parseFloat(values.price) || 0,
        }

        if (isService) {
            updatePayload.stock = null
            updatePayload.stock_min = null
            updatePayload.cost = null
        } else {
            updatePayload.stock = parseInt(values.stock) || 0
            updatePayload.stock_min = values.stock_min !== undefined && values.stock_min !== "" ? parseInt(values.stock_min) : (repuestos.stock_min ?? 0)
            updatePayload.cost = parseFloat(values.cost) || 0
        }

        const { data, error } = await supabase
            .from("products")
            .update(updatePayload)
            .eq("id", repuestos.id)
            .select()
            .single()
            
        if (error) {
            toast.error("Error al actualizar")
            console.error(error)
        } else if (data) {
            onRepuestosActualizado(data)
            toast.success(isService ? "Servicio Actualizado con Éxito!" : "Producto Actualizado con Éxito!")
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }
    
    const defaultTrigger = trigger || <Button variant="outline" size="sm"> Editar </Button>

    return (
        <RepuestoForm
            title={isService ? "Editar Servicio" : "Editar Producto"}
            description={isService ? "Modifica los datos del servicio" : "Modifica los datos del producto o repuesto"}
            submitLabel={isService ? "Actualizar Servicio" : "Actualizar Producto"}
            initialData={repuestos}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={defaultTrigger}
            isService={isService}
        />
    )
}
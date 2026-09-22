"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { RepuestoForm, RepuestoData } from "./RepuestoForm"
import { Button } from "@/componentes/ui/button"
import { Plus } from "lucide-react"

type Props = {
    onRepuestoNuevo: (repuesto: any) => void
    trigger?: React.ReactNode
}

export function AgregarRepuesto({ onRepuestoNuevo, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: RepuestoData) => {
        if (!values.name || !values.price) {
            toast.error("Llenar los campos obligatorios (Nombre y Precio)")
            return
        }

        if (!values.category_id) {
            toast.error("Por favor selecciona una categoría")
            return
        }

        const isService = values.type === "servicio"

        if (!isService && (values.stock === "" || values.stock === undefined)) {
            toast.error("Ingresa el stock disponible")
            return
        }

        setIsSubmitting(true)

        const insertPayload: any = {
            name: values.name.trim(),
            description: values.description ? values.description.trim() : null,
            category: values.category || null,
            category_id: values.category_id,
            active: true
        }

        if (isService) {
            insertPayload.type = 'servicio'
            insertPayload.price = parseFloat(values.price) || 0
            insertPayload.cost = null
            insertPayload.stock = null
            insertPayload.stock_min = null
        } else {
            insertPayload.type = 'product'
            insertPayload.price = parseFloat(values.price) || 0
            insertPayload.cost = parseFloat(values.cost) || 0
            insertPayload.stock = parseInt(values.stock) || 0
            insertPayload.stock_min = values.stock_min ? parseInt(values.stock_min) : 0
        }

        const { data, error } = await supabase
            .from("products")
            .insert([insertPayload])
            .select()
            .single()
        
        if (error) {
            toast.error(isService ? "Error al guardar el servicio" : "Error al guardar el producto")
            console.error(error)
        } else if (data) {
            onRepuestoNuevo(data)
            toast.success(isService ? "Servicio agregado exitosamente!" : "Producto agregado exitosamente!")
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || (
        <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
        </Button>
    )

    return (
        <RepuestoForm
            title="Nuevo Registro"
            description="Agrega un nuevo producto o servicio al inventario"
            submitLabel="Guardar"
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={defaultTrigger}
            allowTypeSelection={true}
        />
    )
}
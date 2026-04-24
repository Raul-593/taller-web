"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { ProvedorForm } from "./ProvedorForm"

type Props = {
    onProvedorNuevo: (provedor: any) => void
    trigger?: React.ReactNode
}

export function AgregarProvedor({ onProvedorNuevo, trigger}: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if(!values.name){
            toast.error("El nombre es obligatorio")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("suppliers")
            .insert([{
                name: values.name,
                phone: values.phone,
                address: values.address,
                active: values.active
            }])
            .select()
            .single()
        
        if (error) {
            toast.error("Error al guardar Proveedor"); 
            console.error(error)
        } else if (data) {
            onProvedorNuevo(data);
            toast.success("Proveedor Agregado Exitosamente!");
            setIsOpen(false);
        }
        setIsSubmitting(false)
    }

    return (
        <ProvedorForm
            title="Agregar Proveedor"
            description="Agregar nuevos proveedores"
            submitLabel="Agregar Proveedor"
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={trigger}
        />
    )
}

"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { ClienteForm } from "./ClienteForm"

type Props = {
    onClienteAgregado: (cliente: any) => void
    trigger?: React.ReactNode
}

export function AgregarClienteDialog({ onClienteAgregado, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if (!values.name.trim()) { 
            toast.error("El nombre es obligatorio")
            return 
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
        .from("customers")
        .insert([{ 
            name: values.name.trim(), 
            phone: values.phone.trim() || null, 
            address: values.address.trim() || null 
        }])
        .select("id, name, phone, address")
        .single()

        if (error) { toast.error("Error al crear el cliente"); console.error(error)}
        else if (data)  { 
            onClienteAgregado(data); 
            toast.success("Cliente creado con Exito"); 
            setIsOpen(false); 
        }
        setIsSubmitting(false)
    }

    return (
        <ClienteForm 
            title="Agregar Cliente"
            description="Ingresa los datos del nuevo cliente."
            submitLabel="Guardar Cliente"
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    )
}

"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { ClienteForm } from "./ClienteForm"
import { Button } from "@/componentes/ui/button"

type Props = {
    cliente: any
    onClienteActualizado: (cliente: any) => void
    trigger?: React.ReactNode
}

export function EditarClienteDialog({ cliente, onClienteActualizado, trigger }: Props) {
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
        .update({ 
            name: values.name.trim(), 
            phone: values.phone.trim() || null, 
            address: values.address.trim() || null 
        })
        .eq('id', cliente.id)
        .select("id, name, phone, address")
        .single()

        if (error) { 
            toast.error("Error al actualizar el cliente")
            console.error(error)
        } else if (data)  { 
            onClienteActualizado(data); 
            toast.success("Cliente actualizado con éxito"); 
            setIsOpen(false); 
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || <Button variant="outline" size="sm"> Editar </Button>

    return (
        <ClienteForm 
            title="Editar Cliente"
            description="Modifica los datos del cliente."
            submitLabel="Actualizar Cliente"
            trigger={defaultTrigger}
            initialData={cliente}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    )
}

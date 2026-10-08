"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { ProvedorForm } from "./ProvedorForm"
import { Button } from "@/componentes/ui/button"


type Props = {
    provedores: any
    onProvedoresActualizado: () => void
}

export function EditarProvedorDialog({ provedores, onProvedoresActualizado }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if(!values.name){
            toast.error("El nombre es obligatorio")
            return
        }
        setIsSubmitting(true)

        const { error } = await supabase
            .from("suppliers")
            .update({
                name: values.name,
                phone: values.phone,
                address: values.address,
                active: values.active
            })
            .eq("id", provedores.id)
        
        if (error) {
            toast.error("Error al actualizar Proveedor")
            console.error(error)
        } else {
            toast.success("Proveedor actualizado exitosamente")
            onProvedoresActualizado()
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    return (
        <ProvedorForm
            title="Editar Proveedor"
            description="Modifica los datos del proveedor"
            submitLabel="Guardar Cambios"
            initialData={provedores}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={
                <Button variant="outline" size="sm">
                    Editar
                </Button>
            }
        />
    )
}

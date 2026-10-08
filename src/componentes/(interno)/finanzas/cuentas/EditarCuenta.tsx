"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { CuentaForm } from "./CuentaForm"
import { Button } from "@/componentes/ui/button"

type Props = {
    cuenta: any
    onCuentaActualizada: (cuenta: any) => void
    trigger?: React.ReactNode
}

export function EditarCuentaDialog({ cuenta, onCuentaActualizada, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if (!values.name) {
            toast.error("El nombre es obligatorio")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("accounts")
            .update({
                name: values.name,
                type: values.type,
                initial_balance: parseFloat(values.initial_balance) || 0,
                initial_balance_date: values.initial_balance_date,
                is_active: values.is_active,
            })
            .eq("id", cuenta.id)
            .select()
            .single()

        if (error) {
            toast.error("Error al actualizar la cuenta")
            console.error(error)
        } else if (data) {
            onCuentaActualizada(data)
            toast.success("Cuenta actualizada con éxito")
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || <Button variant="outline" size="sm">Editar</Button>

    return (
        <CuentaForm
            title="Editar Cuenta"
            description="Modifica los datos de la cuenta"
            submitLabel="Guardar Cambios"
            initialData={cuenta}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={defaultTrigger}
            isEditing
        />
    )
}
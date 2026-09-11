"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { CuentaForm } from "./CuentaForm"

type Props = {
    onCuentaAgregada: (cuenta: any) => void
    trigger?: React.ReactNode
}

export function AgregarCuenta({ onCuentaAgregada, trigger }: Props) {
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
            .insert([{
                name: values.name,
                type: values.type,
                initial_balance: parseFloat(values.initial_balance) || 0,
                initial_balance_date: values.initial_balance_date,
            }])
            .select()
            .single()

        if (error) {
            toast.error("Error al crear la cuenta")
            console.error(error)
        } else if (data) {
            onCuentaAgregada(data)
            toast.success("Cuenta creada con éxito")
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    return (
        <CuentaForm
            title="Agregar Cuenta"
            description="Registra una nueva cuenta (caja chica, banco, etc.)"
            submitLabel="Guardar Cuenta"
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
        />
    )
}
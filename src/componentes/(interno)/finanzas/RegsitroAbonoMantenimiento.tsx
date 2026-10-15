"use client"

import { useState } from "react"
import { FormularioAbono, DatosAbono } from "@/componentes/(interno)/finanzas/FormularioAbono"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"

type Props = {
    mantenimiento: any
    accounts: any[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onAbonoRegistrado: () => void
}

export function RegistrarAbonoMantenimiento({ mantenimiento, accounts, isOpen, onOpenChange, onAbonoRegistrado }: Props) {
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Guarda el abono del mantenimiento en Supabase.
    const handleGuardar = async (datos: DatosAbono) => {
        setIsSubmitting(true)

        const { error } = await supabase.from("maintenance_payments").insert([{
            maintenance_id: mantenimiento.id,
            amount: parseFloat(datos.monto),
            payment_date: datos.fecha,
            payment_method: datos.metodoPago,
            reference: datos.referencia.trim() || null,
            notes: datos.notas.trim() || null,
            account_id: datos.cuentaId,
        }])

        if (error) {
            toast.error("Error al registrar el abono")
            console.error(error)
        } else {
            toast.success("Abono registrado con éxito")
            onAbonoRegistrado()
        }
        setIsSubmitting(false)
    }

    return (
        <FormularioAbono
            titulo="Registrar Abono"
            descripcion={`Mantenimiento — ${mantenimiento.bicycles?.customers?.name || "Cliente"}`}
            cuentas={accounts}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleGuardar}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Abono"
        />
    )
}

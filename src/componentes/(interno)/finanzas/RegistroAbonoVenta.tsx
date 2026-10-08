"use client"

import { useState } from "react"
import { FormularioAbono, DatosAbono } from "@/componentes/(interno)/finanzas/FormularioAbono"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"

type Props = {
    venta: any
    accounts: any[]
    saldoPendiente?: number
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onAbonoRegistrado: () => void
}

export function RegistrarAbonoVenta({ venta, accounts, saldoPendiente, isOpen, onOpenChange, onAbonoRegistrado }: Props) {
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Guarda el abono de la venta en Supabase.
    const handleGuardar = async (datos: DatosAbono) => {
        setIsSubmitting(true)

        const { error } = await supabase.from("payments").insert([{
            sale_id: venta.id,
            amount: parseFloat(datos.monto),
            payment_date: datos.fecha,
            payment_method: datos.metodoPago,
            reference: datos.referencia.trim() || null,
            notes: datos.notas.trim() || null,
            account_id: datos.cuentaId,
            source: "manual",
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
            descripcion={`Venta de ${venta.customers?.name || "cliente"} — ${venta.sales_date}`}
            cuentas={accounts}
            saldoPendiente={saldoPendiente}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleGuardar}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Abono"
        />
    )
}

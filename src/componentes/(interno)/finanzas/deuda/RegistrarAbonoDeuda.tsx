"use client"

import { useState } from "react"
import { FormularioAbono, DatosAbono } from "@/componentes/(interno)/finanzas/FormularioAbono"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"

type Props = {
    deuda: any
    accounts: any[]
    categorias: any[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onAbonoRegistrado: () => void
}

export function RegistrarAbonoDeuda({ deuda, accounts, categorias, isOpen, onOpenChange, onAbonoRegistrado }: Props) {
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const categoriaPagoDeudas = categorias.find((c) => c.name === "Pago de Deudas" && c.category_type === "gasto")

    // Guarda el pago de la deuda como movimiento en Supabase.
    const handleGuardar = async (datos: DatosAbono) => {
        if (!categoriaPagoDeudas) {
            toast.error("No se encontró la categoría 'Pago de Deudas'. Revísala en Categorías antes de continuar.")
            return
        }

        setIsSubmitting(true)

        const { error } = await supabase.from("movimientos").insert([{
            account_id: datos.cuentaId,
            category_id: categoriaPagoDeudas.id,
            amount: parseFloat(datos.monto),
            movement_date: datos.fecha,
            description: datos.notas.trim() || `Abono a deuda — ${deuda.creditor}`,
            reference_type: "debt_payment",
            reference_id: deuda.id,
        }])

        if (error) {
            toast.error("Error al registrar el pago")
            console.error(error)
        } else {
            toast.success("Pago registrado con éxito")
            onAbonoRegistrado()
        }
        setIsSubmitting(false)
    }

    return (
        <FormularioAbono
            titulo="Registrar Pago de Deuda"
            descripcion={`${deuda.creditor} — ${deuda.description || "Sin descripción"}`}
            cuentas={accounts}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleGuardar}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Pago"
            mostrarMetodoPago={false}
            mostrarReferencia={false}
            etiquetaNotas="Descripción"
            alerta={!categoriaPagoDeudas ? (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    No se encontró la categoría "Pago de Deudas". Puede haber sido renombrada o eliminada.
                </div>
            ) : undefined}
        />
    )
}

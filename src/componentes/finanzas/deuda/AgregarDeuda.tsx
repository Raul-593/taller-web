"use client"

import { useState } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"

type Props = {
    onDeudaAgregada: (deuda: any) => void
    trigger?: React.ReactNode
}

export function AgregarDeuda({ onDeudaAgregada, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [creditor, setCreditor] = useState("")
    const [description, setDescription] = useState("")
    const [totalAmount, setTotalAmount] = useState("")
    const [dueDate, setDueDate] = useState("")

    function reset() {
        setCreditor("")
        setDescription("")
        setTotalAmount("")
        setDueDate("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!creditor.trim() || !totalAmount || parseFloat(totalAmount) <= 0) {
            toast.error("Llenar el acreedor y un monto total mayor a 0")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("debts")
            .insert([{
                creditor: creditor.trim(),
                description: description.trim() || null,
                total_amount: parseFloat(totalAmount),
                due_date: dueDate || null,
                status: "pendiente",
            }])
            .select()
            .single()

        if (error) {
            toast.error("Error al registrar la deuda")
            console.error(error)
        } else if (data) {
            onDeudaAgregada(data)
            toast.success("Deuda registrada con éxito")
            reset()
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    return (
        <FormDialog
            title="Registrar Deuda"
            description="Préstamo bancario, personal, o cualquier deuda sin origen en una compra"
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={(open) => { setIsOpen(open); if (!open) reset() }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Deuda"
        >
            <div className="grid gap-2">
                <Label htmlFor="creditor">Acreedor</Label>
                <Input id="creditor" value={creditor} onChange={(e) => setCreditor(e.target.value)} placeholder="Ej. Banco Pichincha" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej. Préstamo para compra de herramientas" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="totalAmount">Monto Total</Label>
                    <Input id="totalAmount" type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                    <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
            </div>
        </FormDialog>
    )
}
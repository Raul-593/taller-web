"use client"

import { useState } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
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

    const [amount, setAmount] = useState("")
    const [accountId, setAccountId] = useState("")
    const [movementDate, setMovementDate] = useState(new Date().toISOString().split("T")[0])
    const [description, setDescription] = useState("")

    const cuentasActivas = accounts.filter((a) => a.is_active)
    const categoriaPagoDeudas = categorias.find((c) => c.name === "Pago de Deudas" && c.category_type === "gasto")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!categoriaPagoDeudas) {
            toast.error("No se encontró la categoría 'Pago de Deudas'. Revísala en Categorías antes de continuar.")
            return
        }
        if (!accountId || !amount || parseFloat(amount) <= 0) {
            toast.error("Llenar la cuenta y un monto mayor a 0")
            return
        }

        setIsSubmitting(true)

        const { error } = await supabase.from("movimientos").insert([{
            account_id: accountId,
            category_id: categoriaPagoDeudas.id,
            amount: parseFloat(amount),
            movement_date: movementDate,
            description: description.trim() || `Abono a deuda — ${deuda.creditor}`,
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
        <FormDialog
            title="Registrar Pago de Deuda"
            description={`${deuda.creditor} — ${deuda.description || "Sin descripción"}`}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Pago"
        >
            {!categoriaPagoDeudas && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    No se encontró la categoría "Pago de Deudas". Puede haber sido renombrada o eliminada.
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="movementDate">Fecha</Label>
                    <Input id="movementDate" type="date" value={movementDate} onChange={(e) => setMovementDate(e.target.value)} />
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Cuenta</Label>
                <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">Seleccionar cuenta</option>
                    {cuentasActivas.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
            </div>
        </FormDialog>
    )
}
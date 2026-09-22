"use client"

import { useState } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { payment_methods } from "@/lib/finanzas/labels"

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

    const [amount, setAmount] = useState("")
    const [accountId, setAccountId] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("efectivo")
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
    const [reference, setReference] = useState("")
    const [notes, setNotes] = useState("")

    const cuentasActivas = accounts.filter((a) => a.is_active)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!accountId || !amount || parseFloat(amount) <= 0) {
            toast.error("Llenar la cuenta y un monto mayor a 0")
            return
        }
        setIsSubmitting(true)

        const { error } = await supabase.from("payments").insert([{
            sale_id: venta.id,
            amount: parseFloat(amount),
            payment_date: paymentDate,
            payment_method: paymentMethod,
            reference: reference.trim() || null,
            notes: notes.trim() || null,
            account_id: accountId,
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
        <FormDialog
            title="Registrar Abono"
            description={`Venta de ${venta.customers?.name || "cliente"} — ${venta.sales_date}`}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Abono"
        >
            {typeof saldoPendiente === "number" && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 font-medium">
                    Saldo pendiente actual: ${saldoPendiente.toFixed(2)}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input id="amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="paymentDate">Fecha</Label>
                    <Input id="paymentDate" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
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
                <Label>Método de Pago</Label>
                <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {payment_methods.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="reference">Referencia</Label>
                <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Opcional (ej. número de transferencia)" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="notes">Notas</Label>
                <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
            </div>
        </FormDialog>
    )
}
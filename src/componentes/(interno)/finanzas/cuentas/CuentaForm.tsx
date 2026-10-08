"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { account_type } from "@/lib/finanzas/labels"
import type { AccountType } from "@/lib/finanzas/types"

type CuentaData = {
    name: string
    type: AccountType
    initial_balance: string
    initial_balance_date: string
    is_active: boolean
}

type Props = {
    title: string
    description: string
    submitLabel: string
    initialData?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CuentaData) => Promise<void>
    isSubmitting: boolean
    trigger?: React.ReactNode
    isEditing?: boolean
}

export function CuentaForm({
    title,
    description,
    submitLabel,
    initialData,
    isOpen,
    onOpenChange,
    onSubmit,
    isSubmitting,
    trigger,
    isEditing = false,
}: Props) {
    const [name, setName] = useState("")
    const [type, setType] = useState<AccountType>("efectivo")
    const [initialBalance, setInitialBalance] = useState("0")
    const [initialBalanceDate, setInitialBalanceDate] = useState(new Date().toISOString().split("T")[0])
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setType(initialData.type || "efectivo")
                setInitialBalance(initialData.initial_balance?.toString() || "0")
                setInitialBalanceDate(initialData.initial_balance_date || new Date().toISOString().split("T")[0])
                setIsActive(initialData.is_active ?? true)
            } else {
                setName("")
                setType("efectivo")
                setInitialBalance("0")
                setInitialBalanceDate(new Date().toISOString().split("T")[0])
                setIsActive(true)
            }
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            name: name.trim(),
            type,
            initial_balance: initialBalance,
            initial_balance_date: initialBalanceDate,
            is_active: isActive,
        })
    }

    return (
        <FormDialog
            title={title}
            description={description}
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
        >
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre de la Cuenta</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Caja Chica" />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="type">Tipo</Label>
                <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {account_type.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="initialBalance">Saldo Inicial</Label>
                    <Input
                        id="initialBalance"
                        type="number"
                        step="0.01"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="initialBalanceDate">Fecha del Saldo Inicial</Label>
                    <Input
                        id="initialBalanceDate"
                        type="date"
                        value={initialBalanceDate}
                        onChange={(e) => setInitialBalanceDate(e.target.value)}
                    />
                </div>
            </div>

            {isEditing && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                    Cambiar el saldo inicial o su fecha recalcula el saldo actual de la cuenta desde ese punto.
                    Solo edítalo si te equivocaste al crearla — para ajustes del día a día registra un movimiento,
                    no cambies esto.
                </div>
            )}

            {isEditing && (
                <div className="grid gap-2">
                    <Label htmlFor="isActive">Estado</Label>
                    <select
                        id="isActive"
                        value={isActive ? "true" : "false"}
                        onChange={(e) => setIsActive(e.target.value === "true")}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="true">Activa</option>
                        <option value="false">Inactiva</option>
                    </select>
                </div>
            )}
        </FormDialog>
    )
}
"use client"

import { useState, useMemo } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { getSelectableCategories } from "@/lib/finanzas/categorias"
import type { Category, CategoryType } from "@/lib/finanzas/types"

type Props = {
    cuentas: any[]
    categorias: Category[]
    onMovimientoAgregado: (movimiento: any) => void
    trigger?: React.ReactNode
}

export function AgregarMovimiento({ cuentas, categorias, onMovimientoAgregado, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form data
    // Default a la fecha actual (formato YYYY-MM-DD para input type="date")
    const [categoryType, setCategoryType] = useState<CategoryType>("gasto")
    const [movementDate, setMovementDate] = useState(() => new Date().toISOString().split("T")[0])
    const [accountId, setAccountId] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")

    const cuentasActivas = cuentas.filter((a) => a.is_active)
    const opcionesCategoria = useMemo(
        () => getSelectableCategories(categorias, categoryType),
        [categorias, categoryType]
    )

    // Agrupa por "group" para renderizar <optgroup> -- undefined/null va suelto arriba
    const sinGrupo = opcionesCategoria.filter((c) => !c.group)
    const gruposUnicos = [...new Set(opcionesCategoria.filter((c) => c.group).map((c) => c.group))]

    function reset() {
        setCategoryType("gasto")
        setMovementDate(new Date().toISOString().split("T")[0])
        setAccountId("")
        setCategoryId("")
        setAmount("")
        setDescription("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!accountId || !categoryId || !amount || parseFloat(amount) <= 0) {
            toast.error("Llenar los campos y un monto mayor a 0")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("movimientos")
            .insert([{
                account_id: accountId,
                category_id: categoryId,
                amount: parseFloat(amount),
                movement_date: movementDate,
                description: description.trim() || null,
            }])
            .select()
            .single()

        if (error) {
            toast.error("Error al registrar el movimiento")
            console.error(error)
        } else if(data) {
            onMovimientoAgregado(data)
            toast.success("Movimiento registrado exitosamente")
            reset()
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    return (
        <FormDialog
            title="Registrar Movimiento Manual"
            description="Ingresa los datos del nuevo ingreso o gasto."
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={(open) => { setIsOpen(open); if (!open) reset() }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Movimiento"
        >
            <div className="grid gap-2">
                <Label>Tipo</Label>
                <select
                    value={categoryType}
                    onChange={(e) => { setCategoryType(e.target.value as CategoryType); setCategoryId("") }}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="gasto">Gasto</option>
                    <option value="ingreso">Ingreso</option>
                </select>
            </div>
            
            <div className="grid gap-2">
                <Label>Categoría</Label>
                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">Seleccionar categoría</option>
                    {sinGrupo.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    {gruposUnicos.map((grupo) => (
                        <optgroup key={grupo} label={grupo!}>
                            {opcionesCategoria
                                .filter((c) => c.group === grupo)
                                .map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            <div className="grid gap-2">
                    <Label>Cuenta</Label>
                    <select 
                        value={accountId}
                        onChange={e => setAccountId(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                        <option value="">Seleccionar Cuenta</option>
                        {cuentasActivas.map((a) => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="amount">Monto</Label>
                    <Input 
                        id="amount"
                        type="number" 
                        step="0.01"
                        min="0.01"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="Ej. 150.50" 
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input 
                        id="description" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Motivo del movimiento..." 
                    />
                </div>
            </div>
        </FormDialog>
    )
}

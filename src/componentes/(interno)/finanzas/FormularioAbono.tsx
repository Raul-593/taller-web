"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/(interno)/FormDialog"
import { SelectCuenta } from "@/componentes/(interno)/finanzas/SelectCuenta"
import { payment_methods } from "@/lib/finanzas/labels"
import { toast } from "sonner"

// Datos que el formulario entrega al guardar. El componente padre
// se encarga de persistirlos en Supabase según su propio caso.
export interface DatosAbono {
    monto: string
    fecha: string
    cuentaId: string
    metodoPago: string
    referencia: string
    notas: string
}

interface FormularioAbonoProps {
    titulo: string
    descripcion: string
    cuentas: { id: string; name: string; is_active?: boolean }[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (datos: DatosAbono) => Promise<void> | void
    isSubmitting?: boolean
    saldoPendiente?: number
    submitLabel?: string
    // La deuda no usa método de pago ni referencia; se ocultan con estas props.
    mostrarMetodoPago?: boolean
    mostrarReferencia?: boolean
    etiquetaNotas?: string
    // Aviso opcional al inicio del diálogo (ej. categoría faltante en deudas).
    alerta?: React.ReactNode
}

// Diálogo de abono/pago compartido por ventas, deudas y mantenimientos.
// Valida lo básico (cuenta y monto mayor a 0) y delega el guardado al padre.
export function FormularioAbono({
    titulo,
    descripcion,
    cuentas,
    isOpen,
    onOpenChange,
    onSubmit,
    isSubmitting,
    saldoPendiente,
    submitLabel = "Guardar Abono",
    mostrarMetodoPago = true,
    mostrarReferencia = true,
    etiquetaNotas = "Notas",
    alerta,
}: FormularioAbonoProps) {
    const [monto, setMonto] = useState("")
    const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0])
    const [cuentaId, setCuentaId] = useState("")
    const [metodoPago, setMetodoPago] = useState("transferencia")
    const [referencia, setReferencia] = useState("")
    const [notas, setNotas] = useState("")

    const cuentasActivas = cuentas.filter((a) => a.is_active !== false)

    /**
     * Resetea todos los campos del formulario a sus valores iniciales.
     */
    const resetForm = () => {
        setMonto("")
        setFecha(new Date().toISOString().split("T")[0])
        setCuentaId("")
        setMetodoPago("transferencia")
        setReferencia("")
        setNotas("")
    }

    // Resetea los campos cada vez que la ventana se cierra
    useEffect(() => {
        if (!isOpen) {
            resetForm()
        }
    }, [isOpen])

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetForm()
        }
        onOpenChange(open)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!cuentaId || !monto || parseFloat(monto) <= 0) {
            toast.error("Llenar la cuenta y un monto mayor a 0")
            return
        }
        onSubmit({ monto, fecha, cuentaId, metodoPago, referencia, notas })
    }

    return (
        <FormDialog
            title={titulo}
            description={descripcion}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
        >
            {alerta}
            {typeof saldoPendiente === "number" && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 font-medium">
                    Saldo pendiente actual: ${saldoPendiente.toFixed(2)}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="abono-monto">Monto</Label>
                    <Input
                        id="abono-monto"
                        type="number"
                        step="0.01"
                        value={monto}
                        onChange={(e) => setMonto(e.target.value)}
                        placeholder="0.00"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="abono-fecha">Fecha</Label>
                    <Input
                        id="abono-fecha"
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                    />
                </div>
            </div>

            <SelectCuenta
                cuentas={cuentasActivas}
                value={cuentaId}
                onChange={setCuentaId}
                label="Cuenta"
                required
            />

            {mostrarMetodoPago && (
                <div className="grid gap-2">
                    <Label>Método de Pago</Label>
                    <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        {payment_methods.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            )}

            {mostrarReferencia && (
                <div className="grid gap-2">
                    <Label htmlFor="abono-referencia">Referencia</Label>
                    <Input
                        id="abono-referencia"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                        placeholder="Opcional (ej. número de transferencia)"
                    />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="abono-notas">{etiquetaNotas}</Label>
                <Input
                    id="abono-notas"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Opcional"
                />
            </div>
        </FormDialog>
    )
}

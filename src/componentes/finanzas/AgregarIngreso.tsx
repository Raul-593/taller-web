"use client"

import { useState } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"

type Props = {
    onIngresoAgregado: (ingreso: any) => void
    trigger?: React.ReactNode
}

export function AgregarIngreso({ onIngresoAgregado, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos del Ingreso
    const [salesDate, setSalesDate] = useState("")
    const [salesType, setSalesType] = useState("retail")
    const [subTotal, setSubTotal] = useState("")
    const [discount, setDiscount] = useState("")
    const [total, setTotal] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("transferencia")
    const [status, setStatus] = useState("completado")
    const [observacion, setObservacion] = useState("")

    function reset() { 
        setSalesDate("")
        setSalesType("retail")
        setSubTotal("")
        setDiscount("")
        setTotal("")
        setPaymentMethod("transferencia")
        setStatus("completado")
        setObservacion("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!salesType || !subTotal || !total || !paymentMethod) {
            toast.error("Existen campos obligatorios vacíos")
            return
        }

        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("sales")
            .insert([{
                sales_date: salesDate || null,
                sales_type: salesType,
                sub_total: parseFloat(subTotal),
                discount: discount ? parseFloat(discount) : 0,
                total: parseFloat(total),
                payment_method: paymentMethod,
                status: status,
                observacion: observacion.trim() || null,
            }])
            .select()
            .single()

        if (error) {
            toast.error("Error al registrar el ingreso")
            console.error(error)
        } else if (data) {
            onIngresoAgregado(data)
            toast.success("Ingreso registrado correctamente")
            reset()
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || (
        <Button variant="default" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg px-6 font-semibold"> 
            Ingresos 
        </Button>
    )

    return (
        <FormDialog
            title="Registrar Ingreso"
            description="Ingresa los datos de la nueva venta del taller"
            trigger={defaultTrigger}
            isOpen={isOpen}
            onOpenChange={(open) => { setIsOpen(open); if (!open) reset() }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Ingreso"
            className="sm:max-w-2xl"
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="salesDate">Fecha de Venta</Label>
                    <Input id="salesDate" type="date" value={salesDate} onChange={e => setSalesDate(e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <Label>Tipo de Venta *</Label>
                    <select 
                        value={salesType}
                        onChange={e => setSalesType(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="retail">Productos (Retail)</option>
                        <option value="service">Servicio</option>
                        <option value="mixed">Mixto (Mixed)</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="subTotal">Sub Total *</Label>
                    <Input id="subTotal" type="number" step="0.01" value={subTotal} onChange={e => setSubTotal(e.target.value)} placeholder="0.00" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="discount">Descuento</Label>
                    <Input id="discount" type="number" step="0.01" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0.00" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="total">Total *</Label>
                    <Input id="total" type="number" step="0.01" value={total} onChange={e => setTotal(e.target.value)} placeholder="0.00" />
                </div>

                <div className="grid gap-2">
                    <Label>Método de Pago *</Label>
                    <select 
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <Label>Estado de la Venta</Label>
                    <select 
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="completado">Completado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                <div className="grid gap-2 col-span-2">
                    <Label htmlFor="observacion">Observación</Label>
                    <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Detalles de la venta..." />
                </div>
            </div>
        </FormDialog>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"

type Props = {
    onGastoAgregado: (gasto: any) => void
    trigger?: React.ReactNode
}

export function AgregarGasto({ onGastoAgregado, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos del Gasto
    const [purchaseDate, setPurchaseDate] = useState("")
    const [description, setDescription] = useState("")
    const [subTotal, setSubTotal] = useState("")
    const [total, setTotal] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("transferencia")
    const [status, setStatus] = useState("completado")
    const [observacion, setObservacion] = useState("")
    
    // Proveedor
    const [suppliers, setSuppliers] = useState<{ id: string, name: string }[]>([])
    const [supplierId, setSupplierId] = useState<string | null>(null)

    // Cargar Proveedores
    useEffect(() => {
        if (isOpen && suppliers.length === 0) {
            const fetchSuppliers = async () => {
                const { data } = await supabase
                    .from("suppliers")
                    .select("id, name")
                    .order("name", { ascending: true })
                if (data) setSuppliers(data)
            }
            fetchSuppliers()
        }
    }, [isOpen, supabase, suppliers.length])

    function reset() { 
        setPurchaseDate("")
        setSupplierId(null)
        setDescription("")
        setSubTotal("")
        setTotal("")
        setPaymentMethod("transferencia")
        setStatus("completado")
        setObservacion("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!purchaseDate || !subTotal || !total || !paymentMethod || !supplierId) {
            toast.error("Existen campos obligatorios vacíos")
            return
        }

        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("purchases")
            .insert([{
                purchase_date: purchaseDate, // en compras es mandatorio
                supplier_id: supplierId,
                description: description.trim() || null,
                sub_total: parseFloat(subTotal),
                total: parseFloat(total),
                payment_method: paymentMethod,
                status: status,
                observacion: observacion.trim() || null,
            }])
            .select()
            .single()

        if (error) {
            toast.error("Error al registrar el gasto")
            console.error(error)
        } else if (data) {
            onGastoAgregado(data)
            toast.success("Gasto registrado correctamente")
            reset()
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || (
        <Button variant="default" className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg px-6 font-semibold"> 
            Gastos 
        </Button>
    )

    return (
        <FormDialog
            title="Registrar Gasto"
            description="Ingresa los datos de la compra del taller"
            trigger={defaultTrigger}
            isOpen={isOpen}
            onOpenChange={(open) => { setIsOpen(open); if (!open) reset() }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Gasto"
            className="sm:max-w-2xl"
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="purchaseDate">Fecha de Compra *</Label>
                    <Input id="purchaseDate" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} />
                </div>

                <div className="grid gap-2">
                    <Label>Proveedor *</Label>
                    <select 
                        value={supplierId || ""}
                        onChange={e => setSupplierId(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                        <option value="">Seleccionar Proveedor</option>
                        {suppliers.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2 col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej. Lote de llantas..." />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="subTotal">Sub Total *</Label>
                    <Input id="subTotal" type="number" step="0.01" value={subTotal} onChange={e => setSubTotal(e.target.value)} placeholder="0.00" />
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
                    <Label>Estado del Pago</Label>
                    <select 
                        value={status}
                        onChange={e => setStatus(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="completado">Pagado</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                <div className="grid gap-2 col-span-2">
                    <Label htmlFor="observacion">Observación</Label>
                    <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Detalles de la compra..." />
                </div>
            </div>
        </FormDialog>
    )
}

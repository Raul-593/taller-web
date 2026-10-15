"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/(interno)/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { CustomerSelect } from "@/componentes/ui/CustomerSelect"
import { Product } from "@/componentes/ui/ProductSelect"
import { FormularioItemProducto } from "@/componentes/(interno)/finanzas/FormularioItemProducto"
import { BicycleSelect } from "@/componentes/ui/BicycleSelect"
import { Button } from "@/componentes/ui/button"
import { PlusCircle } from "lucide-react"
import { AgregarClienteDialog } from "@/componentes/(interno)/clientes/AgregarClienteDialog"
import { AgregarBicicleta } from "@/componentes/(interno)/bicicletas/AgregarBicicleta"

type Props = {
    onMantenimientoAgregado: (mantenimiento: any) => void
    trigger?: React.ReactNode
}

export function AgregarMantenimiento({ onMantenimientoAgregado, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos del Mantenimiento
    const [bicycle_id, setBicycle_id] = useState<string | null>(null)
    const [clienteId, setClienteId] = useState<string | null>(null)
    const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0])
    const [deliveryDate, setDeliveryDate] = useState("")
    const [description, setDescription] = useState("")
    const [observacion, setObservacion] = useState("")
    const [cost, setCost] = useState("0")
    const [estado, setEstado] = useState("recibido")

    // Ítems
    const [items, setItems] = useState<any[]>([])

    // Cálculo automático del costo
    useEffect(() => {
        const total = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price) || 0), 0)
        setCost(total.toString())
    }, [items])

    function reset() {
        setBicycle_id(null)
        setClienteId(null)
        setServiceDate(new Date().toISOString().split('T')[0])
        setDeliveryDate("")
        setDescription("")
        setObservacion("")
        setCost("0")
        setEstado("recibido")
        setItems([])
    }

    // Ítem nuevo con la forma que usa este formulario.
    const crearItemVacio = () => ({ product_id: "", quantity: 1, unit_price: 0, item_type: "retail", description: "" })

    // El precio se toma del producto y se clasifica como servicio o repuesto.
    const alSeleccionarProducto = (item: any, product: Product) => ({
        ...item,
        unit_price: product.price || 0,
        item_type: product.category === 'Servicio' ? 'service' : 'retail',
        description: product.name,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!bicycle_id || !serviceDate || !description) {
            toast.error("Llenar campos obligatorios (Bicicleta, Fecha, Descripción)")
            return
        }
        setIsSubmitting(true)

        // 1. Crear el registro de mantenimiento
        const { data: record, error: recordError } = await supabase
            .from("maintenance_records")
            .insert([{
                service_date: serviceDate,
                delivery_date: deliveryDate || null,
                description: description.trim(),
                observation: observacion.trim(),
                cost: parseFloat(cost),
                status: estado,
                bicycle_id: bicycle_id
            }])
            .select()
            .single()

        if (recordError) {
            toast.error("Error al guardar mantenimiento")
            console.error(recordError)
            setIsSubmitting(false)
            return
        }

        // 2. Insertar ítems si existen
        if (items && items.length > 0) {
            const itemsToInsert = items
                .filter(i => i.product_id)
                .map(i => ({
                    maintenance_id: record.id,
                    product_id: i.product_id,
                    item_type: i.item_type,
                    description: i.description,
                    quantity: parseInt(i.quantity),
                    unit_price: parseFloat(i.unit_price)
                }))

            if (itemsToInsert.length > 0) {
                const { error: itemsError } = await supabase
                    .from("maintenance_items")
                    .insert(itemsToInsert)

                if (itemsError) {
                    toast.error("Mantenimiento creado, pero hubo un error con los ítems")
                    console.error(itemsError)
                }
            }
        }

        toast.success("Mantenimiento guardado correctamente")
        onMantenimientoAgregado(record)
        setIsOpen(false)
        reset()
        setIsSubmitting(false)
    }

    return (
        <FormDialog
            title="Agregar Mantenimiento"
            description="Registra un nuevo mantenimiento y sus repuestos/servicios"
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Mantenimiento"
            className="sm:max-w-4xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda: Datos Básicos */}
                <div className="space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <CustomerSelect
                                value={clienteId}
                                onChange={(id) => {
                                    setClienteId(id)
                                    setBicycle_id(null)
                                }}
                            />
                        </div>
                        <AgregarClienteDialog 
                            onClienteAgregado={(c) => setClienteId(c.id)}
                            trigger={<Button type="button" variant="outline" size="icon" className="shrink-0"><PlusCircle className="h-4 w-4" /></Button>} 
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <div className="flex-1">
                            <BicycleSelect
                                customerId={clienteId}
                                value={bicycle_id}
                                onChange={setBicycle_id}
                                disabled={!clienteId}
                            />
                        </div>
                        <AgregarBicicleta 
                            onBicicletaAgregado={(b) => setBicycle_id(b.id)}
                            trigger={<Button type="button" variant="outline" size="icon" className="shrink-0" disabled={!clienteId}><PlusCircle className="h-4 w-4" /></Button>}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="serviceDate">Fecha de Servicio</Label>
                            <Input id="serviceDate" type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="deliveryDate">Entrega Tentativa</Label>
                            <Input id="deliveryDate" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Descripción del Trabajo</Label>
                        <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ej: Mantenimiento general..." />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="observacion">Observación</Label>
                        <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej: Trae raspón en el marco..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="estado">Estado</Label>
                            <select 
                                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                                value={estado} 
                                onChange={e => setEstado(e.target.value)}
                            >
                                <option value="recibido">Recibido</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="completado">Completado</option>
                                <option value="entregado">Entregado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cost">Costo Total ($)</Label>
                            <div className="text-2xl font-bold text-primary px-1">
                                ${parseFloat(cost).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Ítems (Repuestos/Servicios) */}
                <div>
                    <FormularioItemProducto
                        items={items}
                        onChange={setItems}
                        titulo="Repuestos y Servicios"
                        etiquetaPrecio="Precio"
                        crearItemVacio={crearItemVacio}
                        alSeleccionarProducto={alSeleccionarProducto}
                    />
                </div>
            </div>
        </FormDialog>
    )
}

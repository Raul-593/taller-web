"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { CustomerSelect } from "@/componentes/ui/CustomerSelect"
import { BicycleSelect } from "@/componentes/ui/BicycleSelect"
import { Button } from "@/componentes/ui/button"
import { Trash2, PlusCircle } from "lucide-react"
import { AgregarClienteDialog } from "@/componentes/clientes/AgregarClienteDialog"
import { AgregarBicicleta } from "@/componentes/bicicleta/AgregarBicicleta"

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

    // Ítems y Productos
    const [products, setProducts] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])

    // Cargar productos
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from("products").select("*").order("name")
            if (data) setProducts(data)
        }
        fetchProducts()
    }, [supabase])

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

    const addItem = () => {
        setItems([...items, { product_id: "", quantity: 1, unit_price: 0, item_type: "retail", description: "" }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        const item = { ...newItems[index], [field]: value }

        if (field === "product_id") {
            const product = products.find(p => p.id === value)
            if (product) {
                item.unit_price = product.price || 0
                item.item_type = product.category === 'Servicio' ? 'service' : 'retail'
                item.description = product.name
            }
        }
        newItems[index] = item
        setItems(newItems)
    }

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
                <div className="flex flex-col border rounded-lg bg-zinc-50/50">
                    <div className="p-3 border-b bg-white flex items-center justify-between">
                        <Label className="font-bold">Repuestos y Servicios</Label>
                        <Button type="button" onClick={addItem} variant="outline" size="sm" className="h-8 text-xs">
                            + Agregar Ítem
                        </Button>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                        {(items?.length || 0) === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-white/50">
                                <p className="text-xs text-muted-foreground">No hay repuestos o servicios agregados.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg border shadow-sm space-y-2">
                                        <div className="flex gap-2">
                                            <select 
                                                value={item.product_id}
                                                onChange={e => updateItem(index, "product_id", e.target.value)}
                                                className="flex-1 bg-zinc-50 border rounded-md px-2 py-1.5 text-xs"
                                            >
                                                <option value="">Seleccionar producto/servicio...</option>
                                                {(products?.length || 0) > 0 && products.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="h-8 w-8 p-0 text-red-500">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <Label className="text-[10px] uppercase text-zinc-400 font-bold">Cant.</Label>
                                                <Input type="number" value={item.quantity} onChange={e => updateItem(index, "quantity", e.target.value)} className="h-8 text-xs" />
                                            </div>
                                            <div>
                                                <Label className="text-[10px] uppercase text-zinc-400 font-bold">Precio</Label>
                                                <Input type="number" step="0.01" value={item.unit_price} onChange={e => updateItem(index, "unit_price", e.target.value)} className="h-8 text-xs" />
                                            </div>
                                            <div className="flex flex-col justify-end">
                                                <div className="h-8 flex items-center font-bold text-xs">
                                                    ${(item.quantity * item.unit_price).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </FormDialog>
    )
}
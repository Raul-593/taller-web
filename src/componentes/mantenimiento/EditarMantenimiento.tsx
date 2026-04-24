"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"
import { Trash2, PlusCircle } from "lucide-react"

type Props = {
    mantenimiento: any
    onMantenimientoActualizado: (mantenimiento: any) => void
    trigger?: React.ReactNode
    isOpenOutside?: boolean
    onOpenChangeOutside?: (open: boolean) => void
}

export function EditarMantenimientoDialog({ mantenimiento, onMantenimientoActualizado, trigger, isOpenOutside, onOpenChangeOutside }: Props) {
    const supabase = createClient()
    const [internalOpen, setInternalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isOpen = isOpenOutside !== undefined ? isOpenOutside : internalOpen
    const setIsOpen = onOpenChangeOutside !== undefined ? onOpenChangeOutside : setInternalOpen

    // Datos del Mantenimiento
    const [bicycle_id, setBicycle_id] = useState<string | null>(null)
    const [serviceDate, setServiceDate] = useState("")
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

    // Mostrar datos del mantenimiento cuando se abre el modal
    useEffect(() => {
        if (isOpen && mantenimiento) {
            setBicycle_id(mantenimiento.bicycle_id)
            setServiceDate(mantenimiento.service_date || "")
            setDeliveryDate(mantenimiento.delivery_date || "")
            setDescription(mantenimiento.description || "")
            setObservacion(mantenimiento.observation || "") // corrected typo observacion -> observation if needed, but page query says observation
            setCost(mantenimiento.cost?.toString() || "0")
            setEstado(mantenimiento.status || "recibido")
            setItems(mantenimiento.maintenance_items || [])
        }
    }, [isOpen, mantenimiento])

    // Cálculo automático del costo basado en ítems
    useEffect(() => {
        if (items.length > 0) {
            const total = items.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unit_price) || 0), 0)
            setCost(total.toString())
        }
    }, [items])

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

    // Actualizar mantenimiento
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!serviceDate || !description) {
            toast.error("Llenar campos obligatorios")
            return
        }
        setIsSubmitting(true)

        // 1. Actualizar el registro de mantenimiento
        const { data: record, error: recordError } = await supabase
            .from("maintenance_records")
            .update({
                service_date: serviceDate,
                delivery_date: deliveryDate || null,
                description: description.trim(),
                observation: observacion.trim(),
                cost: parseFloat(cost),
                status: estado,
                bicycle_id: bicycle_id
            })
            .eq("id", mantenimiento.id)
            .select()
            .single()

        if (recordError) {
            toast.error("Error al actualizar mantenimiento")
            console.error(recordError)
            setIsSubmitting(false)
            return
        }

        // 2. Gestionar ítems: Eliminar anteriores y re-insertar (estrategia simple para edición)
        const { error: deleteError } = await supabase
            .from("maintenance_items")
            .delete()
            .eq("maintenance_id", mantenimiento.id)

        if (deleteError) {
            console.error("Error al limpiar ítems antiguos:", deleteError)
        }

        if (items && items.length > 0) {
            const itemsToInsert = items
                .filter(i => i.product_id || i.description)
                .map(i => ({
                    maintenance_id: mantenimiento.id,
                    product_id: i.product_id || null,
                    item_type: i.item_type || "retail",
                    description: i.description,
                    quantity: parseInt(i.quantity.toString()),
                    unit_price: parseFloat(i.unit_price.toString())
                }))

            if (itemsToInsert.length > 0) {
                const { error: itemsError } = await supabase
                    .from("maintenance_items")
                    .insert(itemsToInsert)

                if (itemsError) {
                    toast.error("Mantenimiento actualizado, pero hubo un error con los ítems")
                    console.error(itemsError)
                }
            }
        }

        toast.success("Mantenimiento actualizado correctamente")
        onMantenimientoActualizado(record)
        setIsOpen(false)
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || <Button variant="outline" size="sm"> Editar </Button>

    return (
        <FormDialog
            title="Detalles del Mantenimiento"
            description="Ver y editar información del mantenimiento y sus ítems"
            trigger={defaultTrigger}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Cambios"
            className="sm:max-w-4xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna Izquierda: Datos del Registro */}
                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Cliente</Label>
                        <div className="p-2 border rounded-md bg-muted/50 text-sm">
                            {mantenimiento?.bicycles?.customers?.name || "Sin cliente"}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Bicicleta</Label>
                        <div className="p-2 border rounded-md bg-muted/50 text-sm">
                            {mantenimiento?.bicycles?.brand ? `${mantenimiento.bicycles.brand} ${mantenimiento.bicycles.model || ""}` : "Sin bicicleta"}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-service-date">Fecha de Servicio</Label>
                            <Input type="date" id="edit-service-date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-delivery-date">Fecha de Entrega</Label>
                            <Input type="date" id="edit-delivery-date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-description">Descripción</Label>
                        <Input id="edit-description" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-observation">Observación</Label>
                        <Input id="edit-observation" value={observacion} onChange={e => setObservacion(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-status">Estado</Label>
                            <select 
                                id="edit-status"
                                value={estado}
                                onChange={e => setEstado(e.target.value)}
                                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="recibido">Recibido</option>
                                <option value="en_proceso">En Proceso</option>
                                <option value="completado">Completado</option>
                                <option value="entregado">Entregado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Costo Total ($)</Label>
                            <div className="text-2xl font-bold text-primary px-1">
                                ${parseFloat(cost).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Items */}
                <div className="flex flex-col border rounded-lg bg-zinc-50/50">
                    <div className="p-3 border-b bg-white flex items-center justify-between">
                        <Label className="font-bold">Repuestos y Servicios</Label>
                        <Button type="button" onClick={addItem} variant="outline" size="sm" className="h-8 text-xs">
                            + Agregar Ítem
                        </Button>
                    </div>
                    
                    <div className="p-4 flex-1 overflow-y-auto max-h-[400px]">
                        {items.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg bg-white/50">
                                <p className="text-xs text-muted-foreground">No hay repuestos o servicios agregados.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="bg-white p-3 rounded-lg border shadow-sm space-y-2">
                                        <div className="flex gap-2">
                                            <select 
                                                value={item.product_id || ""}
                                                onChange={e => updateItem(index, "product_id", e.target.value)}
                                                className="flex-1 bg-zinc-50 border rounded-md px-2 py-1.5 text-xs"
                                            >
                                                <option value="">Seleccionar producto/servicio...</option>
                                                {products.map(p => (
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
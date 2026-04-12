"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"
import { Trash2 } from "lucide-react"

type Props = {
    onIngresoAgregado: (ingreso: any) => void
    trigger?: React.ReactNode
}

export function AgregarIngreso({ onIngresoAgregado, trigger }: Props) {
    // Base de datos
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos del Ingreso
    const [salesDate, setSalesDate] = useState(new Date().toISOString())
    const [customerId, setCustomerId] = useState("")
    const [salesType, setSalesType] = useState("retail")
    const [subTotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [total, setTotal] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState("transferencia")
    const [status, setStatus] = useState("completado")
    const [observacion, setObservacion] = useState("")

    // Listas de referencia
    const [products, setProducts] = useState<any[]>([])
    const [customers, setCustomers] = useState<any[]>([])
    
    // Ítems de la venta
    const [items, setItems] = useState<any[]>([])

    // Cargar datos de referencia
    useEffect(() => {
        const fetchData = async () => {
            const [prods, custs] = await Promise.all([
                supabase.from("products").select("*"),
                supabase.from("customers").select("id, name")
            ])
            if (prods.data) setProducts(prods.data)
            if (custs.data) setCustomers(custs.data)
        }
        fetchData()
    }, [supabase])

    // Cálculo automático de totales
    useEffect(() => {
        const calculatedSubTotal = items.reduce((acc, item) => acc + (item.total || 0), 0)
        setSubTotal(calculatedSubTotal)
        setTotal(calculatedSubTotal - (Number(discount) || 0))
    }, [items, discount])

    // Limpiar formulario
    function reset() { 
        setSalesDate(new Date().toISOString())
        setSalesType("retail")
        setCustomerId("")
        setSubTotal(0)
        setDiscount(0)
        setTotal(0)
        setPaymentMethod("transferencia")
        setStatus("completado")
        setObservacion("")
        setItems([])
    }

    const addItem = () => {
        setItems([...items, { product_id: "", quantity: 1, unit_price: 0, total: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        const item = { ...newItems[index], [field]: value }
        
        // Si cambia el producto, intentar actualizar el precio unitario si el producto lo tiene
        if (field === "product_id") {
            const product = products.find(p => p.id === value)
            if (product) {
                item.unit_price = product.price || 0
            }
        }

        // Recalcular total del ítem
        item.total = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
        
        newItems[index] = item
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!salesType || total === 0 || !paymentMethod) {
            toast.error("Existen campos obligatorios vacíos o el total es 0")
            return
        }

        setIsSubmitting(true)

        // 1. Insertar la venta
        const { data: sale, error: saleError } = await supabase
            .from("sales")
            .insert([{
                sales_date: salesDate || null,
                sales_type: salesType,
                customer_id: customerId || null,
                sub_total: subTotal,
                discount: Number(discount) || 0,
                total: total,
                payment_method: paymentMethod,
                status: status,
                observacion: observacion.trim() || null,
            }])
            .select()
            .single()

        if (saleError) {
            toast.error("Error al registrar la venta")
            console.error(saleError)
            setIsSubmitting(false)
            return
        }

        // 2. Insertar los ítems si existen
        if (items.length > 0) {
            const itemsToInsert = items
                .filter((item: any) => item.product_id)
                .map((item: any) => ({
                    sale_id: sale.id,
                    product_id: item.product_id,
                    quantity: parseInt(item.quantity),
                    unit_price: parseFloat(item.unit_price),
                    discount: 0, 
                    total: parseFloat(item.total)
                }))

            if (itemsToInsert.length > 0) {
                const { error: itemsError } = await supabase
                    .from("sale_items")
                    .insert(itemsToInsert)

                if (itemsError) {
                    toast.error("Venta creada, pero hubo un error al registrar los productos")
                    console.error(itemsError)
                }
            }
        }

        if (sale) {
            onIngresoAgregado(sale)
            toast.success("Venta e ítems registrados correctamente")
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
                
                {/* Cliente */}
                <div className="grid gap-2">
                    <Label>Cliente (Opcional)</Label>
                    <select 
                        value={customerId}
                        onChange={e => setCustomerId(e.target.value)}
                        className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        <option value="">-- Sin Cliente --</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2">
                    <Label>Tipo de Venta</Label>
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
                    <Label>Método de Pago</Label>
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

                {/* Sección de Ítems */}
                <div className="col-span-2 border-t pt-4 mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="font-bold text-zinc-900">Productos / Servicios</Label>
                        <Button type="button" onClick={addItem} size="sm" variant="outline" className="h-8">
                            + Agregar Producto o Servicio
                        </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {items.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No hay ítems agregados.</p>
                        )}
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr,60px,100px,80px,30px] gap-2 items-end bg-zinc-50 p-2 rounded-md border">
                                <div className="grid gap-1">
                                    <Label className="text-[10px] uppercase text-zinc-500">Producto</Label>
                                    <select 
                                        value={item.product_id}
                                        onChange={e => updateItem(index, "product_id", e.target.value)}
                                        className="w-full bg-white border border-border rounded px-2 py-1 text-xs focus:outline-none"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-[10px] uppercase text-zinc-500">Cant.</Label>
                                    <Input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={e => updateItem(index, "quantity", e.target.value)}
                                        className="h-7 text-xs px-2"
                                    />
                                
                                
                                    <Label className="text-[10px] uppercase text-zinc-500">Precio Unit.</Label>
                                    <Input 
                                        type="number" 
                                        step="0.01"
                                        value={item.unit_price} 
                                        onChange={e => updateItem(index, "unit_price", e.target.value)}
                                        className="h-7 text-xs px-2"
                                    />
                               
                                
                                    <Label className="text-[10px] uppercase text-zinc-500">Total</Label>
                                    <div className="h-7 text-xs flex items-center font-bold">
                                        ${item.total.toFixed(2)}
                                    </div>
                               </div>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeItem(index)}
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="subTotal">Sub Total</Label>
                    <Input id="subTotal" type="number" value={subTotal.toFixed(2)} readOnly className="bg-zinc-50" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="discount">Descuento Total</Label>
                    <Input id="discount" type="number" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} placeholder="0.00" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="total" className="font-bold">Total a Pagar *</Label>
                    <Input id="total" type="number" value={total.toFixed(2)} readOnly className="bg-zinc-100 font-bold" />
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

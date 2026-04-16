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

        // Insertar la venta
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

        // Insertar los ítems si existen
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Columna Izquierda: Metadatos y Totales */}
                <div className="flex flex-col gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="salesDate" className="font-semibold">Fecha de Venta</Label>
                        <Input id="salesDate" type="date" value={salesDate} onChange={e => setSalesDate(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <Label className="font-semibold">Tipo de Venta</Label>
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
                        <Label className="font-semibold">Estado de la Venta</Label>
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

                    <div className="grid gap-2">
                        <Label htmlFor="observacion" className="font-semibold">Observación</Label>
                        <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. Pago con tarjeta..." />
                    </div>

                    {/* Resumen de Pago (Caja Negra) */}
                    <div className="bg-zinc-900 text-white p-6 rounded-2xl mt-4 flex flex-col gap-4 shadow-xl">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <Label className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">Sub Total</Label>
                                <div className="text-xl font-bold">${subTotal.toFixed(2)}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label htmlFor="discount" className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold text-right">Descuento Total</Label>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="text-zinc-500 font-bold">$</span>
                                    <input 
                                        id="discount" 
                                        type="number" 
                                        step="0.01" 
                                        value={discount} 
                                        onChange={e => setDiscount(Number(e.target.value))} 
                                        className="bg-transparent border-b border-zinc-700 focus:border-white outline-none w-16 text-xl font-bold py-0 text-right"
                                        placeholder="0" 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 border-t border-zinc-800 pt-4">
                            <Label className="text-emerald-400 text-[10px] uppercase tracking-widest font-black">Total a Pagar</Label>
                            <div className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                                ${total.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Cliente e Ítems */}
                <div className="flex flex-col gap-5">
                    {/* Cliente */}
                    <div className="grid gap-2">
                        <Label className="font-semibold">Cliente (Opcional)</Label>
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
                        <Label className="font-semibold">Método de Pago</Label>
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
                    <div className="flex-1 border-2 border-zinc-100 rounded-2xl bg-zinc-50/30 overflow-hidden flex flex-col">
                        <div className="bg-white/80 px-4 py-3 border-b flex items-center justify-between">
                            <Label className="font-bold text-zinc-800">Productos / Servicios</Label>
                            <Button type="button" onClick={addItem} size="sm" variant="outline" className="h-8 text-[10px] font-bold border-zinc-200 hover:bg-zinc-50 shadow-sm">
                                + AGREGAR ITEM
                            </Button>
                        </div>
                        
                        <div className="p-4 flex-1 overflow-y-auto">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-zinc-200 rounded-xl bg-white/50">
                                    <p className="text-xs text-muted-foreground mb-1">No hay ítems agregados.</p>
                                    <Button type="button" variant="link" size="sm" onClick={addItem} className="text-xs font-semibold text-zinc-900 hover:no-underline">
                                        Haz clic aquí para agregar uno
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex flex-col gap-3 group transition-all hover:border-zinc-400">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 grid gap-1.5">
                                                    <Label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Concepto</Label>
                                                    <select 
                                                        value={item.product_id}
                                                        onChange={e => updateItem(index, "product_id", e.target.value)}
                                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-400"
                                                    >
                                                        <option value="">Seleccionar...</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => removeItem(index)}
                                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg flex-none"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="grid gap-1.5">
                                                    <Label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider text-center">Cant.</Label>
                                                    <Input 
                                                        type="number" 
                                                        value={item.quantity} 
                                                        onChange={e => updateItem(index, "quantity", e.target.value)}
                                                        className="h-8 text-xs px-2 text-center bg-zinc-50 border-zinc-200"
                                                    />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">P. Unit.</Label>
                                                    <Input 
                                                        type="number" 
                                                        step="0.01"
                                                        value={item.unit_price} 
                                                        onChange={e => updateItem(index, "unit_price", e.target.value)}
                                                        className="h-8 text-xs px-2 bg-zinc-50 border-zinc-200"
                                                    />
                                                </div>
                                                <div className="grid gap-1.5">
                                                    <Label className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Total</Label>
                                                    <div className="h-8 flex items-center px-1 text-xs font-bold text-zinc-900">
                                                        ${item.total.toFixed(2)}
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
            </div>
        </FormDialog>
    )
}

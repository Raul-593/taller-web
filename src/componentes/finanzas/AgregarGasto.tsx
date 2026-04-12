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
    onGastoAgregado: (gasto: any) => void
    trigger?: React.ReactNode
}

export function AgregarGasto({ onGastoAgregado, trigger }: Props) {
    // Base de datos
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos del Gasto
    const [supplierId, setSupplierId] = useState("")
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString())
    const [description, setDescription] = useState("")
    const [subTotal, setSubTotal] = useState("")
    const [total, setTotal] = useState("")
    const [paymentMethod, setPaymentMethod] = useState("transferencia")
    const [status, setStatus] = useState("completado")
    const [observacion, setObservacion] = useState("")

    // Productos
    const [products, setProducts] = useState<any[]>([])

    // Items de la compra
    const [items, setItems] = useState<any[]>([])
    
    // Proveedor
    const [suppliers, setSuppliers] = useState<{ id: string, name: string }[]>([])

    useEffect(() => {
        const fetchData = async () => {
            const [prods, custs] = await Promise.all([
                supabase.from("products").select("*"),
                supabase.from("suppliers").select("id, name")
            ])
            if (prods.data) setProducts(prods.data)
            if (custs.data) setSuppliers(custs.data)
        }
        fetchData()
    }, [supabase])
   
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
    
    // Cálculo automático de totales
    useEffect(() => {
        const calculatedSubTotal = items.reduce((acc, item) => acc + (item.total || 0), 0)
        setSubTotal(calculatedSubTotal.toFixed(2))
        setTotal(calculatedSubTotal.toFixed(2))
    }, [items])
    
    // Limpiar formulario
    function reset() { 
        setPurchaseDate(new Date().toISOString())
        setSupplierId("")
        setDescription("")
        setSubTotal("0")
        setTotal("0")
        setPaymentMethod("transferencia")
        setStatus("completado")
        setObservacion("")
        setItems([])
    }

    const addItem = () => {
        setItems([...items, { product_id: "", productName: "", quantity: 1, unit_price: 0, total: 0 }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items]
        const item = { ...newItems[index], [field]: value }
        
        // Si cambia el nombre del producto, buscar si existe
        if (field === "productName") {
            const product = products.find(p => p.name.toLowerCase() === value.toLowerCase())
            if (product) {
                item.product_id = product.id
                item.unit_price = product.cost || 0
            } else {
                item.product_id = "" // Es un producto nuevo
            }
        }

        // Recalcular total del ítem
        item.total = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)
        
        newItems[index] = item
        setItems(newItems)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!purchaseDate || parseFloat(total) === 0 || !paymentMethod || !supplierId) {
            toast.error("Existen campos obligatorios vacíos o el total es 0")
            return
        }

        setIsSubmitting(true)

        // 1. Manejar creación de productos nuevos si existen
        const itemsWithIds = await Promise.all(items.map(async (item) => {
            if (item.productName && !item.product_id) {
                // Crear producto nuevo
                const { data: newProd, error: prodError } = await supabase
                    .from("products")
                    .insert([{ 
                        name: item.productName,
                        cost: parseFloat(item.unit_price) || 0,
                        price: (parseFloat(item.unit_price) || 0),
                        active: true
                    }])
                    .select()
                    .single()
                
                if (prodError) {
                    console.error("Error al crear producto:", item.productName, prodError)
                    return item
                }
                return { ...item, product_id: newProd.id }
            }
            return item
        }))

        // 2. Insertar la compra
        const { data: purchase, error: purchasError } = await supabase
            .from("purchases")
            .insert([{
                purchase_date: purchaseDate,
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

        if (purchasError) {
            toast.error("Error al registrar la compra")
            console.error(purchasError)
            setIsSubmitting(false)
            return
        }

        // 3. Insertar los ítems
        const filteredItems = itemsWithIds.filter(item => item.product_id)
        if (filteredItems.length > 0){
            const itemsToInsert = filteredItems.map((item: any) => ({
                purchase_id: purchase.id,
                product_id: item.product_id,
                quantity: parseInt(item.quantity),
                unit_cost: parseFloat(item.unit_price),
                total: parseFloat(item.total),
            }))
            
            const { error: itemsError } = await supabase
                .from("purchase_items")
                .insert(itemsToInsert)

            if (itemsError) {
                toast.error("Compra creada, pero hubo un error al registrar los productos")
                console.error(itemsError)
            }
        }

        if (purchase) {
            onGastoAgregado(purchase)
            toast.success("Compra e ítems registrados correctamente")
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

                {/* Sección de Ítems */}
                <div className="col-span-2 border-t pt-4 mt-2">
                    <div className="flex items-center justify-between mb-2">
                        <Label className="font-bold text-zinc-900">Productos / Repuestos</Label>
                        <Button type="button" onClick={addItem} size="sm" variant="outline" className="h-8">
                            + Agregar Producto
                        </Button>
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {items.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No hay productos agregados.</p>
                        )}
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-[1fr,60px,100px,80px,30px] gap-2 items-end bg-zinc-50 p-2 rounded-md border">
                                <div className="grid gap-1">
                                    <Label className="text-[10px] uppercase text-zinc-500">Buscador / Nuevo</Label>
                                    <input 
                                        list="products-list"
                                        value={item.productName}
                                        onChange={e => updateItem(index, "productName", e.target.value)}
                                        placeholder="Buscar o escribir nombre..."
                                        className="w-full bg-white border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary h-7"
                                    />
                                    <datalist id="products-list">
                                        {products.map(p => (
                                            <option key={p.id} value={p.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-[10px] uppercase text-zinc-500">Cant.</Label>
                                    <Input 
                                        type="number" 
                                        value={item.quantity} 
                                        onChange={e => updateItem(index, "quantity", e.target.value)}
                                        className="h-7 text-xs px-2"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Label className="text-[10px] uppercase text-zinc-500">Costo Unit.</Label>
                                    <Input 
                                        type="number" 
                                        step="0.01"
                                        value={item.unit_price} 
                                        onChange={e => updateItem(index, "unit_price", e.target.value)}
                                        className="h-7 text-xs px-2"
                                    />
                                </div>
                                <div className="grid gap-1">
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
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="subTotal">Sub Total</Label>
                    <Input id="subTotal" type="number" value={subTotal} readOnly className="bg-zinc-50" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="total" className="font-bold">Total a Pagar *</Label>
                    <Input id="total" type="number" value={total} readOnly className="bg-zinc-100 font-bold" />
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

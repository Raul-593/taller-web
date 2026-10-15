"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/(interno)/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"
import { CustomerSelect } from "@/componentes/ui/CustomerSelect"
import { FormularioItemProducto } from "@/componentes/(interno)/finanzas/FormularioItemProducto"
import { AgregarClienteDialog } from "@/componentes/(interno)/clientes/AgregarClienteDialog"
import { payment_methods } from "@/lib/finanzas/labels"
import { SelectCuenta } from "@/componentes/(interno)/finanzas/SelectCuenta"

type Props = {
    accounts: any[]
    onIngresoAgregado: (ingreso: any) => void
    trigger?: React.ReactNode
}

export function AgregarIngreso({ accounts, onIngresoAgregado, trigger }: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [salesDate, setSalesDate] = useState(new Date().toISOString())
    const [customerId, setCustomerId] = useState("")
    const [salesType, setSalesType] = useState("retail")
    const [subTotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [total, setTotal] = useState(0)
    const [paymentMethod, setPaymentMethod] = useState("transferencia")
    const [observacion, setObservacion] = useState("")

    const [items, setItems] = useState<any[]>([])

    // Pago inicial (opcional) -- si se llena, se registra un abono
    // justo después de crear la venta
    const [pagoInicialMonto, setPagoInicialMonto] = useState("")
    const [pagoInicialCuenta, setPagoInicialCuenta] = useState("")
    const [pagoInicialReferencia, setPagoInicialReferencia] = useState("")

    const cuentasActivas = accounts.filter((a) => a.is_active)

    useEffect(() => {
        const calculatedSubTotal = items.reduce((acc, item) => acc + (item.total || 0), 0)
        setSubTotal(calculatedSubTotal)
        setTotal(calculatedSubTotal - (Number(discount) || 0))
    }, [items, discount])

    function reset() {
        setSalesDate(new Date().toISOString())
        setSalesType("retail")
        setCustomerId("")
        setSubTotal(0)
        setDiscount(0)
        setTotal(0)
        setPaymentMethod("transferencia")
        setObservacion("")
        setItems([])
        setPagoInicialMonto("")
        setPagoInicialCuenta("")
        setPagoInicialReferencia("")
    }

    // Ítem nuevo con la forma que usa este formulario.
    // El precio se toma del producto automáticamente (comportamiento por defecto).
    const crearItemVacio = () => ({ product_id: "", quantity: 1, unit_price: 0, total: 0 })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!salesType || total === 0 || !paymentMethod) {
            toast.error("Existen campos obligatorios vacíos o el total es 0")
            return
        }

        const pagoInicial = parseFloat(pagoInicialMonto) || 0
        if (pagoInicial > 0 && !pagoInicialCuenta) {
            toast.error("Selecciona la cuenta del pago inicial")
            return
        }

        setIsSubmitting(true)

        // status no se manda -- nace 'pendiente' por default de la tabla
        // y el trigger de payments lo pasa a 'completado' si corresponde
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
                const { error: itemsError } = await supabase.from("sale_items").insert(itemsToInsert)
                if (itemsError) {
                    toast.error("Venta creada, pero hubo un error al registrar los productos")
                    console.error(itemsError)
                }
            }
        }

        if (pagoInicial > 0) {
            const { error: paymentError } = await supabase.from("payments").insert([{
                sale_id: sale.id,
                amount: pagoInicial,
                payment_date: salesDate,
                payment_method: paymentMethod,
                reference: pagoInicialReferencia.trim() || null,
                account_id: pagoInicialCuenta,
                source: "manual",
            }])
            if (paymentError) {
                toast.error("Venta creada, pero el pago inicial no se pudo registrar. Regístralo manualmente desde el detalle de la venta.")
                console.error(paymentError)
            }
        }

        if (sale) {
            onIngresoAgregado(sale)
            toast.success("Venta registrada correctamente")
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
                        <Label htmlFor="observacion" className="font-semibold">Observación</Label>
                        <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. Pago con tarjeta..." />
                    </div>

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

                    <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 space-y-3">
                        <Label className="font-semibold text-sm">Pago Inicial (opcional)</Label>
                        <p className="text-xs text-muted-foreground">
                            Déjalo vacío si el cliente no paga nada todavía. Puedes registrar abonos después desde el detalle de la venta.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label className="text-[10px] uppercase text-zinc-400 font-bold">Monto</Label>
                                <Input type="number" step="0.01" value={pagoInicialMonto} onChange={e => setPagoInicialMonto(e.target.value)} placeholder="0.00" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-[10px] uppercase text-zinc-400 font-bold">Método de Pago</Label>
                                <select
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full h-9 appearance-none bg-background border border-border rounded-lg px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
                                >
                                    {payment_methods.map((m) => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <SelectCuenta
                            cuentas={cuentasActivas}
                            value={pagoInicialCuenta}
                            onChange={setPagoInicialCuenta}
                            label={`Cuenta ${parseFloat(pagoInicialMonto) > 0 ? "*" : ""}`}
                            required={parseFloat(pagoInicialMonto) > 0}
                        />
                        <Input
                            value={pagoInicialReferencia}
                            onChange={e => setPagoInicialReferencia(e.target.value)}
                            placeholder="Referencia (opcional)"
                            className="text-xs"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="grid gap-2">
                        <AgregarClienteDialog
                            onClienteAgregado={(c) => { setCustomerId(c.id) }}
                            trigger={<CustomerSelect value={customerId} onChange={(id) => { setCustomerId(id) }} />}
                        />
                    </div>

                    <FormularioItemProducto
                        items={items}
                        onChange={setItems}
                        titulo="Productos / Servicios"
                        etiquetaPrecio="P. Unit."
                        crearItemVacio={crearItemVacio}
                    />
                </div>
            </div>
        </FormDialog>
    )
}
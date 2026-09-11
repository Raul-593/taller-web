"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componentes/ui/dialog"
import { Button } from "@/componentes/ui/button"
import { Label } from "@/componentes/ui/label"
import { getStatusClasses } from "@/utils/status-colors"
import { calcularSaldoVenta } from "@/lib/finanzas/ventas"

type Props = {
    venta: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onAbonar: () => void
}

export function VistaVenta({ venta, isOpen, onOpenChange, onAbonar }: Props) {
    const supabase = createClient()
    const [items, setItems] = useState<any[]>([])
    const [pagos, setPagos] = useState<any[]>([])
    const [creditos, setCreditos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isOpen || !venta) return

        const fetchDetalle = async () => {
            setLoading(true)

            const [{ data: itemsData }, { data: pagosData }, { data: mantenimientos }] = await Promise.all([
                supabase.from("sale_items").select("id, quantity, unit_price, total, products (name)").eq("sale_id", venta.id),
                supabase.from("payments").select("id, amount, payment_date, payment_method, accounts (name)").eq("sale_id", venta.id).order("payment_date", { ascending: true }),
                supabase.from("maintenance_records").select("id").eq("sale_id", venta.id),
            ])

            const maintenanceIds = (mantenimientos ?? []).map((m: any) => m.id)
            const orFilter = maintenanceIds.length > 0
                ? `sale_id.eq.${venta.id},maintenance_id.in.(${maintenanceIds.join(",")})`
                : `sale_id.eq.${venta.id}`

            const { data: creditosData } = await supabase
                .from("customer_credit")
                .select("amount, reason, created_at")
                .eq("credit_type", "aplicado")
                .or(orFilter)

            setItems(itemsData ?? [])
            setPagos(pagosData ?? [])
            setCreditos(creditosData ?? [])
            setLoading(false)
        }

        fetchDetalle()
    }, [isOpen, venta, supabase])

    if (!venta) return null

    const { totalPagado, totalCreditoAplicado, saldoPendiente } = calcularSaldoVenta(venta.total, pagos, creditos)
    const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl p-0 flex flex-col overflow-hidden max-h-[90vh]">
                <DialogHeader className="p-6 border-b bg-zinc-50/50">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-xl">Venta — {venta.customers?.name || "Sin cliente"}</DialogTitle>
                            <DialogDescription>{venta.sales_date}</DialogDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusClasses(venta.status)}`}>
                            {venta.status}
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 rounded-lg border bg-zinc-50/30">
                            <Label className="text-xs text-muted-foreground">Total</Label>
                            <p className="font-bold text-lg">{formatCurrency(Number(venta.total))}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-green-50/50">
                            <Label className="text-xs text-muted-foreground">Pagado + Crédito</Label>
                            <p className="font-bold text-lg text-green-700">{formatCurrency(totalPagado + totalCreditoAplicado)}</p>
                        </div>
                        <div className="p-3 rounded-lg border bg-amber-50/50">
                            <Label className="text-xs text-muted-foreground">Saldo Pendiente</Label>
                            <p className="font-bold text-lg text-amber-700">{formatCurrency(saldoPendiente)}</p>
                        </div>
                    </div>

                    <section>
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight mb-2">Ítems</h3>
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Sin ítems registrados.</p>
                        ) : (
                            <div className="border rounded-lg divide-y">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between p-2 text-sm">
                                        <span>{item.products?.name || "Producto"} (x{item.quantity})</span>
                                        <span className="font-medium">{formatCurrency(Number(item.total))}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Historial de Pagos</h3>
                            {venta.status !== "cancelado" && saldoPendiente > 0 && (
                                <Button size="sm" onClick={onAbonar}>Registrar Abono</Button>
                            )}
                        </div>
                        {loading ? (
                            <p className="text-sm text-muted-foreground italic">Cargando...</p>
                        ) : pagos.length === 0 && creditos.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">Sin pagos registrados todavía.</p>
                        ) : (
                            <div className="border rounded-lg divide-y">
                                {pagos.map((p) => (
                                    <div key={p.id} className="flex justify-between p-2 text-sm">
                                        <span>{p.payment_date} — {p.accounts?.name || "—"} ({p.payment_method})</span>
                                        <span className="font-medium text-green-700">+{formatCurrency(Number(p.amount))}</span>
                                    </div>
                                ))}
                                {creditos.map((c, idx) => (
                                    <div key={`credito-${idx}`} className="flex justify-between p-2 text-sm">
                                        <span>Crédito aplicado — {c.reason || "Nota de crédito"}</span>
                                        <span className="font-medium text-blue-700">+{formatCurrency(Math.abs(Number(c.amount)))}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                <DialogFooter className="p-6 border-t bg-zinc-50/50">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
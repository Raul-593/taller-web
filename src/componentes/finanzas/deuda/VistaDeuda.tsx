"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componentes/ui/dialog"
import { Button } from "@/componentes/ui/button"
import { Label } from "@/componentes/ui/label"
import { getStatusClasses } from "@/utils/status-colors"
import { calcularSaldoDeuda } from "@/lib/finanzas/deudas"
import { RegistrarAbonoDeuda } from "./RegistrarAbonoDeuda"

type Props = {
    deudaId: string
    accounts: any[]
    categorias: any[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onDeudaActualizada?: () => void
}

export function VistaDeuda({ deudaId, accounts, categorias, isOpen, onOpenChange, onDeudaActualizada }: Props) {
    const supabase = createClient()
    const [deuda, setDeuda] = useState<any | null>(null)
    const [pagos, setPagos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [mostrarAbono, setMostrarAbono] = useState(false)

    const fetchDetalle = async () => {
        setLoading(true)
        const [{ data: deudaData }, { data: pagosData }] = await Promise.all([
            supabase
                .from("deudas")
                .select(`
                    id, creditor, description, total_amount, due_date, status, purchase_id,
                    purchases (id, description, total, purchase_date, suppliers (name))
                `)
                .eq("id", deudaId)
                .single(),
            supabase
                .from("movimientos")
                .select("id, amount, movement_date, description, accounts (name)")
                .eq("reference_type", "debt_payment")
                .eq("reference_id", deudaId)
                .order("movement_date", { ascending: true }),
        ])
        setDeuda(deudaData)
        setPagos(pagosData ?? [])
        setLoading(false)
    }

    useEffect(() => {
        if (!isOpen) return
        fetchDetalle()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, deudaId])

    const formatCurrency = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

    return (
        <>
            <Dialog open={isOpen && !mostrarAbono} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl p-0 flex flex-col overflow-hidden max-h-[90vh]">
                    {loading || !deuda ? (
                        <div className="p-10 text-center text-sm text-muted-foreground">Cargando...</div>
                    ) : (
                        <>
                            <DialogHeader className="p-6 border-b bg-zinc-50/50">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <DialogTitle className="text-xl">{deuda.creditor}</DialogTitle>
                                        <DialogDescription>{deuda.description || "Sin descripción"}</DialogDescription>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusClasses(deuda.status)}`}>
                                        {deuda.status}
                                    </span>
                                </div>
                            </DialogHeader>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-3 rounded-lg border bg-zinc-50/30">
                                        <Label className="text-xs text-muted-foreground">Total</Label>
                                        <p className="font-bold text-lg">{formatCurrency(Number(deuda.total_amount))}</p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-green-50/50">
                                        <Label className="text-xs text-muted-foreground">Pagado</Label>
                                        <p className="font-bold text-lg text-green-700">
                                            {formatCurrency(calcularSaldoDeuda(deuda.total_amount, pagos).totalPagado)}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-lg border bg-amber-50/50">
                                        <Label className="text-xs text-muted-foreground">Saldo Pendiente</Label>
                                        <p className="font-bold text-lg text-amber-700">
                                            {formatCurrency(calcularSaldoDeuda(deuda.total_amount, pagos).saldoPendiente)}
                                        </p>
                                    </div>
                                </div>

                                {deuda.due_date && (
                                    <div className="p-3 rounded-lg border bg-zinc-50/30">
                                        <Label className="text-xs text-muted-foreground">Fecha de Vencimiento</Label>
                                        <p className="text-sm font-medium">{deuda.due_date}</p>
                                    </div>
                                )}

                                {deuda.purchases && (
                                    <section>
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight mb-2">Compra Relacionada</h3>
                                        <div className="p-3 rounded-lg border bg-zinc-50/30 space-y-1 text-sm">
                                            <p><span className="text-muted-foreground">Proveedor:</span> {deuda.purchases.suppliers?.name || "—"}</p>
                                            <p><span className="text-muted-foreground">Descripción:</span> {deuda.purchases.description || "—"}</p>
                                            <p><span className="text-muted-foreground">Fecha:</span> {deuda.purchases.purchase_date}</p>
                                            <p><span className="text-muted-foreground">Total de la compra:</span> {formatCurrency(Number(deuda.purchases.total))}</p>
                                        </div>
                                    </section>
                                )}

                                <section>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Historial de Pagos</h3>
                                        {deuda.status === "pendiente" && (
                                            <Button size="sm" onClick={() => setMostrarAbono(true)}>Registrar Pago</Button>
                                        )}
                                    </div>
                                    {pagos.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">Sin pagos registrados todavía.</p>
                                    ) : (
                                        <div className="border rounded-lg divide-y">
                                            {pagos.map((p) => (
                                                <div key={p.id} className="flex justify-between p-2 text-sm">
                                                    <span>{p.movement_date} — {p.accounts?.name || "—"}</span>
                                                    <span className="font-medium text-green-700">+{formatCurrency(Number(p.amount))}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>

                            <DialogFooter className="p-6 border-t bg-zinc-50/50">
                                <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {mostrarAbono && deuda && (
                <RegistrarAbonoDeuda
                    deuda={deuda}
                    accounts={accounts}
                    categorias={categorias}
                    isOpen={mostrarAbono}
                    onOpenChange={setMostrarAbono}
                    onAbonoRegistrado={async () => {
                        setMostrarAbono(false)
                        await fetchDetalle()
                        onDeudaActualizada?.()
                    }}
                />
            )}
        </>
    )
}
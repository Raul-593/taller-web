"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/componentes/ui/dialog"
import { Button } from "@/componentes/ui/button"
import { Label } from "@/componentes/ui/label"
import { toast } from "sonner"
import { getStatusClasses } from "@/utils/status-colors"
import { getCreditNoteTypeLabel } from "@/lib/finanzas/labels"

type Props = {
    notaId: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onNotaActualizada?: () => void
}

export function VistaNotaCredito({ notaId, isOpen, onOpenChange, onNotaActualizada }: Props) {
    const supabase = createClient()
    const [nota, setNota] = useState<any | null>(null)
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actualizando, setActualizando] = useState(false)

    const fetchDetalle = async () => {
        setLoading(true)
        const [{ data: notaData }, { data: itemsData }] = await Promise.all([
            supabase
                .from("credit_notes")
                .select(`
                    id, credit_date, credit_type, reason, total, status, sale_id,
                    customers (name), sales (sales_date, total)
                `)
                .eq("id", notaId)
                .single(),
            supabase
                .from("credit_note_items")
                .select("id, quantity, unit_price, total, products (name)")
                .eq("credit_note_id", notaId),
        ])
        setNota(notaData)
        setItems(itemsData ?? [])
        setLoading(false)
    }

    useEffect(() => {
        if (!isOpen) return
        fetchDetalle()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, notaId])

    const cambiarEstado = async (nuevoEstado: "completado" | "cancelado") => {
        setActualizando(true)
        const { error } = await supabase.from("credit_notes").update({ status: nuevoEstado }).eq("id", notaId)

        if (error) {
            toast.error("Error al actualizar la nota de crédito")
            console.error(error)
        } else {
            toast.success(nuevoEstado === "completado" ? "Nota aprobada — crédito acreditado al cliente" : "Nota cancelada")
            await fetchDetalle()
            onNotaActualizada?.()
        }
        setActualizando(false)
    }

    const formatCurrency = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v)

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl p-0 flex flex-col overflow-hidden max-h-[90vh]">
                {loading || !nota ? (
                    <div className="p-10 text-center text-sm text-muted-foreground">Cargando...</div>
                ) : (
                    <>
                        <DialogHeader className="p-6 border-b bg-zinc-50/50">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <DialogTitle className="text-xl">{nota.customers?.name || "Cliente"}</DialogTitle>
                                    <DialogDescription>{nota.credit_date} — {getCreditNoteTypeLabel(nota.credit_type)}</DialogDescription>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusClasses(nota.status)}`}>
                                    {nota.status}
                                </span>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg border bg-zinc-50/30">
                                    <Label className="text-xs text-muted-foreground">Venta Original</Label>
                                    <p className="font-medium text-sm">{nota.sales?.sales_date} — {formatCurrency(Number(nota.sales?.total || 0))}</p>
                                </div>
                                <div className="p-3 rounded-lg border bg-amber-50/50">
                                    <Label className="text-xs text-muted-foreground">Total de la Nota</Label>
                                    <p className="font-bold text-lg text-amber-700">{formatCurrency(Number(nota.total))}</p>
                                </div>
                            </div>

                            <div className="p-3 rounded-lg border bg-zinc-50/30">
                                <Label className="text-xs text-muted-foreground">Razón</Label>
                                <p className="text-sm">{nota.reason}</p>
                            </div>

                            {nota.credit_type === "devolucion" && (
                                <section>
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight mb-2">Productos</h3>
                                    {items.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">Sin productos registrados.</p>
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
                            )}

                            {nota.status === "completado" && (
                                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                                    Esta nota ya fue aprobada. Se acreditó {formatCurrency(Number(nota.total))} al saldo a favor del cliente
                                    {nota.credit_type === "devolucion" && " y el stock de los productos ya fue restaurado"}.
                                </div>
                            )}
                        </div>

                        <DialogFooter className="p-6 border-t bg-zinc-50/50 gap-2 sm:gap-0">
                            {nota.status === "pendiente" && (
                                <>
                                    <Button
                                        onClick={() => cambiarEstado("completado")}
                                        disabled={actualizando}
                                        className="bg-green-600 text-white hover:bg-green-700"
                                    >
                                        Aprobar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => cambiarEstado("cancelado")}
                                        disabled={actualizando}
                                    >
                                        Cancelar Nota
                                    </Button>
                                </>
                            )}
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
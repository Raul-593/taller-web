import { Button } from "@/componentes/ui/button"

// Un movimiento del historial (pago recibido o crédito aplicado).
export interface MovimientoDetalle {
    id: string
    descripcion: string
    monto: number
    tono?: "verde" | "azul"
}

interface TablaDetalleFinancieroProps {
    titulo: string
    movimientos: MovimientoDetalle[]
    mensajeVacio?: string
    cargando?: boolean
    mostrarBotonAgregar?: boolean
    etiquetaAgregar?: string
    onAgregar?: () => void
}

const tonoClases: Record<string, string> = {
    verde: "text-green-700",
    azul: "text-blue-700",
}

// Sección de historial de pagos compartida por las vistas de
// venta, deuda y mantenimiento. Solo presenta datos ya cargados.
export function TablaDetalleFinanciero({
    titulo,
    movimientos,
    mensajeVacio = "Sin pagos registrados todavía.",
    cargando,
    mostrarBotonAgregar,
    etiquetaAgregar = "Registrar Abono",
    onAgregar,
}: TablaDetalleFinancieroProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

    return (
        <section>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-tight">{titulo}</h3>
                {mostrarBotonAgregar && onAgregar && (
                    <Button size="sm" onClick={onAgregar}>{etiquetaAgregar}</Button>
                )}
            </div>
            {cargando ? (
                <p className="text-sm text-muted-foreground italic">Cargando...</p>
            ) : movimientos.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{mensajeVacio}</p>
            ) : (
                <div className="border rounded-lg divide-y">
                    {movimientos.map((m) => (
                        <div key={m.id} className="flex justify-between p-2 text-sm">
                            <span>{m.descripcion}</span>
                            <span className={`font-medium ${tonoClases[m.tono ?? "verde"]}`}>
                                +{formatCurrency(m.monto)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

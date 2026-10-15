import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { Button } from "@/componentes/ui/button"
import { Trash2 } from "lucide-react"
import { Product, ProductSelect } from "@/componentes/ui/ProductSelect"

// Ítem de producto/servicio. Los campos extra de cada caso
// (item_type, description, etc.) se conservan con [key: string].
export interface ItemProductoBase {
    product_id: string
    quantity: number | string
    unit_price: number | string
    total?: number
    [key: string]: unknown
}

interface FormularioItemProductoProps {
    items: ItemProductoBase[]
    onChange: (items: ItemProductoBase[]) => void
    titulo?: string
    etiquetaPrecio?: string
    // Permite personalizar el ítem nuevo y el precio según el caso
    // (ej. gastos usan el costo, mantenimientos usan el precio de venta).
    crearItemVacio?: () => ItemProductoBase
    alSeleccionarProducto?: (item: ItemProductoBase, product: Product) => ItemProductoBase
    // Acción extra junto al selector (ej. botón para agregar repuesto nuevo).
    accionExtraProducto?: (index: number) => React.ReactNode
}

const ITEM_VACIO: ItemProductoBase = { product_id: "", quantity: 1, unit_price: 0, total: 0 }

// Sección de ítems compartida por ingresos, gastos, notas de crédito
// y mantenimientos. El padre conserva su estado y solo recibe los cambios.
export function FormularioItemProducto({
    items,
    onChange,
    titulo = "Productos / Servicios",
    etiquetaPrecio = "Precio Unit.",
    crearItemVacio,
    alSeleccionarProducto,
    accionExtraProducto,
}: FormularioItemProductoProps) {
    const agregarItem = () => {
        onChange([...items, crearItemVacio ? crearItemVacio() : { ...ITEM_VACIO }])
    }

    const eliminarItem = (index: number) => {
        onChange(items.filter((_, i) => i !== index))
    }

    // Actualiza un campo del ítem y recalcula su total.
    const actualizarItem = (index: number, field: string, value: unknown, product?: Product) => {
        const nuevos = [...items]
        let item: ItemProductoBase = { ...nuevos[index], [field]: value }

        if (field === "product_id" && product) {
            item = alSeleccionarProducto
                ? alSeleccionarProducto(item, product)
                : { ...item, unit_price: product.price ?? 0 }
        }

        const cantidad = Number(item.quantity) || 0
        const precio = Number(item.unit_price) || 0
        item.total = cantidad * precio
        nuevos[index] = item
        onChange(nuevos)
    }

    const calcularTotal = (item: ItemProductoBase) =>
        item.total ?? (Number(item.quantity) || 0) * (Number(item.unit_price) || 0)

    return (
        <div className="col-span-2 border rounded-lg overflow-hidden bg-white shadow-sm mt-2">
            <div className="bg-zinc-100/80 px-4 py-2 border-b flex items-center justify-between">
                <Label className="font-bold text-zinc-800 text-sm">{titulo}</Label>
                <Button type="button" onClick={agregarItem} size="sm" variant="outline" className="h-7 text-[10px] bg-white">
                    + AGREGAR ITEM
                </Button>
            </div>

            <div className="p-4 space-y-3 min-h-25">
                {items.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed rounded-md bg-zinc-50/50">
                        <p className="text-xs text-muted-foreground">No hay productos agregados.</p>
                        <Button type="button" variant="link" size="sm" onClick={agregarItem} className="text-xs">
                            Haz clic aquí para agregar uno
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
                        <div className="hidden sm:grid grid-cols-[1fr,70px,100px,80px,36px] gap-3 px-2">
                            <Label className="text-[10px] uppercase font-bold text-zinc-400">Producto / Concepto</Label>
                            <Label className="text-[10px] uppercase font-bold text-zinc-400 text-center">Cant.</Label>
                            <Label className="text-[10px] uppercase font-bold text-zinc-400">{etiquetaPrecio}</Label>
                            <Label className="text-[10px] uppercase font-bold text-zinc-400">Total</Label>
                            <div></div>
                        </div>

                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-[1fr,70px,100px,80px,30px] gap-2 items-center bg-zinc-50/50 p-2 rounded-lg border border-zinc-100 group hover:border-zinc-300 transition-colors"
                            >
                                <div className="w-full min-w-0 flex items-end gap-1">
                                    <div className="w-full min-w-0">
                                        <ProductSelect
                                            value={item.product_id || null}
                                            onChange={(id, product) => actualizarItem(index, "product_id", id, product)}
                                        />
                                    </div>
                                    {accionExtraProducto?.(index)}
                                </div>
                                <div>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => actualizarItem(index, "quantity", e.target.value)}
                                        className="h-8 text-xs px-2 text-left"
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={item.unit_price}
                                        onChange={(e) => actualizarItem(index, "unit_price", e.target.value)}
                                        className="h-8 text-xs px-2"
                                    />
                                </div>
                                <div className="text-xs font-bold text-zinc-700 px-1">
                                    ${calcularTotal(item).toFixed(2)}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => eliminarItem(index)}
                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

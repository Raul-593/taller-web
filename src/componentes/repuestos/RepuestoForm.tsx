"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { Package, Wrench } from "lucide-react"
import { cn } from "@/lib/utils"

export type RepuestoData = {
    type: "producto" | "servicio"
    name: string
    description: string
    category: string
    category_id: string
    stock: string
    stock_min?: string
    price: string
    cost: string
}

type Props = {
    title: string
    description: string
    submitLabel: string
    initialData?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: RepuestoData) => Promise<void>
    isSubmitting: boolean
    trigger?: React.ReactNode
    isService?: boolean
    allowTypeSelection?: boolean
}

type CategoriaProduct = {
    id: string
    name: string
    type?: string | null
}

export function RepuestoForm({ 
    title, 
    description, 
    submitLabel, 
    initialData, 
    isOpen, 
    onOpenChange, 
    onSubmit, 
    isSubmitting,
    trigger,
    isService = false,
    allowTypeSelection = false
}: Props) {
    const [selectedType, setSelectedType] = useState<"producto" | "servicio">(isService ? "servicio" : "producto")
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [categoryName, setCategoryName] = useState("")
    const [stock, setStock] = useState("")
    const [stockMin, setStockMin] = useState("")
    const [price, setPrice] = useState("")
    const [cost, setCost] = useState("")

    // Categorías cargadas desde products (donde category_id es null)
    const [categorias, setCategorias] = useState<CategoriaProduct[]>([])
    const [loadingCategorias, setLoadingCategorias] = useState(false)

    // Cargar categorías de products
    useEffect(() => {
        if (isOpen) {
            const fetchCategorias = async () => {
                setLoadingCategorias(true)
                const supabase = createClient()
                const { data, error } = await supabase
                    .from("products")
                    .select("id, name, type")
                    .is("category_id", null)
                    .is("active", true)
                    .order("name", { ascending: true })

                if (data) {
                    setCategorias(data)
                } else if (error) {
                    console.error("Error al cargar categorías:", error)
                }
                setLoadingCategorias(false)
            }
            fetchCategorias()
        }
    }, [isOpen])

    // Cargar datos iniciales (para edición o reset)
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const isItemService = 
                    initialData.type?.toLowerCase().includes("serv") || 
                    (!initialData.type && initialData.category?.toLowerCase() === "servicios")
                setSelectedType(isItemService ? "servicio" : "producto")
                setName(initialData.name || "")
                setDesc(initialData.description || "")
                setCategoryId(initialData.category_id || "")
                setCategoryName(initialData.category || "")
                setStock(initialData.stock !== null && initialData.stock !== undefined ? initialData.stock.toString() : "")
                setStockMin(initialData.stock_min !== null && initialData.stock_min !== undefined ? initialData.stock_min.toString() : "")
                setPrice(initialData.price !== null && initialData.price !== undefined ? initialData.price.toString() : "")
                setCost(initialData.cost !== null && initialData.cost !== undefined ? initialData.cost.toString() : "")
            } else {
                setSelectedType(isService ? "servicio" : "producto")
                setName("")
                setDesc("")
                setCategoryId("")
                setCategoryName("")
                setStock("")
                setStockMin("")
                setPrice("")
                setCost("")
            }
        }
    }, [isOpen, initialData, isService])

    // Filtrar categorías según tipo seleccionado (producto o servicio)
    const categoriasFiltradas = useMemo(() => {
        if (categorias.length === 0) return []
        const esServicio = selectedType === "servicio"
        const filtradas = categorias.filter(c => {
            const catType = (c.type || "").toLowerCase().trim()
            if (esServicio) {
                return catType === "servicio" || catType === "servicios" || catType === "service" || (!catType && c.name?.toLowerCase().includes("serv"))
            } else {
                return catType === "product" || catType === "products" || (!catType && !c.name?.toLowerCase().includes("serv"))
            }
        })
        // Si no hay categorías con ese filtro estricto, mostrar todas las disponibles
        return filtradas.length > 0 ? filtradas : categorias
    }, [categorias, selectedType])

    const esServicioActual = selectedType === "servicio"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            type: selectedType,
            name: name.trim(),
            description: desc.trim(),
            category: categoryName.trim(),
            category_id: categoryId,
            stock,
            stock_min: stockMin,
            price,
            cost
        })
    }

    return (
        <FormDialog
            title={title}
            description={description}
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
        >
            {/* Selector Inicial de Tipo (Producto / Servicio) */}
            {allowTypeSelection && (
                <div className="grid gap-2 mb-2">
                    <Label className="text-sm font-medium">Tipo de registro</Label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg border border-border">
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedType("producto")
                                setCategoryId("")
                                setCategoryName("")
                            }}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-md transition-all",
                                selectedType === "producto"
                                    ? "bg-background text-primary shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Package className="w-4 h-4" />
                            <span>Producto</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedType("servicio")
                                setCategoryId("")
                                setCategoryName("")
                            }}
                            className={cn(
                                "flex items-center justify-center gap-2 py-2 px-3 text-sm font-semibold rounded-md transition-all",
                                selectedType === "servicio"
                                    ? "bg-background text-blue-600 dark:text-blue-400 shadow-sm border border-border"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Wrench className="w-4 h-4" />
                            <span>Servicio</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="name">{esServicioActual ? "Nombre del Servicio" : "Nombre del Producto / Repuesto"}</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={esServicioActual ? "Ej. Mantenimiento Preventivo" : "Ej. Llanta Maxxis 29x2.20"}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                    id="description"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder={esServicioActual ? "Ej. Calibración de cambios, engrase general..." : "Ej. Compuesto de doble capa..."}
                />
            </div>

            {/* Categoría proveniente de products (donde category_id es null) */}
            <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría</Label>
                <select
                    id="categoria"
                    value={categoryId}
                    onChange={e => {
                        const id = e.target.value
                        setCategoryId(id)
                        const found = categorias.find(c => c.id === id)
                        setCategoryName(found ? found.name : "")
                    }}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">
                        {loadingCategorias ? "Cargando categorías..." : "Selecciona una categoría"}
                    </option>
                    {categoriasFiltradas.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Campos condicionales */}
            {esServicioActual ? (
                <div className="grid gap-2">
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                        id="precio"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                            id="stock"
                            type="number"
                            value={stock}
                            onChange={e => setStock(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="stock_min">Stock Mín.</Label>
                        <Input
                            id="stock_min"
                            type="number"
                            value={stockMin}
                            onChange={e => setStockMin(e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="precio">Precio</Label>
                        <Input
                            id="precio"
                            type="number"
                            step="0.01"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="costo">Costo</Label>
                        <Input
                            id="costo"
                            type="number"
                            step="0.01"
                            value={cost}
                            onChange={e => setCost(e.target.value)}
                            placeholder="0.00"
                        />
                    </div>
                </div>
            )}
        </FormDialog>
    )
}


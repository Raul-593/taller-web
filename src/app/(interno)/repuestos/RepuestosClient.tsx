"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { SearchBar } from "@/componentes/ui/SearchBar"
import { useSyncState } from "@/hooks/useSyncState"
import { useSearch } from "@/hooks/useSearch"
import { useRouter } from "next/navigation"
import { EditarRepuestosDialog } from "@/componentes/repuestos/EditarRepuestos"
import { AgregarRepuesto } from "@/componentes/repuestos/AgregarRepuesto"
import { cn } from "@/lib/utils"

export type ProductItem = {
    id: string
    name: string
    description?: string | null
    category?: string | null
    category_id?: string | null
    type?: string | null
    stock?: number | null
    stock_min?: number | null
    price?: number | null
    cost?: number | null
    active?: boolean
    created_at?: string
    updated_at?: string
}

export function RepuestosClient({ repuestos: initial }: { repuestos: ProductItem[] }) {
    const router = useRouter()
    const [repuestos] = useSyncState(initial)

    // Filtro global por término de búsqueda (nombre, descripción, categoría)
    const { searchTerm, setSearchTerm, filteredItems } = useSearch(repuestos, (r: ProductItem, term: string) => {
        const query = term.toLowerCase().trim()
        if (!query) return true
        return Boolean(
            (r.name && r.name.toLowerCase().includes(query)) ||
            (r.description && r.description.toLowerCase().includes(query)) ||
            (r.category && r.category.toLowerCase().includes(query))
        )
    })

    // Separar productos y servicios asegurando que active sea true y ordenando por name
    const { productos, servicios } = useMemo(() => {
        const prods: ProductItem[] = []
        const servs: ProductItem[] = []

        filteredItems.forEach(item => {
            if (item.active === false) return
            if (!item.category_id) return

            const itemType = (item.type || "").toLowerCase().trim()
            const isService = itemType === "servicios" || itemType === "servicio" || itemType === "service" || (!itemType && item.category?.toLowerCase() === "servicios")

            if (isService) {
                servs.push(item)
            } else {
                prods.push(item)
            }
        })

        // Orden alfabético por name
        prods.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }))
        servs.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" }))

        return { productos: prods, servicios: servs }
    }, [filteredItems])

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Inventario y Servicios"
                subtitle="Administra los repuestos, productos y servicios del taller"
            >
                <SearchBar 
                    value={searchTerm} 
                    onChange={setSearchTerm} 
                    placeholder="Buscar por nombre, categoría..." 
                    className="w-full sm:w-80"
                />
                <AgregarRepuesto onRepuestoNuevo={() => router.refresh()} />
            </PageHeader>

            {/* TABLA 1: PRODUCTOS */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold">Productos</CardTitle>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                {productos.length}
                            </span>
                        </div>
                        <CardDescription>Repuestos y artículos con control de inventario</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {productos.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4">No hay productos disponibles</p>
                    ) : (
                        <Table className="min-w-[800px] w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[18%]">Nombre</TableHead>
                                    <TableHead className="w-[20%]">Descripción</TableHead>
                                    <TableHead className="w-[14%]">Categoría</TableHead>
                                    <TableHead className="w-[10%]">Stock</TableHead>
                                    <TableHead className="w-[10%]">Stock Mín.</TableHead>
                                    <TableHead className="w-[10%]">Precio</TableHead>
                                    <TableHead className="w-[10%]">Costo</TableHead>
                                    <TableHead className="w-[8%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {productos.map(p => {
                                    const stockNum = p.stock !== null && p.stock !== undefined ? Number(p.stock) : 0
                                    const stockMinNum = p.stock_min !== null && p.stock_min !== undefined ? Number(p.stock_min) : 0
                                    const isOutOfStock = stockNum === 0
                                    const isLowStock = !isOutOfStock && stockNum <= stockMinNum

                                    return (
                                        <TableRow 
                                            key={p.id} 
                                            className={cn(
                                                "hover:bg-muted/50 transition-colors",
                                                isOutOfStock && "bg-red-50/80 text-red-900 hover:bg-red-100/80 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30",
                                                isLowStock && "bg-amber-50/70 text-amber-900 hover:bg-amber-100/70 dark:bg-amber-900/20 dark:text-amber-200 dark:hover:bg-amber-900/30"
                                            )}
                                        >
                                            <TableCell className={cn(
                                                "font-medium whitespace-normal break-words",
                                                isOutOfStock && "border-l-4 border-red-600",
                                                isLowStock && "border-l-4 border-amber-500"
                                            )}>
                                                {p.name}
                                            </TableCell>
                                            <TableCell className={cn(
                                                "text-muted-foreground whitespace-normal leading-relaxed break-words",
                                                isOutOfStock && "text-red-800 dark:text-red-300",
                                                isLowStock && "text-amber-800 dark:text-amber-300"
                                            )}>
                                                {p.description || '—'}
                                            </TableCell>
                                            <TableCell className="whitespace-normal break-words">{p.category || '—'}</TableCell>
                                            <TableCell className="whitespace-normal break-words font-semibold">{p.stock ?? 0}</TableCell>
                                            <TableCell className="whitespace-normal break-words text-muted-foreground">{p.stock_min ?? 0}</TableCell>
                                            <TableCell className="whitespace-normal break-words font-semibold">${p.price ?? 0}</TableCell>
                                            <TableCell className="whitespace-normal break-words text-muted-foreground">${p.cost ?? 0}</TableCell>
                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <EditarRepuestosDialog repuestos={p} onRepuestosActualizado={() => router.refresh()} />                                            
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* TABLA 2: SERVICIOS */}
            <Card className="overflow-hidden">
                <CardHeader className="pb-4 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-xl font-bold">Servicios</CardTitle>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                {servicios.length}
                            </span>
                        </div>
                        <CardDescription>Mantenimientos y mano de obra del taller</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {servicios.length === 0 ? (
                        <p className="text-muted-foreground text-sm py-4">No hay servicios disponibles</p>
                    ) : (
                        <Table className="min-w-[700px] w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">Nombre</TableHead>
                                    <TableHead className="w-[35%]">Descripción</TableHead>
                                    <TableHead className="w-[20%]">Categoría</TableHead>
                                    <TableHead className="w-[12%]">Precio</TableHead>
                                    <TableHead className="w-[8%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {servicios.map(s => (
                                    <TableRow 
                                        key={s.id} 
                                        className="hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell className="font-medium whitespace-normal break-words">
                                            {s.name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-normal leading-relaxed break-words">
                                            {s.description || '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-normal break-words">{s.category || '—'}</TableCell>
                                        <TableCell className="whitespace-normal break-words font-semibold">${s.price ?? 0}</TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <EditarRepuestosDialog repuestos={s} onRepuestosActualizado={() => router.refresh()} />                                            
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

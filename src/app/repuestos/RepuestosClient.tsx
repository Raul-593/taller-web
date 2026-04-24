"use client"

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

export function RepuestosClient({ repuestos: initial}: {repuestos: any[]}){
    const router = useRouter()
    const [repuestos] = useSyncState(initial)
    const { searchTerm, setSearchTerm, filteredItems } = useSearch(repuestos, (r, term) => 
        r.name.toLowerCase().includes(term.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarRepuesto onRepuestoNuevo={() => router.refresh()} />
            </PageHeader>

            <Card className="md:col-span-4 overflow-hidden">
                <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-start gap-6">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl font-bold">Repuestos</CardTitle>
                        <CardDescription>Busca los repuestos disponibles</CardDescription>
                    </div>

                    <SearchBar 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder="Buscar repuesto por nombre..." 
                        className="w-full sm:w-80 sm:ml-auto"
                    />
                </CardHeader>
                <CardContent>
                    {filteredItems.length === 0 ? (
                        <p className="text-muted-foreground">No hay repuestos disponibles</p>
                    ) : (
                        <Table className="min-w-[800px] w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[15%]">Nombre</TableHead>
                                    <TableHead className="w-[16%]">Descripción</TableHead>
                                    <TableHead className="w-[14%]">Categoria</TableHead>
                                    <TableHead className="w-[10%]">Stock</TableHead>
                                    <TableHead className="w-[10%]">Precio</TableHead>
                                    <TableHead className="w-[10%]">Costo</TableHead>
                                    <TableHead className="w-[8%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map(r => {
                                    const isOutOfStock = Number(r.stock) === 0 && r.category?.toLowerCase() !== "servicios";
                                    return (
                                        <TableRow 
                                            key={r.id} 
                                            className={cn(
                                                "hover:bg-muted/50 transition-colors",
                                                isOutOfStock && "bg-red-50 text-red-900 hover:bg-red-100/80 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30"
                                            )}
                                        >
                                            <TableCell className={cn(
                                                "font-medium whitespace-normal break-words",
                                                isOutOfStock && "border-l-4 border-red-600"
                                            )}>
                                                {r.name}
                                            </TableCell>
                                            <TableCell className={cn(
                                                "text-muted-foreground whitespace-normal leading-relaxed break-words",
                                                isOutOfStock && "text-red-800 dark:text-red-300"
                                            )}>
                                                {r.description || '—'}
                                            </TableCell>
                                            <TableCell className="whitespace-normal break-words">{r.category}</TableCell>
                                            <TableCell className="whitespace-normal break-words">{r.stock}</TableCell>
                                            <TableCell className="whitespace-normal break-words">${r.price}</TableCell>
                                            <TableCell className="whitespace-normal break-words">${r.cost}</TableCell>
                                            <TableCell onClick={e => e.stopPropagation()}>
                                                <EditarRepuestosDialog repuestos={r} onRepuestosActualizado={() => router.refresh()} />                                            
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

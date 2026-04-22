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
                        <Table className="table-fixed w-full">
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
                                {filteredItems.map(r => (
                                    <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium whitespace-normal break-words">{r.name}</TableCell>
                                        <TableCell className="text-muted-foreground whitespace-normal leading-relaxed break-words">
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
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { SearchBar } from "@/componentes/ui/SearchBar"
import { useSyncState } from "@/hooks/useSyncState"
import { useSearch } from "@/hooks/useSearch"
import { useRouter } from "next/navigation"
import { AgregarProvedor } from "@/componentes/provedores/AgregarProvedor"
import { EditarProvedorDialog } from "@/componentes/provedores/EditarProvedor"


export function ProvedoresClient({ provedores: initial}: { provedores: any[]}){
    const router = useRouter()
    const [provedores] = useSyncState(initial)
    const { searchTerm, setSearchTerm, filteredItems } = useSearch(provedores, (p, term) => 
        p.name.toLowerCase().includes(term.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarProvedor onProvedorNuevo={() => router.refresh()} />
            </PageHeader>

            <Card className="md:col-span-4 overflow-hidden">
                <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-start gap-6">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl font-bold">Proveedores</CardTitle>
                        <CardDescription>Busca los proveedores disponibles</CardDescription>
                    </div>

                    <SearchBar 
                        value={searchTerm} 
                        onChange={setSearchTerm} 
                        placeholder="Buscar proveedor por nombre..." 
                        className="w-full sm:w-80 sm:ml-auto"
                    />
                </CardHeader>
                <CardContent>
                    {filteredItems.length === 0 ? (
                        <p className="text-muted-foreground">No hay proveedores registrados</p>
                    ) : (
                        <Table className="table-fixed w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[25%]">Nombre</TableHead>
                                    <TableHead className="w-[20%]">Teléfono</TableHead>
                                    <TableHead className="w-[30%]">Dirección</TableHead>
                                    <TableHead className="w-[15%]">Estado</TableHead>
                                    <TableHead className="w-[10%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map(p => (
                                    <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium whitespace-normal break-words">{p.name}</TableCell>
                                        <TableCell className="whitespace-normal break-words">{p.phone || "—"}</TableCell>
                                        <TableCell className="whitespace-normal break-words">{p.address || "—"}</TableCell>
                                        <TableCell className="whitespace-normal break-words">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${p.active ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                                                {p.active ? "Activo" : "Inactivo"}
                                            </span>
                                        </TableCell>
                                        <TableCell onClick={e => e.stopPropagation()}>
                                            <EditarProvedorDialog provedores={p} onProvedoresActualizado={() => router.refresh()} />
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
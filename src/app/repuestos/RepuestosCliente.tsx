"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { Search } from "lucide-react"
import { Input } from "@/componentes/ui/input"

export function RepuestosClient({ repuestos: initial}: {repuestos: any[]}){
    const [repuestos, setRepuestos] = useState(initial)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        setRepuestos(initial)
    }, [initial])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">593 Cycling Studio</h1>
                </div>
            </div>

            <Card className="md:col-span-4 overflow-hidden">
                <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-start gap-6">
                    {/* Titulo */}
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl font-bold">Repuestos</CardTitle>
                        <CardDescription>Busca los respuestos disponibles</CardDescription>
                    </div>

                    {/* Barra de busqueda */}
                    <div className="relative w-full sm:w-80 sm:ml-auto">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Buscar repuesto por nombre..."
                            className="pl-9 bg-muted/50 focus-visible:bg-background transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {repuestos.length === 0 ? (
                        <p className="text-muted-foreground">No hay repuestos disponibles</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Precio</TableHead>
                                    <TableHead>Costo</TableHead>
                                </TableRow>
                            </TableHeader>
                            {/* Productos */}
                            <TableBody>
                                {repuestos
                                    .filter(r => r.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()))
                                    .map(r => (
                                        <TableRow key={r.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-medium">{r.name}</TableCell>
                                            <TableCell className="text-muted-foreground whitespace-normal leading-relaxed w-150">{r.description}</TableCell>
                                            <TableCell>{r.category}</TableCell>
                                            <TableCell>{r.stock}</TableCell>
                                            <TableCell>{r.price}</TableCell>
                                            <TableCell>{r.cost}</TableCell>
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
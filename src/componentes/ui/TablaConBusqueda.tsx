"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { SearchBar } from "@/componentes/ui/SearchBar"
import { EstadoVacio } from "@/componentes/ui/EstadoVacio"

// Describe una columna de la tabla: encabezado y cómo renderizar cada celda.
export interface Columna<T> {
    key: string
    header: string
    className?: string
    render: (item: T) => React.ReactNode
}

interface TablaConBusquedaProps<T> {
    titulo: string
    descripcion?: string
    items: T[]
    columns: Columna<T>[]
    mensajeVacio: string
    // Si se indican, la tarjeta muestra una barra de búsqueda que filtra los items.
    searchKeys?: (keyof T)[]
    placeholderBusqueda?: string
    // Contenido extra en el encabezado (por ejemplo, filtros por pestañas).
    accionEncabezado?: React.ReactNode
    // Si se indica, las filas son clicables (por ejemplo, para abrir un detalle).
    alClicFila?: (item: T) => void
    claseTabla?: string
    claseContenido?: string
}

// Tarjeta con tabla y búsqueda opcional. Reemplaza el patrón repetido
// Card + CardHeader + SearchBar + Table que aparece en los listados internos.
export function TablaConBusqueda<T extends { id: string }>({
    titulo,
    descripcion,
    items,
    columns,
    mensajeVacio,
    searchKeys,
    placeholderBusqueda = "Buscar...",
    accionEncabezado,
    alClicFila,
    claseTabla,
    claseContenido,
}: TablaConBusquedaProps<T>) {
    const [searchTerm, setSearchTerm] = useState("")

    // Filtra los items por el término de búsqueda en los campos indicados.
    const filtrados = useMemo(() => {
        if (!searchKeys || !searchTerm.trim()) return items
        const term = searchTerm.toLowerCase()
        return items.filter((item) =>
            searchKeys.some((key) => String(item[key] ?? "").toLowerCase().includes(term))
        )
    }, [items, searchKeys, searchTerm])

    return (
        <Card className="md:col-span-4 overflow-hidden">
            <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-start gap-6">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl font-bold">{titulo}</CardTitle>
                    {descripcion && <CardDescription>{descripcion}</CardDescription>}
                </div>
                {searchKeys && (
                    <SearchBar
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder={placeholderBusqueda}
                        className="w-full sm:w-80 sm:ml-auto"
                    />
                )}
                {accionEncabezado}
            </CardHeader>
            <CardContent className={claseContenido}>
                {filtrados.length === 0 ? (
                    <EstadoVacio mensaje={searchTerm ? "Sin resultados para la búsqueda." : mensajeVacio} />
                ) : (
                    <Table className={claseTabla}>
                        <TableHeader>
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col.key} className={col.className}>
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtrados.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className={alClicFila ? "cursor-pointer hover:bg-muted/50" : "hover:bg-muted/50 transition-colors"}
                                    onClick={alClicFila ? () => alClicFila(item) : undefined}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.key} className="whitespace-normal break-words">
                                            {col.render(item)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

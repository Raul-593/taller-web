"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/componentes/ui/cards"
import { Toaster } from "sonner"
import { EditarBicicletaDialog } from "@/componentes/bicicleta/EditarBicicleta"
import { AgregarBicicleta } from "@/componentes/bicicleta/AgregarBicicleta"
import { Input } from "@/componentes/ui/input"
import { Search } from "lucide-react"

type Bicicleta = {
  id: string
  brand: string
  model: string
  serial_number: string
  observacion: string
  customers: { name: string } | null
}

export function BicicletasClient({ bicicletas }: { bicicletas: Bicicleta[] }) {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
 
   const filtradas = useMemo(() =>
     bicicletas.filter(b => 
       (b.customers?.name || "Sin cliente")
         .toLowerCase()
         .includes(searchTerm.toLowerCase())
     ),
     [bicicletas, searchTerm]
   )

  return (
    <div className="flex flex-col gap-6">
      <Toaster richColors position="top-right" />
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        {/* Titulo y descripcion */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">593 Cycling Studio</h1>
          <p className="text-muted-foreground mt-1">
            {filtradas.length} bicicleta{filtradas.length !== 1 ? "s" : ""}
            {searchTerm ? ` encontradas para "${searchTerm}"` : " registradas"}
          </p>
        </div>
        {/* Botones */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Buscador */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              className="pl-9 bg-muted/50 focus-visible:bg-background transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Agregar Bicicleta */}
          <AgregarBicicleta onBicicletaAgregado={() => router.refresh()} />
        </div>
      </div>

      {/* Grid de cards */}
      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <p className="text-sm">No hay bicicletas para este cliente</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtradas.map(b => (
            <EditarBicicletaDialog
              key={b.id}
              bicicleta={b}
              onBicicletaActualizada={() => router.refresh()}
              trigger={
                <Card className="flex flex-col hover:shadow-md transition-shadow duration-200 cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {b.customers?.name || "Sin cliente"}
                      </span>
                    </div>
                    <CardTitle className="text-base font-semibold mt-2 leading-snug">
                      {b.brand} {b.model}
                    </CardTitle>
                    <CardDescription className="text-xs font-mono tracking-wide">
                      # {b.serial_number || "—"}
                    </CardDescription>
                  </CardHeader>

                  {b.observacion && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed border-t border-border pt-3">
                        {b.observacion}
                      </p>
                    </CardContent>
                  )}
                </Card>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { EditarBicicletaDialog } from "@/componentes/bicicleta/EditarBicicleta"
import { AgregarBicicleta } from "@/componentes/bicicleta/AgregarBicicleta"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { SearchBar } from "@/componentes/ui/SearchBar"
import { useSearch } from "@/hooks/useSearch"

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

  const { searchTerm, setSearchTerm, filteredItems: filtradas } = useSearch(bicicletas, (b, term) => 
    (b.customers?.name || "Sin cliente")
      .toLowerCase()
      .includes(term.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">      
      <PageHeader 
        subtitle={`
          ${filtradas.length} 
          bicicleta${filtradas.length !== 1 ? "s" : ""}
          ${searchTerm ? ` encontradas para "
            ${searchTerm}"` : " registradas"}
        `}
      >
        <SearchBar 
          value={searchTerm} 
          onChange={setSearchTerm} 
          placeholder="Buscar por cliente..." 
          className="w-full sm:w-72"
        />
        <AgregarBicicleta onBicicletaAgregado={() => router.refresh()} />
      </PageHeader>

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

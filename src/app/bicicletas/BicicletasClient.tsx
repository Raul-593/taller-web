"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/componentes/ui/cards"
import { Toaster } from "sonner"
import { EditarBicicletaDialog } from "@/componentes/bicicleta/EditarBicicleta"
import { AgregarBicicleta } from "@/componentes/bicicleta/AgregarBicicleta"

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

  const clientes = useMemo(() => {
    const nombres = bicicletas.map(b => b.customers?.name || "Sin cliente")
    return Array.from(new Set(nombres)).sort()
  }, [bicicletas])

  const [filtro, setFiltro] = useState("Todas")

  const filtradas = useMemo(() =>
    filtro === "Todas"
      ? bicicletas
      : bicicletas.filter(b => (b.customers?.name || "Sin cliente") === filtro),
    [bicicletas, filtro]
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
            {filtro !== "Todas" ? ` de ${filtro}` : " registradas"}
          </p>
        </div>
        {/* Botones */}
        <div className="flex items-center gap-4">
          {/* Dropdown */}
          <div className="relative">
            <select
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="
                appearance-none cursor-pointer
                bg-background border border-border rounded-lg
                pl-4 pr-10 py-2.5
                text-sm font-medium text-foreground
                shadow-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                hover:border-foreground/30
                transition-colors duration-150
                min-w-[200px]
              "
            >
              <option value="Todas">Todos los clientes ({bicicletas.length})</option>
              <optgroup label="Clientes">
                {clientes.map(cliente => (
                  <option key={cliente} value={cliente}>
                    {cliente} ({bicicletas.filter(b => (b.customers?.name || "Sin cliente") === cliente).length})
                  </option>
                ))}
              </optgroup>
            </select>        
            {/* Icono flecha */}
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
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
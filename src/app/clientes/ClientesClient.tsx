"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { AgregarClienteDialog } from "@/componentes/clientes/AgregarClienteDialog"
import { EditarClienteDialog } from "@/componentes/clientes/EditarClienteDialog"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { SearchBar } from "@/componentes/ui/SearchBar"
import { useSyncState } from "@/hooks/useSyncState"
import { useSearch } from "@/hooks/useSearch"


export function ClientesClient({ clientes: initial }: { clientes: any[] }) {
  const router = useRouter()
  const [clientes] = useSyncState(initial)
  
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(clientes, (c, term) => 
    c.name.toLowerCase().includes(term.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">      
      <PageHeader>
        <AgregarClienteDialog onClienteAgregado={() => router.refresh()} />
      </PageHeader>

      <Card className="md:col-span-4 overflow-hidden">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-start gap-6">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-bold">Clientes</CardTitle>
            <CardDescription>Gestiona y busca tus clientes registrados</CardDescription>
          </div>

          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Buscar cliente por nombre..." 
            className="w-full sm:w-80 sm:ml-auto"
          />
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <p className="text-muted-foreground">No hay clientes registrados.</p>
          ) : (
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Nombre</TableHead>
                  <TableHead className="w-[25%]">Teléfono</TableHead>
                  <TableHead className="w-[35%]">Dirección</TableHead>
                  <TableHead className="w-[10%]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium whitespace-normal break-words">{c.name}</TableCell>
                    <TableCell className="whitespace-normal break-words">{c.phone || '—'}</TableCell>
                    <TableCell className="whitespace-normal break-words">{c.address || '—'}</TableCell>
                    <TableCell>
                        <EditarClienteDialog 
                            cliente={c} 
                            onClienteActualizado={() => router.refresh()} 
                        />
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
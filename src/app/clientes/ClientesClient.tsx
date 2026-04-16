"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { Toaster } from "sonner"
import { AgregarClienteDialog } from "@/componentes/clientes/AgregarClienteDialog"
import { EditarClienteDialog } from "@/componentes/clientes/EditarClienteDialog"
import { Input } from "@/componentes/ui/input"
import { Search } from "lucide-react"


export function ClientesClient({ clientes: initial }: { clientes: any[] }) {
  const router = useRouter()
  const [clientes, setClientes] = useState(initial)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setClientes(initial)
  }, [initial])

  return (
    <div className="flex flex-col gap-6">
      <Toaster richColors position="top-right" />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">593 Cycling Studio</h1>
        </div>
        {/* Agregar Cliente */}
        <AgregarClienteDialog onClienteAgregado={() => router.refresh()} />
      </div>

      <Card className="md:col-span-4 overflow-hidden">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-start gap-6">
          {/* Titulo y descripcion */}
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl font-bold">Clientes</CardTitle>
            <CardDescription>Gestiona y busca tus clientes registrados</CardDescription>
          </div>

          {/* Filtrar por cliente */}
          <div className="relative w-full sm:w-80 sm:ml-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente por nombre..."
              className="pl-9 bg-muted/50 focus-visible:bg-background transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <p className="text-muted-foreground">No hay clientes registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Acciones </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.phone || '—'}</TableCell>
                    <TableCell>{c.address || '—'}</TableCell>
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
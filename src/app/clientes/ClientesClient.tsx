"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { Toaster } from "sonner"
import { AgregarClienteDialog } from "@/componentes/clientes/AgregarClienteDialog"
import { EditarClienteDialog } from "@/componentes/clientes/EditarClienteDialog"


export function ClientesClient({ clientes: initial }: { clientes: any[] }) {
  const router = useRouter()
  const [clientes, setClientes] = useState(initial)

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

      <Card className="md:col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Clientes</CardTitle>
          <CardDescription>Clientes registrados</CardDescription>
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
                {clientes.map(c => (
                  <TableRow key={c.id}>
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
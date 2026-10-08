"use client"

import { useRouter } from "next/navigation"
import { AgregarClienteDialog } from "@/componentes/(interno)/clientes/AgregarClienteDialog"
import { EditarClienteDialog } from "@/componentes/(interno)/clientes/EditarClienteDialog"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda"


export function ClientesClient({ clientes: initial }: { clientes: any[] }) {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <AgregarClienteDialog onClienteAgregado={() => router.refresh()} />
      </PageHeader>

      <TablaConBusqueda
        titulo="Clientes"
        descripcion="Gestiona y busca tus clientes registrados"
        items={initial}
        columns={[
          { key: "name", header: "Nombre", className: "w-[30%]", render: (c) => <span className="font-medium">{c.name}</span> },
          { key: "phone", header: "Teléfono", className: "w-[25%]", render: (c) => c.phone || "—" },
          { key: "address", header: "Dirección", className: "w-[35%]", render: (c) => c.address || "—" },
          {
            key: "actions",
            header: "Acciones",
            className: "w-[10%]",
            render: (c) => (
              <EditarClienteDialog
                cliente={c}
                onClienteActualizado={() => router.refresh()}
              />
            ),
          },
        ]}
        searchKeys={["name"]}
        placeholderBusqueda="Buscar cliente por nombre..."
        mensajeVacio="No hay clientes registrados."
        claseTabla="table-fixed"
      />
    </div>
  )
}

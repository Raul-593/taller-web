"use client"

import { PageHeader } from "@/componentes/ui/PageHeader"
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda"
import { BadgeEstado } from "@/componentes/ui/BadgeEstado"
import { useRouter } from "next/navigation"
import { AgregarProvedor } from "@/componentes/(interno)/provedores/AgregarProvedor"
import { EditarProvedorDialog } from "@/componentes/(interno)/provedores/EditarProvedor"


export function ProvedoresClient({ provedores: initial}: { provedores: any[]}){
    const router = useRouter()

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarProvedor onProvedorNuevo={() => router.refresh()} />
            </PageHeader>

            <TablaConBusqueda
                titulo="Proveedores"
                descripcion="Busca los proveedores disponibles"
                items={initial}
                columns={[
                    { key: "name", header: "Nombre", className: "w-[25%]", render: (p) => <span className="font-medium">{p.name}</span> },
                    { key: "phone", header: "Teléfono", className: "w-[20%]", render: (p) => p.phone || "—" },
                    { key: "address", header: "Dirección", className: "w-[30%]", render: (p) => p.address || "—" },
                    {
                        key: "estado",
                        header: "Estado",
                        className: "w-[15%]",
                        render: (p) => <BadgeEstado estado={p.active ? "activo" : "inactivo"} />,
                    },
                    {
                        key: "actions",
                        header: "",
                        className: "w-[10%]",
                        render: (p) => (
                            <EditarProvedorDialog provedores={p} onProvedoresActualizado={() => router.refresh()} />
                        ),
                    },
                ]}
                searchKeys={["name"]}
                placeholderBusqueda="Buscar proveedor por nombre..."
                mensajeVacio="No hay proveedores registrados"
                claseTabla="min-w-[650px] w-full"
            />
        </div>
    )
}

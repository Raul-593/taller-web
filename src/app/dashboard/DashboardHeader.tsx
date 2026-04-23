"use client"

import { useRouter } from "next/navigation"
import { AgregarMantenimiento } from "@/componentes/mantenimiento/AgregarMantenimiento"

export function DashboardHeader() {
    const router = useRouter()

    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight"> 593 Cycling Studio </h1>
            <AgregarMantenimiento onMantenimientoAgregado={() => router.refresh()} />
        </div>
    )
}

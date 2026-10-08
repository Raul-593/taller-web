import { cn } from "@/lib/utils"

interface BadgeEstadoProps {
    estado: string
    variant?: "activo" | "inactivo" | "custom"
    customClass?: string
    label?: string
}

const variantClasses: Record<string, string> = {
    activo: "bg-green-100 text-green-700 border-green-200",
    inactivo: "bg-red-100 text-red-700 border-red-200",
}

export function BadgeEstado({ estado, variant = "activo", customClass, label }: BadgeEstadoProps) {
    const isActive = estado === "activo" || estado === "Activo" || estado === "Activa"
    const baseClass = "px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter"
    const colorClass = variant === "custom" ? customClass : variantClasses[isActive ? "activo" : "inactivo"]

    return (
        <span className={cn(baseClass, colorClass)}>
            {label || (isActive ? "Activo" : "Inactivo")}
        </span>
    )
}

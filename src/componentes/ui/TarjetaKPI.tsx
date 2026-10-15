import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { cn } from "@/lib/utils"

interface TarjetaKPIProps {
    titulo: string
    descripcion?: string
    valor: string | number
    color?: "default" | "green" | "red" | "amber" | "blue"
    icono?: React.ReactNode
}

const colorClasses: Record<string, string> = {
    default: "",
    green: "text-green-600",
    red: "text-red-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
}

export function TarjetaKPI({ titulo, descripcion, valor, color = "default", icono }: TarjetaKPIProps) {
    return (
        <Card className="flex flex-col justify-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-bold">{titulo}</CardTitle>
                    {descripcion && <CardDescription>{descripcion}</CardDescription>}
                </div>
                {icono}
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold", colorClasses[color])}>{valor}</div>
            </CardContent>
        </Card>
    )
}

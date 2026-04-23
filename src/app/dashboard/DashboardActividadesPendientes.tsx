import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"

type Mantenimiento = {
    id: string
    service_date: string
    description: string
    observation: string
    cost: string
    status: string
    bicycles: {
        brand: string
        model: string
        customers: { name: string } | null
    }
}

export function DashboardActividadesSummary({ total }: { total: number }) {
    return (
        <Card className="flex flex-col justify-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-base font-semibold">
                        Actividades Pendientes
                    </CardTitle>
                    <CardDescription>
                        Mantenimientos en curso
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <span className="text-2xl font-bold">{total}</span>
                </div>
            </CardContent>
        </Card>
    )
}

export function DashboardActividadesTable({ activities }: { activities: Mantenimiento[] }) {
    return (
        <Card className="flex flex-col justify-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Actividades Pendientes</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="overflow-x-auto max-h-[400px] overflow-y-auto">
                {(activities?.length || 0) === 0 ? (
                    <p className="text-muted-foreground text-sm mt-2">No hay mantenimientos pendientes.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Bicicleta</TableHead>
                                <TableHead>Costo</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activities.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>{m.service_date}</TableCell>
                                    <TableCell>{(m.bicycles as any)?.customers?.name || '-'}</TableCell>
                                    <TableCell>{(m.bicycles as any)?.brand} {(m.bicycles as any)?.model}</TableCell>
                                    <TableCell className="font-medium">${m.cost}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${m.status === 'en_proceso' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {m.status === 'en_proceso' ? 'En Proceso' : 'Recibido'}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}

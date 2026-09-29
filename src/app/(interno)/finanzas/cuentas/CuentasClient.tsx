"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/componentes/ui/table"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { useSyncState } from "@/hooks/useSyncState"
import { AgregarCuenta } from "@/componentes/finanzas/cuentas/AgregarCuenta"
import { EditarCuentaDialog } from "@/componentes/finanzas/cuentas/EditarCuenta"
import { getAccountTypeLabel } from "@/lib/finanzas/labels"
import type { AccountWithBalance } from "@/lib/finanzas/balance"

export function CuentasClient({ cuentas: initial }: { cuentas: AccountWithBalance[] }) {
    const router = useRouter()
    const [cuentas] = useSyncState(initial)

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

    const cuentasActivas = cuentas.filter((c) => c.is_active)
    const saldoTotal = cuentasActivas.reduce((acc, c) => acc + c.balance, 0)
    const saldoEfectivo = cuentasActivas
        .filter((c) => c.type === "efectivo")
        .reduce((acc, c) => acc + c.balance, 0)
    const saldoBancos = cuentasActivas
        .filter((c) => c.type === "banco")
        .reduce((acc, c) => acc + c.balance, 0)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarCuenta onCuentaAgregada={() => router.refresh()} />
            </PageHeader>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card className="flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Saldo Total</CardTitle>
                            <CardDescription>Todas las cuentas activas</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(saldoTotal)}</div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Efectivo</CardTitle>
                            <CardDescription>Caja chica y similares</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(saldoEfectivo)}</div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="space-y-1">
                            <CardTitle>Bancos</CardTitle>
                            <CardDescription>Cuentas bancarias</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(saldoBancos)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="md:col-span-4 overflow-hidden">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold">Cuentas</CardTitle>
                    <CardDescription>Caja chica, bancos y otros medios donde entra o sale dinero del taller</CardDescription>
                </CardHeader>
                <CardContent>
                    {cuentas.length === 0 ? (
                        <p className="text-muted-foreground">No hay cuentas registradas.</p>
                    ) : (
                        <Table className="min-w-[650px] w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Nombre</TableHead>
                                    <TableHead className="w-[20%]">Tipo</TableHead>
                                    <TableHead className="w-[20%]">Saldo</TableHead>
                                    <TableHead className="w-[15%]">Estado</TableHead>
                                    <TableHead className="w-[15%]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cuentas.map((c) => (
                                    <TableRow key={c.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium whitespace-normal break-words">{c.name}</TableCell>
                                        <TableCell>{getAccountTypeLabel(c.type)}</TableCell>
                                        <TableCell className={`font-bold ${c.balance < 0 ? "text-red-600" : ""}`}>
                                            {formatCurrency(c.balance)}
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${
                                                    c.is_active
                                                        ? "bg-green-100 text-green-700 border-green-200"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                                }`}
                                            >
                                                {c.is_active ? "Activa" : "Inactiva"}
                                            </span>
                                        </TableCell>
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <EditarCuentaDialog cuenta={c} onCuentaActualizada={() => router.refresh()} />
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
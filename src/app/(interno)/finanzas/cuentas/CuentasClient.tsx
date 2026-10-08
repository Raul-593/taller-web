"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda"
import { BadgeEstado } from "@/componentes/ui/BadgeEstado"
import { TarjetaKPI } from "@/componentes/ui/TarjetaKPI"
import { AgregarCuenta } from "@/componentes/(interno)/finanzas/cuentas/AgregarCuenta"
import { EditarCuentaDialog } from "@/componentes/(interno)/finanzas/cuentas/EditarCuenta"
import { getAccountTypeLabel } from "@/lib/finanzas/labels"
import type { AccountWithBalance } from "@/lib/finanzas/balance"

export function CuentasClient({ cuentas: initial }: { cuentas: AccountWithBalance[] }) {
    const router = useRouter()
    const cuentas = initial

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
                <TarjetaKPI
                    titulo="Saldo Total"
                    descripcion="Todas las cuentas activas"
                    valor={formatCurrency(saldoTotal)}
                />
                <TarjetaKPI
                    titulo="Efectivo"
                    descripcion="Caja chica y similares"
                    valor={formatCurrency(saldoEfectivo)}
                    color="green"
                />
                <TarjetaKPI
                    titulo="Bancos"
                    descripcion="Cuentas bancarias"
                    valor={formatCurrency(saldoBancos)}
                    color="blue"
                />
            </div>

            <TablaConBusqueda
                titulo="Cuentas"
                descripcion="Caja chica, bancos y otros medios donde entra o sale dinero del taller"
                items={cuentas}
                columns={[
                    { key: "name", header: "Nombre", className: "w-[30%]", render: (c) => <span className="font-medium">{c.name}</span> },
                    { key: "type", header: "Tipo", className: "w-[20%]", render: (c) => getAccountTypeLabel(c.type) },
                    {
                        key: "balance",
                        header: "Saldo",
                        className: "w-[20%]",
                        render: (c) => (
                            <span className={`font-bold ${c.balance < 0 ? "text-red-600" : ""}`}>
                                {formatCurrency(c.balance)}
                            </span>
                        ),
                    },
                    {
                        key: "estado",
                        header: "Estado",
                        className: "w-[15%]",
                        render: (c) => (
                            <BadgeEstado estado={c.is_active ? "activo" : "inactivo"} label={c.is_active ? "Activa" : "Inactiva"} />
                        ),
                    },
                    {
                        key: "actions",
                        header: "",
                        className: "w-[15%]",
                        render: (c) => (
                            <EditarCuentaDialog cuenta={c} onCuentaActualizada={() => router.refresh()} />
                        ),
                    },
                ]}
                mensajeVacio="No hay cuentas registradas."
                claseTabla="min-w-[650px] w-full"
            />
        </div>
    )
}
"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/componentes/ui/PageHeader";
import { TablaConBusqueda } from "@/componentes/ui/TablaConBusqueda";
import { AgregarTransferencia } from "@/componentes/(interno)/finanzas/transferencias/AgregarTransferencia";

export function TransferenciasClient({
  transferencias: initial,
  accounts,
}: {
  transferencias: any[];
  accounts: any[];
}) {
  const router = useRouter();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader>
        <AgregarTransferencia
          accounts={accounts}
          onTransferenciaAgregada={() => router.refresh()}
        />
      </PageHeader>

      <TablaConBusqueda
        titulo="Transferencias"
        descripcion="Movimientos de dinero entre cuentas del taller"
        items={initial}
        columns={[
          { key: "fecha", header: "Fecha", className: "w-[15%]", render: (t) => t.transfer_date },
          {
            key: "movimiento",
            header: "Movimiento",
            className: "w-[40%]",
            render: (t) => (
              <div className="flex items-center gap-2">
                <span className="font-medium">{t.from_account.name || "—"}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{t.to_account.name || "—"}</span>
              </div>
            ),
          },
          {
            key: "descripcion",
            header: "Descripción",
            className: "w-[25%]",
            render: (t) => <span className="text-muted-foreground">{t.description || "—"}</span>,
          },
          {
            key: "monto",
            header: "Monto",
            className: "w-[20%] text-right",
            render: (t) => <div className="text-right font-bold">{formatCurrency(Number(t.amount))}</div>,
          },
        ]}
        mensajeVacio="No hay transferencias registradas."
        claseTabla="min-w-[700px] w-full"
      />
    </div>
  );
}

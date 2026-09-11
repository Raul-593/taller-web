"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/componentes/ui/cards";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/componentes/ui/table";
import { PageHeader } from "@/componentes/ui/PageHeader";
import { useSyncState } from "@/hooks/useSyncState";
import { AgregarTransferencia } from "@/componentes/finanzas/transferencias/AgregarTransferencia";

export function TransferenciasClient({
  transferencias: initial,
  accounts,
}: {
  transferencias: any[];
  accounts: any[];
}) {
  const router = useRouter();
  const [transferencias] = useSyncState(initial);

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

      <Card className="md:col-span-4 overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold">Transferencias</CardTitle>
          <CardDescription>
            Movimientos de dinero entre cuentas del taller
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transferencias.length === 0 ? (
            <p className="text-muted-foreground">
              No hay transferencias registradas.
            </p>
          ) : (
            <Table className="min-w-[700px] w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[15%]">Fecha</TableHead>
                  <TableHead className="w-[40%]">Movimiento</TableHead>
                  <TableHead className="w-[25%]">Descripción</TableHead>
                  <TableHead className="w-[20%] text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transferencias.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.transfer_date}</TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {t.from_account.name || "—"}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium">{t.to_account.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words text-muted-foreground">
                      {t.description || "—"}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatCurrency(Number(t.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { FormDialog } from "@/componentes/FormDialog";
import { createClient } from "@/utils/supabase/clients";
import { toast } from "sonner";

type Props = {
  accounts: any[];
  onTransferenciaAgregada: (transferencia: any) => void;
  trigger?: React.ReactNode;
};

export function AgregarTransferencia({
  accounts,
  onTransferenciaAgregada,
  trigger,
}: Props) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [transferenciaDate, setTrasferenciaDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [description, setDescription] = useState("");

  const cuentasActivas = accounts.filter((a) => a.is_active);
  const cuentasDestino = cuentasActivas.filter((a) => a.id !== fromAccount);

  function reset() {
    setFromAccount("");
    setToAccount("");
    setAmount("");
    setTrasferenciaDate(new Date().toISOString().split("T")[0]);
    setDescription("");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount || parseFloat(amount) < 0) {
      toast.error("Llenar todos los campos, monto mayor a 0");
      return;
    }
    if (fromAccount === toAccount) {
      toast.error("La cuenta origen y destino deben de ser diferentes");
      return;
    }
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("transferencias")
      .insert([
        {
          from_account: fromAccount,
          to_account: toAccount,
          amount: parseFloat(amount),
          transfer_date: transferenciaDate,
          description: description.trim() || null,
        },
      ])
      .select()
      .single();
    if (error) {
      toast.error("Error al registrar transferencia");
      console.error(error);
    } else if (data) {
      onTransferenciaAgregada(data);
      toast.success("Transferencia Agregada con exito");
      reset();
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  return (
    <FormDialog
      title="Registrar Transferecnia"
      description="Mueve dinero entre cuentas del taller"
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) reset();
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Guardar Transferencia"
    >
      <div className="grid gap-2">
        <Label>Cuenta Origen</Label>
        <select
          value={fromAccount}
          onChange={(e) => {
            setFromAccount(e.target.value);
            if (e.target.value === toAccount) setToAccount("");
          }}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecciona una cuenta</option>
          {cuentasActivas.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label>Cuenta Destino</Label>
        <select
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
          disabled={!fromAccount}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecciona una cuenta</option>
          {cuentasDestino.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Monto</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="transferenciaDate">Fecha</Label>
          <Input
            id="transferenciaDate"
            type="date"
            value={transferenciaDate}
            onChange={(e) => setTrasferenciaDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej. Desposito de caja chica"
        />
      </div>
    </FormDialog>
  );
}

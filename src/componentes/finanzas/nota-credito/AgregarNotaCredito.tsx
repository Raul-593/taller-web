"use client";

import { useState, useEffect } from "react";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { Button } from "@/componentes/ui/button";
import { FormDialog } from "@/componentes/FormDialog";
import { CustomerSelect } from "@/componentes/ui/CustomerSelect";
import { Product, ProductSelect } from "@/componentes/ui/ProductSelect";
import { createClient } from "@/utils/supabase/clients";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { credit_note_type } from "@/lib/finanzas/labels";
import type { CreditNoteType } from "@/lib/finanzas/types";

type Props = {
  onNotaAgregada: (nota: any) => void;
  trigger?: React.ReactNode;
};

export function AgregarNotaCredito({ onNotaAgregada, trigger }: Props) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [ventas, setVentas] = useState<any[]>([]);
  const [saleId, setSaleId] = useState("");
  const [creditType, setCreditType] = useState<CreditNoteType>("devolucion");
  const [reason, setReason] = useState("");
  const [creditDate, setCreditDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [manualTotal, setManualTotal] = useState("");
  const [items, setItems] = useState<any[]>([]);

  // Ventas del cliente seleccionado, para elegir sobre cuál se hace la nota
  useEffect(() => {
    if (!customerId) {
      setVentas([]);
      setSaleId("");
      return;
    }
    const fetchVentas = async () => {
      const { data } = await supabase
        .from("sales")
        .select("id, sales_date, total, observacion")
        .eq("customer_id", customerId)
        .order("sales_date", { ascending: false });
      setVentas(data ?? []);
    };
    fetchVentas();
  }, [customerId, supabase]);

  function reset() {
    setCustomerId("");
    setVentas([]);
    setSaleId("");
    setCreditType("devolucion");
    setReason("");
    setCreditDate(new Date().toISOString().split("T")[0]);
    setManualTotal("");
    setItems([]);
  }

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: string,
    value: any,
    product?: Product,
  ) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === "product_id" && product) {
      item.unit_price = product.price || 0;
    }
    newItems[index] = item;
    setItems(newItems);
  };

  const totalItems = items.reduce(
    (acc, i) => acc + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0),
    0,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !saleId || !reason.trim()) {
      toast.error("Selecciona cliente, venta, y escribe una razón");
      return;
    }
    if (
      creditType === "devolucion" &&
      items.filter((i) => i.product_id).length === 0
    ) {
      toast.error("Agrega al menos un producto para la devolución");
      return;
    }
    if (
      creditType === "descuento" &&
      (!manualTotal || parseFloat(manualTotal) <= 0)
    ) {
      toast.error("Ingresa el monto del descuento");
      return;
    }

    setIsSubmitting(true);

    const { data: nota, error: notaError } = await supabase
      .from("credit_notes")
      .insert([
        {
          sale_id: saleId,
          customer_id: customerId,
          credit_date: creditDate,
          credit_type: creditType,
          reason: reason.trim(),
          total: creditType === "descuento" ? parseFloat(manualTotal) : 0,
          status: "pendiente",
        },
      ])
      .select()
      .single();

    if (notaError) {
      toast.error("Error al registrar la nota de crédito");
      console.error(notaError);
      setIsSubmitting(false);
      return;
    }

    if (creditType === "devolucion") {
      const itemsToInsert = items
        .filter((i) => i.product_id)
        .map((i) => ({
          credit_note_id: nota.id,
          product_id: i.product_id,
          quantity: parseInt(i.quantity),
          unit_price: parseFloat(i.unit_price),
        }));

      const { error: itemsError } = await supabase
        .from("credit_note_items")
        .insert(itemsToInsert);
      if (itemsError) {
        toast.error(
          "Nota creada, pero hubo un error al registrar los productos",
        );
        console.error(itemsError);
      }
    }

    onNotaAgregada(nota);
    toast.success("Nota de crédito registrada — queda pendiente de aprobación");
    reset();
    setIsOpen(false);
    setIsSubmitting(false);
  };

  return (
    <FormDialog
      title="Registrar Nota de Crédito"
      description="Devolución de producto o descuento sobre una venta ya realizada"
      trigger={trigger}
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) reset();
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Guardar Nota"
      className="sm:max-w-2xl"
    >
      <CustomerSelect value={customerId} onChange={(id) => setCustomerId(id)} />

      <div className="grid gap-2">
        <Label>Venta</Label>
        <select
          value={saleId}
          onChange={(e) => setSaleId(e.target.value)}
          disabled={!customerId}
          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          <option value="">
            {customerId ? "Seleccionar venta" : "Selecciona un cliente primero"}
          </option>
          {ventas.map((v) => (
            <option key={v.id} value={v.id}>
              {v.observacion ? `${v.observacion} — ` : ""}{v.sales_date} — ${v.total}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tipo</Label>
          <select
            value={creditType}
            onChange={(e) => setCreditType(e.target.value as CreditNoteType)}
            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {credit_note_type.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="creditDate">Fecha</Label>
          <Input
            id="creditDate"
            type="date"
            value={creditDate}
            onChange={(e) => setCreditDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reason">Razón</Label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej. Casco defectuoso"
        />
      </div>

      {creditType === "descuento" ? (
        <div className="grid gap-2">
          <Label htmlFor="manualTotal">Monto del Descuento</Label>
          <Input
            id="manualTotal"
            type="number"
            step="0.01"
            value={manualTotal}
            onChange={(e) => setManualTotal(e.target.value)}
            placeholder="0.00"
          />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 border-b">
            <Label className="font-bold text-sm">Productos a Devolver</Label>
            <Button
              type="button"
              onClick={addItem}
              size="sm"
              variant="outline"
              className="h-7 text-[10px]"
            >
              + Agregar Producto
            </Button>
          </div>
          <div className="p-3 space-y-3">
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">
                Sin productos agregados.
              </p>
            ) : (
              items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-2 items-end bg-zinc-50/50 p-2 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <ProductSelect
                      value={item.product_id || null}
                      onChange={(id, product) =>
                        updateItem(index, "product_id", id, product)
                      }
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-[10px] uppercase text-zinc-400 font-bold">
                      Cant.
                    </Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-[10px] uppercase text-zinc-400 font-bold">
                      Precio
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={(e) =>
                        updateItem(index, "unit_price", e.target.value)
                      }
                      className="h-9 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="h-9 w-9 p-0 text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
            {items.length > 0 && (
              <div className="text-right text-sm font-bold pt-2 border-t">
                Total: ${totalItems.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
    </FormDialog>
  );
}

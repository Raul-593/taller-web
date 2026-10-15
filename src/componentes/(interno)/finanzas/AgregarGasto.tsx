"use client";

import { useState, useEffect } from "react";
import { Input } from "@/componentes/ui/input";
import { Label } from "@/componentes/ui/label";
import { FormDialog } from "@/componentes/(interno)/FormDialog";
import { createClient } from "@/utils/supabase/clients";
import { toast } from "sonner";
import { Button } from "@/componentes/ui/button";
import { PlusCircle } from "lucide-react";
import { Product } from "@/componentes/ui/ProductSelect";
import { FormularioItemProducto } from "@/componentes/(interno)/finanzas/FormularioItemProducto";
import { getPurchaseCategories } from "@/lib/finanzas/categorias";
import { AgregarRepuesto } from "@/componentes/(interno)/repuestos/AgregarRepuesto";
import { SelectCuenta } from "@/componentes/(interno)/finanzas/SelectCuenta";

type Props = {
  accounts: any[];
  categorias: any[];
  onGastoAgregado: (gasto: any) => void;
  trigger?: React.ReactNode;
};

export function AgregarGasto({
  accounts,
  categorias,
  onGastoAgregado,
  trigger,
}: Props) {
  // Base de datos
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Datos del Gasto
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString());
  const [description, setDescription] = useState("");
  const [subTotal, setSubTotal] = useState("");
  const [total, setTotal] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transferencia");
  const [status, setStatus] = useState("completado");
  const [observacion, setObservacion] = useState("");

  // Cuentas
  const [accountId, setAccountId] = useState("");
  const cuentasActivas = accounts.filter((a) => a.is_active);

  // Categorias
  const [categoryId, setCategoryId] = useState("");
  const opcionesCategorias = getPurchaseCategories(categorias);

  // Items de la compra
  const [items, setItems] = useState<any[]>([]);

  // Proveedor
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("suppliers")
        .select("id, name")
        .order("name", { ascending: true });
      if (data) setSuppliers(data);
    };
    fetchData();
  }, [supabase]);

  // Cálculo automático de totales
  useEffect(() => {
    if (items.length === 0) return; // sin items, el total se ingresa a mano
    const calculatedSubTotal = items.reduce(
      (acc, item) => acc + (item.total || 0),
      0,
    );
    setSubTotal(calculatedSubTotal.toFixed(2));
    setTotal(calculatedSubTotal.toFixed(2));
  }, [items]);

  // Limpiar formulario
  function reset() {
    setPurchaseDate(new Date().toISOString());
    setSupplierId("");
    setDescription("");
    setSubTotal("0");
    setTotal("0");
    setPaymentMethod("transferencia");
    setStatus("completado");
    setObservacion("");
    setAccountId("");
    setCategoryId("");
    setItems([]);
  }

  // Ítem nuevo con la forma que usa este formulario.
  const crearItemVacio = () => ({
    product_id: "",
    productName: "",
    quantity: 1,
    unit_price: 0,
    total: 0,
  });

  // En gastos el precio se toma del costo del producto.
  const alSeleccionarProducto = (item: any, product: Product) => ({
    ...item,
    unit_price: (product as any).cost || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !purchaseDate ||
      parseFloat(total) === 0 ||
      !paymentMethod ||
      !supplierId
    ) {
      toast.error("Existen campos obligatorios vacíos o el total es 0");
      return;
    }

    if (status === "completado" && !accountId) {
      toast.error("Selecciona la cuenta de donde salio el dinero");
      return;
    }
    if (status === "completado" && !categoryId) {
      toast.error("Selecciona una categoria");
      return;
    }

    setIsSubmitting(true);

    // Insertar la compra
    const { data: purchase, error: purchasError } = await supabase
      .from("purchases")
      .insert([
        {
          purchase_date: purchaseDate,
          supplier_id: supplierId,
          description: description.trim() || null,
          sub_total: parseFloat(subTotal),
          total: parseFloat(total),
          payment_method: paymentMethod,
          status: status,
          observacion: observacion.trim() || null,
          account_id: accountId || null,
          category_id: categoryId || null,
        },
      ])
      .select()
      .single();

    if (purchasError) {
      toast.error("Error al registrar la compra");
      console.error(purchasError);
      setIsSubmitting(false);
      return;
    }

    // Insertar los ítems
    const filteredItems = items.filter((item) => item.product_id);
    if (filteredItems.length > 0) {
      const itemsToInsert = filteredItems.map((item: any) => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: parseInt(item.quantity),
        unit_cost: parseFloat(item.unit_price),
        total: parseFloat(item.total),
      }));

      const { error: itemsError } = await supabase
        .from("purchase_items")
        .insert(itemsToInsert);

      if (itemsError) {
        toast.error(
          "Compra creada, pero hubo un error al registrar los productos",
        );
        console.error(itemsError);
      }
    }

    if (purchase) {
      onGastoAgregado(purchase);
      toast.success("Compra e ítems registrados correctamente");
      reset();
      setIsOpen(false);
    }
    setIsSubmitting(false);
  };

  const defaultTrigger = trigger || (
    <Button
      variant="default"
      className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg px-6 font-semibold"
    >
      Gastos
    </Button>
  );

  return (
    <FormDialog
      title="Registrar Gasto"
      description="Ingresa los datos de la compra del taller"
      trigger={defaultTrigger}
      isOpen={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) reset();
      }}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitLabel="Guardar Gasto"
      className="sm:max-w-2xl"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="purchaseDate">Fecha de Compra *</Label>
          <Input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label>Proveedor *</Label>
          <select
            value={supplierId || ""}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="">Seleccionar Proveedor</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 col-span-2">
          <Label htmlFor="description">Descripción</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej. Lote de llantas..."
          />
        </div>

        {/* Sección de Ítems */}
        <FormularioItemProducto
          items={items}
          onChange={setItems}
          titulo="Productos / Repuestos"
          etiquetaPrecio="Costo Unit."
          crearItemVacio={crearItemVacio}
          alSeleccionarProducto={alSeleccionarProducto}
          accionExtraProducto={(index) => (
            <AgregarRepuesto
              onRepuestoNuevo={(nuevo) =>
                setItems((prev) => {
                  const nuevos = [...prev];
                  const base = { ...nuevos[index], product_id: nuevo.id };
                  const item = alSeleccionarProducto(base, nuevo);
                  const cantidad = Number(item.quantity) || 0;
                  const precio = Number(item.unit_price) || 0;
                  nuevos[index] = { ...item, total: cantidad * precio };
                  return nuevos;
                })
              }
              trigger={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              }
            />
          )}
        />

        {/* Resumen Final */}
        {items.length > 0 ? (
          <div className="col-span-2 grid sm:grid-cols-2 gap-6 bg-zinc-900 text-white p-5 rounded-xl mt-2">
            <div className="flex flex-col gap-1">
              <Label className="text-zinc-400 text-[10px] uppercase tracking-wider">
                Sub Total Acumulado
              </Label>
              <div className="text-lg font-medium">
                ${parseFloat(subTotal).toFixed(2)}
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <Label className="text-orange-400 text-[10px] uppercase tracking-wider font-bold">
                Total a Pagar
              </Label>
              <div className="text-2xl font-black text-orange-400">
                ${parseFloat(total).toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-2 grid gap-2 bg-zinc-900 text-white p-5 rounded-xl mt-2">
            <Label
              htmlFor="totalManual"
              className="text-orange-400 text-[10px] uppercase tracking-wider font-bold"
            >
              Monto Total del Gasto *
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-orange-400">$</span>
              <input
                id="totalManual"
                type="number"
                step="0.01"
                min="0"
                value={total}
                onChange={(e) => {
                  setTotal(e.target.value);
                  setSubTotal(e.target.value);
                }}
                className="bg-transparent border-b border-zinc-700 focus:border-white outline-none text-2xl font-black text-orange-400 w-full"
                placeholder="0.00"
              />
            </div>
          </div>
        )}

        <div className="grid gap-2">
          <Label>Método de Pago *</Label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label>Estado del Pago</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="completado">Pagado</option>
            <option value="pendiente">Pendiente</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <SelectCuenta
          cuentas={cuentasActivas}
          value={accountId}
          onChange={setAccountId}
          label={`Cuenta ${status === "completado" ? "*" : ""}`}
          required={status === "completado"}
        />

        {/* Categorias de finanzas*/}
        <div className="grid gap-2">
          <Label>Categorias {status === "completado" && "*"}</Label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Seleccionar categoria</option>
            {opcionesCategorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.group ? `${c.group} > ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 col-span-2">
          <Label htmlFor="observacion">Observación</Label>
          <Input
            id="observacion"
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            placeholder="Ej. Lote de llantas..."
          />
        </div>
      </div>
    </FormDialog>
  );
}

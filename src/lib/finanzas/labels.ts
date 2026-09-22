import type { AccountType } from "./types";

export const account_type: { value: AccountType; label: string }[] = [
    { value: "efectivo", label: "Efectivo" },
    { value: "banco", label: "Banco" },
    { value: "tarjeta", label: "Tarjeta" },
    { value: "billetera_digital", label: "Billetera Digital" },
]

export function getAccountTypeLabel(type: AccountType): string{
    return account_type.find((t) => t.value === type)?.label ?? type
}

export const payment_methods: { value: string; label: string }[] = [
    { value: "efectivo", label: "Efectivo" },
    { value: "transferencia", label: "Transferencia" },
    { value: "tarjeta", label: "Tarjeta" },
]

export const sales_types: { value: string; label: string }[] = [
    { value: "retail", label: "Producto" },
    { value: "service", label: "Servicio" },
    { value: "mixed", label: "Venta Mixta" },
]

export function getSalesTypesLabel(value: string | null): string {
    if (!value) return "-"
    return sales_types.find((t) => t.value === value)?.label ?? value
}

export function getPaymentMethodLabel(value: string | null): string {
    if (!value) return "-"
    return payment_methods.find((t) => t.value === value)?.label ?? value
}

// Credit Note Type
export const credit_note_type: {value: string; label: string}[] = [
    { value: "devolucion", label: "Devolucion"},
    { value: "descuento", label: "Descuento"}
]

export function getCreditNoteTypeLabel(value: string): string{
    return credit_note_type.find((t) => t.value === value)?.label ?? value
}
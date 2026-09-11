// Tipos del modulo de finanzas

export type AccountType = "efectivo" | "banco" | "tarjeta" | "billetera_digital"

export type Account = {
    id: string
    name: string
    type: AccountType
    initial_balance: number
    initial_balance_date: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export type CategoryType = "ingreso" | "gasto"

export type Category = {
    id: string
    parent_id: string | null
    name: string
    category_type: CategoryType
    description: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export type CategoryConHijos = Category & {
    subcategorias?: Category[]
}

// reference_type no tiene check
// Union solo para autocompletar en el editor
// string & {} perimite sugerencias

export type MovimientoReferenceType = 
| "payment"
| "maintenance_payment"
| "puchase"
| "debt_payment"
| (string & {})

export type Movimiento = {
    id: string
    account_id: string
    category_id: string
    amount: number
    movement_date: string
    description: string | null
    reference_type: MovimientoReferenceType | null
    reference_id: string | null
    created_by: string
    created_at: string
    updated_at: string
}

export type MovimientoConRelaciones = Movimiento & {
    accounts: Pick<Account, "id" | "name" | "type"> | null
    categories: Pick<Category, "id" | "name" | "category_type"> | null
}

export type Transferencia = {
    id: string
    from_account: string
    to_account: string
    amount: number
    transfer_date: string
    description: string | null
    created_by: string
    created_at: string
}

export type DebtStatus = "pendiente" | "completado" | "cancelado"

export type Debt = {
    id: string
    creditor: string
    description: string | null
    total_amount: number
    due_date: string | null
    status: DebtStatus
    purchase_id: string | null
    created_by: string
    created_at: string
    updated_at: string
}

// Lista de deudas
export type DebtConSaldo = Debt & {
    total_pagado: number
    saldo_pendiente: number
}

export type PaymentSource = "manual" | "maintenance_transfer"

// Nota de Credito
export type CreditNoteType = "devolucion" | "descuento"
export type CreditNoteStatus = "pendiente" | "completado" | "cancelado"

export type CreditNote = {
    id: string
    customer_id: string
    sale_id: string
    credit_date: string
    credit_type: CreditNoteType
    status: CreditNoteStatus
    reason: string
    total: number
    created_at: string
    updated_at: string
}

export type CreditNoteItem = {
    id: string
    credit_note_id: string
    product_id: string
    quantity: number
    unit_price: number
    total: number
    created_at: string
}

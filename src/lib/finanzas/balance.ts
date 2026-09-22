import type { SupabaseClient } from "@supabase/supabase-js";
import type { Account, Category, Movimiento, Transferencia } from "./types";

export type AccountWithBalance = Account & { balance: number }

type MovimientoParaSaldo = Pick<Movimiento, "account_id" | "amount" | "movement_date"> & {
    categories: Pick<Category, "category_type"> | null
}

type TransferenciaParaSaldo = Pick<Transferencia, "from_account" | "to_account" | "amount" | "transfer_date">

/* 
    Calcular el saldo de una cuenta a partir del saldo inicial
    Reusable para cargar la pagina y al ingresar nuevos datos despues de actualizacion, sin duplicar la logica
*/

export function calcularSaldoCuenta(
    account: Account,
    movimientos: MovimientoParaSaldo[],
    transferencia: TransferenciaParaSaldo[]
): number{
    let saldo = Number(account.initial_balance) || 0

    for (const m of movimientos){
        if (m.account_id !== account.id) continue

        if(m.movement_date < account.initial_balance_date) continue

        if(m.categories?.category_type === "ingreso") saldo += Number(m.amount) || 0
        else if (m.categories?.category_type === "gasto") saldo -= Number(m.amount) || 0 
    }
    for(const t of transferencia){
        if (t.transfer_date < account.initial_balance_date) continue
        if (t.to_account === account.id) saldo += Number(t.amount) || 0
        if (t.from_account === account.id) saldo -= Number(t.amount) || 0
    }
    return saldo
}
/* 
    Trae todas las cuentas con saldo calculado
    Recibe el cliente de supabase
*/
export async function getAccountsWithBalance(
    supabase: SupabaseClient
): Promise<AccountWithBalance[]> {
    const [
        {data: accounts, error: accountsError},
        { data: movimientos, error: movimientosError },
        { data: transferencias, error: transferenciasError }
    ] = await Promise.all([
        supabase.from("accounts").select("*").order("name", {ascending: true}),
        supabase.from("movimientos").select("account_id, amount, movement_date, categories(category_type)"),
        supabase.from("transferencias").select("from_account, to_account, amount, transfer_date"),
    ])
    if(accountsError) throw accountsError
    if(movimientosError) throw movimientosError
    if(transferenciasError) throw transferenciasError

    return (accounts ?? []).map((account) => ({
        ...account,
        balance: calcularSaldoCuenta(
            account,
            (movimientos ?? []) as unknown as MovimientoParaSaldo[],
            (transferencias ?? []) as unknown as TransferenciaParaSaldo[]
        ),
    }))
}

// Saldo total de todas las cuentas
export function calcularSaldoTotal(cuentas: AccountWithBalance[]): number {
    return cuentas.reduce((acc, c) => (c.is_active ? acc + c.balance : acc), 0)
}
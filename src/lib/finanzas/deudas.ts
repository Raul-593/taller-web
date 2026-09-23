import type { SupabaseClient } from "@supabase/supabase-js"

export type SaldoDeuda = {
    totalPagado: number
    saldoPendiente: number
}

export function calcularSaldoDeuda(totalAmount: number, pagos: { amount: number }[]): SaldoDeuda {
    const totalPagado = pagos.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    const saldoPendiente = Math.max(0, (Number(totalAmount) || 0) - totalPagado)
    return { totalPagado, saldoPendiente }
}

/*
  Saldo de muchas deudas a la vez, en una sola consulta a movimientos
  (reference_type = 'debt_payment'), igual que getSaldosVentas
*/
export async function getSaldosDeudas(
    supabase: SupabaseClient,
    deudas: { id: string; total_amount: number }[]
): Promise<Record<string, SaldoDeuda>> {
    const ids = deudas.map((d) => d.id)
    if (ids.length === 0) return {}

    const { data: pagos, error } = await supabase
        .from("movimientos")
        .select("reference_id, amount")
        .eq("reference_type", "debt_payment")
        .in("reference_id", ids)

    if (error) throw error

    const pagosPorDeuda = new Map<string, { amount: number }[]>()
    for (const p of pagos ?? []) {
        const lista = pagosPorDeuda.get(p.reference_id) ?? []
        lista.push({ amount: p.amount })
        pagosPorDeuda.set(p.reference_id, lista)
    }

    const result: Record<string, SaldoDeuda> = {}
    for (const deuda of deudas) {
        result[deuda.id] = calcularSaldoDeuda(deuda.total_amount, pagosPorDeuda.get(deuda.id) ?? [])
    }
    return result
}
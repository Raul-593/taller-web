import { SupabaseClient } from "@supabase/supabase-js"

export type SaldoVenta = {
    totalPagado: number
    totalCreditoAplicado: number
    saldoPendiente: number
}

export function calcularSaldoVenta(
    total: number,
    pagos: { amount:  number}[],
    creditos: { amount: number}[]
): SaldoVenta{
    const totalPagado = pagos.reduce((acc, pago) => acc + (Number(pago.amount) || 0), 0)
    const totalCreditoAplicado = creditos.reduce((acc, credito) => acc + Math.abs(Number(credito.amount) || 0), 0)
    const saldoPendiente = Math.max(0, (Number(total) || 0) - totalPagado - totalCreditoAplicado)
    return { totalPagado, totalCreditoAplicado, saldoPendiente }
}

/*
  Trae las ventas a la vez
  Cuanto se ha pagado y cuanto credito se ha aplicado
*/

export async function getSaldosVentas(
    supabase: SupabaseClient,
    ventas: { id: string; total: number }[]
): Promise<Record<string, SaldoVenta>> {
    
    const saleIds = ventas.map((v) => v.id)
    if (saleIds.length === 0 ) return {}

    const [{ data: pagos, error: pagosError }, { data: mantenimientos, error: mantError }] = await Promise.all([
        supabase.from("payments").select("sale_id, amount").in("sale_id", saleIds),
        supabase.from("maintenance_records").select("id, sale_id").in("sale_id", saleIds),
    ])

    if (pagosError) throw pagosError
    if (mantError) throw mantError

    const maintenanceIdToSaleId = new Map((mantenimientos ?? []).map((m) => [m.id, m.sale_id]))
    const maintenanceIds = [...maintenanceIdToSaleId.keys()]

    const creditosQuery = supabase
        .from("customer_credit")
        .select("sale_id, maintenance_id, amount")
        .eq("credit_type", "aplicado")
    
    const { data: creditos, error: creditosError } = maintenanceIds.length > 0
        ? await creditosQuery.or(`sale_id.in.(${saleIds.join(",")}),maintenance_id.in.(${maintenanceIds.join(",")})`)
        : await creditosQuery.in("sale_id", saleIds)
        
    if (creditosError) throw creditosError

    const pagosPorVenta = new Map<string, {amount: number}[]>()
    for (const p of pagos ?? []) {
        const lista = pagosPorVenta.get(p.sale_id) ?? []
        lista.push({ amount: p.amount })
        pagosPorVenta.set(p.sale_id, lista)
    }

    const creditosPorVenta = new Map<string, {amount: number}[]>()
    for (const c of creditos ?? []) {
        const saleId = c.sale_id ?? (c.maintenance_id ? maintenanceIdToSaleId.get(c.maintenance_id) : null)
        if (!saleId) continue
        const lista = creditosPorVenta.get(saleId) ?? []
        lista.push({ amount: c.amount })
        creditosPorVenta.set(saleId, lista)
    }

    const resultados: Record<string, SaldoVenta> = {}
    for (const v of ventas) {
        resultados[v.id] = calcularSaldoVenta(
            v.total,
            pagosPorVenta.get(v.id) ?? [],
            creditosPorVenta.get(v.id) ?? []
        )
    }
    return resultados
}
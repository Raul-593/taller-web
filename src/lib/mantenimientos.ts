export type SaldoMantenimiento = {
    totalPagado: number
    totalCreditoAplicado: number
    saldoPendiente: number
}

export function calcularSaldoMantenimiento(
    cost: number,
    pagos: { amount: number | string }[],
    creditos: { amount: number | string; credit_type: string }[]
): SaldoMantenimiento {
    const totalPagado = pagos.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)
    const totalCreditoAplicado = creditos
        .filter((c) => c.credit_type === 'aplicado')
        .reduce((acc, c) => acc + Math.abs(Number(c.amount) || 0), 0)
    const saldoPendiente = Math.max(0, (Number(cost) || 0) - totalPagado - totalCreditoAplicado)
    return { totalPagado, totalCreditoAplicado, saldoPendiente }
}
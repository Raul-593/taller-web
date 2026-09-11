import { createClient } from "@/utils/supabase/server"
import { getSaldosDeudas } from "@/lib/finanzas/deudas"
import { DeudasClient } from "./DeudasClient"

export default async function DeudasPage() {
    const supabase = await createClient()

    const [
        { data: deudas, error: deudasError },
        { data: accounts, error: accountsError },
        { data: categorias, error: categoriasError },
    ] = await Promise.all([
        supabase
            .from("deudas")
            .select(`
                id, creditor, description, total_amount, due_date, status, purchase_id,
                purchases (suppliers (name))
            `)
            .order("created_at", { ascending: false }),
        supabase.from("accounts").select("id, name, type, is_active").order("name", { ascending: true }),
        supabase.from("categories").select("id, parent_id, name, category_type").order("name", { ascending: true }),
    ])

    if (deudasError) console.error("Error al obtener deudas:", deudasError)
    if (accountsError) console.error("Error al obtener cuentas:", accountsError)
    if (categoriasError) console.error("Error al obtener categorías:", categoriasError)

    let saldos: Record<string, { totalPagado: number; saldoPendiente: number }> = {}
    try {
        saldos = await getSaldosDeudas(
            supabase,
            (deudas ?? []).map((d: any) => ({ id: d.id, total_amount: d.total_amount }))
        )
    } catch (error) {
        console.error("Error al calcular saldos de deudas:", error)
    }

    return (
        <DeudasClient
            deudas={deudas ?? []}
            accounts={accounts ?? []}
            categorias={categorias ?? []}
            saldos={saldos}
        />
    )
}
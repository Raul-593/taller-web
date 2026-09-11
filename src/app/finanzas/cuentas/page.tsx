import { createClient } from "@/utils/supabase/server";
import { getAccountsWithBalance } from "@/lib/finanzas/balance";
import { CuentasClient } from "./CuentasClient";

export default async function CuentasPage() {
    const supabase = await createClient()
    
    let cuentas: Awaited<ReturnType<typeof getAccountsWithBalance>> = []
    try{
        cuentas = await getAccountsWithBalance(supabase)
    } catch (error) {
        console.error("Error al cargar las cuentas", error)
    }

    return <CuentasClient cuentas={cuentas} />
}
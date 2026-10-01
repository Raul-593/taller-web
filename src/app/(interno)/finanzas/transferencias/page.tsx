import { createClient } from "@/utils/supabase/server";
import { TransferenciasClient } from "./TransferenciaClient"

export default async function TransferecniaPage() {
    const supabase = await createClient()

    const [
        {data: transferencias, error: transferenciasError },
        {data: accounts, error: accountsError },
    ] = await Promise.all([
        supabase
            .from("transferencias")
            .select(`
                id, amount, transfer_date, description,
                from_account( id, name),
                to_account( id, name)
            `)
            .order("transfer_date", {ascending: false}),
        supabase.from("accounts").select("id, name, type, is_active").order("name",{ascending: true}),            
    ])
    
     if (transferenciasError) console.error("Error al obtener transferencias:", transferenciasError)
    if (accountsError) console.error("Error al obtener cuentas:", accountsError)

    return (
        <TransferenciasClient
            transferencias={transferencias ?? []}
            accounts={accounts ?? []}
        />
    )
}
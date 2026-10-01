import { createClient } from "@/utils/supabase/server";
import { NotasCreditoClient } from "./NotaCreditoClient"

export default async function NotaCreditoPage() {
    const supabase = await createClient()

    const { data: notas, error } = await supabase
        .from('credit_notes')
        .select(`
            id, credit_date, credit_type, reason, total, status,
            sale_id, customer_id,
            customers(name),
            sales(id, sales_date, total, observacion)
        `)
        .order('credit_date', { ascending: false })
    
    if(error) console.error("Error al obtener notas de credito:", error)

    return <NotasCreditoClient notas={notas ?? []} />
}
import { createClient } from "@/utils/supabase/server"
import { ClientesClient } from "./ClientesClient"

export default async function Clientes() {
  const supabase = await createClient()
  
  // Fetch Customers
  const { data: clientes, error: clientesError } = await supabase
    .from('customers')
    .select('id, name, phone, address, created_at')
    .order('name', { ascending: true })

  if (clientesError) {
    console.error('Error al obtener clientes:', clientesError)
  }
  
  return <ClientesClient clientes={clientes ?? []} />
}
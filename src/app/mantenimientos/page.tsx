import { createClient } from "@/utils/supabase/server"
import { MantenimientoClient } from "./MantenimientoClient"

type Mantenimiento = {
  id: string
  service_date: string
  description: string
  observation: string
  cost: string
  status: string
  sales_type: string | null
  payment_method: string | null
  sale_id: string | null
  bicicleta: {
    brand: string
    model: string
    customers: { name: string } | null
  }
}

export default async function Mantenimientos() {
  const supabase = await createClient()

  const [
    { data: mantenimientos, error: mantenimientosError },
    { data: accounts, error: accountsError },
  ] = await Promise.all([
    supabase
      .from('maintenance_records')
      .select(`
        id, service_date, description, observation, cost, status, 
        sales_type, payment_method, sale_id, created_at, updated_at,
        bicycles ( brand, model, 
        customers (id, name)
        ),
        maintenance_items(
          id, product_id, quantity, unit_price, total_price, description
        ), 
        maintenance_payments (
          id, amount, payment_date, 
          payment_method, notes, 
          accounts (name)
        ),
        customer_credit(
          amount, credit_type, reason
        )
      `)
      .order('service_date', { ascending: false })
      .order('updated_at', { ascending: false }),
    supabase
      .from('accounts')
      .select(`
        id, name, type, is_active
      `)
      .order('name', { ascending: true })  
  ])

  if (mantenimientosError) { console.error('Error al obtener mantenimientos:', mantenimientosError) }
  if (accountsError) { console.error('Error al obtener cuentas: ', accountsError) }

  return (
    <MantenimientoClient 
      mantenimientos={(mantenimientos as unknown as Mantenimiento[]) ?? []} 
      accounts={accounts ?? []}
    />
  )
}
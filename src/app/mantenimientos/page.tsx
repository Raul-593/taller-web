import { createClient } from "@/utils/supabase/server"
import { MantenimientoClient } from "./MantenimientoClient"

type Mantenimiento = {
  id: string
  service_date: string
  description: string
  observation: string
  cost: string
  status: string
  bicicleta: {
    brand: string
    model: string
    customers: { name: string } | null
  }
}

export default async function Mantenimientos() {
  const supabase = await createClient()

  const { data: mantenimientos, error: mantenimientosError } = await supabase
    .from('maintenance_records')
    .select(`
        id, 
        service_date, 
        description, 
        observation, 
        cost, 
        status,
        bicycles (
            brand, 
            model, 
            customers (name)
        )
    `)
    .order('service_date', { ascending: false })

  if (mantenimientosError) { console.error('Error al obtener mantenimientos:', mantenimientosError) }

  return (
    <MantenimientoClient mantenimientos={(mantenimientos as unknown as Mantenimiento[]) ?? []} />
  )
}
import { createClient } from "@/utils/supabase/server"
import {BicicletasClient} from "./BicicletasClient"

type Bicicleta = {
  id: string
  brand: string
  model: string
  serial_number: string
  observacion: string
  customers: { name: string } | null
}

export default async function Bicicletas() {
  const supabase = await createClient()

  const { data: bicicletas, error } = await supabase
    .from("bicycles")
    .select(`
      id,
      brand,
      model,
      serial_number,
      observacion,
      created_at,
      customers ( name )
    `)
    .order("created_at", { ascending: false })

  if (error) console.error("Error al obtener bicicletas:", error)

  return <BicicletasClient bicicletas={(bicicletas as unknown as Bicicleta[]) ?? []} />
}
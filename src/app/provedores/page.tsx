import { createClient } from "@/utils/supabase/server"
import { ProvedoresClient } from "./ProvedoresClient"


export default async function Provedores(){
  const supabase = await createClient()

  // Obtener Datos
  const { data: provedores, error: provedoresError } = await supabase
    .from('suppliers')
    .select(`
        id, 
        name, 
        phone, 
        address,  
        active
    `)

  
  if (provedoresError){
    console.error('Error al obtener proveedores:', provedoresError)
  }

  return <ProvedoresClient provedores={provedores ?? []} />
}


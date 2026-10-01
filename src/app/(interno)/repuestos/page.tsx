import { createClient } from "@/utils/supabase/server"
import { RepuestosClient } from "./RepuestosClient"

export default async function Repuestos(){
  const supabase = await createClient()

  // Obtener Datos
  const { data: repuestos, error: respuestosError } = await supabase
    .from('products')
    .select('id, name, description, category, category_id, type, stock, stock_min, price, cost, active, created_at, updated_at')
    .eq('active', true)
    .not('category_id', 'is', null)
    .order('name', { ascending: true })
  
  if (respuestosError){
    console.error('Error al obtener repuestos:', respuestosError)
  }

  return <RepuestosClient repuestos={repuestos ?? []} />
}
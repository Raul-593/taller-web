import { createClient } from "@/utils/supabase/server"
import { FinanzasClient } from "./FinanzasClient"

export default async function Finanzas() {
  const supabase = await createClient()

  // Tabla Sales
  const {data: sale, error: saleError} = await supabase
  .from('sales')
  .select(`
    id, 
    sales_date,
    sales_type, 
    sub_total, 
    discount, 
    total, 
    payment_method, 
    status, 
    observacion,
    customers (name)
  `)
  .order('created_at', { ascending: false })

  if (saleError) {
    console.error('Error al obtener ventas :', saleError)
  }

  // Tabla Purchases
  const {data: purchases, error: purchasesError} = await supabase
  .from('purchases')
  .select(`
    id, 
    purchase_date,
    supplier_id,
    description, 
    sub_total, 
    total, 
    payment_method, 
    status, 
    observacion,
    suppliers (name)
  `)
  .order('created_at', { ascending: false })

  if (purchasesError) {
    console.error('Error al obtener compras:', purchasesError)
  }
  
  return (
    <FinanzasClient sales={sale || []} purchases={purchases || []} />
  )
}
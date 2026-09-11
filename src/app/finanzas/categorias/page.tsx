import { createClient } from "@/utils/supabase/server";
import { CategoriasClient } from "./CategoriasClient";

export default async function CategoriaPage() {
    const supabase = await createClient()

    const { data: categorias, error } = await supabase
        .from("categories")
        .select("*")
        .order("category_type", {ascending: true})
        .order("name", {ascending: true})
        
    if (error) console.log("Error al obtener categorias:", error)

    return <CategoriasClient categorias={categorias ?? []} />
    
}
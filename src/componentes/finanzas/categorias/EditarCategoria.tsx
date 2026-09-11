"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { CategoriaForm } from "./CategoriaForm"
import { Button } from "@/componentes/ui/button"
import { isSystemCategory } from "@/lib/finanzas/categorias"
import type { Category } from "@/lib/finanzas/types"

type Props = {
    categoria: any
    categoriasPadre: Category[]
    onCategoriaActualizada: (categoria: any) => void
    trigger?: React.ReactNode
}

export function EditarCategoria({ categoria, categoriasPadre, onCategoriaActualizada, trigger}: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

   const handleSubmit = async (value: any) => {
    // Segundo filtro para evitar modificaciones en categorias del sistema
    if (isSystemCategory(categoria)) {
        toast.error("Esta categoria no se puede modificar ")
        return
    }
    if (!value.name){
        toast.error("Nombre obligatorio")
        return
    }
    setIsSubmitting(true)

    const { data, error } = await supabase
        .from("categories")
        .update({
            name: value.name,
            category_type: value.category_type,
            parent_id: value.parent_id,
            description: value.description || null,
        })
        .eq("id", categoria.id)
        .select()
        .single()

    if(error){
        if (error.code === "23505") {
            toast.error("Ya existe una categoria con ese nombre")
        } else {
            toast.error("Error al editar categoria")
        }
        console.error(error)
    } else if (data) {
        onCategoriaActualizada(data)
        toast.success("Categoria actualizada")
        setIsOpen(false)
    }
    setIsSubmitting(false)
   }
   const defaultTrigger = trigger || <Button variant="outline" size="sm">Editar</Button>

   return (
        <CategoriaForm
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={defaultTrigger}
            categoriasPadre={categoriasPadre}
            initialData={categoria}
            title="Editar Categoria"
            description="Actualizar categoria"
            submitLabel="Guardar Cambios"
        />
    )
}
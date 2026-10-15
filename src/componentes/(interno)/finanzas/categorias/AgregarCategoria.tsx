"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { CategoriaForm } from "./CategoriaForm"
import type { Category } from "@/lib/finanzas/types"

type Props = {
    categoriasPadre: Category[]
    onCategoriaAgregada: (categoria: any) => void
    trigger?: React.ReactNode
}

export function AgregarCategoria({ categoriasPadre, onCategoriaAgregada, trigger}: Props) {
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (values: any) => {
        if (!values.name) {
            toast.error("El nombre es obligatorio")
            return
        }
        setIsSubmitting(true)

        const {data, error} = await supabase
            .from("categories")
            .insert([{
                name: values.name,
                category_type: values.category_type,
                parent_id: values.parent_id,
                description: values.description || null,
            }])
            .select()
            .single()

        if (error) {
            if (error.code === " 23505"){
            toast.error("Ya existe una categoria con ese nombre")
        } else {
            toast.error("Error al crear la categoria")
        }
        console.error(error)
        } else if(data){
            onCategoriaAgregada(data)
            toast.success("Categoria creada con Exito")
            setIsOpen(false)
        }
        setIsSubmitting(false)
    }

    return (
        <CategoriaForm 
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        trigger={trigger}
        categoriasPadre={categoriasPadre}
        title="Agregar nueva Categoria"
        description="Crear nueva Categoria"
        submitLabel="Guardar Categoria"
        />
    )
}
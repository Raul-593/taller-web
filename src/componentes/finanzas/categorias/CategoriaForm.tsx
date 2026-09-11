// Esta segundo y en orden ->
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { category_types } from "@/lib/finanzas/categorias"
import type { Category, CategoryType } from "@/lib/finanzas/types"

type CategoriaData = {
    name: string
    category_type: CategoryType
    parent_id: string | null
    description: string
};

type Props = {
    title: string
    description: string
    submitLabel: string
    initialData?: any
    categoriasPadre: Category[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: CategoriaData) => Promise<void>
    isSubmitting: boolean
    trigger?: React.ReactNode
}

export function CategoriaForm({
    title,
    description,
    submitLabel,
    initialData,
    categoriasPadre,
    isOpen,
    onOpenChange,
    onSubmit,
    isSubmitting,
    trigger,
}: Props) {
    // Estado local de los campos del formulario
    const [name, setName] = useState("")
    const [categoryType, setCategoryType] = useState<CategoryType>("gasto")
    const [parentId, setParentId] = useState<string | null>(null)
    const [desc, setDesc] = useState("")

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setCategoryType(initialData.category_type || "gasto")
                setParentId(initialData.parent_id || "")
                setDesc(initialData.description || "")
            } else {
                setName("")
                setCategoryType("gasto")
                setParentId("")
                setDesc("")
            }
        }
    }, [isOpen, initialData])

    // Solo se puede elegir una categoria padre del mismo tipo y nunca la que se esta editando
    const padreDisponible = useMemo(
        () => categoriasPadre.filter((c) => c.category_type === categoryType && c.id !== initialData?.id),
        [categoriasPadre, categoryType, initialData?.id]
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            name: name.trim(),
            category_type: categoryType,
            parent_id: parentId || null,
            description: desc.trim(),
        })
    }

    return (
        <FormDialog
            title={title}
            description={description}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            trigger={trigger}
            submitLabel={submitLabel}
        >
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sueldos" />
            </div>
            {/* Categoria */}
            <div className="grid gap-2">
                <Label htmlFor="categoryType">Tipo</Label>
                <select
                   id="categoryType"
                    value={categoryType}
                    onChange={(e) => { 
                        setCategoryType(e.target.value as CategoryType) 
                        setParentId("") 
                    }}
                    className="w-full bg-background border border-input rounded-mx px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {category_types.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            {/* Elegir Categoria Padre */}
            <div className="grid gap-2">
                <Label htmlFor="parent_id">Categoria Padre (opcional)</Label>
                <select
                    id="parent_id"
                    value={parentId || ""}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-background border border-input rounded-mx px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="">Ninguna categoria principal</option>
                    {padreDisponible.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>

            {/* Descripcion */}
            <div className="grid gap-2">
                <Label htmlFor="description">Descripcion</Label>
                <Input id="descripcion" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Opcional" />
            </div>
        </FormDialog>
    )
}
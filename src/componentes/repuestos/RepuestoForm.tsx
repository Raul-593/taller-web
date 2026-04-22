"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"

type RepuestoData = {
    name: string
    description: string
    category: string
    stock: string
    price: string
    cost: string
}

type Props = {
    title: string
    description: string
    submitLabel: string
    initialData?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: RepuestoData) => Promise<void>
    isSubmitting: boolean
    trigger?: React.ReactNode
}

export function RepuestoForm({ 
    title, 
    description, 
    submitLabel, 
    initialData, 
    isOpen, 
    onOpenChange, 
    onSubmit, 
    isSubmitting,
    trigger 
}: Props) {
    const [name, setName] = useState("")
    const [desc, setDesc] = useState("")
    const [cat, setCat] = useState("")
    const [stock, setStock] = useState("")
    const [price, setPrice] = useState("")
    const [cost, setCost] = useState("")

    // Cargar datos iniciales (para edición)
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setDesc(initialData.description || "")
                setCat(initialData.category || "")
                setStock(initialData.stock?.toString() || "")
                setPrice(initialData.price?.toString() || "")
                setCost(initialData.cost?.toString() || "")
            } else {
                // Reset para modo "Agregar"
                setName("")
                setDesc("")
                setCat("")
                setStock("")
                setPrice("")
                setCost("")
            }
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            name: name.trim(),
            description: desc.trim(),
            category: cat.trim(),
            stock,
            price,
            cost
        })
    }

    return (
        <FormDialog
            title={title}
            description={description}
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
        >
            <div className="grid gap-2">
                <Label htmlFor="name">Nombre del Repuesto</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Manubrio"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                    id="description"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Ej. Manubrio de aluminio"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                    id="categoria"
                    value={cat}
                    onChange={e => setCat(e.target.value)}
                    placeholder="Ej. Accesorios"
                />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                        id="stock"
                        type="number"
                        value={stock}
                        onChange={e => setStock(e.target.value)}
                        placeholder="0"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="precio">Precio</Label>
                    <Input
                        id="precio"
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.00"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="costo">Costo</Label>
                    <Input
                        id="costo"
                        type="number"
                        value={cost}
                        onChange={e => setCost(e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>
        </FormDialog>
    )
}

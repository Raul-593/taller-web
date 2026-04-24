"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"

type ProvedorData = {
    name: string
    phone: string
    address: string
    active: boolean
}

type Props = {
    title: string
    description: string
    submitLabel: string
    initialData?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: ProvedorData) => Promise<void>
    isSubmitting: boolean
    trigger?: React.ReactNode
}

export function ProvedorForm({ 
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
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [active, setActive] = useState(true)

    // Cargar datos iniciales (para edición)
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setPhone(initialData.phone || "")
                setAddress(initialData.address || "")
                setActive(initialData.active ?? true)
            } else {
                // Reset para modo "Agregar"
                setName("")
                setPhone("")
                setAddress("")
                setActive(true)
            }
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({
            name: name.trim(),
            phone: phone.trim(),
            address: address.trim(),
            active
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
                <Label htmlFor="name">Nombre del Proveedor</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Shimano"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                    id="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ej. 0999999999"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                    id="address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Ej. Av. Principal 123"
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="active">Estado</Label>
                <select
                    id="active"
                    value={active ? "true" : "false"}
                    onChange={e => setActive(e.target.value === "true")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                </select>
            </div>
        </FormDialog>
    )
}

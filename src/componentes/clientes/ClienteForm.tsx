"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"

type ClienteData = {
    name: string
    phone: string
    address: string
}

type Props = {
    title: string
    description: string
    submitLabel: string
    initialData?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: ClienteData) => Promise<void>
    isSubmitting: boolean
    trigger?: React.ReactNode
}

export function ClienteForm({ 
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

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setPhone(initialData.phone || "")
                setAddress(initialData.address || "")
            } else {
                setName("")
                setPhone("")
                setAddress("")
            }
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await onSubmit({ name, phone, address })
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
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej. 0991234567" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej. Av. Principal 123" />
            </div>
        </FormDialog>
    )
}

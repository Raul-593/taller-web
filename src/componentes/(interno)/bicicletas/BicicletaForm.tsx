"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { CustomerSelect } from "@/componentes/ui/CustomerSelect"

type BicicletaData = {
    brand: string
    model: string
    serial_number: string
    observacion: string
    customer_id: string | null
}

type Props = {
    title: string
    description: string
    submitLabel: string
    initialData?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: BicicletaData) => Promise<void>
    isSubmitting: boolean
    trigger?: React.ReactNode
}

export function BicicletaForm({ 
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
    const [brand, setBrand] = useState("")
    const [model, setModel] = useState("")
    const [serialNumber, setSerialNumber] = useState("")
    const [observacion, setObservacion] = useState("")
    const [customerId, setCustomerId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setBrand(initialData.brand || "")
                setModel(initialData.model || "")
                setSerialNumber(initialData.serial_number || "")
                setObservacion(initialData.observacion || "")
                setCustomerId(initialData.customer_id || null)
            } else {
                setBrand("")
                setModel("")
                setSerialNumber("")
                setObservacion("")
                setCustomerId(null)
            }
        }
    }, [isOpen, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        await onSubmit({ brand, model, serial_number: serialNumber, observacion, customer_id: customerId })
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
            <CustomerSelect value={customerId} onChange={setCustomerId} />
            <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ej. Specialized" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="Ej. Epic" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="serialNumber">Número de Serie</Label>
                <Input id="serialNumber" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Ej. SN-123" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="observacion">Observación</Label>
                <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. Rayones en el cuadro" />
            </div>
        </FormDialog>
    )
}

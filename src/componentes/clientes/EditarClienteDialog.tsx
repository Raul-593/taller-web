"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { Button } from "@/componentes/ui/button"

type Props = {
    cliente: any
    onClienteActualizado: (cliente: any) => void
    trigger?: React.ReactNode
}

export function EditarClienteDialog({ cliente, onClienteActualizado, trigger }: Props) {
    const supabase = createClient()
    
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [name, setName] = useState(cliente.name || "")
    const [phone, setPhone] = useState(cliente.phone || "")
    const [address, setAddress] = useState(cliente.address || "")

    // Actualiza los estados locales si las props cambian
    useEffect(() => {
        if (isOpen) {
            setName(cliente.name || "")
            setPhone(cliente.phone || "")
            setAddress(cliente.address || "")
        }
    }, [isOpen, cliente])

    function reset() { 
        setName(cliente.name || "")
        setPhone(cliente.phone || "")
        setAddress(cliente.address || "")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) { 
            toast.error("El nombre es obligatorio")
            return 
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
        .from("customers")
        .update({ 
            name: name.trim(), 
            phone: phone.trim() || null, 
            address: address.trim() || null 
        })
        .eq('id', cliente.id)
        .select("id, name, phone, address")
        .single()

        if (error) { 
            toast.error("Error al actualizar el cliente")
            console.error(error)
        } else if (data)  { 
            onClienteActualizado(data); 
            toast.success("Cliente actualizado con éxito"); 
            setIsOpen(false); 
        }
        setIsSubmitting(false)
    }

    const defaultTrigger = trigger || <Button variant="outline" size="sm"> Editar </Button>

    return (
        <FormDialog 
            title="Editar Cliente"
            description="Modifica los datos del cliente."
            trigger={defaultTrigger}
            isOpen={isOpen}
            onOpenChange={ (open) => { setIsOpen(open); if (!open) reset() }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Actualizar Cliente"
        >
            <div className="grid gap-2">
                <Label htmlFor={`edit-name-${cliente.id}`}>Nombre</Label>
                <Input id={`edit-name-${cliente.id}`} value={name} onChange={e => setName(e.target.value)} placeholder="Ej. Juan Pérez" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-phone-${cliente.id}`}>Teléfono</Label>
                <Input id={`edit-phone-${cliente.id}`} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Ej. 0991234567" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor={`edit-address-${cliente.id}`}>Dirección</Label>
                <Input id={`edit-address-${cliente.id}`} value={address} onChange={e => setAddress(e.target.value)} placeholder="Ej. Av. Principal 123" />
            </div>
        </FormDialog>
    )
}

"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"

type Props = {
    onBicicletaAgregado: (bicicleta: any) => void
    trigger?: React.ReactNode
}

export function AgregarBicicleta({ onBicicletaAgregado, trigger }: Props) {
    // Base de Datos y Modal
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Datos de la Bicicleta
    const [brand, setBrand] = useState("")
    const [model, setModel] = useState("")
    const [serialNumber, setSerialNumber] = useState("")
    const [observacion, setObservacion] = useState("")
    const [customerId, setCustomerId] = useState<string | null>(null)
    const [clientes, setClientes] = useState<{ id: string, name: string }[]>([])

    // Cargar Clientes
    useEffect(() => {
        if (isOpen && clientes.length === 0) {
            const fetchClientes = async () => {
                const { data } = await supabase
                    .from("customers")
                    .select("id, name, created_at")
                    .order("created_at", { ascending: false })
                if (data) setClientes(data)
            }
            fetchClientes()
        }
    }, [isOpen, supabase, clientes.length])

    function reset() { setBrand(""); setModel(""); setSerialNumber(""); setObservacion(""); setCustomerId(null) }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!brand.trim() && !model.trim()) {
            toast.error("La marca y el modelo son obligatorios")
            return
        }
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("bicycles")
            .insert([{
                brand: brand.trim(),
                model: model.trim(),
                serial_number: serialNumber.trim() || null,
                observacion: observacion.trim() || null,
                customer_id: customerId
            }])
            .select("id, brand, model, serial_number, observacion, customer_id")
            .single()

        if (error) {
            toast.error('Error al crear bicicleta'); console.error(error)
        } else if (data) {
            onBicicletaAgregado(data);
            toast.success("Bicicleta creada con exito");
            setIsOpen(false);
            reset()
        }
        setIsSubmitting(false)
    }

    return (
        <FormDialog
            title="Agregar Bicicleta"
            description="Ingrese los datos de la nueva Bicicleta"
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Bicicleta"
        >
            <div className="grid gap-2">
                <Label>Cliente</Label>
                <div className="relative">
                    <select
                        value={customerId || ""}
                        onChange={e => setCustomerId(e.target.value)}
                        className="
                            w-full appearance-none cursor-pointer
                            bg-background border border-border rounded-lg
                            px-3 py-2
                            text-sm font-medium text-foreground
                            shadow-sm
                            focus:outline-none focus:ring-5 focus:ring-primary/20 focus:border-primary
                            hover:border-foreground/30
                            transition-colors duration-150"
                    >
                        <option value="">Seleccionar Cliente</option>
                        <optgroup label="Clientes">
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                    {/* Icono flecha */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ej. Specialized" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="Ej. Epic" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="serialNumber">Numero de Serie</Label>
                <Input id="serialNumber" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} placeholder="Ej. R-001" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="observacion">Observacion</Label>
                <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. Bicicleta en buen estado" />
            </div>
        </FormDialog>
    )
}
"use client"

import { useState } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"
import { CustomerSelect } from "@/componentes/ui/CustomerSelect"
import { BicycleSelect } from "@/componentes/ui/BicycleSelect"

type Props = {
    onMantenimientoAgregado: (mantenimiento: any) => void
    trigger?: React.ReactNode
}

export function AgregarMantenimiento({ onMantenimientoAgregado, trigger}: Props) {
    //Base de datos y  Modal
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    //Datos del Mantenimiento
    const [bicycle_id, setBicycle_id] = useState<string | null>(null)
    const [clienteId, setClienteId] = useState<string | null>(null)
    const [serviceDate, setServiceDate] = useState("")
    const [deliveryDate, setDeliveryDate] = useState("")
    const [description, setDescription] = useState("")
    const [observacion, setObservacion] = useState("")
    const [cost, setCost] = useState("")
    const [estado, setEstado] = useState("recibido")

    function reset() { setBicycle_id(null); setClienteId(null); setServiceDate(""); setDeliveryDate(""); setDescription(""); setObservacion(""); setCost(""); setEstado("recibido")}
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bicycle_id || !serviceDate || !description || !cost){
            toast.error("Llenar todos los campos")
            return
        }        
        setIsSubmitting(true)

        const { data, error } = await supabase
            .from("maintenance_records")
            .insert([{
                service_date: serviceDate.trim(),
                delivery_date: deliveryDate.trim(),
                description: description.trim(),
                observation: observacion.trim(),
                cost: cost,
                status: estado,
                bicycle_id: bicycle_id
            }])
            .select()
            .single()

        if (error) {
            toast.error("Error al guardar Mantenimietno"); console.error(error)
        } else if (data) {
            onMantenimientoAgregado(data);
            toast.success("Mantenimiento guardado correctamente");
            setIsOpen(false);
            reset();
        }
        setIsSubmitting(false)
    }


    return (
        <FormDialog
            title="Agregar Mantenimiento"
            description="Agregar un nuevo mantenimiento"
            trigger={trigger}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitLabel="Guardar Mantenimiento"
        >
            <CustomerSelect 
                value={clienteId} 
                onChange={(id) => {
                    setClienteId(id)
                    setBicycle_id(null)
                }}
            />
            <BicycleSelect 
                customerId={clienteId}
                value={bicycle_id}
                onChange={setBicycle_id}
                disabled={!clienteId}
            />
                <div className="grip gap-2">
                    <Label htmlFor="serviceDate"> Fecha de Servicio </Label>
                    <Input id="serviceDate" type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} placeholder="Fecha de Servicio"/>
                </div>
                <div className="grip gap-2">
                    <Label htmlFor="deliveryDate"> Fecha Tentativa de Entrega </Label>
                    <Input id="deliveryDate" type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} placeholder="Fecha Tentativa de Entrega"/>
                </div>
                <div className="grip gap-2">
                    <Label htmlFor="description"> Descripción </Label>
                    <Input id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción"/>
                </div>
                <div className="grip gap-2">
                    <Label htmlFor="observacion"> Observación </Label>
                    <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Observación"/>
                </div>
                <div className="grip gap-2">
                    <Label htmlFor="cost"> Costo </Label>
                    <Input id="cost" value={cost} onChange={e => setCost(e.target.value)} placeholder="Costo"/>
                </div>
                <div className="grip gap-2">
                    <Label htmlFor="estado"> Estado </Label>
                    <select className="w-full apperance-non cursor-pointer" value={estado} onChange={e => setEstado(e.target.value)}>
                        <option value="recibido">Recibido</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="completado">Completado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>
        </FormDialog>
    )
}
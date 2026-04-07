"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/FormDialog"
import { createClient } from "@/utils/supabase/clients"
import { toast } from "sonner"

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
    const [bicicletas, setBicicletas] = useState<{ id: string, brand: string, model: string, customer_id: string }[]>([])
    const [bicycle_id, setBicycle_id] = useState<string | null>(null)
    const [cliente, setCliente] = useState<{ id: string, name: string }[]>([])
    const [clienteId, setClienteId] = useState<string | null>(null)
    const [serviceDate, setServiceDate] = useState("")
    const [deliveryDate, setDeliveryDate] = useState("")
    const [description, setDescription] = useState("")
    const [observacion, setObservacion] = useState("")
    const [cost, setCost] = useState("")
    const [estado, setEstado] = useState("recibido")

    // Cargar Bicicletas
    useEffect(() => {
        if (isOpen && bicicletas.length === 0) {
            const fetchBicicletas = async () => {
                const { data } = await supabase
                    .from("bicycles")
                    .select("id, brand, model, customer_id")
                    .order("created_at", { ascending: false })
                if (data) setBicicletas(data)
            }
            fetchBicicletas()
        }
    }, [isOpen, supabase, bicicletas.length])

    // Cargar Clientes
    useEffect(() => {
        if (isOpen && cliente.length === 0) {
            const fetchClientes = async () => {
                const { data } = await supabase
                    .from("customers")
                    .select("id, name, created_at")
                    .order("created_at", { ascending: false })
                if (data) setCliente(data)
            }
            fetchClientes()
        }
    }, [isOpen, supabase, cliente.length])

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

    const bicicletasFiltradas = clienteId ? bicicletas.filter(b => b.customer_id === clienteId) : []

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
            <div className="grid gap-2">
                <Label> Clientes </Label>
                <div className="relative">
                    <select 
                        value={clienteId || ""}
                        onChange={e => {
                            setClienteId(e.target.value)
                            setBicycle_id(null)
                        }}
                        className="w-full apperance-non cursor-pointer"
                    >
                        <option value="">Seleccionar Cliente</option>
                        <optgroup>
                            {cliente.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>
                <Label> Bicicletas </Label>
                <div className="relative">
                    <select 
                        value= {bicycle_id || ""}
                        onChange={e => setBicycle_id(e.target.value)}
                        className="w-full apperance-non cursor-pointer"
                        disabled={!clienteId}
                    >
                        <option value="">Seleccionar Bicicleta</option>
                        <optgroup>
                            {bicicletasFiltradas.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.brand} {b.model}
                                </option>
                            ))}
                        </optgroup>
                    </select>
                </div>
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

            </div>
        </FormDialog>
    )
}
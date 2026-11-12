"use client"

import { useState, useEffect } from "react"
import { Input } from "@/componentes/ui/input"
import { Label } from "@/componentes/ui/label"
import { FormDialog } from "@/componentes/(interno)/FormDialog"
import { CustomerSelect } from "@/componentes/ui/CustomerSelect"
import { createClient } from "@/utils/supabase/clients"

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
    //const [serialNumber, setSerialNumber] = useState("")
    const [observacion, setObservacion] = useState("")
    const [customerId, setCustomerId] = useState<string | null>(null)

    // Tipos de Bicicletas
    const TIPOS_BICICLETAS=[
        { value: "N", label: "Niño"},
        { value: "B", label: "Básica"},
        { value: "R", label: "Rutera" },
        { value: "RE", label: "Rutera Eléctrica" },
        { value: "MTB", label: "Montañera" },
        { value: "MTBE", label: "Montañera Eléctrica"},
        { value: "TRI", label: "Triaclón"},
    ]

    const [tipo, setTipo] = useState("")
    const [numeroSerie, setNumeroSerie] = useState<number | null>(null)
    const [loadingNumero, setLoadingNumero] = useState(false)

    async function obtenerSiguienteNumero(tipoSeleccionado: string){
        setLoadingNumero(true)
        const supabase = createClient()

        const { data, error } = await supabase 
            .from("bicycles")
            .select("serial_number")
            .ilike("serial_number", `${tipoSeleccionado} -%`)
        
        if(error){
            console.error("Error al calcular numero de serie: ", error)
            setLoadingNumero(false)
            return
        }

        let maxNumero = 0
        data?.forEach((b) => {
            const partes = b.serial_number?.split(" - ")
            const n = partes?.[1] ? parseInt(partes[1], 10) : NaN
            if (!isNaN(n) && n > maxNumero) maxNumero = n
        })

        setNumeroSerie(maxNumero + 1)
        setLoadingNumero(false)
    }

    useEffect(() => {
        if (isOpen) {
            
            const match = initialData?.serial_number?.match(/^(N|B|R|RE|MTB|MTBE|TRI) - (\d+)$/)
            
            if (initialData) {
                setBrand(initialData.brand || "")
                setModel(initialData.model || "")
                //setSerialNumber(initialData.serial_number || "")
                setObservacion(initialData.observacion || "")
                setCustomerId(initialData.customer_id || null)
                if(match){
                    setTipo(match[1])
                    setNumeroSerie(parseInt(match[2], 10))
                } else{
                    setTipo("R")
                    setNumeroSerie(null)
                }
            } else {
                setBrand("")
                setModel("")
                //setSerialNumber("")
                setObservacion("")
                setCustomerId(null)
                setTipo("R")
            }
        }
    }, [isOpen, initialData])

    useEffect(() => {
        if(!isOpen || !tipo) return
        
        const match = initialData?.serial_number?.match(/^(N|B|R|RE|MTB|MTBE|TRI) - (\d+)$/)
        
        if (match && match[1] === tipo) {
            setNumeroSerie(parseInt(match[2], 10))
            return
        }
        obtenerSiguienteNumero(tipo)
    
    },[isOpen, tipo, initialData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        if(loadingNumero) return // Evitar submit mientra calculas el nuevo numero
        
        const serialNumberFinal =  numeroSerie ? `${tipo} - ${numeroSerie}` : ""
        await onSubmit({ 
            brand, 
            model, 
            serial_number: serialNumberFinal, 
            observacion, 
            customer_id: customerId 
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
            <CustomerSelect value={customerId} onChange={setCustomerId} />
            <div className="grid gap-2">
                <Label htmlFor="brand">Marca</Label>
                <Input id="brand" value={brand} onChange={e => setBrand(e.target.value)} placeholder="Ej. Specialized" />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="model">Modelo</Label>
                <Input id="model" value={model} onChange={e => setModel(e.target.value)} placeholder="Ej. Epic" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="tipo">Tipo de Bicicleta</Label>
                    <select 
                        id="tipo" 
                        value={tipo} 
                        onChange={e => setTipo(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm  focus:ring-2"
                    >
                        {TIPOS_BICICLETAS.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="numeroSerie">Numero de Serie</Label>
                    <Input 
                        id="numeroSerie" 
                        value={loadingNumero ? "Calculando...": numeroSerie ? `${tipo} - ${numeroSerie}` : ""} 
                        disabled 
                        readOnly
                        className="w-full bg-background"
                    />
                </div> 
            </div>   
            <div className="grid gap-2">
                <Label htmlFor="observacion">Observación</Label>
                <Input id="observacion" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej. Rayones en el cuadro" />
            </div>
        </FormDialog>
    )
}

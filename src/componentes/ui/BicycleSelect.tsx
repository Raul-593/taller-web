"use client"

import { useState, useEffect } from "react"
import { Label } from "@/componentes/ui/label"
import { createClient } from "@/utils/supabase/clients"

type Props = {
    customerId?: string | null
    value: string | null
    onChange: (id: string) => void
    label?: string
    placeholder?: string
    disabled?: boolean
}

export function BicycleSelect({ customerId, value, onChange, label = "Bicicleta", placeholder = "Seleccionar Bicicleta", disabled }: Props) {
    const supabase = createClient()
    const [bicycles, setBicycles] = useState<{ id: string, brand: string, model: string }[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchBicycles = async () => {
            setLoading(true)
            let query = supabase.from("bicycles").select("id, brand, model")
            
            if (customerId) {
                query = query.eq("customer_id", customerId)
            }

            const { data } = await query.order("brand", { ascending: true })
            if (data) setBicycles(data)
            setLoading(false)
        }
        fetchBicycles()
    }, [supabase, customerId, value])

    return (
        <div className="grid gap-2">
            <Label>{label}</Label>
            <div className="relative">
                <select
                    value={value || ""}
                    onChange={e => onChange(e.target.value)}
                    disabled={disabled || loading}
                    className="
                        w-full appearance-none cursor-pointer
                        bg-background border border-border rounded-lg
                        px-3 py-2
                        text-sm font-medium text-foreground
                        shadow-sm
                        focus:outline-none focus:ring-5 focus:ring-primary/20 focus:border-primary
                        hover:border-foreground/30
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors duration-150"
                >
                    <option value="">{loading ? "Cargando..." : ((bicycles?.length || 0) === 0 && customerId ? "Sin bicicletas" : placeholder)}</option>
                    {(bicycles?.length || 0) > 0 && bicycles.map(b => (
                        <option key={b.id} value={b.id}>
                            {b.brand} {b.model}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

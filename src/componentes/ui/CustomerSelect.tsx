"use client"

import { useState, useEffect } from "react"
import { Label } from "@/componentes/ui/label"
import { createClient } from "@/utils/supabase/clients"

type Props = {
    value: string | null
    onChange: (id: string) => void
    label?: string
    placeholder?: string
    disabled?: boolean
}

export function CustomerSelect({ value, onChange, label = "Cliente", placeholder = "Seleccionar Cliente", disabled }: Props) {
    const supabase = createClient()
    const [customers, setCustomers] = useState<{ id: string, name: string }[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true)
            const { data } = await supabase
                .from("customers")
                .select("id, name")
                .order("name", { ascending: true })
            if (data) setCustomers(data)
            setLoading(false)
        }
        fetchCustomers()
    }, [supabase])

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
                    <option value="">{loading ? "Cargando..." : placeholder}</option>
                    {customers.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
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

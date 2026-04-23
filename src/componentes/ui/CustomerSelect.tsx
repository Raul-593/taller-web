"use client"

import { useState, useEffect, useRef } from "react"
import { Label } from "@/componentes/ui/label"
import { Input } from "@/componentes/ui/input"
import { createClient } from "@/utils/supabase/clients"
import { Search, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
    value: string | null
    onChange: (id: string) => void
    label?: string
    placeholder?: string
    disabled?: boolean
}

export function CustomerSelect({ value, onChange, label = "Cliente", placeholder = "Buscar cliente...", disabled }: Props) {
    const supabase = createClient()
    const [customers, setCustomers] = useState<{ id: string, name: string }[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

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
    }, [supabase, value])

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedCustomer = customers.find(c => c.id === value)

    const handleSelect = (id: string, name: string) => {
        onChange(id)
        setSearchTerm("")
        setIsOpen(false)
    }

    const clearSelection = () => {
        onChange("")
        setSearchTerm("")
    }

    return (
        <div className="grid gap-2" ref={containerRef}>
            <Label>{label}</Label>
            <div className="relative">
                <div 
                    className={cn(
                        "flex items-center w-full bg-background border border-border rounded-lg px-3 py-2 text-sm shadow-sm transition-all",
                        isOpen ? "ring-2 ring-primary/20 border-primary" : "hover:border-foreground/30",
                        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                >
                    <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                    
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground"
                        placeholder={selectedCustomer ? selectedCustomer.name : placeholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        disabled={disabled}
                    />

                    {value && !searchTerm && (
                        <button 
                            type="button" 
                            onClick={clearSelection}
                            className="p-1 hover:bg-zinc-100 rounded-md text-muted-foreground"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                    
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </div>

                {/* Dropdown de resultados */}
                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-xl max-h-[250px] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        {loading ? (
                            <div className="p-3 text-sm text-muted-foreground text-center italic">Cargando clientes...</div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground text-center italic">No se encontraron resultados</div>
                        ) : (
                            <div className="py-1">
                                {filteredCustomers.map((customer) => (
                                    <button
                                        key={customer.id}
                                        type="button"
                                        onClick={() => handleSelect(customer.id, customer.name)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-50 flex items-center justify-between",
                                            value === customer.id ? "bg-zinc-50 text-primary font-bold" : "text-foreground"
                                        )}
                                    >
                                        <span>{customer.name}</span>
                                        {value === customer.id && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

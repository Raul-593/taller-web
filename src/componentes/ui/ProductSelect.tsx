"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Label } from "@/componentes/ui/label"
import { createClient } from "@/utils/supabase/clients"
import { Search, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type Product = {
    id: string
    name: string
    price: number | null
    cost: number | null
    category: string | null
}

type Props = {
    value: string | null
    onChange: (id: string, product?: Product) => void
    onInputChange?: (value: string) => void
    inputValue?: string
    label?: string
    placeholder?: string
    disabled?: boolean
}

export function ProductSelect({ value, onChange, onInputChange, inputValue, label = "Producto o servicio", placeholder = "Buscar producto o servicio...", disabled }: Props) {
    const supabase = useMemo(() => createClient(), [])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true)
            const { data } = await supabase
                .from("products")
                .select("id, name, price, cost, category")
                .order("name", { ascending: true })
            if (data) setProducts(data)
            setLoading(false)
        }
        fetchProducts()
    }, [supabase, value])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedProduct = products.find(product => product.id === value)
    const displayedValue = inputValue ?? selectedProduct?.name ?? ""

    const handleSelect = (product: Product) => {
        onInputChange?.(product.name)
        onChange(product.id, product)
        setSearchTerm("")
        setIsOpen(false)
    }

    const clearSelection = () => {
        onInputChange?.("")
        onChange("")
        setSearchTerm("")
    }

    const toggleDropdown = () => {
        setSearchTerm(isOpen ? "" : displayedValue)
        setIsOpen(!isOpen)
    }

    return (
        <div className="grid min-w-0 w-full max-w-full gap-2" ref={containerRef}>
            <Label>{label}</Label>
            <div className="relative min-w-0 w-full max-w-full">
                <div
                    className={cn(
                        "flex min-w-0 items-center w-full max-w-full bg-background border border-border rounded-lg px-3 py-2 text-sm shadow-sm transition-all",
                        isOpen ? "ring-2 ring-primary/20 border-primary" : "hover:border-foreground/30",
                        disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                >
                    <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />

                    <input
                        type="text"
                        className="min-w-0 flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground"
                        placeholder={placeholder}
                        value={isOpen ? searchTerm : displayedValue}
                        onChange={(event) => {
                            const value = event.target.value
                            setSearchTerm(value)
                            onInputChange?.(value)
                            if (!isOpen) setIsOpen(true)
                        }}
                        onFocus={(event) => {
                            if (!isOpen && selectedProduct) event.target.select()
                        }}
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

                    <button
                        type="button"
                        onClick={toggleDropdown}
                        className="p-1 hover:bg-zinc-100 rounded-md text-muted-foreground"
                    >
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                    </button>
                </div>

                {isOpen && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-w-full bg-white border border-border rounded-lg shadow-xl max-h-62.5 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        {loading ? (
                            <div className="p-3 text-sm text-muted-foreground text-center italic">Cargando productos...</div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground text-center italic">No se encontraron resultados</div>
                        ) : (
                            <div className="py-1">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        type="button"
                                        onClick={() => handleSelect(product)}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-zinc-50 flex items-center justify-between",
                                            value === product.id ? "bg-zinc-50 text-primary font-bold" : "text-foreground"
                                        )}
                                    >
                                        <span>{product.name}</span>
                                        {value === product.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
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

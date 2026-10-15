// Una opción de las pestañas de filtro.
export interface OpcionFiltro {
    value: string
    label: string
}

interface FiltroEstadoTabsProps {
    opciones: OpcionFiltro[]
    valor: string
    onChange: (value: string) => void
    // Si se pasan, muestra la cantidad junto a cada opción.
    conteos?: Record<string, number>
}

// Pestañas de filtro por estado compartidas por mantenimientos,
// deudas y notas de crédito. Solo presenta opciones ya definidas.
export function FiltroEstadoTabs({ opciones, valor, onChange, conteos }: FiltroEstadoTabsProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {opciones.map((op) => (
                <button
                    key={op.value}
                    onClick={() => onChange(op.value)}
                    className={["px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150",
                        valor === op.value
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    ].join(" ")}
                >
                    {op.label}
                    {conteos?.[op.value] !== undefined && (
                        <span className="ml-1.5 opacity-60 text-xs">
                            {conteos[op.value]}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}

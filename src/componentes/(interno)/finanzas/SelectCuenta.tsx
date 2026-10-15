import { Label } from "@/componentes/ui/label"

interface SelectCuentaProps {
    cuentas: { id: string; name: string }[]
    value: string
    onChange: (id: string) => void
    label?: string
    required?: boolean
    disabled?: boolean
}

export function SelectCuenta({ cuentas, value, onChange, label = "Cuenta", required, disabled }: SelectCuentaProps) {
    return (
        <div className="grid gap-2">
            <Label>
                {label} {required && "*"}
            </Label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="w-full appearance-none bg-background border border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map((a) => (
                    <option key={a.id} value={a.id}>
                        {a.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

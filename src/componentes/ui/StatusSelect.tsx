import { getStatusClasses } from "@/utils/status-colors";

interface StatusOption {
    value: string;
    label: string;
}

interface StatusSelectProps {
    value: string;
    options: StatusOption[];
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

/**
 * Selector de estado estandarizado con colores según el valor.
 */
export function StatusSelect({ value, options, onChange, disabled, className = "" }: StatusSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`
                px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter appearance-none cursor-pointer focus:outline-none transition-all duration-200
                ${getStatusClasses(value)} ${disabled ? 'opacity-50' : ''} ${className}
            `}
        >
            {options.map(option => (
                <option key={option.value} value={option.value} className="bg-white text-zinc-900 capitalize font-medium">
                    {option.label}
                </option>
            ))}
        </select>
    );
}

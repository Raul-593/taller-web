"use client"

import { useDateFilter } from "@/hooks/useDateFilter";

interface DateFilterProps {
    currentMonth?: string;
    currentYear?: string;
    className?: string;
    size?: 'sm' | 'xs';
}

export const MONTHS = [
    { value: 'all', label: 'Todo el año' },
    { value: '1', label: 'Enero' },
    { value: '2', label: 'Febrero' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Mayo' },
    { value: '6', label: 'Junio' },
    { value: '7', label: 'Julio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
];

export const YEARS = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() + i).toString());

export function DateFilter({ currentMonth, currentYear, className = "", size = 'sm' }: DateFilterProps) {
    const { handleFilterChange } = useDateFilter(currentMonth, currentYear);
    const paddingClass = size === 'xs' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';

    return (
        <div className={`flex gap-2 items-center ${className}`}>
            <select
                value={currentMonth || 'all'}
                onChange={(e) => handleFilterChange('month', e.target.value)}
                className={`bg-background border border-border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 ${paddingClass}`}
            >
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select
                value={currentYear || new Date().getFullYear().toString()}
                onChange={(e) => handleFilterChange('year', e.target.value)}
                className={`bg-background border border-border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 ${paddingClass}`}
            >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
        </div>
    );
}

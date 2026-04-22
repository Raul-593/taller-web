export const STATUS_COLORS: Record<string, string> = {
    // Finanzas & General
    completado: "bg-green-100 text-green-700 border-green-200",
    pagado: "bg-green-100 text-green-700 border-green-200",
    pendiente: "bg-amber-100 text-amber-700 border-amber-200",
    cancelado: "bg-red-100 text-red-700 border-red-200",
    
    // Mantenimientos
    recibido: "bg-blue-100 text-blue-700 border-blue-200",
    en_proceso: "bg-yellow-100 text-yellow-700 border-yellow-200",
    entregado: "bg-emerald-100 text-emerald-700 border-emerald-200",
    
    // Fallback
    default: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export const getStatusClasses = (status: string) => {
    const s = status?.toLowerCase();
    return STATUS_COLORS[s] || STATUS_COLORS.default;
};

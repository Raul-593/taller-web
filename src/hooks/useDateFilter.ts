import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Hook para manejar los filtros de fecha (mes/año) en la URL.
 */
export function useDateFilter(currentMonth?: string, currentYear?: string) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const handleFilterChange = (type: 'month' | 'year', value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (type === 'year') {
            params.set('year', value);
            if (!params.has('month')) params.set('month', currentMonth || 'all');
        } else {
            params.set('month', value);
            if (!params.has('year')) params.set('year', currentYear || new Date().getFullYear().toString());
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return { handleFilterChange };
}

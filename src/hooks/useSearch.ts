import { useState, useMemo } from "react";

/**
 * Hook para manejar la lógica de búsqueda y filtrado de listas.
 */
export function useSearch<T>(items: T[], filterFn: (item: T, term: string) => boolean) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        return items.filter(item => filterFn(item, searchTerm));
    }, [items, searchTerm, filterFn]);

    return { searchTerm, setSearchTerm, filteredItems };
}

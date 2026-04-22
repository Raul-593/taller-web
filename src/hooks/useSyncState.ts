import { useState, useEffect } from "react";

/**
 * Hook para sincronizar el estado local con las props del servidor.
 * Útil cuando se usa router.refresh() para actualizar datos.
 */
export function useSyncState<T>(initialData: T) {
    const [state, setState] = useState(initialData);

    useEffect(() => {
        setState(initialData);
    }, [initialData]);

    return [state, setState] as const;
}

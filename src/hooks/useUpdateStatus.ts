import { useState } from "react";
import { createClient } from "@/utils/supabase/clients";

/**
 * Hook para manejar la actualización de estados de registros en Supabase
 * con actualización optimista de la UI y manejo de carga.
 */
export function useUpdateStatus<T extends { id: string }>(
    tableName: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const supabase = createClient();

    const updateStatus = async (
        id: string, 
        newStatus: string, 
        setLocalItems: (fn: (prev: T[]) => T[]) => void,
        revertItems?: T[]
    ) => {
        setLoadingId(id);

        // Actualización optimista
        setLocalItems(prev =>
            prev.map(item => item.id === id ? { ...item, status: newStatus } : item)
        );

        const { error } = await supabase
            .from(tableName)
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            console.error(`Error actualizando estado en ${tableName}:`, error);
            if (revertItems) {
                setLocalItems(() => revertItems);
            }
            if (onError) onError(error);
        } else {
            if (onSuccess) onSuccess();
        }

        setLoadingId(null);
    };

    return { loadingId, updateStatus };
}

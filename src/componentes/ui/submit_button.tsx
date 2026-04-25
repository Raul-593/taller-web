'use client'

import { useFormStatus } from "react-dom";
import { Button } from "@/componentes/ui/button";
import { Loader2 } from "lucide-react";

export function SubmitButton({ formAction, className, children, pendingText }: { formAction: (formData: FormData) => Promise<void>; className?: string; children: React.ReactNode; pendingText?: string }) {
    const { pending } = useFormStatus();

    return (
        <Button disabled={pending} className={className || "w-full"} formAction={formAction}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {pendingText || "Cargando..."}
                </>
            ) : (
                children
            )}
        </Button>
    )
}
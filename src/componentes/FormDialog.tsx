"use client"

import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/componentes/ui/dialog"
import { Button } from "@/componentes/ui/button"

type Props = {
    title: string
    description: string
    trigger?: React.ReactNode
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (e: React.FormEvent) => void
    isSubmitting?: boolean
    submitLabel?: string
    children: React.ReactNode
    className?: string
}

export function FormDialog({ title, description, trigger, isOpen, onOpenChange, onSubmit, isSubmitting, submitLabel="Guardar", children, className}: Props){
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg px-6 font-semibold">
                        {title}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className={className}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                        {children}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-zinc-900 text-white hover:bg-zinc-800">
                            {isSubmitting ? "Guardando..." : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
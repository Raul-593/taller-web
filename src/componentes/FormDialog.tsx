"use client"

import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/componentes/ui/dialog"
import { Button } from "@/componentes/ui/button"
import { cn } from "@/lib/utils"

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
            <DialogContent className={cn("max-h-[96vh] p-0 flex flex-col overflow-hidden gap-0", className)}>
                <DialogHeader className="p-6 pb-4 border-b flex-none">
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                
                <form onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 pt-4">
                        <div className="grid gap-4">
                            {children}
                        </div>
                    </div>
                    
                    <DialogFooter className="p-6 py-4 border-t flex-none bg-zinc-50/30">
                        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
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
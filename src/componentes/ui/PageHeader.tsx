import React from "react";

interface PageHeaderProps {
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
}

/**
 * Componente de encabezado de página estandarizado.
 */
export function PageHeader({ title = "593 Cycling Studio", subtitle, children }: PageHeaderProps) {
    return (
        <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">
                {children}
            </div>
        </div>
    );
}

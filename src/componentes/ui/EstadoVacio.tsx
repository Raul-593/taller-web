interface EstadoVacioProps {
    mensaje: string
    icono?: React.ReactNode
}

export function EstadoVacio({ mensaje, icono }: EstadoVacioProps) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            {icono && <div className="mb-2">{icono}</div>}
            <p>{mensaje}</p>
        </div>
    )
}

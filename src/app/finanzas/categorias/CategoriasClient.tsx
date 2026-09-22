"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { PageHeader } from "@/componentes/ui/PageHeader"
import { useSyncState } from "@/hooks/useSyncState"
import { AgregarCategoria } from "@/componentes/finanzas/categorias/AgregarCategoria"
import { EditarCategoria } from "@/componentes/finanzas/categorias/EditarCategoria"
import { buildCategoryTree, isSystemCategory } from "@/lib/finanzas/categorias"
import type { Category } from "@/lib/finanzas/types"

function ColumnaCategorias({
    titulo,
    categorias,
    categoriasPadre,
    onActualizado,
}: {
    titulo: string
    categorias: Category[]
    categoriasPadre: Category[]
    onActualizado: () => void
}) {
    const arbol = useMemo(() => buildCategoryTree(categorias), [categorias])

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{titulo}</CardTitle>
                <CardDescription>
                    {categorias.length} categoría{categorias.length !== 1 ? "s" : ""}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {arbol.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay categorías registradas.</p>
                ) : (
                    arbol.map((padre) => (
                        <div key={padre.id} className="border rounded-lg overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 border-b">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{padre.name}</span>
                                    {isSystemCategory(padre) && (
                                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter bg-zinc-200 text-zinc-600">
                                            <Lock className="h-2.5 w-2.5" /> Sistema
                                        </span>
                                    )}
                                </div>
                                {!isSystemCategory(padre) && (
                                    <EditarCategoria
                                        categoria={padre}
                                        categoriasPadre={categoriasPadre}
                                        onCategoriaActualizada={onActualizado}
                                    />
                                )}
                            </div>
                            {padre.subcategorias && padre.subcategorias.length > 0 && (
                                <div className="divide-y">
                                    {padre.subcategorias.map((hija) => (
                                        <div key={hija.id} className="flex items-center justify-between px-3 py-2 pl-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <span>{hija.name}</span>
                                                {isSystemCategory(hija) && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter bg-zinc-200 text-zinc-600">
                                                        <Lock className="h-2.5 w-2.5" /> Sistema
                                                    </span>
                                                )}
                                            </div>
                                            {!isSystemCategory(hija) && (
                                                <EditarCategoria
                                                    categoria={hija}
                                                    categoriasPadre={categoriasPadre}
                                                    onCategoriaActualizada={onActualizado}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

export function CategoriasClient({ categorias: initial }: { categorias: any[] }) {
    const router = useRouter()
    const [categorias] = useSyncState(initial)

    const ingresos = categorias.filter((c) => c.category_type === "ingreso")
    const gastos = categorias.filter((c) => c.category_type === "gasto")
    // Filtro de categoria segun categoria pader dependiendo de lo que el usuario escoja
    const categoriasPadre = categorias.filter((c) => !c.parent_id)

    return (
        <div className="flex flex-col gap-6">
            <PageHeader>
                <AgregarCategoria categoriasPadre={categoriasPadre} onCategoriaAgregada={() => router.refresh()} />
            </PageHeader>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <ColumnaCategorias
                    titulo="Ingreso"
                    categorias={ingresos}
                    categoriasPadre={categoriasPadre}
                    onActualizado={() => router.refresh()}
                />
                <ColumnaCategorias
                    titulo="Gasto"
                    categorias={gastos}
                    categoriasPadre={categoriasPadre}
                    onActualizado={() => router.refresh()}
                />
            </div>
        </div>
    )
}
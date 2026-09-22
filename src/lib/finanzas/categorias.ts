import type { Category, CategoryConHijos, CategoryType } from "./types";

export const category_types: { value: CategoryType; label: string }[] = [
    { value: "ingreso", label: "Ingreso" },
    { value: "gasto", label: "Gasto"},
]

// Nombres que no se cambian
export const system_category_names = ["Cobros a Clientes", "Compra de Repuestos", "Pago de Deudas"] 

export function isSystemCategory(category: Pick<Category, "name">): boolean {
    return (system_category_names as readonly string[]).includes(category.name)
}

// Filtro por Categoria padre
export function buildCategoryTree(categories: Category[]): CategoryConHijos[] {
    const padres = categories.filter((c) => !c.parent_id)
    return padres.map((padre) => ({
        ...padre,
        subcategorias: categories.filter((c) => c.parent_id === padre.id)
    }))
}

// Categorias Seleccionables
export type CategoriaSelccionable = { id: string; name: string; group: string | null }

export function getSelectableCategories(
    categories: Category[],
    type: CategoryType,
    excludeNames: readonly string[] = system_category_names
): CategoriaSelccionable[]{
    const filtered = categories.filter((c) => c.category_type === type && !excludeNames.includes(c.name))
    const padres = filtered.filter((c) => !c.parent_id)
    const hijos = filtered.filter((c) => c.parent_id)
    
    const result: CategoriaSelccionable[] = []

    for (const padre of padres){
        const hijosDePadre = hijos.filter((h) => h.parent_id === padre.id)
        if (hijosDePadre.length > 0){
            for (const hijo of hijosDePadre){
                result.push({ id: hijo.id, name: hijo.name, group: padre.name})
            }
        } else {
            const originalmenteTeniaHijos = categories.some((c) => c.parent_id === padre.id)
            if (!originalmenteTeniaHijos) {
                result.push({ id: padre.id, name: padre.name, group: null })
            }
        }
    }
    
    return result
}

// Categorias Labels
export function getCategoryDisplayLabel(
    categoryId: string,
    categoriasById: Map<string, Category>
): string {
    const categoria = categoriasById.get(categoryId)
    if (!categoria) return "-"
    if (!categoria.parent_id) return categoria.name
    const padre = categoriasById.get(categoria.parent_id)
    return padre ? `${padre.name} -> ${categoria.name}` : categoria.name
}

// Categorias para Compras muy grandes
export function getPurchaseCategories(categoria: Category[]): CategoriaSelccionable[] {
    return getSelectableCategories(categoria, "gasto", ["Pago de Deudas"])
}

// Gasto por categorias
export type GastoPorCategoria = { name: string; total: number }

// Las subcategorias se suman y se muestra solo la categorias padre
export function aggregateGastosByCategoria(
    movimientos: { amount: number; category_id: string }[],
    categorias: Category[]
): GastoPorCategoria[] {
    const categoriasById = new Map(categorias.map((c) => [c.id, c]))
    const totales = new Map<string, number>()

    for (const m of movimientos) {
        const categoria = categoriasById.get(m.category_id)
        if (!categoria || categoria.category_type !== "gasto") continue

        const nombreGrupo = categoria.parent_id
            ? categoriasById.get(categoria.parent_id)?.name ?? categoria.name
            : categoria.name

        totales.set(nombreGrupo, (totales.get(nombreGrupo) ?? 0) + Number(m.amount))
    }

    return [...totales.entries()]
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
}
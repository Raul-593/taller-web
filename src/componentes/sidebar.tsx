'use client'

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Bike, PiggyBank, Wrench, Package, Menu, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/componentes/ui/sheet";
import { createClient } from "@/utils/supabase/clients";
import { useState } from "react";

const sections = [
    {
        title: "GENERAL",
        links: [
            {
                title: "Resumen",
                href: "/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "CLIENTES",
        links: [
            {
                title: "Clientes",
                href: "/clientes",
                icon: Users,
            },
            {
                title: "Bicicletas",
                href: "/bicicletas",
                icon: Bike,
            },
        ],
    },
    {
        title: "TALLER",
        links: [
            {
                title: "Mantenimientos",
                href: "/mantenimientos",
                icon: Wrench,
            },
            {
                title: "Repuestos",
                href: "/repuestos",
                icon: Package,
            },
            {
                title: "Proveedores",
                href: "/provedores",
                icon: Users,
            },
        ],
    },
    {
        title: "ADMINISTRACIÓN",
        links: [
            {
                title: "Finanzas",
                href: "/finanzas",
                icon: PiggyBank,
            },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        setIsOpen(false);
    };

    const NavContent = () => (
        <>
            <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start px-3 text-sm font-medium mt-6 gap-6">
                    {sections.map((section) => (
                        <div key={section.title} className="flex flex-col gap-1">
                            <h2 className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-2">
                                {section.title}
                            </h2>
                            {section.links.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all group ${
                                            isActive
                                                ? "bg-[#9ADCF9] text-[#000000] border border-[#ffffff]"
                                                : "text-gray-400 hover:text-black hover:bg-[#9ADCF9]"
                                        }`}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? "text-[#000000]" : "group-hover:text-black"}`} />
                                        <span className={isActive ? "font-semibold" : ""}>{link.title}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </div>
            {/* Logout Button */}
            <div className="p-4 mt-auto border-t">
                <button 
                    onClick={handleLogout} 
                    className="flex justify-start items-center gap-3 w-full rounded-lg px-3 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* === DESKTOP VIEW === */}
            <aside className="hidden border-r bg-white text-black w-64 md:flex flex-col h-screen">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Bike className="h-5 w-5 text-[#9ADCF9]" />
                        <span className="tracking-tight">593 Cycling Studio</span>
                    </Link>
                </div>
                <NavContent />
            </aside>

            {/* === MOBILE VIEW === */}
            <header className="flex h-14 bg-white items-center justify-between border-b px-4 md:hidden">
                <Link href="/" className="flex items-center gap-2 font-semibold text-black">
                    <Bike className="h-5 w-5 text-[#9ADCF9]" />
                    <span className="tracking-tight text-lg">593 Cycling</span>
                </Link>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger className="p-2 border rounded-md hover:bg-gray-100 transition-colors">
                        <Menu className="h-5 w-5 text-gray-700" />
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-white">
                        <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
                        <SheetHeader className="h-14 flex items-center justify-start border-b px-6 flex-row">
                            <Bike className="h-5 w-5 text-[#9ADCF9] mr-2" />
                            <span className="tracking-tight font-semibold text-lg">593 Cycling Menu</span>
                        </SheetHeader>
                        <NavContent />
                    </SheetContent>
                </Sheet>
            </header>
        </>
    );
}

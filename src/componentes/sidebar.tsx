"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bike,
  PiggyBank,
  Wrench,
  Package,
  Menu,
  LogOut,
  DollarSign,
  List,
  BookOpenCheck,
  Handshake,
  TriangleAlert,
  FilePlus2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/componentes/ui/sheet";
import { createClient } from "@/utils/supabase/clients";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavLink = {
  title: string;
  href: string;
  icon: React.ElementType;
};

type SubSection = {
  title: string;
  icon: React.ElementType;
  href?: string;
  links?: NavLink[];
};

type Section = {
  title: string;
  links?: NavLink[];
  subSections?: SubSection[];
};

// ─── Nav structure ────────────────────────────────────────────────────────────

const sections: Section[] = [
  {
    title: "GENERAL",
    links: [
      { title: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "USUARIOS",
    links: [
      { title: "Clientes", href: "/clientes", icon: Users },
      { title: "Bicicletas", href: "/bicicletas", icon: Bike },
    ],
  },
  {
    title: "TALLER",
    links: [
      { title: "Mantenimientos", href: "/mantenimientos", icon: Wrench },
      { title: "Repuestos", href: "/repuestos", icon: Package },
      { title: "Proveedores", href: "/provedores", icon: Users },
    ],
  },
  {
    title: "ADMINISTRACIÓN",
    subSections: [
      {
        title: "Finanzas",
        icon: PiggyBank,
        href: "/finanzas",
        links: [
          { title: "Resumen", href: "/finanzas", icon: PiggyBank },
          { title: "Cuentas", href: "/finanzas/cuentas", icon: DollarSign },
          { title: "Categorías", href: "/finanzas/categorias", icon: List },
          { title: "Movimientos", href: "/finanzas/movimientos", icon: BookOpenCheck },
          { title: "Deudas", href: "/finanzas/deudas", icon: TriangleAlert },
          { title: "Transferencias", href: "/finanzas/transferencias", icon: Handshake },
          { title: "Nota Crédito", href: "/finanzas/nota-credito", icon: FilePlus2 },
        ],
      },
    ],
  },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  link,
  pathname,
  indent = false,
  onClick,
}: {
  link: NavLink;
  pathname: string;
  indent?: boolean;
  onClick?: () => void;
}) {
  const Icon = link.icon;
  const isActive = pathname === link.href;

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all group text-sm ${
        indent ? "ml-4" : ""
      } ${
        isActive
          ? "bg-[#9ADCF9] text-black border border-white/60"
          : "text-gray-400 hover:text-black hover:bg-[#9ADCF9]/60"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-black" : "group-hover:text-black"}`} />
      <span className={isActive ? "font-semibold" : ""}>{link.title}</span>
    </Link>
  );
}

// ─── SubSectionItem (e.g. Finanzas) ──────────────────────────────────────────

function SubSectionItem({
  sub,
  pathname,
  onLinkClick,
}: {
  sub: SubSection;
  pathname: string;
  onLinkClick?: () => void;
}) {
  const Icon = sub.icon;
  const isChildActive = sub.links?.some((l) => pathname === l.href) ?? false;
  const isSelfActive = sub.href ? pathname === sub.href : false;
  const [open, setOpen] = useState(isChildActive || isSelfActive);

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 w-full text-left text-sm transition-all group ${
          isSelfActive || isChildActive
            ? "bg-[#9ADCF9]/30 text-black"
            : "text-gray-400 hover:text-black hover:bg-[#9ADCF9]/30"
        }`}
      >
        <Icon className={`h-4 w-4 shrink-0 ${isSelfActive || isChildActive ? "text-black" : "group-hover:text-black"}`} />
        <span className={`flex-1 ${isSelfActive || isChildActive ? "font-semibold" : ""}`}>
          {sub.title}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" />
        )}
      </button>

      {open && sub.links && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {sub.links.map((link) => (
            <NavItem
              key={link.href}
              link={link}
              pathname={pathname}
              indent
              onClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SectionGroup (collapsible top-level) ────────────────────────────────────

function SectionGroup({
  section,
  pathname,
  onLinkClick,
}: {
  section: Section;
  pathname: string;
  onLinkClick?: () => void;
}) {
  const directActive = section.links?.some((l) => pathname === l.href) ?? false;
  const subActive =
    section.subSections?.some(
      (s) => (s.href && pathname === s.href) || s.links?.some((l) => pathname === l.href)
    ) ?? false;

  const [open, setOpen] = useState(directActive || subActive);

  return (
    <div className="flex flex-col gap-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between px-3 py-1 w-full group"
      >
        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] group-hover:text-gray-600 transition-colors">
          {section.title}
        </h2>
        {open ? (
          <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
        ) : (
          <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-gray-600 transition-colors" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-0.5">
          {section.links?.map((link) => (
            <NavItem
              key={link.href}
              link={link}
              pathname={pathname}
              onClick={onLinkClick}
            />
          ))}
          {section.subSections?.map((sub) => (
            <SubSectionItem
              key={sub.title}
              sub={sub}
              pathname={pathname}
              onLinkClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    setIsOpen(false);
  };

  const NavContent = () => (
    <>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-3 text-sm font-medium mt-6 gap-4">
          {sections.map((section) => (
            <SectionGroup
              key={section.title}
              section={section}
              pathname={pathname}
              onLinkClick={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t">
        <button
          onClick={handleLogout}
          className="flex justify-start items-center gap-3 w-full rounded-lg px-3 py-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all font-medium text-sm"
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
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-black"
        >
          <Bike className="h-5 w-5 text-[#9ADCF9]" />
          <span className="tracking-tight text-lg">593 Cycling</span>
        </Link>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="p-2 border rounded-md hover:bg-gray-100 transition-colors">
            <Menu className="h-5 w-5 text-gray-700" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[280px] p-0 flex flex-col bg-white"
          >
            <SheetTitle className="sr-only">Menú de Navegación</SheetTitle>
            <SheetHeader className="h-14 flex items-center justify-start border-b px-6 flex-row">
              <Bike className="h-5 w-5 text-[#9ADCF9] mr-2" />
              <span className="tracking-tight font-semibold text-lg">
                593 Cycling Menu
              </span>
            </SheetHeader>
            <NavContent />
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}

import React from "react"
import Link from "next/link"
import { Wrench, Instagram, Facebook, MessageSquare } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="#inicio" className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Wrench className="h-4 w-4" />
              </div>
              <span>593 Cycling Studio</span>
            </Link>
            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Taller especializado en mantenimiento, reparación y optimización de bicicletas. Pasión y precisión para ciclistas exigentes.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#inicio" className="hover:text-white transition-colors">Inicio</Link>
              </li>
              <li>
                <Link href="#nosotros" className="hover:text-white transition-colors">Sobre Nosotros</Link>
              </li>
              <li>
                <Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link>
              </li>
              <li>
                <Link href="#contacto" className="hover:text-white transition-colors">Contacto</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">Ingresar al Sistema</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Socials */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Síguenos</h4>
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://wa.me/593991234567" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                aria-label="WhatsApp"
              >
                <MessageSquare className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>&copy; {new Date().getFullYear()} 593 Cycling Studio. Todos los derechos reservados.</p>
          <p>Diseñado con pasión para ciclistas.</p>
        </div>
      </div>
    </footer>
  )
}

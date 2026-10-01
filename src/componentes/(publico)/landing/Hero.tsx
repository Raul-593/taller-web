import React from "react"
import Link from "next/link"
import { Button } from "@/componentes/ui/button"
import { ShieldCheck, Wrench, Clock } from "lucide-react"

export function Hero() {
  return (
    <section id="inicio" className="relative min-h-[90vh] flex items-center justify-center bg-zinc-950 text-white overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-xs sm:text-sm font-medium mb-6 backdrop-blur-md">
          <Wrench className="h-4 w-4 text-primary" />
          <span>Taller Especializado en Ciclismo</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mb-6">
          Pasión y Precisión en Cada <span className="text-primary">Km recorrigo</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mb-10 leading-relaxed">
          Devolvemos el rendimiento óptimo a tu bicicleta con mantenimiento profesional y la atención experta que te mereces.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link 
            href="https://wa.me/593984705431?text=Hola,%20quiero%20agendar%20un%20mantenimiento" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full sm:w-auto"
          >
            <Button size="lg" className="w-full text-base font-semibold shadow-lg">
              Agenda tu Mantenimiento
            </Button>
          </Link>
          <Link href="#servicios" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full text-base font-semibold bg-zinc-900/50 border-zinc-700 hover:bg-zinc-800 text-white">
              Ver Servicios
            </Button>
          </Link>
        </div>

        {/* Highlights / Features bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 pt-10 border-t border-zinc-800/80 w-full max-w-4xl text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Garantía de Calidad</h3>
              <p className="text-sm text-zinc-400">Servicios respaldados por expertos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Repuestos</h3>
              <p className="text-sm text-zinc-400">Las mejores marcas del mercado</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Entrega Puntual</h3>
              <p className="text-sm text-zinc-400">Tu bici lista cuando lo prometemos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

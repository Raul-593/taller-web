import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/componentes/ui/cards"
import { Wrench, Gauge, Sparkles, Settings, Disc, ShieldAlert } from "lucide-react"

export function Services() {
  const servicesList = [
    {
      title: "Mantenimiento General / Básico",
      description: "Ajuste de cambios y frenos, lubricación de transmisión, revisión general, engrase de ejes y rodamientos.",
      icon: Wrench,
    },
    {
      title: "Mantenimiento Pro",
      description: "Todo lo del Básico + mantenimiento especializado, mantenimiento de frenos, mantenimiento de suspensión.",
      icon: Settings,
    },
    {
      title: "Servicio de Suspensiones",
      description: "Mantenimiento preventivo y correctivo de horquillas y amortiguadores con cambio de retenes y aceite original.",
      icon: Gauge,
    },
    {
      title: "Lavado Detallado",
      description: "Limpieza profunda con productos biodegradables que cuidan la pintura y componentes, desengrasado y protección.",
      icon: Sparkles,
    },
    {
      title: "Purgado y Frenos Hidráulicos",
      description: "Optimización de la potencia de frenado, purgado de líneas, cambio de líquido de frenos y revisión de pastillas/discos.",
      icon: Disc,
    },
    {
      title: "Diagnóstico y Ajustes Rápidos",
      description: "Evaluación de fallas, centrado de rines, alineación de patilla de cambio y correcciones express para tu salida.",
      icon: ShieldAlert,
    },
  ]

  return (
    <section id="servicios" className="py-24 bg-primary dark:bg-zinc-900/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium mb-4">
            <Wrench className="h-4 w-4" />
            <span>Nuestros Servicios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-primary-foreground">
            Soluciones integrales para el rendimiento de tu bicicleta
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg text-primary-foreground">
            Contamos con personal altamente calificado y herramientas de vanguardia para asegurar que cada kilómetro sea seguro y eficiente.
          </p>
        </div>

        {/* Grid of Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => {
            const IconComponent = service.icon
            return (
              <Card key={index} className="bg-secondary border border-border shadow-sm hover:shadow-lg hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
                <CardHeader className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold mb-2">{service.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

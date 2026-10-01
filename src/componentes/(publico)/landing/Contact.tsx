import React from "react"
import { MapPin, Clock, Phone, MessageSquare, Mail } from "lucide-react"
import { Button } from "@/componentes/ui/button"

export function Contact() {
  return (
    <section id="contacto" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
            <Phone className="h-4 w-4" />
            <span>Contacto y Ubicación</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            ¿Listo para poner a punto tu bicicleta?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Visítanos en nuestro taller o contáctanos directamente para agendar tu cita o consultar por repuestos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Details Card */}
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm flex flex-col justify-between">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold">Información de Contacto</h3>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Dirección</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Via a la costa km 13 dentro del Club Terranostra, Guayaquil, Ecuador
                  </p>
                  <a 
                    href="https://www.google.com/maps/place/593Cycling+Studio/@-2.1927123,-79.9993622,19.5z/data=!4m6!3m5!1s0x902d7127f5ffe75f:0x84051e6ead4635cf!8m2!3d-2.1926754!4d-79.999075!16s%2Fg%2F11tcj49njg?entry=ttu&g_ep=EgoyMDI2MDkyOC4wIKXMDSoASAFQAw%3D%3D" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary text-sm font-medium hover:underline inline-block mt-2"
                  >
                    Ver en Google Maps &rarr;
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Horarios de Atención</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Lunes a Viernes: 09:00 - 18:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Teléfono</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    +593 98 470 5431
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <div className="mt-10 pt-6 border-t border-border">
              <a 
                href="https://wa.me/593984705431?text=Hola,%20deseo%20agendar%20un%20mantenimiento%20para%20mi%20bicicleta." 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button size="lg" className="w-full gap-2 text-base font-semibold bg-green-600 hover:bg-green-700 text-white">
                  <MessageSquare className="h-5 w-5" />
                  Escríbenos por WhatsApp
                </Button>
              </a>
            </div>
          </div>

          {/* Map / Visual Container */}
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm min-h-[400px] relative bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
            {/* Embedded simulation or placeholder for Google Maps */}
            <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url('/mapa_taller.webp')` }} />
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 text-white">
              <MapPin className="h-12 w-12 text-primary mb-4 animate-bounce" />
              <h4 className="text-2xl font-bold mb-2">593 Cycling Studio</h4>
              <p className="text-sm text-zinc-200 max-w-sm mb-6">
                Te esperamos en nuestro taller para brindarle a tu bicicleta el servicio que se merece.
              </p>
              <a 
                href="https://www.google.com/maps/place/593Cycling+Studio/@-2.1927123,-79.9993622,19.5z/data=!4m6!3m5!1s0x902d7127f5ffe75f:0x84051e6ead4635cf!8m2!3d-2.1926754!4d-79.999075!16s%2Fg%2F11tcj49njg?entry=ttu&g_ep=EgoyMDI2MDkyOC4wIKXMDSoASAFQAw%3D%3D" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="default" size="sm">
                  Abrir Mapa Interactivo
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

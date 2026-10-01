import React from "react"
import { CheckCircle2, Award, Users, HeartHandshake } from "lucide-react"

export function About() {
  const values = [
    { title: "Pasión por el Ciclismo", description: "Vivimos y respiramos ciclismo en cada diagnóstico y reparación." },
    { title: "Precisión Técnica", description: "Herramientas especializadas y rigor profesional para tu bicicleta." },
    { title: "Atención Personalizada", description: "Cada ciclista y cada bicicleta son únicos; adaptamos nuestro servicio." },
    { title: "Compromiso y Confianza", description: "Transparencia absoluta en presupuestos y tiempos de entrega." },
  ]

  return (
    <section id="nosotros" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Info */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
              <Award className="h-4 w-4" />
              <span>Sobre Nosotros</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6">
              Expertos dedicados al cuidado de tu compañera de ruta
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg mb-6 leading-relaxed">
              En <strong className="text-foreground">593 Cycling Studio</strong> entendemos que tu bicicleta no es solo un medio de transporte o una herramienta deportiva; es una extensión de ti. Por eso, combinamos años de experiencia técnica con la última tecnología en herramientas y repuestos.
            </p>
            <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
              Nuestro taller nació con el propósito de elevar el estándar del mantenimiento de bicicletas en la región, ofreciendo diagnósticos precisos, limpiezas profundas y puestas a punto de competición para aficionados y profesionales.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {values.map((val, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{val.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{val.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual / Image Container */}
          <div className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-border bg-zinc-100 dark:bg-zinc-900 aspect-[4/3]">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=1000&auto=format&fit=crop')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="text-sm font-medium text-primary-foreground/90 uppercase tracking-wider">Taller Profesional</p>
                  <p className="text-lg font-bold">Equipamiento de alta gama para resultados precisos</p>
                </div>
              </div>
            </div>

            {/* Floating stats card */}
            <div className="absolute -bottom-6 -left-6 sm:bottom-6 sm:-left-6 bg-card border border-border p-4 rounded-xl shadow-xl hidden sm:flex items-center gap-4 max-w-xs">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+1,500</p>
                <p className="text-xs text-muted-foreground">Ciclistas satisfechos confían en nosotros</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

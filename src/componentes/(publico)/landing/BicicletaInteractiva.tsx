"use client";

import { useState } from "react";
import Image from "next/image";
import { MousePointerClick } from "lucide-react";
import { BIKE_HOTSPOTS } from "@/lib/landing/bike-hotspots";
import { cn } from "@/lib/utils";

export function BicicletaInteractiva() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeHotspot = BIKE_HOTSPOTS.find(
    (hotspot) => hotspot.id === activeId,
  );

  return (
    <section id="bicicleta" className="py-24 bg-background">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Encabezado de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
            <MousePointerClick className="h-4 w-4" />
            <span>Explora tu Bicicleta</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Conoce nuestros servicios
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Toca cada punto de la bicicleta y descubre cómo cuidamos esa parte
            en el taller.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Imagen de la bicicleta con los puntos interactivos */}
          <div className="relative w-full aspect-[16/9]">
            <Image
              src="/public/bicicleta-servicios.svg"
              alt="Bicicleta de montaña vista de lado con puntos interactivos sobre sus componentes"
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain"
            />

            {BIKE_HOTSPOTS.map((hotspot) => {
              const isActive = hotspot.id === activeId;

              return (
                <button
                  key={hotspot.id}
                  type="button"
                  aria-label={hotspot.label}
                  aria-pressed={isActive}
                  onClick={() => setActiveId(isActive ? null : hotspot.id)}
                  style={{ top: hotspot.top, left: hotspot.left }}
                  className="group absolute z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "block rounded-full border-2 border-white shadow-md transition-all duration-200",
                      isActive
                        ? "h-6 w-6 bg-teal-500 ring-4 ring-teal-500/30"
                        : "h-5 w-5 bg-teal-600 ring-2 ring-teal-600/25 animate-pulse group-hover:scale-110",
                    )}
                  />
                </button>
              );
            })}
          </div>

          {/* Panel de detalle del servicio seleccionado */}
          <div
            aria-live="polite"
            className="flex min-h-[240px] flex-col justify-center rounded-2xl border border-border bg-card p-8 shadow-sm md:min-h-[280px]"
          >
            {activeHotspot ? (
              <>
                <span className="inline-flex w-fit items-center rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
                  {activeHotspot.label}
                </span>
                <h3 className="mt-4 text-2xl font-bold">{activeHotspot.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {activeHotspot.description.split(',').map((item, index, arr)=>(
                    <span key={index} className="block">
                      {item.trim()}
                      {index < arr.length -1 ? "" : ""}
                    </span>
                  ))}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MousePointerClick className="h-6 w-6" />
                </div>
                <p className="text-muted-foreground">
                  Haz clic en un punto de la bicicleta para ver el servicio.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

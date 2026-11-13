export type BikeHotspot = {
  id: string;
  label: string;
  top: string;
  left: string;
  title: string;
  description: string;
};

export const BIKE_HOTSPOTS: BikeHotspot[] = [
  {
    id: "electrico",
    label: "Electricas",
    top: "10%",
    left: "70.6%",
    title: "Bicicletas Eléctricas",
    description: "Actualización de Software de los componentes, Cambio de Pilas, Ajuste Fino",
  },
  {
    id: "frenos",
    label: "Frenos",
    top: "59%",
    left: "58%",
    title: "Ajuste y purga de frenos",
    description:
      "Calibración de Frenos V-Brake y Frenos de Disco, Cambio de Pastillas, Cambio de Disco, Cambio de Cable, Cambio de Liquido de Freno, Purgado de Freno",
  },
  {
    id: "desviador",
    label: "Desviador Delantero",
    top: "50.8%",
    left: "38%",
    title: "Desviador Delantero",
    description:
    "Calibración, Lubricación, Limpieza de Cadena o Cambio, Cambio de Cables, Limpieza de Platos o Cambio",
  },
  {
    id: "pedales",
    label: "Eje Pedales",
    top: "62%",
    left: "36.8%",
    title: "Eje de Pedales y Pedales",
    description:
    "Cambio de Rodamientos, Engrasado de Rodamientos, Cambio de Rodamientos freeWheel, Cambio de Pedales, Limpieza del Eje por Dentro",
  },
  {
    id: "shifter y manillar",
    label: "Shifter y Manubrios",
    top: "10%",
    left: "53.8%",
    title: "Shifter y Manubrios",
    description:
      "Cambio de Shifter, Cambio de Manubrio, , Instalación de Cinta, Ajuste de Posición para las manos, Lubricación, Cambio de Cables",
  },
  {
    id: "ruedas",
    label: "Ruedas y Llantas",
    top: "40%",
    left: "64.8%",
    title: "Ruedas y Llantas",
    description:
      "Cambio de Rodamientos, Engrasado de Rodamientos, Cambio de Rodamientos freeWheel, Centrado de Ruedas, Cambio de Llantas, Liquido para Ruedas sin Tubo, Parchado de Tubo, Cambio de Tubo",
  },
  {
    id: "dropout",
    label: "Dropout",
    top: "62.8%",
    left: "28.2%",
    title: "Revisión del dropout",
    description:
      "Calibración, Lubricación, Limpieza de Cadena o Cambio, Cambio de Cables, Limpieza de Cassette, Limpieza de Piñon o Cambio",
  },
  {
    id: "suspensión",
    label: "Suspención",
    top: "30.5%",
    left: "51.5%",
    title: "Suspención",
    description:
      "Mantenimiento de Suspensión Delantera y Trasera, Cambio de Aceite, Ajuste de Aire, Ajuste de Tensión",
  },
];
// Configuración de Supabase
const SUPABASE_URL = 'https://tsixuqbkyfrxqrhnjmor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaXh1cWJreWZyeHFyaG5qbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTI5OTksImV4cCI6MjA2NzY2ODk5OX0.VeoM1Z1oWy9CLiNjRODKQPT_QGjPd6xoWRGazwf2aRw';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const tabla = document.getElementById("tabla").querySelector("tbody");

async function cargarDatos() {
  const { data, error } = await client
    .from("mantenimientos")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al cargar datos:", error);
    alert("❌ No se pudieron cargar los registros.");
    return;
  }

  tabla.innerHTML = "";

  data.forEach((item) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td data-label="Fecha">${new Date(item.fecha).toLocaleString()}</td>
      <td data-label="Cliente">${item.cliente || ""}</td>
      <td data-label="Dirección">${item.direccion || ""}</td>
      <td data-label="Teléfono">${item.telefono || ""}</td>
      <td data-label="Bicicleta">${item.bicicleta || ""}</td>
      <td data-label="Servicio">${item.servicio || ""}</td>
      <td data-label="Costo">$${item.costo || "0"}</td>
      <td data-label="Observacion">${item.observacion || ""}</td>
    `;

    fila.style.cursor = "pointer";
    fila.addEventListener("click", () => {
      window.location.href = `detalle.html?id=${item.id}`;
    });

    tabla.appendChild(fila);
  });
}

cargarDatos();


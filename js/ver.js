const SUPABASE_URL = 'https://tsixuqbkyfrxqrhnjmor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaXh1cWJreWZyeHFyaG5qbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTI5OTksImV4cCI6MjA2NzY2ODk5OX0.VeoM1Z1oWy9CLiNjRODKQPT_QGjPd6xoWRGazwf2aRw';


const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const tabla = document.getElementById("tabla").querySelector("tbody");
const inputBusqueda = document.getElementById("busqueda");

let todosLosDatos = []; // Guardamos todos los datos para filtrar después

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

  todosLosDatos = data; // Guardamos todos los registros
  mostrarDatos(todosLosDatos); // Mostramos todos por defecto
}

function mostrarDatos(datos) {
  tabla.innerHTML = "";

  datos.forEach((item) => {
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

// 🔍 Evento para filtrar en tiempo real
if(inputBusqueda){
  inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.toLowerCase();

    const filtrados = todosLosDatos.filter((item) => {
      return (
        (item.fecha && new Date(item.fecha).toLocaleString().toLowerCase().includes(texto)) ||
        (item.cliente && item.cliente.toLowerCase().includes(texto)) ||
        (item.direccion && item.direccion.toLowerCase().includes(texto)) ||
        (item.telefono && item.telefono.toString().toLowerCase().includes(texto)) ||
        (item.bicicleta && item.bicicleta.toLowerCase().includes(texto)) ||
        (item.servicio && item.servicio.toLowerCase().includes(texto)) ||
        (item.costo && item.costo.toString().toString().includes(texto)) ||
        (item.observacion && item.observacion.toLowerCase().includes(texto))
      );
    });

    mostrarDatos(filtrados);
  });
}

cargarDatos();


// Configuración Supabase
const SUPABASE_URL = 'https://tsixuqbkyfrxqrhnjmor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaXh1cWJreWZyeHFyaG5qbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTI5OTksImV4cCI6MjA2NzY2ODk5OX0.VeoM1Z1oWy9CLiNjRODKQPT_QGjPd6xoWRGazwf2aRw';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const form = document.getElementById("form");
const tabla = document.getElementById("tabla").querySelector("tbody");

async function cargarDatos() {
  const { data, error } = await client
    .from("mantenimientos")
    .select("*")
    .order("fecha", { ascending: false });

  if (error) {
    console.error("Error al cargar datos:", error);
    return;
  }

  tabla.innerHTML = "";
  data.forEach(item => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${new Date(item.fecha).toLocaleString()}</td>
      <td>${item.cliente || ""}</td>
      <td>${item.direccion || ""}</td>
      <td>${item.telefono || ""}</td>
      <td>${item.bicicleta || ""}</td>
      <td>${item.servicio || ""}</td>
      <td>${item.costo || ""}</td>
      <td>${item.observacion || ""}</td>
    `;
    tabla.appendChild(fila);
  });
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  data.fecha = new Date().toISOString();

  const { error } = await client
    .from("mantenimientos")
    .insert([data]);

  if (error) {
    console.error("Error al guardar:", error);
    alert("Error al guardar los datos.");
  } else {
    document.getElementById("respuesta").innerText = "Guardado con éxito!";
    form.reset();
    cargarDatos();
  }
});

cargarDatos();

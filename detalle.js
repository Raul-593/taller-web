const SUPABASE_URL = 'https://tsixuqbkyfrxqrhnjmor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaXh1cWJreWZyeHFyaG5qbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTI5OTksImV4cCI6MjA2NzY2ODk5OX0.VeoM1Z1oWy9CLiNjRODKQPT_QGjPd6xoWRGazwf2aRw';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const detalleDiv = document.getElementById("detalle");

async function cargarDetalle() {
  if (!id) {
    detalleDiv.innerText = "ID no válido.";
    return;
  }

  const { data, error } = await client
    .from("mantenimientos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    detalleDiv.innerText = "No se encontró el registro.";
    return;
  }

  // Muestra la información
  detalleDiv.innerHTML = `
    <p><strong>Fecha:</strong> ${new Date(data.fecha).toLocaleString()}</p>
    <p><strong>Cliente:</strong> ${data.cliente}</p>
    <p><strong>Dirección:</strong> ${data.direccion}</p>
    <p><strong>Teléfono:</strong> ${data.telefono}</p>
    <p><strong>Bicicleta:</strong> ${data.bicicleta}</p>
    <p><strong>Servicio:</strong> ${data.servicio}</p>
    <p><strong>Costo:</strong> $${data.costo}</p>
    <p><strong>Observaciones:</strong> ${data.observacion}</p>
  `;
}

cargarDetalle();

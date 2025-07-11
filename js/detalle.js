const SUPABASE_URL = 'https://tsixuqbkyfrxqrhnjmor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaXh1cWJreWZyeHFyaG5qbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTI5OTksImV4cCI6MjA2NzY2ODk5OX0.VeoM1Z1oWy9CLiNjRODKQPT_QGjPd6xoWRGazwf2aRw';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const detalleDiv = document.getElementById("detalle");

let datosActuales = null;

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

  datosActuales = data;

  mostrarDatos(data);
}

function mostrarDatos(data) {
  detalleDiv.innerHTML = `
    <p><strong>Fecha:</strong> ${new Date(data.fecha).toLocaleString()}</p>
    <p><strong>Cliente:</strong> ${data.cliente}</p>
    <p><strong>Dirección:</strong> ${data.direccion}</p>
    <p><strong>Teléfono:</strong> ${data.telefono}</p>
    <p><strong>Bicicleta:</strong> ${data.bicicleta}</p>
    <p><strong>Servicio:</strong> ${data.servicio}</p>
    <p><strong>Costo:</strong> $${data.costo}</p>
    <p><strong>Observacion:</strong> ${data.observacion}</p>
  `;
}

// Botón Editar
document.getElementById("btn_edit").addEventListener("click", () => {
  if (!datosActuales) return;

  detalleDiv.innerHTML = `
    <input name="cliente" value="${datosActuales.cliente || ''}" placeholder="Cliente"><br>
    <input name="direccion" value="${datosActuales.direccion || ''}" placeholder="Dirección"><br>
    <input name="telefono" value="${datosActuales.telefono || ''}" placeholder="Teléfono"><br>
    <input name="bicicleta" value="${datosActuales.bicicleta || ''}" placeholder="Bicicleta"><br>
    <input name="servicio" value="${datosActuales.servicio || ''}" placeholder="Servicio"><br>
    <input name="costo" value="${datosActuales.costo || ''}" placeholder="Costo" type="number"><br>
    <textarea name="observacion" placeholder="Observacion">${datosActuales.observacion || ''}</textarea><br>
    <button id="btnGuardarCambios">💾 Guardar cambios</button>
  `;

  document.getElementById("btnGuardarCambios").addEventListener("click", async () => {
  const campos = detalleDiv.querySelectorAll("input, textarea");
  const nuevosDatos = {};

  campos.forEach(campo => {
    const valor = campo.value.trim();
    nuevosDatos[campo.name] = valor === "" ? null : valor;
  });

  // Validar que haya datos
  if (!nuevosDatos.cliente || !nuevosDatos.servicio) {
    alert("Cliente y servicio son obligatorios.");
    return;
  }

  const { error } = await client
    .from("mantenimientos")
    .update(nuevosDatos)
    .eq("id", id);

  if (error) {
    console.error("Error al actualizar:", error);
    alert("❌ Error al guardar los cambios.");
  } else {
    alert("✅ Cambios guardados");
    cargarDetalle(); // recarga la vista
  }
});

});

// Botón Eliminar
document.getElementById("btn_delete").addEventListener("click", async () => {
  const confirmar = confirm("¿Estás seguro de eliminar este mantenimiento? Esta acción no se puede deshacer.");

  if (!confirmar) return;

  const { error } = await client
    .from("mantenimientos")
    .delete()
    .eq("id", id);

  if (error) {
    alert("❌ No se pudo eliminar");
    console.error(error);
  } else {
    alert("✅ Registro eliminado");
    window.location.href = "ver.html";
  }
});

cargarDetalle();

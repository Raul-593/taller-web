import { supabaseClient, getCurrentUserRole } from '../conexionBaseDatos.js';
import { requireAuth } from '../auth/autorizacion.js';

// Variables generales
const params = new URLSearchParams(window.location.search);
const mantenimientoId = params.get('id');
const contenedor = document.getElementById('detalle-mantenimiento');
const btnEditar = document.getElementById('btn-editar');
const btnEliminar = document.getElementById('btn-eliminar');
const modal = document.getElementById('modal-editar');
const cerrarModal = document.getElementById('cerrar-modal');
const formEditar = document.getElementById('form-editar');

let mantenimientoActual = null;

//Protege la vista si no tiene usuario
(async () => {
  await requireAuth();
})();

// Validar ID
if (!mantenimientoId) {
  contenedor.innerHTML = '<p>ID no proporcionado.</p>';
} else {
  cargarMantenimiento(mantenimientoId);
  verificarPermisos(); // Verifica el rol del usuario al cargar
}

// Obtener detalle del mantenimiento
async function cargarMantenimiento(id) {
  const { data, error } = await supabaseClient
    .from('maintenance_records')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    contenedor.innerHTML = '<p>Error al obtener el mantenimiento.</p>';
    return;
  }

  mantenimientoActual = data;

  // Obtener datos de la bicicleta asociada
const { data: bicicleta, error: errorBici } = await supabaseClient
  .from('bicycles')
  .select('brand, model, serial_number')
  .eq('id', data.bicycle_id)
  .single();

if (!bicicleta || errorBici) {
  document.getElementById('titulo-bicicleta').textContent = 'Detalle del Mantenimiento';
} else {
  document.getElementById('titulo-bicicleta').textContent =
    `${bicicleta.brand} | ${bicicleta.model} | N.Serie: ${bicicleta.serial_number}`;
}

contenedor.innerHTML = `
  <table>
    <tr>
      <th>Fecha del servicio</th>
      <td>${data.service_date}</td>
    </tr>
    <tr>
      <th>Descripción</th>
      <td>${data.description}</td>
    </tr>
    <tr>
      <th>Costo</th>
      <td>$${data.cost}</td>
    </tr>
    <tr>
      <th>Observación</th>
      <td>${data.observation || 'Sin observaciones'}</td>
    </tr>
  </table>
`;


}

// Verifica el rol del usuario
async function verificarPermisos() {
  const role = await getCurrentUserRole();

  if (role === 'superadmin') {
    // Mostrar ambos botones
    btnEditar.style.display = 'inline-block';
    btnEliminar.style.display = 'inline-block';
  } else {
    // Solo permitir editar
    btnEditar.style.display = 'inline-block';
    btnEliminar.style.display = 'none';
  }
}

// Abrir ventana de edición
btnEditar.addEventListener('click', () => {
  if (!mantenimientoActual) return;

  formEditar.service_date.value = mantenimientoActual.service_date;
  formEditar.description.value = mantenimientoActual.description;
  formEditar.cost.value = mantenimientoActual.cost;
  formEditar.observation.value = mantenimientoActual.observation || '';

  modal.classList.remove('hidden');
});

// Cerrar modal
cerrarModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Guardar cambios
formEditar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formEditar);

  const actualizado = {
    service_date: formData.get('service_date'),
    description: formData.get('description'),
    cost: parseFloat(formData.get('cost')),
    observation: formData.get('observation'),
  };

  const { error } = await supabaseClient
    .from('maintenance_records')
    .update(actualizado)
    .eq('id', mantenimientoId);

  if (error) {
    alert('Error al actualizar');
    console.error(error);
    return;
  }

  modal.classList.add('hidden');
  alert('Mantenimiento actualizado correctamente');
  cargarMantenimiento(mantenimientoId);
});

// Eliminar mantenimiento (solo si es superadmin)
btnEliminar.addEventListener('click', async () => {
  const confirmar = confirm('¿Estás seguro de eliminar este mantenimiento?');
  if (!confirmar) return;

  const { error } = await supabaseClient
    .from('maintenance_records')
    .delete()
    .eq('id', mantenimientoId);

  if (error) {
    alert('Error al eliminar');
    console.error(error);
    return;
  }

  alert('Mantenimiento eliminado');
  window.location.href = 'index.html'; // Puedes cambiar esto si deseas volver a detalle_cliente.html
});

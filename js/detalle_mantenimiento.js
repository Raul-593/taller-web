import { supabaseClient } from './conexionBaseDatos.js';

//Variable para Detalle
const params = new URLSearchParams(window.location.search);
const mantenimientoId = params.get('id');
const contenedor = document.getElementById('detalle-mantenimiento');
//Variable para CRUD
const btnEditar = document.getElementById('btn-editar');
const btnEliminar = document.getElementById('btn-eliminar');
const modal = document.getElementById('modal-editar');
const cerrarModal = document.getElementById('cerrar-modal');
const formEditar = document.getElementById('form-editar');

let mantenimientoActual = null;

//Detalle de Mantenimiento
if (!mantenimientoId) {
  contenedor.innerHTML = '<p>ID no proporcionado.</p>';
} else {
  cargarMantenimiento(mantenimientoId);
}

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

  contenedor.innerHTML = `
    <p><strong>Fecha:</strong> ${data.service_date}</p>
    <p><strong>Descripción:</strong> ${data.description}</p>
    <p><strong>Costo:</strong> $${data.cost}</p>
    <p><strong>Observación:</strong> ${data.observation || 'Sin observaciones'}</p>
  `;
}

// Abrir Ventana Emergente Editar
btnEditar.addEventListener('click', () => {
  if (!mantenimientoActual) return;

  formEditar.service_date.value = mantenimientoActual.service_date;
  formEditar.description.value = mantenimientoActual.description;
  formEditar.cost.value = mantenimientoActual.cost;
  formEditar.observation.value = mantenimientoActual.observation || '';

  modal.classList.remove('hidden');
});

// Cerrar Ventana Emergente
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

// Eliminar mantenimiento
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
  window.location.href = 'index.html';
});
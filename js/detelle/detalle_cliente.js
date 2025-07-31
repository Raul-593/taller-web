import { supabaseClient } from '../conexionBaseDatos.js';
import { requireAuth } from '../auth/autorizacion.js';

const params = new URLSearchParams(window.location.search);
const clienteId = params.get('id');

const clienteNombre = document.getElementById('cliente-nombre');
const clienteInfo = document.getElementById('cliente-info');
const contenedor = document.getElementById('container-bicicletas');

// Modal mantenimiento
const modal = document.getElementById('modal-mantenimiento');
const formModal = document.getElementById('form-modal');
const cerrarModal = document.getElementById('cerrar-modal');

// Modal bicicleta
const modalBici = document.getElementById('modal-bicicleta');
const formBici = document.getElementById('form-bicicleta');
const cerrarModalBici = document.getElementById('cerrar-modal-bici');
const btnNuevaBicicleta = document.getElementById('btn-nueva-bicicleta');

//Nuevo Mantenimiento
const btnNuevoMantenimiento = document.getElementById('btn-nuevo-mantenimiento');
const selectBicicleta = document.getElementById('select-bicicleta');

//Protege la vista si no tiene usuario
(async () => {
  await requireAuth();
})();

// Toast
function mostrarToast(mensaje, tipo = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Validar cliente
if (!clienteId) {
  clienteNombre.textContent = 'Cliente no Encontrado';
  clienteInfo.textContent = 'No se proporcionó un ID válido';
} else {
  cargarDetalle(clienteId);
}

// Obtener cliente y bicicletas
async function cargarDetalle(id) {
  contenedor.innerHTML = ''; // Limpiar

  const { data: cliente, error: errorCliente } = await supabaseClient
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (errorCliente || !cliente) {
    clienteNombre.textContent = 'Error al obtener cliente';
    return;
  }

  clienteNombre.textContent = cliente.name;
  clienteInfo.textContent = `${cliente.address} |  ${cliente.phone}`;

  const { data: bicicletas, error: errorBici } = await supabaseClient
    .from('bicycles')
    .select(`
      id,
      brand,
      model,
      serial_number,
      maintenance_records (
        id,
        service_date,
        description,
        cost,
        observation
      )
    `)
    .eq('customer_id', id);

  if (errorBici) {
    contenedor.innerHTML = '<p>Error al cargar bicicletas.</p>';
    return;
  }

  if (bicicletas.length === 0) {
    contenedor.innerHTML = '<p>No hay bicicletas registradas.</p>';
    return;
  }

  bicicletas.forEach(bici => {
    const div = document.createElement('div');
    div.classList.add('bici-box');
    div.dataset.biciId = bici.id;

    const mantenimientoHTML = bici.maintenance_records.length === 0
      ? '<p>No tiene mantenimientos aún.</p>'
      : `
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Descripción</th>
              <th>Costo</th>
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            ${bici.maintenance_records.map(m => `
              <tr>
                <td data-label="Fecha">${m.service_date}</td>
                <td data-label="Descripción"><a href="detalle_mantenimiento.html?id=${m.id}">${m.description}</a></td>
                <td data-label="Costo">${m.cost}</td>
                <td data-label="Observaciones">${m.observation}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      `;

    div.innerHTML = `
      <h4> <br> ${bici.brand} | ${bici.model} | ${bici.serial_number}</h4>
      ${mantenimientoHTML}
    `;

    contenedor.appendChild(div);
  });
}

//Nuevo mantenimiento
btnNuevoMantenimiento.addEventListener('click', async () => {
  formModal.reset();
  selectBicicleta.innerHTML = '<option value="" disabled selected>Selecciona una bicicleta</option>';

  const { data: bicicletas, error } = await supabaseClient
    .from('bicycles')
    .select('id, serial_number')
    .eq('customer_id', clienteId);

  if (error || !bicicletas.length) {
    mostrarToast('No hay bicicletas para este cliente', 'error');
    return;
  }

  bicicletas.forEach(bici => {
    const option = document.createElement('option');
    option.value = bici.id;
    option.textContent = `ID: ${bici.id} | N. Serie: ${bici.serial_number}`;
    selectBicicleta.appendChild(option);
  });

  modal.classList.remove('hidden');
});


// Cerrar modales
cerrarModal.addEventListener('click', () => modal.classList.add('hidden'));
cerrarModalBici.addEventListener('click', () => modalBici.classList.add('hidden'));

// Guardar mantenimiento
formModal.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formModal);

  const nuevoMantenimiento = {
    bicycle_id: formData.get('bicycle_id'),
    service_date: formData.get('service_date'),
    description: formData.get('description'),
    cost: parseFloat(formData.get('cost')),
    observation: formData.get('observation')
  };

  const { data, error } = await supabaseClient
    .from('maintenance_records')
    .insert([nuevoMantenimiento])
    .select();

  if (error) {
    mostrarToast('Error al guardar mantenimiento', 'error');
    console.error(error);
    return;
  }

  mostrarToast('Mantenimiento guardado correctamente', 'success');
  modal.classList.add('hidden');
  cargarDetalle(clienteId);
});

// Mostrar modal Nueva bicicleta
btnNuevaBicicleta.addEventListener('click', () => {
  formBici.reset();
  modalBici.classList.remove('hidden');
});

// Guardar nueva bicicleta
formBici.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(formBici);

  const nuevaBici = {
    customer_id: clienteId,
    brand: formData.get('brand'),
    model: formData.get('model'),
    serial_number: formData.get('serial_number')
  };

  const { data, error } = await supabaseClient
    .from('bicycles')
    .insert([nuevaBici])
    .select();

  if (error) {
    mostrarToast('Error al guardar bicicleta', 'error');
    console.error(error);
    return;
  }

  mostrarToast('Bicicleta guardada correctamente', 'success');
  modalBici.classList.add('hidden');
  await cargarDetalle(clienteId);
});

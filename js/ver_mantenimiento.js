import { supabaseClient } from './conexionBaseDatos.js';
import { requireAuth } from './auth/autorizacion.js';

const tabla = document.querySelector('#tabla');
const tbody = tabla.querySelector('tbody');
const inputBusqueda = document.getElementById('busqueda');

//Protege la vista si no tiene usuario
(async () => {
  await requireAuth();
})();

// Función para obtener mantenimientos con clientes
async function cargarMantenimientos(filtro = '') {
  const { data, error } = await supabaseClient
    .from('bicycles')
    .select(`
      id,
      brand,
      model,
      serial_number,
      customers (
        name
      ),
      maintenance_records (
        id,
        service_date,
        description,
        cost,
        observation
      )
    `);

  if (error) {
    console.error('Error al obtener datos:', error);
    return;
  }

  // Limpiar tabla
  tbody.innerHTML = '';

  const resultados = filtro
    ? data.filter(item => {
        const fullText = `${item.serial_number} ${item.brand} ${item.model} ${item.customers?.name || ''}`.toLowerCase();
        return fullText.includes(filtro.toLowerCase());
      })
    : data;

  // Mostrar resultados
  resultados.forEach(row => {
    const clienteNombre = row.customers?.name || 'Cliente desconocido';
    const mantenimientos = row.maintenance_records;

    // Crear fila con título del cliente como fila especial
    const clienteRow = document.createElement('tr');
    clienteRow.innerHTML = `
      <td colspan="6" style="font-weight: bold; background: #eee;"> ${clienteNombre}</td>
    `;
    tbody.appendChild(clienteRow);

    // Si no hay mantenimientos
    if (mantenimientos.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.serial_number}</td>
        <td>${row.brand}</td>
        <td>${row.model}</td>
        <td colspan="3">Sin mantenimientos registrados</td>
      `;
      tbody.appendChild(tr);
    } else {
      mantenimientos.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.serial_number}</td>
          <td>${row.brand}</td>
          <td>${row.model}</td>
          <td>${m.description}</td>
          <td>${m.cost}</td>
          <td>${m.observation}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  });
}

// Búsqueda en tiempo real
inputBusqueda.addEventListener('input', (e) => {
  cargarMantenimientos(e.target.value);
});

// Al cargar la página
cargarMantenimientos();

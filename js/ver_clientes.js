import { supabaseClient } from './conexionBaseDatos.js';
import { requireAuth } from './auth/autorizacion.js';

const tbody = document.querySelector('#tabla tbody');
const inputBusqueda = document.getElementById('busqueda');

//Protege la vista si no tiene usuario
(async () => {
  await requireAuth();
})();

// Función para obtener y mostrar clientes + bicicletas
async function cargarClientes(filtroSerial = '') {
  const { data, error } = await supabaseClient
    .from('bicycles')
    .select(`
      id,
      brand,
      model,
      serial_number,
      customers (
        id,
        name,
        phone,
        address
      )
    `);

  if (error) {
    console.error('Error al obtener datos:', error);
    return;
  }

  // Limpiar la tabla
  tbody.innerHTML = '';

  // Filtrar por número de serie si hay filtro
  const resultados = filtroSerial
    ? data.filter(item => item.serial_number.toLowerCase().includes(filtroSerial.toLowerCase()))
    : data;

  // Insertar filas
  resultados.forEach(row => {
    const cliente = row.customers;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Cliente">
      <a href="detalle_cliente.html?id=${cliente.id}">${cliente.name}</a>
      </td>
      <td data-label="Dirección">${cliente?.address || '-'}</td>
      <td data-label="Teléfono">${cliente?.phone || '-'}</td>
      <td data-label="Bicicleta">${row.brand} ${row.model}</td>
      <td data-label="Número de Serie">${row.serial_number}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Búsqueda en tiempo real
inputBusqueda.addEventListener('input', (e) => {
  const valor = e.target.value;
  cargarClientes(valor);
});

// Cargar al iniciar
cargarClientes();

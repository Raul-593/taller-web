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
    .from('customers')
    .select(`
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
    ? data.filter(cliente => cliente.name.toLowerCase().includes(filtroSerial.toLowerCase()))
    : data;

  // Insertar filas
  resultados.forEach(row => {
    const cliente = row;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Cliente">
      <a href="detalle_cliente.html?id=${cliente.id}">${cliente.name}</a>
      </td>
      <td data-label="Dirección">${cliente?.address || '-'}</td>
      <td data-label="Teléfono">${cliente?.phone || '-'}</td>
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

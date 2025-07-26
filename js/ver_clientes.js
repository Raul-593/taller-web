import { supabaseClient } from './conexionBaseDatos.js'; 

const tbody = document.querySelector('#tabla tbody');
const inputBusqueda = document.getElementById('busqueda');

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
      <td>
      <a href="detalle_cliente.html?id=${cliente.id}">${cliente.name}</a>
      </td>
      <td>${cliente?.address || '-'}</td>
      <td>${cliente?.phone || '-'}</td>
      <td>${row.brand} ${row.model}</td>
      <td>${row.serial_number}</td>
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

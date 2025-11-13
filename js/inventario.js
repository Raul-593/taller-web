import { supabaseClient } from './conexionBaseDatos.js';
import { requireAuth } from './auth/autorizacion.js';

async function cargarInventario() {
  const { data, error } = await supabaseClient
    .from('inventory_items')
    .select('*')
    .order('name', { ascending: true });

  if (error) console.error(error);
  const tbody = document.querySelector('#tabla-inventario tbody');
  tbody.innerHTML = '';

  data.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.stock}</td>
        <td>$${item.unit_price}</td>
        <td>
          <button class="btn-incio" onclick="registrarMovimiento('venta', ${item.id})">Venta</button>
        </td>
      </tr>`;
  });
}

window.registrarMovimiento = async function (tipo, itemId) {
  const cantidad = prompt(`Cantidad a ${tipo}:`);
  const precio = prompt(`Precio unitario:`);

  const { data: item } = await supabaseClient
    .from('inventory_items')
    .select('stock')
    .eq('id', itemId)
    .single();

  const nuevoStock = tipo === 'compra'
    ? item.stock + parseInt(cantidad)
    : item.stock - parseInt(cantidad);

  // Registrar movimiento
  await supabaseClient.from('inventory_movements').insert([{
    item_id: itemId,
    type: tipo,
    quantity: cantidad,
    unit_price: precio,
    total: cantidad * precio,
    date: new Date().toISOString().split('T')[0],
  }]);

  // Actualizar stock
  await supabaseClient.from('inventory_items').update({ stock: nuevoStock }).eq('id', itemId);

  cargarInventario();
};

cargarInventario();
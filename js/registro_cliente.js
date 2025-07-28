import { supabaseClient } from './conexionBaseDatos.js';
import { requireAuth } from './auth/autorizacion.js';

const form = document.getElementById('form');
const respuesta = document.getElementById('respuesta');

//Protege la vista si no tiene usuario
(async () => {
  await requireAuth();
})();

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const name = data.get('name');
  const phone = data.get('phone');
  const address = data.get('address');
  const brand = data.get('brand');
  const model = data.get('model');
  const serial_number = data.get('serial_numer');

  //Insertar cliente
  const { data: cliente, error: errorCliente } = await supabaseClient
    .from('customers')
    .insert([{ name, phone, address }])
    .select()
    .single();

  if (errorCliente) {
    console.error(errorCliente);
    respuesta.textContent = 'Error al guardar cliente';
    return;
  }

  //Insertar bicicleta
  const { data:biciInsertada, error: errorBici } = await supabaseClient
    .from('bicycles')
    .insert([{
      customer_id: cliente.id,
      brand,
      model,
      serial_number
    }])
    .select()
    .single();

  if (errorBici) {
    console.error(errorBici);
    respuesta.textContent = 'Error al guardar bicicleta';
    return;
  }

  //Si todo se guardo bien, se redirige al registro mantenimiento
  window.location.href = `registro_mantenimiento.html?bici_id=${biciInsertada.id}`;

  form.reset();
});

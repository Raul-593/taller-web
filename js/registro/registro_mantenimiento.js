import { supabaseClient } from '../conexionBaseDatos.js'; 
import { requireAuth } from '../auth/autorizacion.js';

const form = document.getElementById('form');
const respuesta = document.getElementById('respuesta');

//Protege la vista si no tiene usuario
(async () => {
  await requireAuth();
})();

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const service_date = data.get('service_date');
  const description = data.get('description');
  const cost = parseFloat(data.get('cost'));
  const observation = data.get('observation');

  //Obtener id de Bicicleta 
  const params = new URLSearchParams(window.location.search)
  const bicycle_id = params.get('bici_id')

  const { error } = await supabaseClient
    .from('maintenance_records')
    .insert([{
      bicycle_id,
      service_date,
      description,
      cost,
      observation
    }]);

  if (error) {
    console.error(error);
    respuesta.textContent = 'Error al guardar servicio';
    return;
  }

  window.location.href = 'index.html';

  form.reset();
});


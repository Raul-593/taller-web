import { supabaseClient } from '../conexionBaseDatos.js';


document.getElementById('logout').addEventListener('click', async () => {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
});

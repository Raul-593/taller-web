import { supabaseClient } from '../conexionBaseDatos.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) {
    document.getElementById('mensaje-error').textContent = error.message;
  } else {
    window.location.href = 'index.html';
  }
});

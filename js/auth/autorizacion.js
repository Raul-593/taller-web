import { supabaseClient } from '../conexionBaseDatos.js';

// Verifica si el usuario tiene sesión activa
export async function requireAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = 'login.html';
  }
}

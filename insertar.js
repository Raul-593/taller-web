// Configuración de Supabase
const SUPABASE_URL = 'https://tsixuqbkyfrxqrhnjmor.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzaXh1cWJreWZyeHFyaG5qbW9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwOTI5OTksImV4cCI6MjA2NzY2ODk5OX0.VeoM1Z1oWy9CLiNjRODKQPT_QGjPd6xoWRGazwf2aRw';

const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.fecha = new Date().toISOString();

  const { error } = await client.from("mantenimientos").insert([data]);

  if (error) {
    console.error("Error al guardar:", error);
    alert("❌ Error al guardar los datos.");
  } else {
    document.getElementById("respuesta").innerText = "✅ Guardado con éxito!";
    form.reset();
  }
});

const toggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');

// Mostrar/ocultar menú
toggle.addEventListener('click', (event) => {
    event.stopPropagation(); // Evita que se cierre de inmediato
    menu.classList.toggle('active');
});

// Cierra fuera del menu
document.addEventListener('click', (event) => {
    // Clic fuera del icono de menú
    if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        menu.classList.remove('active');
    }
});

// Cierra menú cuando se hace clic en un enlace
menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
    menu.classList.remove('active');
    });
});
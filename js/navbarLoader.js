// js/navbarLoader.js
document.addEventListener("DOMContentLoaded", () => {
  fetch("navbar.html")
    .then(res => res.text())
    .then(html => {
      document.getElementById("navbar-container").innerHTML = html;
      const script = document.createElement("script");
      script.src = "js/sidebar.js";
      document.body.appendChild(script);
    })
    .catch(err => console.error("Error al cargar el navbar:", err));
});

  const toggle = document.getElementById("menuToggle");
  const links = document.getElementById("navbarLinks");

  toggle.addEventListener("click", () => {
    links.classList.toggle("show");
  });
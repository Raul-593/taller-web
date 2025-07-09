const form = document.getElementById("form");
    form.addEventListener("submit", e => {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(form).entries());

      fetch("https://script.google.com/macros/s/AKfycbyB3OL3Qbbg0KciqR5kYespaGpX5T461PljFyQ7Jytlc16NfvBlsX8f7JsUt4rgkYSujA/exec", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      })
      .then(res => res.text())
      .then(msg => {
        document.getElementById("respuesta").innerText = "Guardado con éxito!";
        form.reset();
      })
      .catch(err => alert("Error al guardar"));
    });
    
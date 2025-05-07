
    // Frutas
    const formFrutas = document.getElementById("form-frutas");
    const frutas = [];
    formFrutas.addEventListener("submit", function(e) {
      e.preventDefault();
      const f1 = document.getElementById("fruta1").value;
      if (f1) frutas.push(f1);
      document.getElementById("resultado-frutas").textContent = "Frutas: " + frutas.join(", ") + "";
      // Limpiar inputs
      formFrutas.reset();
    });

    // Amigos
    const formAmigos = document.getElementById("form-amigos");
    const amigos = [];
    formAmigos.addEventListener("submit", function(e) {
      e.preventDefault();
      const a1 = document.getElementById("amigo1").value;
      if (a1) amigos.push(a1);
      document.getElementById("resultado-amigos").textContent = "Amigos: " + amigos.join(", ") + "";
      formAmigos.reset();
    });

    // Números
    const formNumeros = document.getElementById("form-numeros");
    const numeros = [3, 7, 15];
    formNumeros.addEventListener("submit", function(e) {
      e.preventDefault();
      const nuevo = parseInt(document.getElementById("nuevoNumero").value);
      if (!isNaN(nuevo)) {
        const ultimo = numeros[numeros.length - 1];
        if (nuevo > ultimo) {
          numeros.push(nuevo);
          document.getElementById("resultado-numeros").textContent = "Números: [" + numeros.join(", ") + "]";
        } else {
          document.getElementById("resultado-numeros").textContent = "El número no es mayor al último (" + ultimo + ")";
        }
      }
      formNumeros.reset();
    });
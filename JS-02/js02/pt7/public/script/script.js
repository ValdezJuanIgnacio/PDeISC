
   
    const palabras = [];
    //agrega palabras a un array
    document.getElementById("form-palabras").addEventListener("submit", e => {
      e.preventDefault();
      const p = document.getElementById("palabra").value.trim();
      if (p) {
        palabras.push(p);
        document.getElementById("array-palabras").textContent =
          "Palabras: [" + palabras.join(", ") + "]";
      }
      e.target.reset();
    });
    //busca la palabra "perro" en el array y su posicion
    function buscarPerro() {
      const idx = palabras.indexOf("perro");
      document.getElementById("resultado-perro").textContent =
        idx !== -1
          ? `"perro" está en la posición ${idx}`
          : `"perro" no está en el array.`;
    }

    
    const numeros = [];
    //agrega numeros a un array
    document.getElementById("form-numeros").addEventListener("submit", e => {
      e.preventDefault();
      const n = parseInt(document.getElementById("numero").value, 10);
      if (!isNaN(n)) {
        numeros.push(n);
        document.getElementById("array-numeros").textContent =
          "Números: [" + numeros.join(", ") + "]";
      }
      e.target.reset();
    });
    //busca el numero 50 y si lo encuentra lo muestra junto con la posicion en la que esta
    function buscarCincuenta() {
      const idx = numeros.indexOf(50);
      document.getElementById("resultado-cincuenta").textContent =
        idx !== -1
          ? `El número 50 está en la posición ${idx}`
          : "El número 50 no está en el array.";
    }

    
    const ciudades = [];
    //agrega palabras a un array
  document.getElementById("form-ciudades").addEventListener("submit", e => {
    e.preventDefault();
    const c = document.getElementById("ciudad").value.trim();
    if (c) {
      ciudades.push(c);
      document.getElementById("array-ciudades").textContent =
        "Ciudades: [" + ciudades.join(", ") + "]";
    }
    e.target.reset();
  });
  // busca la palabra "Madrid" en el array y su posicion
  function buscarMadrid() {
    const idx = ciudades.findIndex(
      ciudad => ciudad.toLowerCase() === "madrid"
    );
    document.getElementById("resultado-madrid").textContent =
      idx !== -1
        ? `"Madrid" está en la posición ${idx}`
        : `"Madrid" no está en el array."`;
  }
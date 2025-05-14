
    // 1. Primeros 3 números
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
    //copia los primeros 3 elementos del array
    function copiarPrimeros3() {
      const copia = numeros.slice(0, 3);
      document.getElementById("resultado-numeros").textContent =
        "Copia: [" + copia.join(", ") + "]";
    }

  
    const peliculas = [];
    //agrega las palabras escritas al array peliculas
    document.getElementById("form-peliculas").addEventListener("submit", e => {
      e.preventDefault();
      const peli = document.getElementById("pelicula").value.trim();
      if (peli) {
        peliculas.push(peli);
        document.getElementById("array-peliculas").textContent =
          "Películas: [" + peliculas.join(", ") + "]";
      }
      e.target.reset();
    });
    //copia en otra array los elementos entre la posicion 2 y 4 y los muestra
    function copiarPeliculas() {
      const copia = peliculas.slice(2, 4);
      document.getElementById("resultado-peliculas").textContent =
        "Copia parcial: [" + copia.join(", ") + "]";
    }

    
    const ultimos = [];
    //agrega lo escrito al array
    document.getElementById("form-ultimos").addEventListener("submit", e => {
      e.preventDefault();
      const el = document.getElementById("elementoUltimo").value.trim();
      if (el) {
        ultimos.push(el);
        document.getElementById("array-ultimos").textContent =
          "Elementos: [" + ultimos.join(", ") + "]";
      }
      e.target.reset();
    });
    //copia los 3 ultimos elementos del array
    function copiarUltimos3() {
      const copia = ultimos.slice(-3);
      document.getElementById("resultado-ultimos").textContent =
        "Últimos 3: [" + copia.join(", ") + "]";
    }
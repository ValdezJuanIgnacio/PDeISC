
    let animales = ["Perro", "Gato", "Conejo"];
    //elimina el ultimo elemento del array
    function eliminarAnimal() {
      if (animales.length > 0) {
        let eliminado = animales.pop();
        document.getElementById("ultimo-animal").textContent = "Eliminado: " + eliminado;
        document.getElementById("resultado-animales").textContent = "Animales: [" + animales.join(", ") + "]";
      } else {
        document.getElementById("ultimo-animal").textContent = "No hay más animales.";
      }
    }

    
    let productos = ["Pan", "Leche", "Huevos"];
    //elimina el ultimo elemento del array
    function eliminarProducto() {
      if (productos.length > 0) {
        let eliminado = productos.pop();
        document.getElementById("producto-eliminado").textContent = "Eliminado: " + eliminado;
        document.getElementById("resultado-productos").textContent = "Productos: [" + productos.join(", ") + "]";
      } else {
        document.getElementById("producto-eliminado").textContent = "Lista vacía.";
      }
    }

    let elementos = ["A", "B", "C", "D"];
    //vacia el array por completo
    function vaciarArray() {
      let eliminados = [];
      while (elementos.length > 0) {
        eliminados.push(elementos.pop());
      }
      document.getElementById("resultado-vaciar").textContent = "Elementos: []";
      document.getElementById("elementos-eliminados").textContent = "Eliminados: [" + eliminados.join(", ") + "]";
    }
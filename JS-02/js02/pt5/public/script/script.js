

    let letras = [];
    //agrega las letras al array
    document.getElementById("form-letras").addEventListener("submit", e => {
      e.preventDefault();
      const letra = document.getElementById("letra").value.trim();
      if (!letra) return;
      letras.push(letra);
      document.getElementById("resultado-letras").textContent =
        "Letras: [" + letras.join(", ") + "]";
      e.target.reset();
    });
    //elimina los dos ultimos elementos del array
    function eliminarElementos() {
      if (letras.length > 1) {
        const eliminados = letras.splice(1, 2);
        document.getElementById("eliminados").textContent =
          "Eliminados: " + eliminados.join(", ");
        document.getElementById("resultado-letras").textContent =
          "Letras: [" + letras.join(", ") + "]";
      } else {
        document.getElementById("eliminados").textContent =
          "No hay suficientes elementos para eliminar.";
      }
    }

   
    let nombres = [];
    //ingresa los nombres escritos en la posicion 2 del array
    document.getElementById("form-nombre").addEventListener("submit", e => {
      e.preventDefault();
      const nuevoNombre = document.getElementById("nuevoNombre").value.trim();
      if (!nuevoNombre) return;
      nombres.splice(1, 0, nuevoNombre);
      document.getElementById("resultado-nombres").textContent =
        "Nombres: [" + nombres.join(", ") + "]";
      e.target.reset();
    });

     
  const formReemplazo = document.getElementById("form-reemplazo");
  const input1 = document.getElementById("nuevoElemento1");
  const input2 = document.getElementById("nuevoElemento2");
  const btnReemplazar = document.getElementById("btn-reemplazar");

  
  let reemplazo = ["Elemento1", "Elemento2", "Elemento3", "Elemento4", "Elemento5"];

  // Mostrar la lista
  document.getElementById("resultado-reemplazo").textContent =
    "Reemplazo: [" + reemplazo.join(", ") + "]";

  // Función que habilita el botón sólo si ambos inputs tienen texto
  function validaReemplazo() {
    const v1 = input1.value.trim();
    const v2 = input2.value.trim();
    btnReemplazar.disabled = !(v1 && v2);
  }

  // Cada vez que cambie alguno de los dos inputs, validamos
  input1.addEventListener("input", validaReemplazo);
  input2.addEventListener("input", validaReemplazo);

  // Al enviar, aplicamos el splice y volvemos a desactivar
  formReemplazo.addEventListener("submit", function(e) {
    e.preventDefault();
    const v1 = input1.value.trim();
    const v2 = input2.value.trim();
    // Si por alguna razón están vacíos, no hace nada
    if (!v1 || !v2) return;

    // Reemplaza en el array
    reemplazo.splice(1, 2, v1, v2);

    // muestra la lista 
    document.getElementById("resultado-reemplazo").textContent =
      "Reemplazo: [" + reemplazo.join(", ") + "]";

    
    formReemplazo.reset();
    validaReemplazo();
  });

  // Inicializa el estado del botón en deshabilitado
  validaReemplazo();
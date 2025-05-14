
  
    const numeros = [10, 20, 30, 40];
    //quita los numeros del array
    function quitarNumero() {
      if (numeros.length > 0) {
        const quitado = numeros.shift();
        document.getElementById("numero-quitado").textContent = "Número quitado: " + quitado;
        document.getElementById("resultado-numeros").textContent = "Números: [" + numeros.join(", ") + "]";
      } else {
        document.getElementById("numero-quitado").textContent = "No quedan números.";
      }
    }

    const mensajes = ["Hola", "¿Cómo estás?", "¿Listo para la reunión?"];
    //elimina los elementos del array
    function eliminarMensaje() {
      if (mensajes.length > 0) {
        const eliminado = mensajes.shift();
        document.getElementById("mensaje-eliminado").textContent = "Mensaje eliminado: " + eliminado;
        document.getElementById("resultado-chat").textContent = "Mensajes: [" + mensajes.join(", ") + "]";
      } else {
        document.getElementById("mensaje-eliminado").textContent = "No hay mensajes.";
      }
    }


    const clientes = ["Ana", "Pedro", "Laura"];
    //agrega elementos al array en la ultima posicion
    const formClientes = document.getElementById("form-clientes");
    formClientes.addEventListener("submit", e => {
      e.preventDefault();
      const nuevo = document.getElementById("nuevoCliente").value.trim();
      if (nuevo) {
        clientes.push(nuevo);
        document.getElementById("resultado-clientes").textContent = "Cola: [" + clientes.join(", ") + "]";
        formClientes.reset();
      }
    });
    //elimina el primer elemento del array
    function atenderCliente() {
      if (clientes.length > 0) {
        const atendido = clientes.shift();
        document.getElementById("cliente-atendido").textContent = "Cliente atendido: " + atendido;
        document.getElementById("resultado-clientes").textContent = "Cola: [" + clientes.join(", ") + "]";
      } else {
        document.getElementById("cliente-atendido").textContent = "No hay clientes en espera.";
      }
    }
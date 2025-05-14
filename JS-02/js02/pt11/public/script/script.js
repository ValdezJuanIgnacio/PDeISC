

  let numeros = [];
  //agrega los numeros ingresados al array
  function agregarNumero() {
    const num = parseFloat(document.getElementById("inputNumero").value);
    if (!isNaN(num)) {
      numeros.push(num);
      document.getElementById("resultado-numeros").textContent = "Números: [" + numeros.join(", ") + "]";
      document.getElementById("inputNumero").value = '';
    }
  }
    //si los numeros son mayores a 10 los muestra
  function filtrarMayores10() {
    const mayores = numeros.filter(n => n > 10);
    document.getElementById("resultado-mayores10").textContent = "Mayores a 10: [" + mayores.join(", ") + "]";
  }

  
  let palabras = [];
  //agrega palabras al array
  function agregarPalabra() {
    const palabra = document.getElementById("inputPalabra").value.trim();
    if (palabra) {
      palabras.push(palabra);
      document.getElementById("resultado-palabras").textContent = "Palabras: [" + palabras.join(", ") + "]";
      document.getElementById("inputPalabra").value = '';
    }
  }
  //si las palabras tiene mas de 5 caracteres las muestra
  function filtrarPalabrasLargas() {
    const largas = palabras.filter(p => p.length > 5);
    document.getElementById("resultado-largas").textContent = "Palabras largas: [" + largas.join(", ") + "]";
  }

  
  let usuarios = [];
  //si el nombre del usuario lo agrega al array
  function agregarUsuario() {
    const nombre = document.getElementById("inputNombreUsuario").value.trim();
    const activo = document.getElementById("inputActivo").value === "true";
    if (nombre) {
      usuarios.push({ nombre, activo });
      const lista = usuarios.map(u => `${u.nombre} (${u.activo ? "activo" : "inactivo"})`);
      document.getElementById("resultado-usuarios").textContent = "Usuarios: [" + lista.join(", ") + "]";
      document.getElementById("inputNombreUsuario").value = '';
    }
  }
  //muestra los usuarios que tengan el valor ed activo
  function filtrarActivos() {
    const activos = usuarios.filter(u => u.activo);
    const listaActivos = activos.map(u => u.nombre);
    document.getElementById("resultado-activos").textContent = "Activos: [" + listaActivos.join(", ") + "]";
  }
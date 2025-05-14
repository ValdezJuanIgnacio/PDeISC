
  
  let numerosSuma = [];
  //agrega numeros a un array y muestra la lista
  function agregarNumeroSuma() {
    const num = parseFloat(document.getElementById("inputSuma").value);
    if (!isNaN(num)) {
      numerosSuma.push(num);
      document.getElementById("listaSuma").textContent = "Números: [" + numerosSuma.join(", ") + "]";
      document.getElementById("inputSuma").value = '';
    }
  }
  //Suma todos los numeros del array
  function sumarNumeros() {
    const suma = numerosSuma.reduce((acc, val) => acc + val, 0);
    document.getElementById("resultadoSuma").textContent = "Suma total: " + suma;
  }

  
  let numerosMultiplicacion = [];
  //agrega numeros a un array y muestra la lista
  function agregarNumeroMultiplicacion() {
    const num = parseFloat(document.getElementById("inputMultiplicacion").value);
    if (!isNaN(num)) {
      numerosMultiplicacion.push(num);
      document.getElementById("listaMultiplicacion").textContent = "Números: [" + numerosMultiplicacion.join(", ") + "]";
      document.getElementById("inputMultiplicacion").value = '';
    }
  }
  //Verifica que el array no este vacio y multiplica los numeros del mismo
  function multiplicarNumeros() {
    if (numerosMultiplicacion.length === 0) return;
    const producto = numerosMultiplicacion.reduce((acc, val) => acc * val, 1);
    document.getElementById("resultadoMultiplicacion").textContent = "Multiplicación total: " + producto;
  }

  
  let productos = [];
  //Agrega un precio al array de precios
  function agregarPrecio() {
    const precio = parseFloat(document.getElementById("inputPrecio").value);
    if (!isNaN(precio)) {
      productos.push({ precio });
      const lista = productos.map(p => `$${p.precio.toFixed(2)}`);
      document.getElementById("listaPrecios").textContent = "Precios: [" + lista.join(", ") + "]";
      document.getElementById("inputPrecio").value = '';
    }
  }
  //suma todos los precios del array
  function sumarPrecios() {
    const total = productos.reduce((acc, prod) => acc + prod.precio, 0);
    document.getElementById("resultadoPrecios").textContent = "Total de precios: $" + total.toFixed(2);
  }
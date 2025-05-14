
  // Ejercicio 1
  let numeros3 = [];
  //agrega los numeros ingresados al array
  function agregarNumero3() {
    const numero = parseFloat(document.getElementById("inputNumero3").value);
    if (!isNaN(numero)) {
      numeros3.push(numero);
      document.getElementById("resultado-numeros3").textContent = "Números: [" + numeros3.join(", ") + "]";
      document.getElementById("inputNumero3").value = '';
    }
  }
  //multiplica por tres a los numeros del array
  function multiplicarPor3() {
    const multiplicados = numeros3.map(num => num * 3);
    document.getElementById("resultado-multiplicados").textContent = "Resultado: [" + multiplicados.join(", ") + "]";
  }

  // Ejercicio 2
  let nombresMayus = [];
  //agrega los nombres escritos al array
  function agregarNombreMayus() {
    const nombre = document.getElementById("inputNombreMayus").value.trim();
    if (nombre) {
      nombresMayus.push(nombre);
      document.getElementById("resultado-nombresMayus").textContent = "Nombres: [" + nombresMayus.join(", ") + "]";
      document.getElementById("inputNombreMayus").value = '';
    }
  }
  //guarda los nombres del array nombre pero hace que sus caracteres se pongan en mayuscuala en otro array
  function convertirMayusculas() {
    const mayus = nombresMayus.map(nombre => nombre.toUpperCase());
    document.getElementById("resultado-mayusculas").textContent = "Mayúsculas: [" + mayus.join(", ") + "]";
  }

  // Ejercicio 3
  let precios = [];
  //agrega los precios al array
  function agregarPrecio() {
    const precio = parseFloat(document.getElementById("inputPrecio").value);
    if (!isNaN(precio)) {
      precios.push(precio);
      document.getElementById("resultado-precios").textContent = "Precios: [" + precios.join(", ") + "]";
      document.getElementById("inputPrecio").value = '';
    }
  }
  //le suma a los precios del array precios un 21% de más 
  function agregarIVA() {
    const preciosIVA = precios.map(p => (p * 1.21).toFixed(2));
    document.getElementById("resultado-iva").textContent = "Con IVA: [" + preciosIVA.join(", ") + "]";
  }

 // Agrega las letras al array
  let letras = [];

  function agregarLetra() {
    const letra = document.getElementById("inputLetras").value.trim();
    if (letra) {
      letras.push(letra);
      document.getElementById("resultado-letras").textContent = "Letras: [" + letras.join(", ") + "]";
      document.getElementById("inputLetras").value = '';
    }
  }
// Agarra el array de las letras y luego las guarda invertidas en otra variable
  function invertirLetras() {
    const invertidas = [...letras].reverse();
    document.getElementById("resultado-invertido-letras").textContent = "Invertidas: [" + invertidas.join(", ") + "]";
  }

  
  let numeros = [];
  //Agrega numeros a una array
  function agregarNumero() {
    const num = parseFloat(document.getElementById("inputNumero").value);
    if (!isNaN(num)) {
      numeros.push(num);
      document.getElementById("resultado-numeros").textContent = "Números: [" + numeros.join(", ") + "]";
      document.getElementById("inputNumero").value = '';
    }
  }
  // Agarra el array de los numeros y despues los guarda invertidos en otra variable
  function invertirNumeros() {
    const invertidos = [...numeros].reverse();
    document.getElementById("resultado-invertido-numeros").textContent = "Invertidos: [" + invertidos.join(", ") + "]";
  }

  // guarda el texto en una variable, despues en otra invierte el contenido de la variable que tiene el texto original 
  function invertirTexto() {
    const texto = document.getElementById("inputTexto").value;
    const invertido = texto.split('').reverse().join('');
    document.getElementById("resultado-texto-invertido").textContent = "Texto invertido: " + invertido;
  }
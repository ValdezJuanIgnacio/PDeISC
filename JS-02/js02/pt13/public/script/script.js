
let numeros = [];
//agrega numeros a un array si son validos
function agregarNumero() {
  const num = parseFloat(document.getElementById("inputNumero").value);
  if (!isNaN(num)) {
    numeros.push(num);
    document.getElementById("resultado-numeros").textContent = "Números: " + numeros.join(", ") + "";
    document.getElementById("inputNumero").value = '';
  }
}
//ordena los numeros de menor a mayor
function ordenarNumeros() {
  const ordenados = [...numeros].sort((a, b) => a - b);
  document.getElementById("resultado-ordenados").textContent = "Ordenados: " + ordenados.join(", ") + "";
}


let palabras = [];
//Agrega palabaras a un array
function agregarPalabra() {
  const palabra = document.getElementById("inputPalabra").value.trim();
  if (palabra) {
    palabras.push(palabra);
    document.getElementById("resultado-palabras").textContent = "Palabras: " + palabras.join(", ") + "";
    document.getElementById("inputPalabra").value = '';
  }
}
//ordena las palabras del array alfabeticamente
function ordenarPalabras() {
  const ordenadas = [...palabras].sort((a, b) => a.localeCompare(b));
  document.getElementById("resultado-palabras-ordenadas").textContent = "Ordenadas: " + ordenadas.join(", ") + "";
}


let personas = [];
//Guarda objetos con el valor de nombre y edad a un array
function agregarPersona() {
  const nombre = document.getElementById("inputNombre").value.trim();
  const edad = parseInt(document.getElementById("inputEdad").value);
  if (nombre && !isNaN(edad)) {
    personas.push({ nombre, edad });
    const lista = personas.map(p => `${p.nombre} ${p.edad} años`);
    document.getElementById("resultado-personas").textContent = "Personas: " + lista.join(", ") + "";
    document.getElementById("inputNombre").value = '';
    document.getElementById("inputEdad").value = '';
  }
}
//ordena los objetos en ornde de menor a mayor segun la edad
function ordenarPorEdad() {
  const ordenadas = [...personas].sort((a, b) => a.edad - b.edad);
  const lista = ordenadas.map(p => `${p.nombre} ${p.edad} años`);
  document.getElementById("resultado-personas-ordenadas").textContent = "Ordenadas por edad: " + lista.join(", ") + "";
}
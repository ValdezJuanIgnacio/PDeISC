
let nombres = [];
//agrega lso nombres escritos al array si no estan repetidso
function agregarNombre() {
  const nombre = document.getElementById("inputNombre").value.trim();
  if (nombre && !nombres.includes(nombre)) {
    nombres.push(nombre);
    document.getElementById("resultado-nombres").textContent = "Nombres: [" + nombres.join(", ") + "]";
    document.getElementById("inputNombre").value = '';  // Limpiar el input
  }
}
//muestra los nombres del array con un "Hola -nombre- !"
function saludarNombres() {
  let saludos = [];
  nombres.forEach(nombre => {
    saludos.push(`Hola, ${nombre}!`);
  });
  document.getElementById("saludo-nombres").textContent = saludos.join("\n");
}

let numeros = [];
//agrega un numero si no esta repetido
function agregarNumero() {
  const numero = parseInt(document.getElementById("inputNumero").value);
  if (!isNaN(numero) && !numeros.includes(numero)) {
    numeros.push(numero);
    document.getElementById("resultado-numeros").textContent = "Números: [" + numeros.join(", ") + "]";
    document.getElementById("inputNumero").value = '';  // Limpiar el input
  }
}
//multiplica cada numero del array por 2
function doblarNumeros() {
  let dobles = [];
  numeros.forEach(numero => {
    dobles.push(numero * 2);
  });
  document.getElementById("doble-numeros").textContent = "Doble de los números: " + dobles.join(", ");
}

let personas = [];
//agrega los objetos pero solo si sus dos atributos estan completos
function agregarPersona() {
  const nombre = document.getElementById("inputPersonaNombre").value.trim();
  const edad = parseInt(document.getElementById("inputPersonaEdad").value);
  if (nombre && !isNaN(edad)) {
    personas.push({ nombre, edad });
    document.getElementById("resultado-personas").textContent = "Personas: " + personas.map(p => p.nombre).join(", ");
    document.getElementById("inputPersonaNombre").value = '';  // Limpiar el input
    document.getElementById("inputPersonaEdad").value = '';  // Limpiar el input
  }
}
//muestra los atributos de los objetos del array
function mostrarPersonas() {
  let textoPersonas = [];
  personas.forEach(persona => {
    textoPersonas.push(`${persona.nombre}, ${persona.edad} años`);
  });
  document.getElementById("mostrar-personas").textContent = "Personas y edades: " + textoPersonas.join(", ");
}
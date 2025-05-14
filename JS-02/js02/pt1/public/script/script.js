document.addEventListener("DOMContentLoaded", () => {
  const frutas = [];
  const amigos = [];
  const numeros = [3, 7, 15];

  // agrega hasta 3 elementos a un array
  document.getElementById("form-frutas").addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("fruta1");
    const resultado = document.getElementById("resultado-frutas");
  
    if (frutas.length >= 3) {
      resultado.textContent = "Ya agregaste 3 frutas: " + frutas.join(", ");
      input.value = "";
      return;
    }
  
    if (input.value.trim()) {
      frutas.push(input.value.trim());
      resultado.textContent = "Frutas: " + frutas.join(", ");
      input.value = "";
    }
  });

  // agrega hasta tres elementos a un array
  document.getElementById("form-amigos").addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("amigo1");
    const resultado = document.getElementById("resultado-amigos");
  
    if (amigos.length >= 3) {
      resultado.textContent = "Ya agregaste 3 amigos: " + amigos.join(", ");
      input.value = "";
      return;
    }
  
    if (input.value.trim()) {
      amigos.push(input.value.trim());
      resultado.textContent = "Amigos: " + amigos.join(", ");
      input.value = "";
    }
  });

  // agrega numeros al array solo si es mas grande que el ultimo numero de la misma
  document.getElementById("form-numeros").addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("nuevoNumero");
    const valor = parseFloat(input.value);
    if (!isNaN(valor)) {
      numeros.push(valor);
      document.getElementById("resultado-numeros").textContent = "Números: " + numeros.join(", ");
      input.value = "";
    }
  });
});

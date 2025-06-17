export let zoo = [];
export let tiposAnimales = ["Felino", "Ave", "Reptil"];
export let cantidadJaulas = 0;

export function init() {
  renderTipos();
}

export function crearJaulas() {
  cantidadJaulas = parseInt(document.getElementById("inputJaulas").value);

  const selectJaulas = document.getElementById("jaula");
  const filtro1 = document.getElementById("jaulaFiltro1");
  const filtro2 = document.getElementById("jaulaFiltro2");
  const desde = document.getElementById("jaulaDesde");
  const hasta = document.getElementById("jaulaHasta");

  // Limpiar todas las opciones
  [selectJaulas, filtro1, filtro2, desde, hasta].forEach(sel => sel.innerHTML = "");

  for (let i = 1; i <= cantidadJaulas; i++) {
    const opt = new Option("Jaula " + i, i);
    const opt2 = opt.cloneNode(true);
    const opt3 = opt.cloneNode(true);
    const opt4 = opt.cloneNode(true);
    const opt5 = opt.cloneNode(true);

    selectJaulas.appendChild(opt);
    filtro1.appendChild(opt2);
    filtro2.appendChild(opt3);
    desde.appendChild(opt4);
    hasta.appendChild(opt5);
  }
}


export function agregarTipo() {
  const nuevo = document.getElementById("nuevoTipo").value.trim();
  if (nuevo && !tiposAnimales.includes(nuevo)) {
    tiposAnimales.push(nuevo);
    renderTipos();
    document.getElementById("nuevoTipo").value = "";
  }
}

export function renderTipos() {
  const selectTipo = document.getElementById("tipoAnimal");
  const filtroTipo = document.getElementById("tipoFiltro");
  selectTipo.innerHTML = "";
  filtroTipo.innerHTML = "";
  tiposAnimales.forEach((tipo, index) => {
    const opt = new Option(tipo, index);
    selectTipo.appendChild(opt);
    filtroTipo.appendChild(opt.cloneNode(true));
  });
}

export function agregarAnimal(animal) {
  zoo.push(animal);
}

export function renderTabla() {
  let html = `<table class="table table-bordered mt-3"><thead><tr>
    <th>ID</th><th>Nombre</th><th>Jaula</th><th>Tipo</th><th>Peso</th>
  </tr></thead><tbody>`;
  for (let z of zoo) {
    html += `<tr><td>${z.IdAnimal}</td><td>${z.nombre}</td><td>${z.JaulaNumero}</td><td>${tiposAnimales[z.IdTypeAnimal]}</td><td>${z.peso}</td></tr>`;
  }
  html += "</tbody></table>";
  document.getElementById("tablaAnimales").innerHTML = html;
}

function mostrarResultadoConAnimacion(idContenedor, texto) {
  const contenedor = document.getElementById(idContenedor);
  if (texto && texto.trim() !== "") {
    contenedor.innerText = texto;
    contenedor.classList.add("mostrar");
  } else {
    contenedor.innerText = "";
    contenedor.classList.remove("mostrar");
  }
}

export function filtrarAnimalesPeso() {
  const jaula = parseInt(document.getElementById("jaulaFiltro1").value);
  const peso = parseFloat(document.getElementById("pesoFiltro1").value);
  if (!jaula || isNaN(peso)) {
    mostrarResultadoConAnimacion("resultadoFiltroPeso", "");
    return;
  }
  const cantidad = zoo.filter(z => z.JaulaNumero === jaula && z.peso < peso).length;
  mostrarResultadoConAnimacion("resultadoFiltroPeso", `Cantidad en Jaula ${jaula} con peso < ${peso}kg: ${cantidad}`);
}

export function filtrarTipoYJaula() {
  const tipo = parseInt(document.getElementById("tipoFiltro").value);
  const desde = parseInt(document.getElementById("jaulaDesde").value);
  const hasta = parseInt(document.getElementById("jaulaHasta").value);
  if (isNaN(tipo) || isNaN(desde) || isNaN(hasta)) {
    mostrarResultadoConAnimacion("resultadoFiltroTipo", "");
    return;
  }
  const cantidad = zoo.filter(z => z.IdTypeAnimal === tipo && z.JaulaNumero >= desde && z.JaulaNumero <= hasta).length;
  mostrarResultadoConAnimacion("resultadoFiltroTipo", `Cantidad tipo ${tiposAnimales[tipo]} entre jaulas ${desde}-${hasta}: ${cantidad}`);
}

export function animalMenorPeso() {
  const jaula = parseInt(document.getElementById("jaulaFiltro2").value);
  const peso = parseFloat(document.getElementById("pesoFiltro2").value);
  if (!jaula || isNaN(peso)) {
    mostrarResultadoConAnimacion("resultadoAnimalMenor", "");
    return;
  }
  const animal = zoo.find(z => z.JaulaNumero === jaula && z.peso < peso);
  const texto = animal ? `Animal encontrado: ${animal.nombre}` : "No se encontró ningún animal con esos criterios.";
  mostrarResultadoConAnimacion("resultadoAnimalMenor", texto);
}
export function mostrarConDocumentWrite() {
  document.write("<h1>Listado de Animales</h1>");
  zoo.forEach(z => {
    document.write(`ID: ${z.IdAnimal} | Nombre: ${z.nombre} | Jaula: ${z.JaulaNumero} | Tipo: ${tiposAnimales[z.IdTypeAnimal]} | Peso: ${z.peso}kg<br>`);
  });
}
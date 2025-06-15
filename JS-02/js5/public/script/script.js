
  class CZooAnimal {
    constructor(id, nombre, jaula, tipo, peso) {
      this.IdAnimal = id;
      this.nombre = nombre;
      this.JaulaNumero = jaula;
      this.IdTypeAnimal = tipo;
      this.peso = peso;
    }
  }

  let zoo = [];
  let tiposAnimales = ["Felino", "Ave", "Reptil"];
  let cantidadJaulas = 0;

  // Inicializa selectores al cargar
  window.onload = () => {
    renderTipos();
  };

  document.getElementById("formAnimal").addEventListener("submit", function(e) {
    e.preventDefault();
    const animal = new CZooAnimal(
      document.getElementById("idAnimal").value,
      document.getElementById("nombre").value,
      parseInt(document.getElementById("jaula").value),
      parseInt(document.getElementById("tipoAnimal").value),
      parseFloat(document.getElementById("peso").value)
    );
    zoo.push(animal);
    this.reset();
    renderTabla();
  });

  function crearJaulas() {
    cantidadJaulas = parseInt(document.getElementById("inputJaulas").value);
    const selectJaulas = document.getElementById("jaula");
    selectJaulas.innerHTML = "";
    for (let i = 1; i <= cantidadJaulas; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.text = "Jaula " + i;
      selectJaulas.appendChild(option);
    }
  }

  function agregarTipo() {
    const nuevo = document.getElementById("nuevoTipo").value.trim();
    if (nuevo && !tiposAnimales.includes(nuevo)) {
      tiposAnimales.push(nuevo);
      renderTipos();
      document.getElementById("nuevoTipo").value = "";
    }
  }

  function renderTipos() {
    const selectTipo = document.getElementById("tipoAnimal");
    const filtroTipo = document.getElementById("tipoFiltro");

    selectTipo.innerHTML = "";
    filtroTipo.innerHTML = "";

    tiposAnimales.forEach((tipo, index) => {
      let opt = new Option(tipo, index);
      selectTipo.appendChild(opt);
      filtroTipo.appendChild(opt.cloneNode(true));
    });
  }

  function renderTabla() {
    let html = `
      <table class="table table-bordered table-striped mt-3">
        <thead><tr>
          <th>ID</th><th>Nombre</th><th>Jaula</th><th>Tipo</th><th>Peso (kg)</th>
        </tr></thead><tbody>
    `;
    for (let animal of zoo) {
      html += `<tr>
        <td>${animal.IdAnimal}</td>
        <td>${animal.nombre}</td>
        <td>${animal.JaulaNumero}</td>
        <td>${tiposAnimales[animal.IdTypeAnimal]}</td>
        <td>${animal.peso}</td>
      </tr>`;
    }
    html += "</tbody></table>";
    document.getElementById("tablaAnimales").innerHTML = html;
  }

  function filtrarAnimalesPeso() {
    const jaula = parseInt(document.getElementById("jaulaFiltro1").value);
    const peso = parseFloat(document.getElementById("pesoFiltro1").value);
    const cantidad = zoo.filter(z => z.JaulaNumero === jaula && z.peso < peso).length;
    alert(`Cantidad de animales en jaula ${jaula} con peso < ${peso}kg: ${cantidad}`);
  }

  function filtrarTipoYJaula() {
    const tipo = parseInt(document.getElementById("tipoFiltro").value);
    const desde = parseInt(document.getElementById("jaulaDesde").value);
    const hasta = parseInt(document.getElementById("jaulaHasta").value);
    const cantidad = zoo.filter(z => z.IdTypeAnimal === tipo && z.JaulaNumero >= desde && z.JaulaNumero <= hasta).length;
    alert(`Cantidad de animales tipo ${tiposAnimales[tipo]} entre jaulas ${desde}-${hasta}: ${cantidad}`);
  }

  function animalMenorPeso() {
    const jaula = parseInt(document.getElementById("jaulaFiltro2").value);
    const peso = parseFloat(document.getElementById("pesoFiltro2").value);
    const animal = zoo.find(z => z.JaulaNumero === jaula && z.peso < peso);
    if (animal) {
      alert(`Animal encontrado: ${animal.nombre}`);
    } else {
      alert("No se encontró ningún animal con esos criterios.");
    }
  }

  function mostrarConDocumentWrite() {
    document.write("<h1>Listado de Animales</h1>");
    for (let z of zoo) {
      document.write(`ID: ${z.IdAnimal} | Nombre: ${z.nombre} | Jaula: ${z.JaulaNumero} | Tipo: ${tiposAnimales[z.IdTypeAnimal]} | Peso: ${z.peso}kg<br>`);
    }
  }
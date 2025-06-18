export let zoo = [];
export let tiposAnimales = ["Felino", "Ave", "Reptil"];
export let cantidadJaulas = 5; 
let nextAnimalId = 1; 
//inicia los tipos y la cantidad de jaulas que hay por defecto
export function init() {
  renderTipos();
  crearJaulas(); 
}
//cambia la cantidad de jaulas y pone esa cantidad en la parte de filtros
export function crearJaulas() {
  const inputJaulas = document.getElementById("inputJaulas");
  if (inputJaulas && inputJaulas.value) { 
    cantidadJaulas = parseInt(inputJaulas.value);
  } else if (!inputJaulas || !inputJaulas.value) { 
  }
  const selectJaulas = document.getElementById("jaula");
  if (selectJaulas) selectJaulas.innerHTML = "";
  for (let i = 1; i <= cantidadJaulas; i++) {
    const opt = new Option("Jaula " + i, i);
    if (selectJaulas) selectJaulas.appendChild(opt.cloneNode(true));
  }
}
//pone un nuevo animal si este no existe
export function agregarTipo() {
  const nuevo = document.getElementById("nuevoTipo").value.trim();
  if (nuevo && !tiposAnimales.includes(nuevo)) {
    tiposAnimales.push(nuevo);
    renderTipos();
    document.getElementById("nuevoTipo").value = "";
  }
}
//pone los animales que hay en las opciones 
export function renderTipos() {
  const selectTipo = document.getElementById("tipoAnimal");
  
  if (selectTipo) selectTipo.innerHTML = "";
  
  tiposAnimales.forEach((tipo, index) => {
    const opt = new Option(tipo, index);
    if (selectTipo) selectTipo.appendChild(opt);
    
  });
}
//le pone un id al animal y lo agrega al array zoo
export function agregarAnimal(animal) {
  animal.IdAnimal = nextAnimalId.toString();
  zoo.push(animal);
  nextAnimalId++; 
}
//crea la tabla con los animales con sus caracteristicas 
export function renderTabla() {
  let html = `
    <h2>Animales Registrados</h2>
  <table class="table table-bordered mt-3"><thead><tr>
    <th>ID</th><th>Nombre</th><th>Jaula</th><th>Tipo</th><th>Peso</th>
  </tr></thead><tbody>`;
  for (let z of zoo) {
    html += `<tr><td>${z.IdAnimal}</td><td>${z.nombre}</td><td>${z.JaulaNumero}</td><td>${tiposAnimales[z.IdTypeAnimal]}</td><td>${z.peso}</td></tr>`;
  }
  html += "</tbody></table>";
  const tablaAnimalesDiv = document.getElementById("tablaAnimales");
  if (tablaAnimalesDiv) {
    tablaAnimalesDiv.innerHTML = html;
  }
}
//muestra mensajes con una animacion css
function mostrarResultadoConAnimacion(idContenedor, texto) {
  const contenedor = document.getElementById(idContenedor);
  if (contenedor) { 
    if (texto && texto.trim() !== "") {
      contenedor.innerText = texto;
      contenedor.classList.add("mostrar");
    } else {
      contenedor.innerText = "";
      contenedor.classList.remove("mostrar");
    }
  }
}
//filtra en una jaula los animales que tienen un peso menor al indicado y muestra si hay
export function filtrarAnimalesPeso() {
  const jaula = parseInt(document.getElementById("jaulaFiltro1").value);
  const peso = parseFloat(document.getElementById("pesoFiltro1").value);
  if (!jaula || isNaN(peso)) {
    mostrarResultadoConAnimacion("resultadoFiltroPeso", "");
    return;
  }
  const cantidad = zoo.filter(z => z.JaulaNumero === jaula && z.peso < peso).length;
  mostrarResultadoConAnimacion("resultadoFiltroPeso", ``);
}
//filtra el tipo de animal pedido con el numero de la jaula y si hay lo muestra
export function filtrarTipoYJaula() {
  const tipo = parseInt(document.getElementById("tipoFiltro").value);
  const desde = parseInt(document.getElementById("jaulaDesde").value);
  const hasta = parseInt(document.getElementById("jaulaHasta").value);
  if (isNaN(tipo) || isNaN(desde) || isNaN(hasta)) {
    mostrarResultadoConAnimacion("resultadoFiltroTipo", "");
    return;
  }
  const cantidad = zoo.filter(z => z.IdTypeAnimal === tipo && z.JaulaNumero >= desde && z.JaulaNumero <= hasta).length;
  mostrarResultadoConAnimacion("resultadoFiltroTipo", ``);
}
//busca el primer animal que tenga un peso menor al indicado en la jaula puesta
export function animalMenorPeso() {
  const jaula = parseInt(document.getElementById("jaulaFiltro2").value);
  const peso = parseFloat(document.getElementById("pesoFiltro2").value);
  if (!jaula || isNaN(peso)) {
    mostrarResultadoConAnimacion("resultadoAnimalMenor", "");
    return;
  }
  const animal = zoo.find(z => z.JaulaNumero === jaula && z.peso < peso);
  const texto = animal ? `` : "No se encontró ningún animal con esos criterios.";
  mostrarResultadoConAnimacion("resultadoAnimalMenor", texto);
}

//crea la pagina html con los filtros y la tabla que muestra los animales en base a los filtros
export function mostrarConDocumentWrite(filteredZoo = null) {
  document.open(); 
  document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Listado de Animales</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Pacifico&family=Helvetica+Neue:wght@300;400;700&display=swap" rel="stylesheet">
          <style>
            body {
              background-color: #f8f9fa;
              font-family: 'Helvetica Neue', sans-serif;
              padding: 20px;
            }
            h1, h2 {
              font-family: 'Pacifico', cursive;
              color: #343a40;
              text-align: center;
              margin-bottom: 2rem;
            }
            .table {
              margin-top: 20px;
              border-radius: 0.5rem;
              overflow: hidden; /* For rounded borders to apply to the table */
            }
            th, td {
              vertical-align: middle;
            }
            .btn-back {
              margin-top: 20px;
              display: block;
              width: fit-content;
              margin-left: auto;
              margin-right: auto;
            }
            .card {
                background-color: #fff;
                border: 1px solid #dee2e6;
                border-radius: 0.5rem;
                box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                margin-bottom: 1.5rem;
                padding: 20px;
            }
            .form-label {
                font-weight: bold;
            }
            .resultado-filtro {
              background-color: #f0f8ff; /* A background color for the results */
              padding: 10px;
              border-radius: 5px;
              margin-top: 10px;
              border: 1px solid #cceeff;
              min-height: 40px; /* Ensure space even when empty */
              display: flex;
              align-items: center;
            }
            .error-message {
                color: #dc3545; /* Bootstrap danger color */
                font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Listado de Animales</h1>
            <div class="card">
                <h2 class="text-center mb-4">Filtrar Animales</h2>
                <div class="row g-3">
                    <div class="col-md-4">
                      <label class="form-label">Jaula y Peso (Menor a...)</label>
                      <select class="form-select mb-1" id="jaulaFiltro1DW">
                          <option value="">Seleccione jaula</option>
                          ${[...Array(cantidadJaulas)].map((_, i) => `<option value="${i + 1}" ${i + 1 === 5 ? 'selected' : ''}>Jaula ${i + 1}</option>`).join('')}
                      </select>
                      <input type="number" class="form-control" id="pesoFiltro1DW" placeholder="Peso máx" value="3" />
                      <button class="btn btn-secondary mt-2 w-100" onclick="window.filtrarAnimalesPesoDW()">Filtrar</button>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Tipo y Rango de Jaulas</label>
                      <select class="form-select mb-1" id="tipoFiltroDW">
                          ${tiposAnimales.map((tipo, index) => `<option value="${index}" ${tipo === 'Felino' ? 'selected' : ''}>${tipo}</option>`).join('')}
                      </select>
                      <select class="form-select mb-1" id="jaulaDesdeDW">
                          <option value="">Desde jaula</option>
                          ${[...Array(cantidadJaulas)].map((_, i) => `<option value="${i + 1}" ${i + 1 === 2 ? 'selected' : ''}>Jaula ${i + 1}</option>`).join('')}
                      </select>
                      <select class="form-select" id="jaulaHastaDW">
                          <option value="">Hasta jaula</option>
                          ${[...Array(cantidadJaulas)].map((_, i) => `<option value="${i + 1}" ${i + 1 === 5 ? 'selected' : ''}>Jaula ${i + 1}</option>`).join('')}
                      </select>
                      <button class="btn btn-secondary mt-2 w-100" onclick="window.filtrarTipoYJaulaDW()">Filtrar</button>
                    </div>
                    <div class="col-md-4">
                      <label class="form-label">Animal de menor peso en Jaula</label>
                      <select class="form-select mb-1" id="jaulaFiltro2DW">
                          <option value="">Seleccione jaula</option>
                          ${[...Array(cantidadJaulas)].map((_, i) => `<option value="${i + 1}" ${i + 1 === 4 ? 'selected' : ''}>Jaula ${i + 1}</option>`).join('')}
                      </select>
                      <input type="number" class="form-control" id="pesoFiltro2DW" placeholder="Peso máximo" value="120" />
                      <button class="btn btn-secondary mt-2 w-100" onclick="window.animalMenorPesoDW()">Buscar</button>
                    </div>
                </div>
                <div id="resultadoFiltrosDW" class="resultado-filtro mt-4"></div>
            </div>
            <div id="tablaAnimalesDW" class="table-responsive"></div>
            <button class="btn btn-primary btn-back" onclick="window.location.reload()">Volver</button>
          </div>
          <script>
            
            let zoo = ${JSON.stringify(zoo)};
            let tiposAnimales = ${JSON.stringify(tiposAnimales)};
            let cantidadJaulas = ${JSON.stringify(cantidadJaulas)};

           
            function renderJaulasDW() {
                const jaulasSelects = [
                    document.getElementById("jaulaFiltro1DW"),
                    document.getElementById("jaulaFiltro2DW"),
                    document.getElementById("jaulaDesdeDW"),
                    document.getElementById("jaulaHastaDW")
                ];
                jaulasSelects.forEach(sel => {
                    
                    if(sel && sel.options.length <= 1) { // Check if only the default "Seleccione jaula" or "Desde/Hasta jaula" option exists
                        sel.innerHTML = sel.querySelector('option[value=""]') ? '<option value="">' + sel.querySelector('option[value=""]').innerText + '</option>' : '';
                        for (let i = 1; i <= cantidadJaulas; i++) {
                            const opt = new Option("Jaula " + i, i);
                            sel.appendChild(opt);
                        }
                    }
                });
            }

            function renderTiposDW() {
                const tipoFiltro = document.getElementById("tipoFiltroDW");
                if(tipoFiltro && tipoFiltro.options.length === 0) { 
                    tiposAnimales.forEach((tipo, index) => {
                        const opt = new Option(tipo, index);
                        tipoFiltro.appendChild(opt);
                    });
                }
            }

            // Render the animal table on the new page
            function renderTablaDW(dataToRender) {
              let html = \`<table class="table table-bordered table-striped mt-3"><thead><tr>
                <th>ID</th><th>Nombre</th><th>Jaula</th><th>Tipo</th><th>Peso</th>
              </tr></thead><tbody>\`;
              const data = dataToRender || zoo; // Use filteredZoo if it exists, otherwise use the full zoo
              if (data.length === 0) {
                html += \`<tr><td colspan="5" class="text-center">No se encontraron animales.</td></tr>\`;
              } else {
                for (let z of data) {
                  html += \`<tr><td>\${z.IdAnimal}</td><td>\${z.nombre}</td><td>\${z.JaulaNumero}</td><td>\${tiposAnimales[z.IdTypeAnimal]}</td><td>\${z.peso}</td></tr>\`;
                }
              }
              html += "</tbody></table>";
              const tablaAnimalesDwDiv = document.getElementById("tablaAnimalesDW");
              if(tablaAnimalesDwDiv) {
                  tablaAnimalesDwDiv.innerHTML = html;
              }
            }

            function showTempMessageDW(element, message, isError = false) {
                if (element) {
                    element.innerText = message;
                    if (isError) {
                        element.classList.add("error-message");
                    } else {
                        element.classList.remove("error-message");
                    }
                    if (isError) {
                        setTimeout(() => {
                            element.innerText = "";
                            element.classList.remove("error-message");
                        }, 3000);
                    }
                }
            }

            window.filtrarAnimalesPesoDW = function() {
              const jaulaValue = document.getElementById("jaulaFiltro1DW").value;
              const pesoValue = document.getElementById("pesoFiltro1DW").value;
              const jaula = parseInt(jaulaValue);
              const peso = parseFloat(pesoValue);
              const resultadoFiltrosDW = document.getElementById("resultadoFiltrosDW");

              if (!jaulaValue || isNaN(peso)) {
                showTempMessageDW(resultadoFiltrosDW, "Por favor, complete todos los campos de filtro.", true);
                renderTablaDW(zoo); 
                return;
              } else {
                showTempMessageDW(resultadoFiltrosDW, ""); 
              }

              const filtered = zoo.filter(z => z.JaulaNumero === jaula && z.peso < peso);
              if (filtered.length === 0) {
                showTempMessageDW(resultadoFiltrosDW, "No se encontró ningún animal con esos criterios.");
              } else {
                showTempMessageDW(resultadoFiltrosDW, \`\`);
              }
              renderTablaDW(filtered);
            };

            window.filtrarTipoYJaulaDW = function() {
              const tipoValue = document.getElementById("tipoFiltroDW").value;
              const desdeValue = document.getElementById("jaulaDesdeDW").value;
              const hastaValue = document.getElementById("jaulaHastaDW").value;

              const tipo = parseInt(tipoValue);
              const desde = parseInt(desdeValue);
              const hasta = parseInt(hastaValue);
              const resultadoFiltrosDW = document.getElementById("resultadoFiltrosDW");

              if (tipoValue === "" || desdeValue === "" || hastaValue === "") { // Check for empty strings from selects
                showTempMessageDW(resultadoFiltrosDW, "Por favor, complete todos los campos de filtro.", true);
                renderTablaDW(zoo); // Show full table if inputs are invalid
                return;
              } else {
                showTempMessageDW(resultadoFiltrosDW, ""); 
              }
              
              const filtered = zoo.filter(z => z.IdTypeAnimal === tipo && z.JaulaNumero >= desde && z.JaulaNumero <= hasta);
              if (filtered.length === 0) {
                showTempMessageDW(resultadoFiltrosDW, "No se encontró ningún animal con esos criterios.");
              } else {
                showTempMessageDW(resultadoFiltrosDW, \`\`);
              }
              renderTablaDW(filtered);
            };

            window.animalMenorPesoDW = function() {
              const jaulaValue = document.getElementById("jaulaFiltro2DW").value;
              const pesoValue = document.getElementById("pesoFiltro2DW").value;
              const jaula = parseInt(jaulaValue);
              const peso = parseFloat(pesoValue);
              const resultadoFiltrosDW = document.getElementById("resultadoFiltrosDW");

              if (!jaulaValue || isNaN(peso)) {
                showTempMessageDW(resultadoFiltrosDW, "Por favor, complete todos los campos.", true);
                renderTablaDW(zoo); 
                return;
              } else {
                showTempMessageDW(resultadoFiltrosDW, ""); 
              }

              const animal = zoo.find(z => z.JaulaNumero === jaula && z.peso < peso);
              const texto = animal ? \`\` : "No se encontró ningún animal con esos criterios.";
              showTempMessageDW(resultadoFiltrosDW, texto);
              renderTablaDW(animal ? [animal] : []);
            };

            document.addEventListener('DOMContentLoaded', () => {
                renderJaulasDW();
                renderTiposDW();
                renderTablaDW(zoo); 
                const resultadoFiltrosDW = document.getElementById("resultadoFiltrosDW");
                if(resultadoFiltrosDW) resultadoFiltrosDW.innerText = ""; 
            });
          </script>
        </body>
        </html>
  `);
  document.close(); 
}
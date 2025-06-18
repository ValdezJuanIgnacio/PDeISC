import { CZooAnimal } from './CZoo.js';
import * as zooManager from './zoofunciones.js';

window.onload = () => zooManager.init();
//almacenamiento de las variables del formulario
document.getElementById("formAnimal").addEventListener("submit", function (e) {
  e.preventDefault();
  
  const animal = new CZooAnimal(
    null, 
    document.getElementById("nombre").value,
    parseInt(document.getElementById("jaula").value),
    parseInt(document.getElementById("tipoAnimal").value),
    parseFloat(document.getElementById("peso").value)
  );
  zooManager.agregarAnimal(animal);
  this.reset();
  zooManager.renderTabla();
});
//acceder a las funciones de 
window.crearJaulas = zooManager.crearJaulas;
window.agregarTipo = zooManager.agregarTipo;
window.filtrarAnimalesPeso = zooManager.filtrarAnimalesPeso;
window.filtrarTipoYJaula = zooManager.filtrarTipoYJaula;
window.animalMenorPeso = zooManager.animalMenorPeso;
window.mostrarConDocumentWrite = zooManager.mostrarConDocumentWrite;

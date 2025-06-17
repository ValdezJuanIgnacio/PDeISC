import { CZooAnimal } from './CZooAnimal.js';
import * as zooManager from './zooManager.js';

window.onload = () => zooManager.init();

document.getElementById("formAnimal").addEventListener("submit", function (e) {
  e.preventDefault();
  const animal = new CZooAnimal(
    document.getElementById("idAnimal").value,
    document.getElementById("nombre").value,
    parseInt(document.getElementById("jaula").value),
    parseInt(document.getElementById("tipoAnimal").value),
    parseFloat(document.getElementById("peso").value)
  );
  zooManager.agregarAnimal(animal);
  this.reset();
  zooManager.renderTabla();
});

window.crearJaulas = zooManager.crearJaulas;
window.agregarTipo = zooManager.agregarTipo;
window.filtrarAnimalesPeso = zooManager.filtrarAnimalesPeso;
window.filtrarTipoYJaula = zooManager.filtrarTipoYJaula;
window.animalMenorPeso = zooManager.animalMenorPeso;
window.mostrarConDocumentWrite = zooManager.mostrarConDocumentWrite;

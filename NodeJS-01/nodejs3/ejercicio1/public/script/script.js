//Hacer aparecer y desaparecer el titulo
function e1(){
    const elemento = document.getElementById("element");
    const elemento2 = document.getElementById("bt");
    if (elemento.style.display === "none" || elemento.style.display === "") {
      elemento.style.display = "block";
      elemento2.innerText="Quitar Titulo";
    } else {
      elemento.style.display = "none";
      elemento2.innerText="Mostrar Titulo";
    }
}
//Cambiar el titulo por chau dom
function cambiarTitulo() {
  const elemento = document.getElementById("element");
  const elemento2 = document.getElementById("btn");
  if (elemento.style.display === "block" && elemento.textContent === "Hola DOM") {
    elemento.innerText = "Chau DOM";
    elemento2.innerText="Hola DOM";
  } else if(elemento.style.display === "block"){
    elemento.innerText= "Hola DOM";
    elemento2.innerText="Chau DOM";
  }
}
//Cambiar color
function cambiarColorH1() {
  const elemento = document.getElementById("element");
  if (elemento) {
    elemento.style.color = "#" + Math.floor(Math.random()*16777215).toString(16);
  } else {
    alert("Primero agregá el H1.");
  }
}
function agregarImagen() {
  const elemento = document.getElementById("imagen");
  if (elemento.style.display === "none" || elemento.style.display === "") {
    elemento.style.display = "block";
    am.innerText="Quitar Imagen";
  }else{
    elemento.style.display = "none";
    am.innerText="Agregar imagen";
  }
}

function cambiarImagen() {
  const elemento = document.getElementById("imagen");
  if (elemento.style.display === "block" && elemento.textContent === "Hola DOM") {
    elemento.innerText = "Chau DOM";
    elemento2.innerText="Hola DOM";
  } else if(elemento.style.display === "block"){
    elemento.innerText= "Hola DOM";
    elemento2.innerText="Chau DOM";
  }
}

function cambiarTamañoImagen() {
  const elemento = document.getElementById("imagen");
  if(elemento.style.width === "500px"){
    elemento.style.width="800px;";

  }
}
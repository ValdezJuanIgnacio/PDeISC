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
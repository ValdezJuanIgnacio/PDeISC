const boton = document.getElementById("boton");
    //Cambia el color al precionar el boton
    boton.addEventListener("mousedown", () => {
      boton.style.backgroundColor = "red";
      boton.textContent = "Soltame";
    });

    // Al soltarlo se saca el efecto anterior
    boton.addEventListener("mouseup", () => {
      boton.style.backgroundColor = "blue";
      boton.textContent = "Presioname";
    });
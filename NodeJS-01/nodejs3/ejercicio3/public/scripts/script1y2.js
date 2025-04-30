//Muestra coordenadas del mouse
document.addEventListener('mousemove', function(event) {
    const x = event.clientX;
    const y = event.clientY;
    document.getElementById('coordenadas').textContent = `X: ${x} | Y: ${y}`;
  });
  const cuadro = document.getElementById("cuadro");
//Para cuando entra
  cuadro.addEventListener("mouseenter", () => {
    cuadro.style.backgroundColor = "darkorange";
    cuadro.textContent = "Viva Perón";
  });

  // Para cuando sale el mouse
  cuadro.addEventListener("mouseleave", () => {
    cuadro.style.backgroundColor = "steelblue";
    cuadro.textContent = "Viva Nestor";
  });


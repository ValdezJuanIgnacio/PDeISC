 //Muestra la tecla presionada
 const divTecla = document.getElementById('tecla');
 document.addEventListener('keydown', (event) => {
   divTecla.textContent = `Tecla: ${event.key}`;
 });
 
 //Muestra la altura del scroll en base a la pantalla
 const info = document.getElementById("scrollInfo");

 window.addEventListener("scroll", () => {
   const scrollY = window.scrollY;
   info.textContent = `Scroll: ${scrollY.toFixed(0)}px`;
 });
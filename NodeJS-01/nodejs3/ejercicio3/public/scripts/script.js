// Aseguramos que el DOM esté completamente cargado antes de ejecutar el código.
document.addEventListener('DOMContentLoaded', function () {

    // Obtenemos el botón que contará los hijos
    const btnContar = document.getElementById('contarHijos');
    
    // Obtenemos el contenedor que tiene los botones
    const botonera = document.getElementById('botonera');

    // Aseguramos que los elementos existen
    if (!btnContar || !botonera) {
        console.error('No se encontraron los elementos necesarios.');
        return;
    }

    // Añadimos el evento al botón de contar
    btnContar.addEventListener('click', function () {
        // Contamos cuántos botones hay dentro de la botonera
        const botones = botonera.getElementsByTagName('button');
        
        // Mostramos un alert con la cantidad de botones
        alert(`La botonera tiene ${botones.length} botones.`);
    });
});

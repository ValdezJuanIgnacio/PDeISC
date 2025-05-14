// Función para leer y decodificar el archivo
function leerYDecodificar() {
    const archivoInput = document.getElementById('archivoEntrada');
    const archivo = archivoInput.files[0];

    if (!archivo) {
      alert('Por favor selecciona un archivo.');
      return;
    }

    const lector = new FileReader();
    lector.onload = function(e) {
      const mensajeCifrado = e.target.result;
      document.getElementById('cifrado').textContent = mensajeCifrado;
      
      // Decodificación: invierte el contenido de los paréntesis
      const mensajeDecodificado = mensajeCifrado.replace(/\(([^)]+)\)/g, (match, contenido) => {
        return contenido.split('').reverse().join('');
      });

      // Mostrar mensaje decodificado
      document.getElementById('decodificado').textContent = mensajeDecodificado;

      // Crear el archivo de salida
      const blob = new Blob([mensajeDecodificado], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const enlace = document.getElementById('descargar');
      enlace.href = url;
      enlace.style.display = 'inline';
    };

    // Leer el archivo seleccionado
    lector.readAsText(archivo);
  }
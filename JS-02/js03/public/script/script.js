    let numeros = [];
    let filtradosResultado = ''; 
    //muestra el mensaje de error
    function mostrarError(mensaje) {
      const errorDiv = document.getElementById('mensajeError');
      errorDiv.innerText = mensaje;
      errorDiv.style.display = 'block';
    }
    //quita el mensaje de error
    function limpiarError() {
      const errorDiv = document.getElementById('mensajeError');
      errorDiv.innerText = '';
      errorDiv.style.display = 'none';
    }
    //agrega numeros al array, mientras sean validos y no tenga mas de 20 numeros el array
    function agregarNumero() {
      limpiarError();
      const input = document.getElementById('numInput');
      const num = parseInt(input.value);
      if (isNaN(num)) {
        mostrarError("Ingrese un número válido.");
        return;
      }

      if (numeros.length >= 20) {
        mostrarError("No puede ingresar más de 20 números.");
        return;
      }

      numeros.push(num);
      input.value = '';
      actualizarLista();
    }
    //muestra los numeros ingresados y la cantidad que tiene el array
    function actualizarLista() {
      document.getElementById('contador').innerText = numeros.length;
      document.getElementById('listaNumeros').innerText = numeros.join(', ');
    }
    //valida que hayan 10 numerosen el array y descarga el archivo.txt
    function descargarTxt() {
      limpiarError();
      
      if (numeros.length < 10) {
        mostrarError("Debe ingresar al menos 10 números antes de descargar.");
        return;
      }

      const blob = new Blob([numeros.join('\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'numeros.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    //filtra los numeros que empiezan y terminan con el mismo numero, saca el porcentaje y los guarda en una variable   
    function leerArchivo(event) {
      const archivo = event.target.files[0];
      if (!archivo) return;

      const lector = new FileReader();
      lector.onload = function(e) {
        const lineas = e.target.result.split('\n').map(l => l.trim()).filter(l => l);
        const numerosArchivo = lineas.map(Number).filter(n => !isNaN(n));

        const validos = numerosArchivo.filter(n => {
          const str = n.toString();
          return str[0] === str[str.length - 1];
        }).sort((a, b) => a - b);

        const total = numerosArchivo.length;
        const porcentaje = total > 0 ? ((validos.length / total) * 100).toFixed(2) : 0;

        filtradosResultado = validos.join('\n');

        const salida = `
          <h5 class="mb-3">Resultados del Filtrado</h5>
          <p><strong>Números válidos:</strong> ${validos.join(', ') || '(ninguno)'}</p>
          <p><strong>Total válidos:</strong> ${validos.length}</p>
          <p><strong>Total inválidos:</strong> ${total - validos.length}</p>
          <p><strong>Porcentaje válidos:</strong> ${porcentaje}%</p>
          <button class="btn btn-info mt-2" onclick="descargarFiltrados()">Descargar filtrados</button>
        `;
        const resultado = document.getElementById('resultadoFiltrado');
        resultado.innerHTML = salida;
        resultado.classList.remove('d-none');
      };
      lector.readAsText(archivo);
    }
    //si hay numeros filtrados, genera un archivo y lo descarga 
    function descargarFiltrados() {
      if (!filtradosResultado) {
        alert('No hay datos para descargar.');
        return;
      }

      const blob = new Blob([filtradosResultado], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'filtrados.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
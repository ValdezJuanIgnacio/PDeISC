const formulario = document.getElementById('mi_formulario');

formulario.addEventListener('submit', function(event) {
  event.preventDefault();

  const datosFormulario = new FormData(formulario);

  fetch('/enviar', {
    method: 'POST',
    body: datosFormulario
  })
  .then(response => {
    if (response.ok) {
      return response.text();
    }
    throw new Error('Error al enviar el formulario');
  })
  .then(data => {
    document.getElementById('resultado').innerHTML = data;
  })
  .catch(error => {
    console.error('Error:', error);
    document.getElementById('resultado').innerHTML = 'Error al enviar el formulario.';
  });
});

//guarda en variables lo puesto en el formulario
document.getElementById('registroForm').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const formData = new FormData(this);
    const datos = {
      nombre: formData.get('nombre'),
      apellido: formData.get('apellido'),
      edad: formData.get('edad'),
      email: formData.get('email'),
      genero: formData.get('genero'),
      pais: formData.get('pais'),
      intereses: formData.getAll('intereses')
    };
  
    mostrarDatos(datos);
  });
  //Muestra los datos del formulario
  function mostrarDatos(datos) {
    const div = document.getElementById('resultado');
    div.innerHTML = `
      <h2>Datos Registrados</h2>
      <p><strong>Nombre:</strong> ${datos.nombre}</p>
      <p><strong>Apellido:</strong> ${datos.apellido}</p>
      <p><strong>Edad:</strong> ${datos.edad}</p>
      <p><strong>Email:</strong> ${datos.email}</p>
      <p><strong>Género:</strong> ${datos.genero}</p>
      <p><strong>País:</strong> ${datos.pais}</p>
      <p><strong>Intereses:</strong> ${datos.intereses.join(', ')}</p>
    `;
  }
  
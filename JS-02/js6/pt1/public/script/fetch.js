fetch('https://jsonplaceholder.typicode.com/users')
.then(response => response.json())
//recibe el array de los usuarios de la api
.then(usuarios => {
  const lista = document.getElementById('usuariosFetch');
  lista.innerHTML = '';
  usuarios.forEach(usuario => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.innerHTML = `
    <strong>${usuario.name}</strong><br>
    <small>${usuario.email}</small>`;
    lista.appendChild(li);
  });
})
//Muestra si hay un error al cargar los datos de la api
.catch(error => {
  console.error('Error con fetch:', error);
  document.getElementById('usuariosFetch').innerHTML = `
  <li class="list-group-item text-danger text-center">Error al cargar datos</li>`;
});
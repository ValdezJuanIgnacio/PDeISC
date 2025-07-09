axios.get('https://jsonplaceholder.typicode.com/users')
//recibe el array de los usuarios de la api
.then(res => {
  const usuarios = res.data;
        const lista = document.getElementById('usuariosAxios');
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
  console.error('Error con axios:', error);
  document.getElementById('usuariosAxios').innerHTML = `
  <li class="list-group-item text-danger text-center">Error al cargar datos</li>`;
});
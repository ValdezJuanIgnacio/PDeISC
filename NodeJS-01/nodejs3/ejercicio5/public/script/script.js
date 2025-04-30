const contenedor = document.getElementById('contenedor');
const orden = ['titulo', 'parrafo', 'lista', 'imagen', 'input'];
const elementos = {
  titulo: null,
  parrafo: null,
  lista: null,
  imagen: null,
  input: null
};

function agregarElemento(tipo) {
  if (elementos[tipo]) {
    alert(`Ya se agregó el elemento ${tipo.toUpperCase()}.`);
    return;
  }

  let html = '';
  switch (tipo) {
    case 'titulo':
      html = `<h2 class="card">Título Insertado</h2>`;
      break;
    case 'parrafo':
      html = `<p class="card">Este es un párrafo generado dinámicamente.</p>`;
      break;
    case 'lista':
      html = `<ul class="card">
                <li>Elemento 1</li>
                <li>Elemento 2</li>
                <li>Elemento 3</li>
              </ul>`;
      break;
    case 'imagen':
      html = `<img class="card" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1200px-Facebook_Logo_%282019%29.png" alt="Imagen de prueba" />`;
      break;
    case 'input':
      html = `<input class="card" type="text" placeholder="Nuevo input agregado" /><br>`;
      break;
  }

  elementos[tipo] = html;
  document.getElementById(`btn-${tipo}`).disabled = true;
  renderizar();
}

function renderizar() {
  contenedor.innerHTML = '';
  orden.forEach(tipo => {
    if (elementos[tipo]) {
      contenedor.innerHTML += elementos[tipo];
    }
  });
}

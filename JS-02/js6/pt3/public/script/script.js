//Gestiona la lista de usuarios
class UsuarioManager {
    constructor() {
        this._usuarios = [];
    }

    set usuarios(data) {
        this._usuarios = data;
    }

    get usuarios() {
        return this._usuarios;
    }

    filtrarPorNombre(nombre) {
        return this._usuarios.filter(usuario =>
          usuario.name.toLowerCase().includes(nombre.toLowerCase())
        );
    }
}

const manager = new UsuarioManager();
const buscador = document.getElementById("buscador");
const listaDiv = document.getElementById("listaUsuarios");
//Agarra los usuarios de la api
fetch("https://jsonplaceholder.typicode.com/users")
.then(res => res.json())
.then(data => {
    manager.usuarios = data;
    mostrarUsuarios(manager.usuarios);
});
//Muestra los usuarios de la api
function mostrarUsuarios(usuarios) {
      listaDiv.innerHTML = "";
      if (usuarios.length === 0) {
        listaDiv.innerHTML = `<p class="text-muted">No se encontraron usuarios.</p>`;
        return;
      }

    usuarios.forEach(user => {
        const col = document.createElement("div");
        col.className = "col-md-6";

        const card = document.createElement("div");
        card.className = "card shadow-sm";

        card.innerHTML = `
          <div class="card-body">
            <h5 class="card-title">${user.name}</h5>
            <p class="card-text">
              <strong>Email:</strong> ${user.email}<br>
              <strong>Teléfono:</strong> ${user.phone}<br>
              <strong>Empresa:</strong> ${user.company.name}
            </p>
          </div>
        `;

        col.appendChild(card);
        listaDiv.appendChild(col);
    });
}
//detecta el nombre escrito y filtra los usuarios
buscador.addEventListener("input", () => {
    const texto = buscador.value.trim();
    const filtrados = manager.filtrarPorNombre(texto);
    mostrarUsuarios(filtrados);
});
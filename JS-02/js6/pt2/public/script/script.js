const form = document.getElementById("formUsuario");
const respuestaDiv = document.getElementById("respuesta");
const listaDiv = document.getElementById("listaUsuarios");

//Carga los usuarios de la api y los muestra
async function cargarUsuarios() {
  try {
    
    const res = await axios.get("http://localhost:3000/api/alumnos");
    listaDiv.innerHTML = ""; 

    res.data.forEach(user => {
      listaDiv.innerHTML += `
        <div class="col-md-6">
          <div class="card mb-3 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${user.name}</h5>
              <p class="card-text">
                <strong>Email:</strong> ${user.email}<br>
                <strong>ID:</strong> ${user.id}
              </p>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) {
    
    listaDiv.innerHTML = `<p class="text-danger"> Error al cargar usuarios</p>`;
    console.error(err);
  }
}

//Carga el usuario ingresado en el formulario 
form.addEventListener("submit", async (e) => {
  e.preventDefault(); 

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;

  try {
    
    const res = await axios.post("http://localhost:3000/api/alumnos", {
      name: nombre,
      email: email
    });

    respuestaDiv.classList.remove("d-none", "alert-danger", "alert-info");
    respuestaDiv.classList.add("alert-success");
    respuestaDiv.textContent = `Usuario creado con ID: ${res.data.id}`;

    form.reset();

    cargarUsuarios();

    setTimeout(() => {
      respuestaDiv.classList.add("d-none");
    }, 2000);

  } catch (err) {
    
    respuestaDiv.classList.remove("d-none", "alert-success", "alert-info");
    respuestaDiv.classList.add("alert-danger");
    respuestaDiv.textContent = "Error al crear el usuario";
    console.error(err);
  }
});

cargarUsuarios();

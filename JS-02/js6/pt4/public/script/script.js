const API_URL = "http://localhost:3000/api/alumnos";
//Mostrar los alumnos de la api
async function cargarAlumnos() {
    try {
        const res = await axios.get(API_URL);
        const lista = document.getElementById("alumnoList");
        lista.innerHTML = "";

        res.data.forEach(alumno => {
          lista.innerHTML += `
            <div class="col-md-6">
              <div class="card mb-3 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">${alumno.name}</h5>
                  <p class="card-text">
                    <strong>Edad:</strong> ${alumno.age}<br>
                    <strong>ID:</strong> ${alumno.id}
                  </p>
                  <button class="btn btn-danger btn-sm" onclick="eliminarAlumno(${alumno.id})">Eliminar</button>
                </div>
              </div>
            </div>`;
        });
    } catch (err) {
        document.getElementById("alumnoList").innerHTML = "<p class='text-danger'>Error al cargar alumnos</p>";
      }
}
//Eliminar alumnoi por id
async function eliminarAlumno(id) {
    if (!confirm("¿Seguro que querés eliminar este alumno?")) return;
    try {
        await axios.delete(`${API_URL}/${id}`);
        cargarAlumnos();
    } catch (err) {
        alert("No se pudo eliminar el alumno.");
    }
}
//Agrega un alumno enviado desde el formulario
document.getElementById("alumnoForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const age = document.getElementById("age").value;

    if (!name || !age) return;

    try {
        const res = await axios.post(API_URL, {
            name,
            age
        });

        const mensaje = document.getElementById("message");
        mensaje.innerHTML = `<div class="alert alert-success">Alumno creado con ID: ${res.data.id}</div>`;
        this.reset();
        cargarAlumnos();

        setTimeout(() => mensaje.innerHTML = "", 2000);
    } catch (err) {
        document.getElementById("message").innerHTML = "<div class='alert alert-danger'>Error al crear el alumno</div>";
    }
});

cargarAlumnos();
import { useState } from "react";
//guarda nombre y muestra un mensaje
function Formulario() {
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  //validaciones, si esta bien genera el mensaje
  const manejarEnvio = (e) => {
    e.preventDefault();

    if (nombre.trim() === "") {
      setError("El nombre no puede estar vacío.");
      setMensaje("");
      return;
    }

    if (nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 letras.");
      setMensaje("");
      return;
    }

    setMensaje(`¡Bienvenido/a, ${nombre}!`);
    setError("");
    setNombre("");
  };
  //genera el formulario
  return (
    <div className="container mt-4">
      <h2>Formulario de Bienvenida</h2>

      <form onSubmit={manejarEnvio}>
        <div className="mb-3">
          <label htmlFor="nombre" className="form-label">
            Nombre:
          </label>
          <input
            type="text"
            id="nombre"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingresá tu nombre"
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <button type="submit" className="btn btn-primary">
          Enviar
        </button>
      </form>
    </div>
  );
}

export default Formulario;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { capitalizarTexto } from "../components/Nombre";

function EditarUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [errores, setErrores] = useState({});

  useEffect(() => {
    const fetchUsuario = async () => {
      const res = await axios.get(`http://localhost:3001/usuarios/${id}`);
      setNombre(res.data.Nombre);
      setApellido(res.data.Apellido);
      setEmail(res.data.Email);
    };
    fetchUsuario();
  }, [id]);

  const validar = () => {
    const nuevosErrores = {};
    if (!nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio";
    else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre))
      nuevosErrores.nombre = "El nombre solo puede contener letras y espacios";

    if (!apellido.trim()) nuevosErrores.apellido = "El apellido es obligatorio";
    else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(apellido))
      nuevosErrores.apellido =
        "El apellido solo puede contener letras y espacios";

    if (!email.trim()) nuevosErrores.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email))
      nuevosErrores.email = "El email no es válido";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    await axios.put(`http://localhost:3001/usuarios/${id}`, {
      Nombre: capitalizarTexto(nombre),
      Apellido: capitalizarTexto(apellido),
      Email: email.toLowerCase(),
    });

    navigate("/");
  };

  return (
    <div
      className="container"
      style={{ minHeight: "100vh", paddingTop: "100px" }}
    >
      <div className="form-center">
        <div className="card p-5 shadow-lg rounded-4">
          <h2 className="mb-5 text-center text-primary">Editar Usuario</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label className="form-label fw-semibold">Nombre</label>
              <input
                type="text"
                className={`form-control form-control-lg ${
                  errores.nombre ? "is-invalid" : ""
                }`}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
              {errores.nombre && (
                <div className="invalid-feedback">{errores.nombre}</div>
              )}
            </div>
            <div className="mb-5">
              <label className="form-label fw-semibold">Apellido</label>
              <input
                type="text"
                className={`form-control form-control-lg ${
                  errores.apellido ? "is-invalid" : ""
                }`}
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
              />
              {errores.apellido && (
                <div className="invalid-feedback">{errores.apellido}</div>
              )}
            </div>
            <div className="mb-5">
              <label className="form-label fw-semibold">Correo</label>
              <input
                type="email"
                className={`form-control form-control-lg ${
                  errores.email ? "is-invalid" : ""
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errores.email && (
                <div className="invalid-feedback">{errores.email}</div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fs-5 rounded-3"
            >
              Actualizar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditarUsuario;

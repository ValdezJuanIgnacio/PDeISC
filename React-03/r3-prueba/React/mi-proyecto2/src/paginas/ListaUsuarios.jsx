import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    const res = await axios.get("http://localhost:3001/usuarios");
    setUsuarios(res.data);
  };

  const confirmarEliminar = async () => {
    if (usuarioAEliminar) {
      await axios.delete(
        `http://localhost:3001/usuarios/${usuarioAEliminar.Id}`
      );
      setUsuarioAEliminar(null);
      fetchUsuarios();
    }
  };

  return (
    <div
      className="container"
      style={{ minHeight: "100vh", paddingTop: "100px" }}
    >
      <div className="form-center">
        <h2 className="mb-4 text-primary text-center">Listado de Usuarios</h2>

        <div className="shadow rounded">
          <table
            className="table table-hover align-middle w-100"
            style={{ tableLayout: "auto" }}
          >
            <thead className="table-primary">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.Id}>
                  <td>{u.Id}</td>
                  <td className="text-wrap">{u.Nombre}</td>
                  <td className="text-wrap">{u.Apellido}</td>
                  <td className="text-wrap">{u.Email}</td>
                  <td>
                    <div className="d-flex flex-wrap justify-content-center gap-1">
                      <Link
                        to={`/editar/${u.Id}`}
                        className="btn btn-warning btn-sm"
                      >
                        Editar
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setUsuarioAEliminar(u)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuarioAEliminar && (
          <div className="alert alert-danger d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
            <span>
              ¿Seguro que deseas eliminar a{" "}
              <b>
                {usuarioAEliminar.Nombre} {usuarioAEliminar.Apellido}
              </b>
              ?
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setUsuarioAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={confirmarEliminar}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaUsuarios;

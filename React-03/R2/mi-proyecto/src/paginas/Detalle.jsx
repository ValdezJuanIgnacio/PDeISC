import React, { useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { Card, Button, Alert } from "react-bootstrap";

function Detalle({ tareas, onEliminar }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const tarea = tareas.find((t) => t.id === parseInt(id));

  if (!tarea) {
    return <Navigate to="/" replace />;
  }

  const manejarEliminar = () => {
    if (tarea.estado === "completa") {
      navigate("/");
      onEliminar(tarea.id);
    } else {
      setMensaje({
        tipo: "warning",
        texto: "Solo puedes eliminar tareas completadas.",
      });
    }
    setConfirmarEliminar(false);
  };

  return (
    <div>
      {}
      {mensaje && (
        <Alert
          variant={mensaje.tipo}
          onClose={() => setMensaje(null)}
          dismissible
          className="mb-3"
        >
          {mensaje.texto}
        </Alert>
      )}

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>{tarea.titulo}</Card.Title>
          <Card.Text>
            <strong>Descripción:</strong> {tarea.descripcion}
          </Card.Text>
          <Card.Text>
            {tarea.fechaCreacion && (
              <span>
                <strong>Fecha de creación:</strong> {tarea.fechaCreacion}
              </span>
            )}
          </Card.Text>
          <Card.Text>
            <strong>Estado:</strong>{" "}
            {tarea.estado === "completa" ? "Completa" : "Incompleta"}
          </Card.Text>

          <div className="d-flex flex-column align-items-start">
            <div className="mb-2">
              <Link to={`/editar/${tarea.id}`} className="btn btn-warning me-2">
                Modificar
              </Link>

              {tarea.estado === "completa" && !confirmarEliminar && (
                <Button
                  variant="danger"
                  onClick={() => setConfirmarEliminar(true)}
                >
                  Eliminar
                </Button>
              )}
            </div>

            {}
            {confirmarEliminar && (
              <div className="confirmacion p-3 mb-2">
                <p>¿Seguro que quieres eliminar esta tarea?</p>
                <Button
                  variant="danger"
                  size="sm"
                  className="me-2"
                  onClick={manejarEliminar}
                >
                  Confirmar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmarEliminar(false)}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Detalle;

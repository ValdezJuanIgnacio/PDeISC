import React from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

function Detalle({ tareas, onEliminar }) {
  const { id } = useParams();
  const tarea = tareas.find((t) => t.id === parseInt(id));

  if (!tarea) {
    return <Navigate to="/" replace />;
  }

  const manejarEliminar = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta tarea?")) {
      onEliminar(tarea.id);
    }
  };

  return (
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

        <div className="d-flex justify-content-end">
          <Link to={`/editar/${tarea.id}`} className="btn btn-warning me-2">
            Modificar
          </Link>
          {/* Botón de eliminar, solo si la tarea está completa */}
          {tarea.estado === "completa" && (
            <Button variant="danger" onClick={manejarEliminar}>
              Eliminar
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default Detalle;

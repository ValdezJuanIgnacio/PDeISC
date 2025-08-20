import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";

function Edicion({ tareas, onModificar }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const tareaOriginal = tareas.find((t) => t.id === parseInt(id));

  if (!tareaOriginal) {
    return <Navigate to="/" replace />;
  }

  const [titulo, setTitulo] = useState(tareaOriginal.titulo);
  const [descripcion, setDescripcion] = useState(tareaOriginal.descripcion);
  const [estado, setEstado] = useState(tareaOriginal.estado);
  const [error, setError] = useState("");

  const manejarSubmit = (e) => {
    e.preventDefault();

    setError("");
    if (!titulo.trim() || titulo.trim() === "000") {
      setError('El título no puede estar vacío o ser "000".');
      return;
    }
    if (/^\d+$/.test(titulo.trim())) {
      setError("El título no puede ser solo números.");
      return;
    }
    if (!descripcion.trim()) {
      setError("La descripción no puede estar vacía.");
      return;
    }

    const tareaModificada = {
      ...tareaOriginal,
      titulo,
      descripcion,
      estado,
    };

    onModificar(tareaModificada);
    navigate("/");
  };

  return (
    <div>
      <h1>Modificar tarea</h1>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={manejarSubmit}>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Marcar como completa"
            checked={estado === "completa"}
            onChange={(e) =>
              setEstado(e.target.checked ? "completa" : "incompleta")
            }
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Guardar Cambios
        </Button>
      </Form>
    </div>
  );
}

export default Edicion;

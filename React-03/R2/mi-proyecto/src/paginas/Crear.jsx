import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";

function Crear({ onCrearTarea }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("incompleta");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const manejarSubmit = (e) => {
    e.preventDefault();

    setError("");

    if (!titulo.trim()) {
      setError("El título no puede estar vacío.");
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
    if (/^\d+$/.test(descripcion.trim())) {
      setError("La descripción no puede ser solo numeros.");
      return;
    }
    const fechaCreacion = new Date().toLocaleString();
    onCrearTarea({ titulo, descripcion, estado, fechaCreacion });
    navigate("/");
  };

  return (
    <div>
      <h1>Crear nueva tarea</h1>
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
        <Button variant="success" type="submit">
          Guardar
        </Button>
      </Form>
    </div>
  );
}

export default Crear;

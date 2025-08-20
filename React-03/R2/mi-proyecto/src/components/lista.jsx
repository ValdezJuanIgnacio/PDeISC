import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";

function Lista({ tarea }) {
  const descripcionCorta = tarea.descripcion.split(" ").slice(0, 3).join(" ");

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>{tarea.titulo}</Card.Title>
        {}
        <Card.Text>
          {tarea.descripcion.split(" ").length > 3
            ? `${descripcionCorta}...`
            : descripcionCorta}
        </Card.Text>
        <Link to={`/detalle/${tarea.id}`} className="btn btn-primary">
          Ver Detalle
        </Link>
      </Card.Body>
    </Card>
  );
}

export default Lista;

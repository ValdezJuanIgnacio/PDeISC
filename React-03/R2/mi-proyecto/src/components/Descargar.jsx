import React from "react";
import { Button } from "react-bootstrap";

function Descargar({ tareas }) {
  const manejarDescarga = () => {
    const blob = new Blob([JSON.stringify(tareas, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "tareas.json";
    enlace.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline-light" onClick={manejarDescarga}>
      Descargar tareas
    </Button>
  );
}

export default Descargar;

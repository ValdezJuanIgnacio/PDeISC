import React from "react";
import Lista from "../components/Lista.jsx";

function Inicio({ tareas }) {
  return (
    <div>
      <h1>Lista de Tareas</h1>
      {tareas.length > 0 ? (
        tareas.map((t) => <Lista key={t.id} tarea={t} />)
      ) : (
        <p>No hay tareas para mostrar. Crea una nueva.</p>
      )}
    </div>
  );
}

export default Inicio;

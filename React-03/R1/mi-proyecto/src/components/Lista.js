import { useState } from "react";
//lista, se agreagan tareas y se pueden marcar
function Lista() {
  const [tareas, setTareas] = useState([]);
  const [nuevaTarea, setNuevaTarea] = useState("");
  //agrega la tarea
  const agregarTarea = () => {
    if (nuevaTarea.trim() === "") return;

    const tarea = {
      id: Date.now(),
      texto: nuevaTarea,
      completada: false,
    };

    setTareas([...tareas, tarea]);
    setNuevaTarea("");
  };

  const manejarEnter = (e) => {
    if (e.key === "Enter") {
      agregarTarea();
    }
  };

  const marcarComoCompletada = (id) => {
    const tareasActualizadas = tareas.map((tarea) =>
      tarea.id === id ? { ...tarea, completada: !tarea.completada } : tarea
    );
    setTareas(tareasActualizadas);
  };
  //genera la lista
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Lista de Tareas</h2>

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          value={nuevaTarea}
          onChange={(e) => setNuevaTarea(e.target.value)}
          onKeyDown={manejarEnter}
          placeholder="Escribí una nueva tarea y presioná Enter"
        />
        <button className="btn btn-primary" onClick={agregarTarea}>
          Agregar
        </button>
      </div>

      <ul className="list-group">
        {tareas.map((tarea) => (
          <li
            key={tarea.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              className={
                tarea.completada
                  ? "text-decoration-line-through text-muted"
                  : ""
              }
            >
              {tarea.texto}
            </span>
            <button
              className={`btn btn-sm ${
                tarea.completada ? "btn-secondary" : "btn-success"
              }`}
              onClick={() => marcarComoCompletada(tarea.id)}
            >
              {tarea.completada ? "Desmarcar" : "Completar"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Lista;

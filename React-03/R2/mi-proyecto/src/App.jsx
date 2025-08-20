import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import Inicio from "./paginas/Inicio.jsx";
import Detalle from "./paginas/Detalle.jsx";
import Crear from "./paginas/Crear.jsx";
import Edicion from "./components/Edicion.jsx";
import Descargar from "./components/Descargar.jsx";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [tareas, setTareas] = useState([
    {
      id: 1,
      titulo: "Comprar pan",
      descripcion: "Ir a la panadería a las 8am",
      estado: "completa",
      fechaCreacion: new Date().toLocaleString(),
    },
    {
      id: 2,
      titulo: "Hacer ejercicio",
      descripcion: "Correr 30 minutos",
      estado: "incompleta",
      fechaCreacion: new Date().toLocaleString(),
    },
  ]);

  const crearTarea = (nuevaTarea) => {
    const id = tareas.length > 0 ? Math.max(...tareas.map((t) => t.id)) + 1 : 1;
    setTareas([...tareas, { id, ...nuevaTarea }]);
  };

  const modificarTarea = (tareaModificada) => {
    setTareas(
      tareas.map((t) => (t.id === tareaModificada.id ? tareaModificada : t))
    );
  };

  const eliminarTarea = (id) => {
    // Eliminación solo si la tarea está completa
    const tareaAEliminar = tareas.find((t) => t.id === id);
    if (tareaAEliminar && tareaAEliminar.estado === "completa") {
      setTareas(tareas.filter((t) => t.id !== id));
    }
    // No se muestran alertas ni mensajes aquí
  };

  return (
    <Router>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/crear">
              Nueva Tarea
            </Nav.Link>
          </Nav>

          <Descargar tareas={tareas} />
        </Container>
      </Navbar>

      <Container className="mt-4">
        <Routes>
          <Route path="/" element={<Inicio tareas={tareas} />} />
          <Route
            path="/detalle/:id"
            element={<Detalle tareas={tareas} onEliminar={eliminarTarea} />}
          />
          <Route path="/crear" element={<Crear onCrearTarea={crearTarea} />} />
          <Route
            path="/editar/:id"
            element={<Edicion tareas={tareas} onModificar={modificarTarea} />}
          />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;

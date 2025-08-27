import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import ListaUsuarios from "./paginas/ListaUsuarios";
import AgregarUsuario from "./paginas/AgregarUsuario";
import EditarUsuario from "./paginas/EditarUsuario";

function App() {
  const [usuarios, setUsuarios] = useState([]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ListaUsuarios usuarios={usuarios} setUsuarios={setUsuarios} />
          }
        />
        <Route
          path="/agregar"
          element={
            <AgregarUsuario usuarios={usuarios} setUsuarios={setUsuarios} />
          }
        />
        <Route
          path="/editar/:id"
          element={
            <EditarUsuario usuarios={usuarios} setUsuarios={setUsuarios} />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

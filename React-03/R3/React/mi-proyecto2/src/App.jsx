import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/usuarios")
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Usuarios</h1>
      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>
            {u.Nombre} {u.Apellido} - {u.Email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

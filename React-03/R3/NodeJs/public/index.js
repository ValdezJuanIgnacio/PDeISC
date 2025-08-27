// index.js
import express from "express";
import cors from "cors";
import { connectDB } from "./connectbbdd.js";

const app = express();
app.use(cors()); // Permite que React (otro puerto) acceda al backend
app.use(express.json()); // Permite enviar/recibir JSON

// ✅ Ruta GET: obtener todos los usuarios
app.get("/usuarios", async (req, res) => {
  const db = await connectDB();
  if (!db)
    return res.status(500).json({ error: "Error en la conexión a la DB" });

  try {
    const [rows] = await db.execute("SELECT * FROM usuario");
    res.json(rows); // 👉 devuelve los usuarios como JSON
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await db.end();
  }
});

// ✅ Ruta POST: agregar un nuevo usuario
app.post("/usuarios", async (req, res) => {
  const { nombre, apellido, email } = req.body;
  const db = await connectDB();
  if (!db)
    return res.status(500).json({ error: "Error en la conexión a la DB" });

  try {
    const [result] = await db.execute(
      "INSERT INTO usuario (nombre, apellido, email) VALUES (?, ?, ?)",
      [nombre, apellido, email]
    );
    res.json({ id: result.insertId, nombre, apellido, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await db.end();
  }
});

// ✅ Ruta PUT: actualizar un usuario
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, email } = req.body;
  const db = await connectDB();
  if (!db)
    return res.status(500).json({ error: "Error en la conexión a la DB" });

  try {
    await db.execute(
      "UPDATE usuario SET nombre=?, apellido=?, email=? WHERE id=?",
      [nombre, apellido, email, id]
    );
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await db.end();
  }
});

// ✅ Ruta DELETE: eliminar un usuario
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const db = await connectDB();
  if (!db)
    return res.status(500).json({ error: "Error en la conexión a la DB" });

  try {
    await db.execute("DELETE FROM usuario WHERE id=?", [id]);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await db.end();
  }
});

// ✅ Iniciar servidor
app.listen(3001, () => {
  console.log("Servidor Node corriendo en http://localhost:3001");
});

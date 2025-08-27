// index.js
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Conexión a la base de datos "usuario"
const db = await mysql.createConnection({
  host: "localhost",
  user: "root", // ⚠️ cambiar si tu usuario es distinto
  password: "", // ⚠️ poner la contraseña real si tenés
  database: "usuario",
});

// ✅ Listado de usuarios
app.get("/usuarios", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM usuario");
  res.json(rows);
});

// ✅ Consulta por ID
app.get("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.query("SELECT * FROM usuario WHERE Id = ?", [id]);
  if (rows.length === 0)
    return res.status(404).json({ error: "Usuario no encontrado" });
  res.json(rows[0]);
});

// ✅ Alta
app.post("/usuarios", async (req, res) => {
  const { Nombre, Apellido, Email } = req.body;
  await db.query(
    "INSERT INTO usuario (Nombre, Apellido, Email) VALUES (?, ?, ?)",
    [Nombre, Apellido, Email]
  );
  res.json({ message: "Usuario agregado" });
});

// ✅ Modificación
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { Nombre, Apellido, Email } = req.body;
  await db.query(
    "UPDATE usuario SET Nombre = ?, Apellido = ?, Email = ? WHERE Id = ?",
    [Nombre, Apellido, Email, id]
  );
  res.json({ message: "Usuario actualizado" });
});

// ✅ Baja
app.delete("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM usuario WHERE Id = ?", [id]);
  res.json({ message: "Usuario eliminado" });
});

// Servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});

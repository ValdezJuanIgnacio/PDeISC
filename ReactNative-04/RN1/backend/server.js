const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log("======================");
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("======================");
  next();
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Registro de usuario
app.post("/api/register", async (req, res) => {
  try {
    const { name, password } = req.body;

    console.log("Intentando registrar usuario:", name);

    // Validaciones
    if (!name || !password) {
      console.log("Validación fallida: campos vacíos");
      return res.status(400).json({
        success: false,
        message: "Nombre y contraseña son requeridos",
      });
    }

    // Validar que el nombre no sea solo números
    if (/^\d+$/.test(name)) {
      console.log("Validación fallida: nombre solo números");
      return res.status(400).json({
        success: false,
        message: "El nombre no puede contener solo números",
      });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 4) {
      console.log("Validación fallida: contraseña muy corta");
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 4 caracteres",
      });
    }

    console.log("Verificando si usuario existe...");
    // Verificar si el usuario ya existe - CAMBIADO A .execute()
    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE name = ?",
      [name]
    );

    console.log(
      "Resultado búsqueda:",
      existingUser.length,
      "usuarios encontrados"
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe",
      });
    }

    console.log("Encriptando contraseña...");
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Insertando usuario en la base de datos...");
    // Insertar usuario - CAMBIADO A .execute()
    await db.execute("INSERT INTO users (name, password) VALUES (?, ?)", [
      name,
      hashedPassword,
    ]);

    console.log("Usuario registrado exitosamente:", name);

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Login de usuario
app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    console.log("Intentando login:", name);

    // Validaciones
    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre y contraseña son requeridos",
      });
    }

    // Buscar usuario - CAMBIADO A .execute()
    const [users] = await db.execute("SELECT * FROM users WHERE name = ?", [
      name,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    const user = users[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    console.log("Login exitoso:", name);

    // Login exitoso
    res.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

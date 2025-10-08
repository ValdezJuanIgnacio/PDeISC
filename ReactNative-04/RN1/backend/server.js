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

// Health check endpoint (para verificar que el servidor funciona)
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// Probar conexión a base de datos
app.get("/api/test-db", async (req, res) => {
  try {
    const [result] = await db.execute("SELECT 1 + 1 AS result");
    res.json({ success: true, database: "conectada", result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      database: "desconectada",
      error: error.message 
    });
  }
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
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Insertando usuario en la base de datos...");
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

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    console.log("Login exitoso:", name);

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

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor con mejor manejo de errores
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Escuchando en todas las interfaces de red`);
  console.log(`Endpoints disponibles:`);
  console.log(`  - GET  http://localhost:${PORT}/health`);
  console.log(`  - GET  http://localhost:${PORT}/api/test-db`);
  console.log(`  - POST http://localhost:${PORT}/api/register`);
  console.log(`  - POST http://localhost:${PORT}/api/login`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`El puerto ${PORT} ya está en uso`);
    console.error(`Intenta con otro puerto o cierra la aplicación que lo está usando`);
  } else {
    console.error('Error al iniciar el servidor:', err);
  }
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});
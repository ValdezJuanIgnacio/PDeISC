const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Registro de usuario
app.post('/api/register', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validaciones
    if (!name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y contraseña son requeridos' 
      });
    }

    // Validar que el nombre no sea solo números
    if (/^\d+$/.test(name)) {
      return res.status(400).json({ 
        success: false, 
        message: 'El nombre no puede contener solo números' 
      });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 4) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña debe tener al menos 4 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE name = ?',
      [name]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario ya existe' 
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    await db.query(
      'INSERT INTO users (name, password) VALUES (?, ?)',
      [name, hashedPassword]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Usuario registrado exitosamente' 
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// Login de usuario
app.post('/api/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    // Validaciones
    if (!name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nombre y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const [users] = await db.query(
      'SELECT * FROM users WHERE name = ?',
      [name]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    const user = users[0];

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario o contraseña incorrectos' 
      });
    }

    // Login exitoso
    res.json({ 
      success: true, 
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error en el servidor' 
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
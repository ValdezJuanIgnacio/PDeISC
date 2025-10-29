const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpeta para uploads si no existe
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPEG, PNG) o PDFs"));
    }
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Middleware de logging
app.use((req, res, next) => {
  console.log("======================");
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  if (req.method !== "GET") console.log("Body:", req.body);
  console.log("======================");
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================
// AUTENTICACIÓN TRADICIONAL
// ============================================

// Registro tradicional
app.post("/api/register", async (req, res) => {
  try {
    const { name, password, email } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre y contraseña son requeridos",
      });
    }

    if (/^\d+$/.test(name)) {
      return res.status(400).json({
        success: false,
        message: "El nombre no puede contener solo números",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 4 caracteres",
      });
    }

    const [existingUser] = await db.execute(
      "SELECT * FROM users WHERE name = ? OR email = ?",
      [name, email || null]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El usuario ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, password, email, auth_provider) VALUES (?, ?, ?, ?)",
      [name, hashedPassword, email || null, "local"]
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      user: {
        id: result.insertId,
        name: name,
        email: email || null,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Login tradicional
app.post("/api/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre y contraseña son requeridos",
      });
    }

    const [users] = await db.execute(
      "SELECT * FROM users WHERE name = ? AND auth_provider = 'local'",
      [name]
    );

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

    // Actualizar último login
    await db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    res.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profile_photo,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        authProvider: user.auth_provider,
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

// ============================================
// AUTENTICACIÓN OAUTH
// ============================================

// Login/Registro con OAuth (Google, Facebook, Apple)
// Login/Registro con OAuth (Google, Facebook, Apple)
app.post("/api/oauth-login", async (req, res) => {
  try {
    const { provider, providerId, email, name, profilePhoto } = req.body;

    console.log("🔐 OAuth Login Request:", { provider, email, name });

    // Validación de datos
    if (!provider || !providerId || !email || !name) {
      return res.status(400).json({
        success: false,
        message: "Datos de proveedor incompletos",
      });
    }

    // Validar proveedor
    const validProviders = ["google", "facebook", "apple"];
    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        success: false,
        message: "Proveedor OAuth no válido",
      });
    }

    // Buscar usuario existente con este proveedor
    const [existingUsers] = await db.execute(
      "SELECT * FROM users WHERE auth_provider = ? AND provider_id = ?",
      [provider, providerId]
    );

    let user;

    if (existingUsers.length > 0) {
      // Usuario existe, actualizar último login y foto (si cambió)
      user = existingUsers[0];

      console.log("✅ Usuario OAuth existente encontrado:", user.id);

      await db.execute(
        "UPDATE users SET last_login = NOW(), profile_photo = COALESCE(?, profile_photo) WHERE id = ?",
        [profilePhoto, user.id]
      );

      // Actualizar foto en la respuesta
      user.profile_photo = profilePhoto || user.profile_photo;
    } else {
      console.log("📝 Creando nuevo usuario OAuth");

      // Verificar si el email ya existe con otro método
      const [emailCheck] = await db.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Este email ya está registrado con otro método de autenticación",
        });
      }

      // Crear nuevo usuario
      const [result] = await db.execute(
        `INSERT INTO users (
          name, 
          email, 
          auth_provider, 
          provider_id, 
          profile_photo,
          role,
          created_at,
          last_login
        ) VALUES (?, ?, ?, ?, ?, 'user', NOW(), NOW())`,
        [name, email, provider, providerId, profilePhoto || null]
      );

      console.log("✅ Usuario OAuth creado:", result.insertId);

      user = {
        id: result.insertId,
        name: name,
        email: email,
        auth_provider: provider,
        provider_id: providerId,
        profile_photo: profilePhoto,
        role: "user",
      };
    }

    res.json({
      success: true,
      message: "Login exitoso con " + provider,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profile_photo,
        phone: user.phone || null,
        address: user.address || null,
        bio: user.bio || null,
        authProvider: provider,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("❌ Error en OAuth login:", error);

    // Error de duplicado por constraint único
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Esta cuenta OAuth ya está vinculada a otro usuario",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Vincular cuenta OAuth a usuario existente (NUEVO)
app.post("/api/oauth-link", async (req, res) => {
  try {
    const { userId, provider, providerId, email } = req.body;

    console.log("🔗 Vinculando cuenta OAuth:", { userId, provider });

    // Verificar que el usuario existe
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar que la cuenta OAuth no esté en uso
    const [oauthCheck] = await db.execute(
      "SELECT * FROM users WHERE auth_provider = ? AND provider_id = ?",
      [provider, providerId]
    );

    if (oauthCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Esta cuenta OAuth ya está vinculada a otro usuario",
      });
    }

    // Vincular la cuenta
    await db.execute(
      "UPDATE users SET auth_provider = ?, provider_id = ?, email = COALESCE(email, ?) WHERE id = ?",
      [provider, providerId, email, userId]
    );

    console.log("✅ Cuenta OAuth vinculada correctamente");

    res.json({
      success: true,
      message: "Cuenta OAuth vinculada correctamente",
    });
  } catch (error) {
    console.error("❌ Error vinculando OAuth:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// ============================================
// PERFIL DE USUARIO
// ============================================

// Obtener perfil de usuario
app.get("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const user = users[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profile_photo,
        phone: user.phone,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        bio: user.bio,
        dateOfBirth: user.date_of_birth,
        authProvider: user.auth_provider,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Actualizar perfil de usuario
app.put("/api/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      email,
      phone,
      address,
      latitude,
      longitude,
      bio,
      dateOfBirth,
    } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push("address = ?");
      values.push(address);
    }
    if (latitude !== undefined) {
      updates.push("latitude = ?");
      values.push(latitude);
    }
    if (longitude !== undefined) {
      updates.push("longitude = ?");
      values.push(longitude);
    }
    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(bio);
    }
    if (dateOfBirth !== undefined) {
      updates.push("date_of_birth = ?");
      values.push(dateOfBirth);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay datos para actualizar",
      });
    }

    values.push(userId);

    await db.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Obtener usuario actualizado
    const [users] = await db.execute("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    const user = users[0];

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profile_photo,
        phone: user.phone,
        address: user.address,
        latitude: user.latitude,
        longitude: user.longitude,
        bio: user.bio,
        dateOfBirth: user.date_of_birth,
      },
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Subir foto de perfil
app.post(
  "/api/profile/:userId/photo",
  upload.single("photo"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionó ninguna imagen",
        });
      }

      const photoPath = `/uploads/${req.file.filename}`;

      // Eliminar foto anterior si existe
      const [users] = await db.execute(
        "SELECT profile_photo FROM users WHERE id = ?",
        [userId]
      );

      if (users.length > 0 && users[0].profile_photo) {
        const oldPhotoPath = path.join(
          __dirname,
          users[0].profile_photo.replace(/^\//, "")
        );
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }

      await db.execute("UPDATE users SET profile_photo = ? WHERE id = ?", [
        photoPath,
        userId,
      ]);

      res.json({
        success: true,
        message: "Foto de perfil actualizada",
        profilePhoto: photoPath,
      });
    } catch (error) {
      console.error("Error subiendo foto:", error);
      res.status(500).json({
        success: false,
        message: "Error en el servidor: " + error.message,
      });
    }
  }
);

// Subir documento
app.post(
  "/api/profile/:userId/document",
  upload.single("document"),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { documentType } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionó ningún documento",
        });
      }

      const documentPath = `/uploads/${req.file.filename}`;

      await db.execute(
        "INSERT INTO user_documents (user_id, document_type, document_path) VALUES (?, ?, ?)",
        [userId, documentType, documentPath]
      );

      res.json({
        success: true,
        message: "Documento subido exitosamente",
        documentPath: documentPath,
      });
    } catch (error) {
      console.error("Error subiendo documento:", error);
      res.status(500).json({
        success: false,
        message: "Error en el servidor: " + error.message,
      });
    }
  }
);

// Obtener documentos de usuario
app.get("/api/profile/:userId/documents", async (req, res) => {
  try {
    const { userId } = req.params;

    const [documents] = await db.execute(
      "SELECT * FROM user_documents WHERE user_id = ? ORDER BY uploaded_at DESC",
      [userId]
    );

    res.json({
      success: true,
      documents: documents,
    });
  } catch (error) {
    console.error("Error obteniendo documentos:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// ============================================
// ADMINISTRACIÓN (Solo Admin)
// ============================================

// Login de admin
app.post("/api/admin/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Nombre y contraseña son requeridos",
      });
    }

    const [users] = await db.execute(
      "SELECT * FROM users WHERE name = ? AND role = 'admin'",
      [name]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales de administrador incorrectas",
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales de administrador incorrectas",
      });
    }

    await db.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    res.json({
      success: true,
      message: "Login de administrador exitoso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error en admin login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Obtener todos los usuarios (solo admin)
app.get("/api/admin/users", async (req, res) => {
  try {
    const { adminId } = req.query;

    // Verificar que quien pide es admin
    const [adminCheck] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [adminId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    const [users] = await db.execute(
      `SELECT id, name, email, phone, role, auth_provider, created_at, last_login 
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      users: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Buscar usuarios (solo admin)
app.get("/api/admin/users/search", async (req, res) => {
  try {
    const { adminId, query } = req.query;

    // Verificar que quien pide es admin
    const [adminCheck] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [adminId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    const searchQuery = `%${query}%`;
    const [users] = await db.execute(
      `SELECT id, name, email, phone, role, auth_provider, created_at, last_login 
       FROM users 
       WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?
       ORDER BY created_at DESC`,
      [searchQuery, searchQuery, searchQuery]
    );

    res.json({
      success: true,
      users: users,
      total: users.length,
    });
  } catch (error) {
    console.error("Error buscando usuarios:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Cambiar rol de usuario (solo admin)
app.put("/api/admin/users/:userId/role", async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminId, newRole } = req.body;

    // Verificar que quien pide es admin
    const [adminCheck] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [adminId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    // No permitir cambiar el rol del propio admin
    if (parseInt(userId) === parseInt(adminId)) {
      return res.status(400).json({
        success: false,
        message: "No puedes cambiar tu propio rol",
      });
    }

    // Validar rol
    if (!["admin", "user"].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: "Rol inválido",
      });
    }

    // Cambiar rol
    await db.execute("UPDATE users SET role = ? WHERE id = ?", [
      newRole,
      userId,
    ]);

    // Registrar acción en logs
    await db.execute(
      "INSERT INTO admin_logs (admin_id, action, target_user_id, details) VALUES (?, ?, ?, ?)",
      [adminId, "change_role", userId, `Cambió rol a: ${newRole}`]
    );

    res.json({
      success: true,
      message: "Rol actualizado correctamente",
    });
  } catch (error) {
    console.error("Error cambiando rol:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Eliminar usuario (solo admin)
app.delete("/api/admin/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminId } = req.body;

    // Verificar que quien pide es admin
    const [adminCheck] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [adminId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    // No permitir eliminar al propio admin
    if (parseInt(userId) === parseInt(adminId)) {
      return res.status(400).json({
        success: false,
        message: "No puedes eliminarte a ti mismo",
      });
    }

    // Verificar que el usuario a eliminar no sea admin
    const [userCheck] = await db.execute(
      "SELECT role, name FROM users WHERE id = ?",
      [userId]
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    if (userCheck[0].role === "admin") {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar a otro administrador",
      });
    }

    // Eliminar usuario
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);

    // Registrar acción en logs
    await db.execute(
      "INSERT INTO admin_logs (admin_id, action, target_user_id, details) VALUES (?, ?, ?, ?)",
      [adminId, "delete_user", userId, `Eliminó usuario: ${userCheck[0].name}`]
    );

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Obtener estadísticas (solo admin)
app.get("/api/admin/stats", async (req, res) => {
  try {
    const { adminId } = req.query;

    // Verificar que quien pide es admin
    const [adminCheck] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [adminId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    // Total de usuarios
    const [totalUsers] = await db.execute(
      "SELECT COUNT(*) as total FROM users"
    );

    // Usuarios por rol
    const [usersByRole] = await db.execute(
      "SELECT role, COUNT(*) as count FROM users GROUP BY role"
    );

    // Usuarios registrados hoy
    const [todayUsers] = await db.execute(
      "SELECT COUNT(*) as total FROM users WHERE DATE(created_at) = CURDATE()"
    );

    // Usuarios por proveedor de autenticación
    const [usersByProvider] = await db.execute(
      "SELECT auth_provider, COUNT(*) as count FROM users GROUP BY auth_provider"
    );

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers[0].total,
        usersByRole: usersByRole,
        todayUsers: todayUsers[0].total,
        usersByProvider: usersByProvider,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor: " + error.message,
    });
  }
});

// Obtener logs de administración (solo admin)
app.get("/api/admin/logs", async (req, res) => {
  try {
    const { adminId, limit = 50 } = req.query;

    // Verificar que quien pide es admin
    const [adminCheck] = await db.execute(
      "SELECT role FROM users WHERE id = ?",
      [adminId]
    );

    if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Acceso denegado",
      });
    }

    const [logs] = await db.execute(
      `SELECT l.*, u.name as admin_name 
       FROM admin_logs l
       LEFT JOIN users u ON l.admin_id = u.id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      logs: logs,
    });
  } catch (error) {
    console.error("Error obteniendo logs:", error);
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
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Iniciar servidor
const server = app
  .listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Carpeta de uploads: ${uploadsDir}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`El puerto ${PORT} ya está en uso`);
    } else {
      console.error("Error al iniciar el servidor:", err);
    }
    process.exit(1);
  });

// Manejo de señales
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  server.close(() => process.exit(0));
});

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash de la contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await db.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, password_hash, role || "reader"]
    );

    const token = generateToken({
      id: result.insertId,
      email,
      role: role || "reader",
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: result.insertId, username, email, role: role || "reader" },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, username, profileImage } = req.body;

    // Buscar usuario por google_id o email
    let [users] = await db.query(
      "SELECT * FROM users WHERE google_id = ? OR email = ?",
      [googleId, email]
    );

    let user;
    if (users.length === 0) {
      // Crear nuevo usuario
      const [result] = await db.query(
        "INSERT INTO users (username, email, google_id, profile_image_url, role) VALUES (?, ?, ?, ?, ?)",
        [username, email, googleId, profileImage, "reader"]
      );
      user = { id: result.insertId, username, email, role: "reader" };
    } else {
      user = users[0];
      // Actualizar google_id si no existe
      if (!user.google_id) {
        await db.query("UPDATE users SET google_id = ? WHERE id = ?", [
          googleId,
          user.id,
        ]);
      }
    }

    const token = generateToken(user);

    res.json({
      message: "Google authentication successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_image_url: user.profile_image_url,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

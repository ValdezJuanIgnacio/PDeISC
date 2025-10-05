const mysql = require("mysql2/promise");
require("dotenv").config();

async function testConnection() {
  console.log("Configuración:");
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_USER:", process.env.DB_USER);
  console.log(
    "DB_PASSWORD:",
    process.env.DB_PASSWORD === "" ? "(vacío)" : "(tiene valor)"
  );
  console.log("DB_NAME:", process.env.DB_NAME);

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Conexión exitosa a MySQL");

    const [rows] = await connection.execute("SELECT 1 + 1 AS result");
    console.log("Prueba de consulta:", rows);

    await connection.end();
  } catch (error) {
    console.error("❌ Error de conexión:", error.message);
  }
}

testConnection();

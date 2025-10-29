const bcrypt = require("bcrypt");

bcrypt.hash("admin123", 10, function (err, hash) {
  if (err) {
    console.error("Error:", err);
    return;
  }

  console.log("\n=================================");
  console.log("✅ Hash generado exitosamente");
  console.log("=================================");
  console.log("\nCOPIA ESTE HASH:");
  console.log(hash);
  console.log("\n=================================");
  console.log("Ahora ejecuta esta query en phpMyAdmin:\n");
  console.log(
    `UPDATE users SET password = '${hash}', role = 'admin' WHERE name = 'admin';`
  );
  console.log("\nO si el usuario no existe:\n");
  console.log(
    `INSERT INTO users (name, password, email, role, auth_provider, created_at)`
  );
  console.log(
    `VALUES ('admin', '${hash}', 'admin@sistema.com', 'admin', 'local', NOW());`
  );
  console.log("\n=================================\n");
});

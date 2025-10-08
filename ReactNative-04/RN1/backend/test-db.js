const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Ruta de prueba simple
app.get("/health", (req, res) => {
  console.log(" Petición recibida en /health");
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    message: "Servidor funcionando correctamente"
  });
});

app.get("/api/test", (req, res) => {
  console.log(" Petición recibida en /api/test");
  res.json({ 
    success: true, 
    message: "API funcionando" 
  });
});

app.post("/api/test-post", (req, res) => {
  console.log(" Petición POST recibida");
  console.log("Body:", req.body);
  res.json({ 
    success: true, 
    message: "POST funcionando",
    received: req.body
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log("\n=================================");
  console.log(` Servidor de prueba iniciado`);
  console.log(`Puerto: ${PORT}`);
  console.log(`\nPrueba desde el navegador:`);
  console.log(`  http://localhost:${PORT}/health`);
  console.log(`\nPrueba desde tu móvil/emulador:`);
  console.log(`  Obtén tu IP con: ipconfig (Windows) o ifconfig (Mac/Linux)`);
  console.log(`  Luego usa: http://TU_IP:${PORT}/health`);
  console.log("=================================\n");
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(` El puerto ${PORT} ya está en uso`);
    console.error(`Cierra el otro proceso o usa otro puerto`);
  } else {
    console.error(' Error:', err);
  }
});